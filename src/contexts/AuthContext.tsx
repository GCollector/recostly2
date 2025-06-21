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
  forceSignOut: () => void;
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
  
  const mountedRef = useRef(true);
  const authListenerRef = useRef<any>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 3;
  const retryCount = useRef(0);

  // Force sign out function - clears everything aggressively
  const forceSignOut = () => {
    console.log('🔥 FORCE SIGN OUT - Clearing all auth state');
    
    // Clear all state immediately
    setUser(null);
    setSession(null);
    setLoading(false);
    setInitialized(true);
    
    // Clear any stored auth data
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('sb-' + supabase.supabaseUrl.split('//')[1] + '-auth-token');
    
    // Clear session storage
    sessionStorage.clear();
    
    // Force sign out from Supabase (don't wait for response)
    supabase.auth.signOut().catch(() => {
      console.log('Supabase signOut failed, but continuing with force logout');
    });
    
    console.log('✅ Force sign out completed');
  };

  // Load user profile with retry logic
  const loadUserProfile = async (supabaseUser: SupabaseUser, attempt = 1): Promise<User | null> => {
    if (!mountedRef.current) return null;
    
    try {
      console.log(`📝 Loading profile for user: ${supabaseUser.email} (attempt ${attempt})`);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (!mountedRef.current) return null;

      if (error) {
        console.error('❌ Profile fetch error:', error);
        
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('🆕 Creating new profile for user:', supabaseUser.email);
          
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
            console.error('❌ Error creating profile:', createError);
            if (attempt < maxRetries) {
              console.log(`🔄 Retrying profile creation (${attempt + 1}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              return loadUserProfile(supabaseUser, attempt + 1);
            }
            throw new Error('Failed to create user profile after retries');
          }

          if (createdProfile) {
            console.log('✅ Profile created successfully');
            return { ...createdProfile, supabaseUser };
          }
        } else {
          // For other errors, retry if we haven't exceeded max attempts
          if (attempt < maxRetries) {
            console.log(`🔄 Retrying profile fetch (${attempt + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            return loadUserProfile(supabaseUser, attempt + 1);
          }
          throw error;
        }
        return null;
      } else if (profile) {
        console.log('✅ Profile loaded successfully');
        return { ...profile, supabaseUser };
      }
      
      return null;
    } catch (error) {
      console.error('💥 Error in loadUserProfile:', error);
      
      if (attempt < maxRetries) {
        console.log(`🔄 Retrying after error (${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return loadUserProfile(supabaseUser, attempt + 1);
      }
      
      // After max retries, force sign out to prevent infinite loading
      console.error('💥 Max retries exceeded, forcing sign out');
      forceSignOut();
      return null;
    }
  };

  // Initialize authentication with aggressive timeout
  useEffect(() => {
    const initializeAuth = async () => {
      if (!mountedRef.current) return;
      
      console.log('🚀 Initializing authentication...');
      
      // Set aggressive timeout to prevent infinite loading
      initTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current && loading) {
          console.warn('⏰ Auth initialization timeout - forcing completion');
          retryCount.current++;
          
          if (retryCount.current >= maxRetries) {
            console.error('💥 Max initialization retries exceeded - forcing sign out');
            forceSignOut();
          } else {
            setLoading(false);
            setInitialized(true);
          }
        }
      }, 5000); // 5 second timeout
      
      try {
        // Get current session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session fetch timeout')), 3000)
        );
        
        const { data: { session: currentSession }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (!mountedRef.current) return;
        
        // Clear timeout since we got a response
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
          initTimeoutRef.current = null;
        }
        
        if (error) {
          console.error('❌ Error getting session:', error);
          forceSignOut();
          return;
        }

        setSession(currentSession);
        
        if (currentSession?.user) {
          console.log('✅ Found existing session for:', currentSession.user.email);
          try {
            const userProfile = await loadUserProfile(currentSession.user);
            if (mountedRef.current) {
              setUser(userProfile);
            }
          } catch (profileError) {
            console.error('💥 Failed to load profile, forcing sign out:', profileError);
            forceSignOut();
            return;
          }
        } else {
          console.log('ℹ️ No existing session found');
          setUser(null);
        }
        
        if (mountedRef.current) {
          setLoading(false);
          setInitialized(true);
          retryCount.current = 0; // Reset retry count on success
        }
      } catch (error) {
        console.error('💥 Error initializing auth:', error);
        if (mountedRef.current) {
          if (initTimeoutRef.current) {
            clearTimeout(initTimeoutRef.current);
            initTimeoutRef.current = null;
          }
          
          retryCount.current++;
          if (retryCount.current >= maxRetries) {
            console.error('💥 Max initialization retries exceeded');
            forceSignOut();
          } else {
            console.log(`🔄 Retrying initialization (${retryCount.current}/${maxRetries})`);
            setTimeout(() => {
              if (mountedRef.current) {
                setLoading(true);
                // Retry initialization
                initializeAuth();
              }
            }, 2000);
          }
        }
      }
    };

    initializeAuth();
  }, []); // Empty dependency array - runs only once

  // Set up auth state listener with error handling
  useEffect(() => {
    if (!initialized || !mountedRef.current) return;

    console.log('👂 Setting up auth state listener...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mountedRef.current) return;
        
        console.log('🔄 Auth state changed:', event, newSession?.user?.email || 'No user');
        
        try {
          setSession(newSession);

          if (event === 'SIGNED_IN' && newSession?.user) {
            console.log('✅ User signed in:', newSession.user.email);
            setLoading(true);
            try {
              const userProfile = await loadUserProfile(newSession.user);
              if (mountedRef.current) {
                setUser(userProfile);
                setLoading(false);
              }
            } catch (profileError) {
              console.error('💥 Failed to load profile after sign in:', profileError);
              forceSignOut();
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('👋 User signed out');
            if (mountedRef.current) {
              setUser(null);
              setLoading(false);
            }
          } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
            console.log('🔄 Token refreshed for:', newSession.user.email);
            // Don't change loading state or reload profile on token refresh
          }
        } catch (error) {
          console.error('💥 Error handling auth state change:', error);
          if (mountedRef.current) {
            forceSignOut();
          }
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
  }, [initialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
      }
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    if (!mountedRef.current) return;
    
    try {
      console.log('🔐 Attempting sign in for:', email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        setLoading(false);
        throw error;
      }

      console.log('✅ Sign in successful for:', data.user?.email);
      // The auth state change listener will handle loading the profile
      
    } catch (error) {
      console.error('💥 Sign in failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    if (!mountedRef.current) return;
    
    try {
      console.log('📝 Attempting sign up for:', email);
      setLoading(true);
      
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
        console.error('❌ Sign up error:', error);
        setLoading(false);
        throw error;
      }

      console.log('✅ Sign up successful for:', data.user?.email);
      // The auth state change listener will handle loading the profile
      
    } catch (error) {
      console.error('💥 Sign up failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    if (!mountedRef.current) return;
    
    try {
      console.log('👋 Signing out...');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Sign out error:', error);
        // Even if signOut fails, force clear the local state
        forceSignOut();
        return;
      }
      
      // Clear state immediately
      setUser(null);
      setSession(null);
      setLoading(false);
      
      console.log('✅ Sign out successful');
      
    } catch (error) {
      console.error('💥 Sign out error:', error);
      // Force sign out even if there's an error
      forceSignOut();
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
      console.error('💥 Update profile error:', error);
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
    forceSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};