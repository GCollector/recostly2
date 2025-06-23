import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { Database } from '../lib/supabase';

type Profile = Database['public']['Tables']['profile']['Row'];

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

// Debug logging helper
const debugLog = (message: string, data?: any) => {
  console.log(`🔍 [AUTH DEBUG] ${message}`, data || '');
};

// Optimized timeout constants for better network handling
const QUICK_TIMEOUT = 3000; // 3 seconds for quick operations
const STANDARD_TIMEOUT = 8000; // 8 seconds for standard operations
const PROFILE_RETRY_DELAY = 500; // 500ms between retries
const MAX_RETRIES = 2; // Reduced retries for faster recovery

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Create timeout promise with better error context
  function createTimeoutPromise(ms: number, operation: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operation} timeout after ${ms}ms`));
      }, ms);
    });
  }

  // Simplified profile loading that skips connection tests and focuses on the actual query
  const loadUserProfile = async (supabaseUser: SupabaseUser, retryCount = 0): Promise<User | null> => {
    debugLog(`Loading profile for user: ${supabaseUser.email} (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
    
    try {
      // Skip connection test and go directly to profile fetch with shorter timeout
      debugLog('Fetching user profile directly...');
      const profileQuery = supabase
        .from('profile')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      const profileResult = await Promise.race([
        profileQuery,
        createTimeoutPromise(QUICK_TIMEOUT, 'Profile fetch')
      ]);

      const { data: profile, error } = profileResult as any;

      debugLog('Profile fetch result:', { hasProfile: !!profile, error: error?.message });

      if (error) {
        // Handle specific error cases
        if (error.code === 'PGRST116' || error.message?.includes('No rows found') || !profile) {
          debugLog('Profile not found, attempting to create...');
          
          const newProfile = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.name || 
                  supabaseUser.user_metadata?.full_name || 
                  supabaseUser.email?.split('@')[0] || 
                  'User',
            tier: 'basic' as const
          };

          debugLog('Creating new profile with data:', newProfile);

          try {
            const createQuery = supabase
              .from('profile')
              .insert(newProfile)
              .select()
              .single();

            const createResult = await Promise.race([
              createQuery,
              createTimeoutPromise(STANDARD_TIMEOUT, 'Profile creation')
            ]);

            const { data: createdProfile, error: createError } = createResult as any;

            if (createError) {
              debugLog('Profile creation error:', createError.message);

              // If creation fails due to conflict, try to fetch again
              if (createError.code === '23505' || createError.message?.includes('duplicate')) {
                debugLog('Profile already exists, retrying fetch...');
                if (retryCount < MAX_RETRIES) {
                  await new Promise(resolve => setTimeout(resolve, PROFILE_RETRY_DELAY));
                  return loadUserProfile(supabaseUser, retryCount + 1);
                }
              }

              throw createError;
            }

            if (createdProfile) {
              debugLog('Profile created successfully');
              return { ...createdProfile, supabaseUser };
            }
          } catch (createError: any) {
            debugLog('Profile creation failed:', createError.message);
            
            // Retry logic for creation failures
            if (retryCount < MAX_RETRIES && !createError.message?.includes('timeout')) {
              debugLog(`Retrying profile creation (attempt ${retryCount + 2}/${MAX_RETRIES + 1})...`);
              await new Promise(resolve => setTimeout(resolve, PROFILE_RETRY_DELAY));
              return loadUserProfile(supabaseUser, retryCount + 1);
            }
            
            throw createError;
          }
        } else {
          // For timeout and other errors, implement retry logic
          if (retryCount < MAX_RETRIES) {
            debugLog(`Retrying profile fetch due to error (attempt ${retryCount + 2}/${MAX_RETRIES + 1})...`);
            await new Promise(resolve => setTimeout(resolve, PROFILE_RETRY_DELAY));
            return loadUserProfile(supabaseUser, retryCount + 1);
          }
          
          throw error;
        }
      } else if (profile) {
        debugLog('Profile loaded successfully');
        return { ...profile, supabaseUser };
      }
      
      debugLog('No profile data returned');
      return null;
    } catch (error: any) {
      debugLog('Error in loadUserProfile:', {
        message: error.message,
        retryCount
      });
      
      // Retry logic for network/timeout errors
      if (retryCount < MAX_RETRIES && error.message?.includes('timeout')) {
        debugLog(`Retrying profile load due to timeout (attempt ${retryCount + 2}/${MAX_RETRIES + 1})...`);
        await new Promise(resolve => setTimeout(resolve, PROFILE_RETRY_DELAY));
        return loadUserProfile(supabaseUser, retryCount + 1);
      }
      
      // After all retries failed, continue without profile but don't crash
      debugLog('Profile loading failed after all retries, continuing without profile data');
      console.warn('Profile loading failed after all retries:', error.message);
      
      // Return a minimal user object to prevent app crash
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || 
              supabaseUser.user_metadata?.full_name || 
              supabaseUser.email?.split('@')[0] || 
              'User',
        tier: 'basic' as const,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        subscription_status: null,
        marketing_image: null,
        marketing_copy: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        supabaseUser
      };
    }
  };

  // Simplified authentication initialization
  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        debugLog('Starting authentication initialization...');
        
        // Set a reasonable timeout for the entire initialization
        initTimeout = setTimeout(() => {
          if (mounted) {
            debugLog('Auth initialization timeout reached, continuing with session only');
            setLoading(false);
          }
        }, STANDARD_TIMEOUT);
        
        // Get current session with shorter timeout
        debugLog('Getting current session...');
        const sessionQuery = supabase.auth.getSession();
        
        let sessionResult;
        try {
          sessionResult = await Promise.race([
            sessionQuery,
            createTimeoutPromise(QUICK_TIMEOUT, 'Session fetch')
          ]);
        } catch (sessionError: any) {
          debugLog('Session fetch error:', sessionError.message);
          
          if (!mounted) return;
          clearTimeout(initTimeout);
          
          if (sessionError.message?.includes('timeout')) {
            debugLog('Session fetch timeout - continuing with no session');
            setLoading(false);
            setUser(null);
            setSession(null);
            return;
          }
          
          throw sessionError;
        }
        
        const { data: { session: currentSession }, error } = sessionResult as any;
        
        if (!mounted) return;
        clearTimeout(initTimeout);
        
        debugLog('Session fetch result:', { 
          hasSession: !!currentSession, 
          userEmail: currentSession?.user?.email,
          error: error?.message 
        });
        
        if (error) {
          debugLog('Session fetch error details:', error.message);
          setLoading(false);
          return;
        }

        setSession(currentSession);
        
        if (currentSession?.user) {
          debugLog('Found existing session, loading profile...');
          try {
            const userProfile = await loadUserProfile(currentSession.user);
            if (mounted) {
              setUser(userProfile);
              debugLog('Profile loaded and user set:', !!userProfile);
            }
          } catch (profileError: any) {
            debugLog('Failed to load profile during initialization:', profileError.message);
            if (mounted) {
              // Set a minimal user object instead of null to prevent app crash
              setUser({
                id: currentSession.user.id,
                email: currentSession.user.email || '',
                name: currentSession.user.user_metadata?.name || 'User',
                tier: 'basic' as const,
                stripe_customer_id: null,
                stripe_subscription_id: null,
                subscription_status: null,
                marketing_image: null,
                marketing_copy: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                supabaseUser: currentSession.user
              });
            }
          }
        } else {
          debugLog('No existing session found');
          setUser(null);
        }
        
        if (mounted) {
          setLoading(false);
          debugLog('Auth initialization completed');
        }
      } catch (error: any) {
        debugLog('Auth initialization error:', error.message);
        
        if (mounted) {
          clearTimeout(initTimeout);
          setLoading(false);
          setUser(null);
          setSession(null);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
    };
  }, []);

  // Optimized auth state listener
  useEffect(() => {
    debugLog('Setting up auth state listener...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        debugLog('Auth state changed:', { 
          event, 
          hasSession: !!newSession,
          userEmail: newSession?.user?.email 
        });
        
        setSession(newSession);

        if (event === 'SIGNED_IN' && newSession?.user) {
          debugLog('User signed in, loading profile...');
          setLoading(true);
          
          try {
            const userProfile = await loadUserProfile(newSession.user);
            setUser(userProfile);
            debugLog('Profile loaded after sign in:', !!userProfile);
          } catch (profileError: any) {
            debugLog('Failed to load profile after sign in:', profileError.message);
            // Set minimal user object instead of null
            setUser({
              id: newSession.user.id,
              email: newSession.user.email || '',
              name: newSession.user.user_metadata?.name || 'User',
              tier: 'basic' as const,
              stripe_customer_id: null,
              stripe_subscription_id: null,
              subscription_status: null,
              marketing_image: null,
              marketing_copy: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              supabaseUser: newSession.user
            });
          } finally {
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          debugLog('User signed out');
          setUser(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
          debugLog('Token refreshed for user:', newSession.user.email);
          // Don't reload profile on token refresh unless we don't have one
          if (!user) {
            debugLog('No user profile, loading after token refresh...');
            try {
              const userProfile = await loadUserProfile(newSession.user);
              setUser(userProfile);
            } catch (profileError: any) {
              debugLog('Failed to load profile after token refresh:', profileError.message);
            }
          }
        }
      }
    );

    return () => {
      debugLog('Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, [user]);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      debugLog('Starting sign in process for:', email);
      
      const signInQuery = supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      const result = await Promise.race([
        signInQuery,
        createTimeoutPromise(STANDARD_TIMEOUT, 'Sign in')
      ]);

      const { data, error } = result as any;

      debugLog('Sign in result:', { 
        hasUser: !!data?.user, 
        userEmail: data?.user?.email,
        error: error?.message 
      });

      if (error) {
        debugLog('Sign in error details:', error.message);
        throw error;
      }

      debugLog('Sign in successful');
      // The auth state change listener will handle loading the profile
      
    } catch (error: any) {
      debugLog('Sign in failed:', error.message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    try {
      debugLog('Starting sign up process for:', email);
      
      const signUpQuery = supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      const result = await Promise.race([
        signUpQuery,
        createTimeoutPromise(STANDARD_TIMEOUT, 'Sign up')
      ]);

      const { data, error } = result as any;

      debugLog('Sign up result:', { 
        hasUser: !!data?.user, 
        userEmail: data?.user?.email,
        needsConfirmation: !data?.session,
        error: error?.message 
      });

      if (error) {
        debugLog('Sign up error details:', error.message);
        throw error;
      }

      debugLog('Sign up successful');
      // The auth state change listener will handle loading the profile
      
    } catch (error: any) {
      debugLog('Sign up failed:', error.message);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      debugLog('Starting sign out process...');
      
      const signOutQuery = supabase.auth.signOut();

      try {
        const result = await Promise.race([
          signOutQuery,
          createTimeoutPromise(QUICK_TIMEOUT, 'Sign out')
        ]);

        const { error } = result as any;
        debugLog('Sign out result:', { error: error?.message });

        if (error && !error.message?.includes('timeout')) {
          debugLog('Sign out error:', error.message);
        }
      } catch (timeoutError) {
        debugLog('Sign out timeout, forcing local cleanup');
      }
      
      // Clear state immediately
      setUser(null);
      setSession(null);
      setLoading(false);
      
      debugLog('Sign out completed');
      
    } catch (error: any) {
      debugLog('Sign out error:', error.message);
      
      // Force clear state even on error
      setUser(null);
      setSession(null);
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<void> => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      debugLog('Updating profile for user:', user.email);
      debugLog('Profile updates:', updates);
      
      const updateQuery = supabase
        .from('profile')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      const result = await Promise.race([
        updateQuery,
        createTimeoutPromise(STANDARD_TIMEOUT, 'Profile update')
      ]);

      const { data, error } = result as any;

      debugLog('Profile update result:', { hasData: !!data, error: error?.message });

      if (error) {
        debugLog('Profile update error details:', error.message);
        
        if (error.message?.includes('timeout')) {
          throw new Error('Profile update timed out. Please try again.');
        }
        throw error;
      }

      if (data) {
        setUser({ ...data, supabaseUser: user.supabaseUser });
        debugLog('Profile updated successfully');
      }
    } catch (error: any) {
      debugLog('Profile update failed:', error.message);
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