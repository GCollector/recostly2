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
  const authListenerRef = useRef<any>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingAuthChange = useRef(false);

  // Clear loading timeout helper
  const clearLoadingTimeout = () => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  // Set loading with timeout fallback
  const setLoadingWithTimeout = (isLoading: boolean, timeoutMs = 10000) => {
    clearLoadingTimeout();
    setLoading(isLoading);
    
    if (isLoading) {
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn('Loading timeout reached, forcing loading to false');
        setLoading(false);
      }, timeoutMs);
    }
  };

  // Load user profile from database
  const loadUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      console.log('Loading profile for user:', supabaseUser.email);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

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
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing authentication...');
        setLoadingWithTimeout(true);
        
        // Get current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setSession(null);
            setUser(null);
            clearLoadingTimeout();
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        if (mounted) {
          setSession(currentSession);
          
          if (currentSession?.user) {
            console.log('Found existing session for:', currentSession.user.email);
            const userProfile = await loadUserProfile(currentSession.user);
            if (mounted) {
              setUser(userProfile);
            }
          } else {
            console.log('No existing session found');
            setUser(null);
          }
          
          clearLoadingTimeout();
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          clearLoadingTimeout();
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      clearLoadingTimeout();
    };
  }, []); // Empty dependency array - runs only once

  // Set up auth state listener - runs only once after initialization
  useEffect(() => {
    if (!initialized) return;

    console.log('Setting up auth state listener...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        // Prevent concurrent auth state processing
        if (isProcessingAuthChange.current) {
          console.log('Already processing auth change, skipping...');
          return;
        }

        isProcessingAuthChange.current = true;
        console.log('Auth state changed:', event, newSession?.user?.email || 'No user');
        
        try {
          setSession(newSession);

          if (event === 'SIGNED_IN' && newSession?.user) {
            console.log('User signed in:', newSession.user.email);
            setLoadingWithTimeout(true);
            const userProfile = await loadUserProfile(newSession.user);
            setUser(userProfile);
            clearLoadingTimeout();
            setLoading(false);
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            setUser(null);
            clearLoadingTimeout();
            setLoading(false);
          } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
            console.log('Token refreshed for:', newSession.user.email);
            // Don't change loading state or reload profile on token refresh
            // Just update the session
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          setUser(null);
          clearLoadingTimeout();
          setLoading(false);
        } finally {
          isProcessingAuthChange.current = false;
        }
      }
    );

    authListenerRef.current = subscription;

    return () => {
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
      }
      clearLoadingTimeout();
    };
  }, [initialized]); // Only depends on initialized

  // Handle browser visibility changes to prevent auth issues
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Browser became visible, checking auth state...');
        // Don't trigger loading state changes on visibility change
        // The auth listener will handle any necessary updates
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      console.log('Attempting sign in for:', email);
      setLoadingWithTimeout(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        clearLoadingTimeout();
        setLoading(false);
        throw error;
      }

      console.log('Sign in successful for:', data.user?.email);
      // The auth state change listener will handle loading the profile
      
    } catch (error) {
      console.error('Sign in failed:', error);
      clearLoadingTimeout();
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    try {
      console.log('Attempting sign up for:', email);
      setLoadingWithTimeout(true);
      
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
        clearLoadingTimeout();
        setLoading(false);
        throw error;
      }

      console.log('Sign up successful for:', data.user?.email);
      // The auth state change listener will handle loading the profile
      
    } catch (error) {
      console.error('Sign up failed:', error);
      clearLoadingTimeout();
      setLoading(false);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      console.log('Signing out...');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // Clear state immediately
      setUser(null);
      setSession(null);
      clearLoadingTimeout();
      setLoading(false);
      
      console.log('Sign out successful');
      
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<void> => {
    if (!user) {
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

      if (data) {
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