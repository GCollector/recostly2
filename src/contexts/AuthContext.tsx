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

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && key && url !== 'https://placeholder.supabase.co' && key !== 'placeholder-key';
};

// Optimized timeout constants for better network handling
const QUICK_TIMEOUT = 3000; // 3 seconds for quick operations
const STANDARD_TIMEOUT = 8000; // 8 seconds for standard operations
const PROFILE_RETRY_DELAY = 500; // 500ms between retries
const MAX_RETRIES = 2; // Reduced retries for faster recovery

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  // CRITICAL CHANGE: Start with loading = false for better UX
  const [loading, setLoading] = useState(false);

  // Create timeout promise with better error context
  function createTimeoutPromise(ms: number, operation: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operation} timeout after ${ms}ms`));
      }, ms);
    });
  }

  // Background profile loading that doesn't block the UI
  const loadUserProfileInBackground = async (supabaseUser: SupabaseUser, retryCount = 0): Promise<User | null> => {
    if (!isSupabaseConfigured()) {
      debugLog('Supabase not configured, skipping profile load');
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || 'Demo User',
        tier: 'free' as const,
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

    debugLog(`Background loading profile for user: ${supabaseUser.email} (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
    
    try {
      // Skip connection test and go directly to profile fetch with shorter timeout
      debugLog('Fetching user profile in background...');
      const profileQuery = supabase
        .from('profile')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      const profileResult = await Promise.race([
        profileQuery,
        createTimeoutPromise(QUICK_TIMEOUT, 'Background profile fetch')
      ]);

      const { data: profile, error } = profileResult as any;

      debugLog('Background profile fetch result:', { hasProfile: !!profile, error: error?.message });

      if (error) {
        // Handle specific error cases
        if (error.code === 'PGRST116' || error.message?.includes('No rows found') || !profile) {
          debugLog('Profile not found, attempting to create in background...');
          
          const newProfile = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.name || 
                  supabaseUser.user_metadata?.full_name || 
                  supabaseUser.email?.split('@')[0] || 
                  'User',
            tier: 'free' as const
          };

          debugLog('Creating new profile in background with data:', newProfile);

          try {
            const createQuery = supabase
              .from('profile')
              .insert(newProfile)
              .select()
              .single();

            const createResult = await Promise.race([
              createQuery,
              createTimeoutPromise(STANDARD_TIMEOUT, 'Background profile creation')
            ]);

            const { data: createdProfile, error: createError } = createResult as any;

            if (createError) {
              debugLog('Background profile creation error:', createError.message);

              // If creation fails due to conflict, try to fetch again
              if (createError.code === '23505' || createError.message?.includes('duplicate')) {
                debugLog('Profile already exists, retrying background fetch...');
                if (retryCount < MAX_RETRIES) {
                  await new Promise(resolve => setTimeout(resolve, PROFILE_RETRY_DELAY));
                  return loadUserProfileInBackground(supabaseUser, retryCount + 1);
                }
              }

              throw createError;
            }

            if (createdProfile) {
              debugLog('Profile created successfully in background');
              return { ...createdProfile, supabaseUser };
            }
          } catch (createError: any) {
            debugLog('Background profile creation failed:', createError.message);
            
            // Retry logic for creation failures
            if (retryCount < MAX_RETRIES && !createError.message?.includes('timeout')) {
              debugLog(`Retrying background profile creation (attempt ${retryCount + 2}/${MAX_RETRIES + 1})...`);
              await new Promise(resolve => setTimeout(resolve, PROFILE_RETRY_DELAY));
              return loadUserProfileInBackground(supabaseUser, retryCount + 1);
            }
            
            throw createError;
          }
        } else {
          // For timeout and other errors, implement retry logic
          if (retryCount < MAX_RETRIES) {
            debugLog(`Retrying background profile fetch due to error (attempt ${retryCount + 2}/${MAX_RETRIES + 1})...`);
            await new Promise(resolve => setTimeout(resolve, PROFILE_RETRY_DELAY));
            return loadUserProfileInBackground(supabaseUser, retryCount + 1);
          }
          
          throw error;
        }
      } else if (profile) {
        debugLog('Profile loaded successfully in background');
        return { ...profile, supabaseUser };
      }
      
      debugLog('No profile data returned from background fetch');
      return null;
    } catch (error: any) {
      debugLog('Error in background profile loading:', {
        message: error.message,
        retryCount
      });
      
      // Retry logic for network/timeout errors
      if (retryCount < MAX_RETRIES && error.message?.includes('timeout')) {
        debugLog(`Retrying background profile load due to timeout (attempt ${retryCount + 2}/${MAX_RETRIES + 1})...`);
        await new Promise(resolve => setTimeout(resolve, PROFILE_RETRY_DELAY));
        return loadUserProfileInBackground(supabaseUser, retryCount + 1);
      }
      
      // After all retries failed, continue without profile but don't crash
      debugLog('Background profile loading failed after all retries, continuing without profile data');
      console.warn('Background profile loading failed after all retries:', error.message);
      
      // Return a minimal user object to prevent app crash
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || 
              supabaseUser.user_metadata?.full_name || 
              supabaseUser.email?.split('@')[0] || 
              'User',
        tier: 'free' as const,
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

  // Background authentication initialization - no loading state
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      debugLog('Supabase not configured, skipping auth initialization');
      return;
    }

    let mounted = true;

    const initializeAuthInBackground = async () => {
      try {
        debugLog('Starting background authentication initialization...');
        
        // Get current session with shorter timeout
        debugLog('Getting current session in background...');
        const sessionQuery = supabase.auth.getSession();
        
        let sessionResult;
        try {
          sessionResult = await Promise.race([
            sessionQuery,
            createTimeoutPromise(QUICK_TIMEOUT, 'Background session fetch')
          ]);
        } catch (sessionError: any) {
          debugLog('Background session fetch error:', sessionError.message);
          
          if (!mounted) return;
          
          if (sessionError.message?.includes('timeout')) {
            debugLog('Background session fetch timeout - continuing with no session');
            setUser(null);
            setSession(null);
            return;
          }
          
          throw sessionError;
        }
        
        const { data: { session: currentSession }, error } = sessionResult as any;
        
        if (!mounted) return;
        
        debugLog('Background session fetch result:', { 
          hasSession: !!currentSession, 
          userEmail: currentSession?.user?.email,
          error: error?.message 
        });
        
        if (error) {
          debugLog('Background session fetch error details:', error.message);
          return;
        }

        setSession(currentSession);
        
        if (currentSession?.user) {
          debugLog('Found existing session, loading profile in background...');
          
          // Load profile in background without blocking UI
          loadUserProfileInBackground(currentSession.user).then(userProfile => {
            if (mounted && userProfile) {
              setUser(userProfile);
              debugLog('Background profile loaded and user set:', !!userProfile);
            }
          }).catch(profileError => {
            debugLog('Failed to load profile in background during initialization:', profileError.message);
            if (mounted) {
              // Set a minimal user object instead of null to prevent app crash
              setUser({
                id: currentSession.user.id,
                email: currentSession.user.email || '',
                name: currentSession.user.user_metadata?.name || 'User',
                tier: 'free' as const,
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
          });
        } else {
          debugLog('No existing session found in background');
          setUser(null);
        }
        
        debugLog('Background auth initialization completed');
      } catch (error: any) {
        debugLog('Background auth initialization error:', error.message);
        
        if (mounted) {
          setUser(null);
          setSession(null);
        }
      }
    };

    initializeAuthInBackground();

    return () => {
      mounted = false;
    };
  }, []);

  // Optimized auth state listener
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

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
          debugLog('User signed in, loading profile in background...');
          
          // Load profile in background without showing loading state
          loadUserProfileInBackground(newSession.user).then(userProfile => {
            setUser(userProfile);
            debugLog('Profile loaded after sign in:', !!userProfile);
          }).catch(profileError => {
            debugLog('Failed to load profile after sign in:', profileError.message);
            // Set minimal user object instead of null
            setUser({
              id: newSession.user.id,
              email: newSession.user.email || '',
              name: newSession.user.user_metadata?.name || 'User',
              tier: 'free' as const,
              stripe_customer_id: null,
              stripe_subscription_id: null,
              subscription_status: null,
              marketing_image: null,
              marketing_copy: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              supabaseUser: newSession.user
            });
          });
        } else if (event === 'SIGNED_OUT') {
          debugLog('User signed out');
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
          debugLog('Token refreshed for user:', newSession.user.email);
          // Don't reload profile on token refresh unless we don't have one
          if (!user) {
            debugLog('No user profile, loading after token refresh in background...');
            loadUserProfileInBackground(newSession.user).then(userProfile => {
              setUser(userProfile);
            }).catch(profileError => {
              debugLog('Failed to load profile after token refresh:', profileError.message);
            });
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
    if (!isSupabaseConfigured()) {
      throw new Error('Authentication is not available in demo mode');
    }

    try {
      debugLog('Starting sign in process for:', email);
      
      // Show loading only during active sign in
      setLoading(true);
      
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
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    if (!isSupabaseConfigured()) {
      throw new Error('Authentication is not available in demo mode');
    }

    try {
      debugLog('Starting sign up process for:', email);
      
      // Show loading only during active sign up
      setLoading(true);
      
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
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    if (!isSupabaseConfigured()) {
      // Just clear local state in demo mode
      setUser(null);
      setSession(null);
      return;
    }

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
      
      debugLog('Sign out completed');
      
    } catch (error: any) {
      debugLog('Sign out error:', error.message);
      
      // Force clear state even on error
      setUser(null);
      setSession(null);
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<void> => {
    if (!user) {
      throw new Error('No user logged in');
    }

    if (!isSupabaseConfigured()) {
      throw new Error('Profile updates are not available in demo mode');
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
    loading, // This will only be true during active sign in/up operations
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