import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { Database } from '../lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface User extends Profile {
  supabaseUser: SupabaseUser;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  // Use refs to track state and prevent race conditions
  const authListenerRef = useRef<any>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingAuthChange = useRef(false);
  const mountedRef = useRef(true);

  // Clear loading timeout helper
  const clearLoadingTimeout = () => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  // Safe state setter that checks if component is mounted
  const safeSetLoading = (isLoading: boolean) => {
    if (!mountedRef.current) return;
    
    clearLoadingTimeout();
    setLoading(isLoading);
    
    // Set a maximum timeout for loading states
    if (isLoading) {
      loadingTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          console.warn('Loading timeout reached, forcing loading to false');
          setLoading(false);
        }
      }, 8000); // 8 second timeout
    }
  };

  // Load user profile from database
  const loadUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    if (!mountedRef.current) return null;
    
    try {
      console.log('Loading profile for user:', supabaseUser.email);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (!mountedRef.current) return null;

      if (error) {
        console.error('Profile fetch error:', error);
        
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('Creating new profile for user:', supabaseUser.email);
          
          const newProfile = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.name || 
                  supabaseUser.user_metadata?.full_name || 
                  'User',
            tier: 'public' as const
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();

          if (!mountedRef.current) return null;

          if (createError) {
            console.error('Error creating profile:', createError);
            return null;
          }

          if (createdProfile) {
            console.log('Profile created successfully');
            return { ...createdProfile, supabaseUser };
          }
        }
        return null;
      } else if (profile) {
        console.log('Profile loaded successfully');
        return { ...profile, supabaseUser };
      }
      
      return null;
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      return null;
    }
  };

  // Initialize authentication state - runs only once
  useEffect(() => {
    const initializeAuth = async () => {
      if (!mountedRef.current) return;
      
      try {
        console.log('Initializing authentication...');
        safeSetLoading(true);
        
        // Get current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (!mountedRef.current) return;
        
        if (error) {
          console.error('Error getting session:', error);
          setSession(null);
          setUser(null);
          safeSetLoading(false);
          setInitialized(true);
          return;
        }

        setSession(currentSession);
        
        if (currentSession?.user) {
          console.log('Found existing session for:', currentSession.user.email);
          const userProfile = await loadUserProfile(currentSession.user);
          if (mountedRef.current) {
            setUser(userProfile);
          }
        } else {
          console.log('No existing session found');
          setUser(null);
        }
        
        if (mountedRef.current) {
          safeSetLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mountedRef.current) {
          setSession(null);
          setUser(null);
          safeSetLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();
  }, []); // Empty dependency array - runs only once

  // Set up auth state listener - runs only once after initialization
  useEffect(() => {
    if (!initialized || !mountedRef.current) return;

    console.log('Setting up auth state listener...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mountedRef.current) return;
        
        // Prevent concurrent auth state processing
        if (isProcessingAuthChange.current) {
          console.log('Already processing auth change, skipping...');
          return;
        }

        isProcessingAuthChange.current = true;
        console.log('Auth state changed:', event, newSession?.user?.email || 'No user');
        
        try {
          if (!mountedRef.current) return;
          
          setSession(newSession);

          if (event === 'SIGNED_IN' && newSession?.user) {
            console.log('User signed in:', newSession.user.email);
            safeSetLoading(true);
            const userProfile = await loadUserProfile(newSession.user);
            if (mountedRef.current) {
              setUser(userProfile);
              safeSetLoading(false);
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            if (mountedRef.current) {
              setUser(null);
              safeSetLoading(false);
            }
          } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
            console.log('Token refreshed for:', newSession.user.email);
            // Don't change loading state or reload profile on token refresh
            // Just update the session - user profile should remain the same
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          if (mountedRef.current) {
            setUser(null);
            safeSetLoading(false);
          }
        } finally {
          isProcessingAuthChange.current = false;
        }
      }
    );

    authListenerRef.current = subscription;

    return () => {
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
        authListenerRef.current = null;
      }
    };
  }, [initialized]); // Only depends on initialized

  // Handle browser visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && mountedRef.current) {
        console.log('Browser became visible');
        // Don't trigger any loading states or auth checks
        // The existing auth listener will handle any necessary updates
      }
    };

    const handleFocus = () => {
      if (mountedRef.current) {
        console.log('Window focused');
        // Don't trigger any loading states or auth checks
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearLoadingTimeout();
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    if (!mountedRef.current) return;
    
    try {
      console.log('Attempting sign in for:', email);
      safeSetLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        safeSetLoading(false);
        throw error;
      }

      console.log('Sign in successful for:', data.user?.email);
      // The auth state change listener will handle loading the profile and setting loading to false
      
    } catch (error) {
      console.error('Sign in failed:', error);
      safeSetLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    if (!mountedRef.current) return;
    
    try {
      console.log('Attempting sign up for:', email);
      safeSetLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        safeSetLoading(false);
        throw error;
      }

      console.log('Sign up successful for:', data.user?.email);
      // The auth state change listener will handle loading the profile and setting loading to false
      
    } catch (error) {
      console.error('Sign up failed:', error);
      safeSetLoading(false);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    if (!mountedRef.current) return;
    
    try {
      console.log('Signing out...');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // Clear state immediately
      setUser(null);
      setSession(null);
      safeSetLoading(false);
      
      console.log('Sign out successful');
      
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<void> => {
    if (!user || !mountedRef.current) {
      throw new Error('No user logged in');
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data && mountedRef.current) {
        setUser({ ...data, supabaseUser: user.supabaseUser });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};