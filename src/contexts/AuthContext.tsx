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

// More generous timeout constants for better UX
const SIGN_IN_TIMEOUT = 15000; // 15 seconds
const PROFILE_LOAD_TIMEOUT = 10000; // 10 seconds
const SESSION_INIT_TIMEOUT = 12000; // 12 seconds

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to create a timeout promise with better error handling
  function createTimeoutPromise(ms: number, operation: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operation} timeout after ${ms}ms - this may be due to network conditions`));
      }, ms);
    });
  }

  // Improved profile loading with retry logic and better error handling
  const loadUserProfile = async (supabaseUser: SupabaseUser, retryCount = 0): Promise<User | null> => {
    const maxRetries = 2;
    
    try {
      console.log(`📝 Loading profile for user: ${supabaseUser.email} (attempt ${retryCount + 1})`);

      // Use a more generous timeout and simpler query
      const profilePromise = supabase
        .from('profile')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      const timeoutPromise = createTimeoutPromise(PROFILE_LOAD_TIMEOUT, 'Profile loading');

      const result = await Promise.race([
        profilePromise,
        timeoutPromise
      ]);

      const { data: profile, error } = result as any;

      if (error) {
        console.error('❌ Profile fetch error:', error);
        
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          console.log('🆕 Creating new profile for user:', supabaseUser.email);
          
          const newProfile = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.name || 
                  supabaseUser.user_metadata?.full_name || 
                  supabaseUser.email?.split('@')[0] || 
                  'User',
            tier: 'basic' as const
          };

          try {
            const createResult = await Promise.race([
              supabase
                .from('profile')
                .insert(newProfile)
                .select()
                .single(),
              createTimeoutPromise(PROFILE_LOAD_TIMEOUT, 'Profile creation')
            ]);

            const { data: createdProfile, error: createError } = createResult as any;

            if (createError) {
              console.error('❌ Error creating profile:', createError);
              
              // If creation fails, try to fetch again (maybe it was created by trigger)
              if (retryCount < maxRetries) {
                console.log('🔄 Retrying profile fetch after creation failure...');
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                return loadUserProfile(supabaseUser, retryCount + 1);
              }
              
              console.warn('Profile creation failed, user will continue without profile data');
              return null;
            }

            if (createdProfile) {
              console.log('✅ Profile created successfully');
              return { ...createdProfile, supabaseUser };
            }
          } catch (createError) {
            console.error('💥 Error creating profile:', createError);
            
            // Retry logic for creation failures
            if (retryCount < maxRetries) {
              console.log('🔄 Retrying profile creation...');
              await new Promise(resolve => setTimeout(resolve, 1000));
              return loadUserProfile(supabaseUser, retryCount + 1);
            }
            
            console.warn('Profile creation failed after retries, user will continue without profile data');
            return null;
          }
        } else {
          // For other errors, try retry if we haven't exceeded max retries
          if (retryCount < maxRetries && !error.message?.includes('timeout')) {
            console.log('🔄 Retrying profile fetch due to error...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            return loadUserProfile(supabaseUser, retryCount + 1);
          }
          
          console.warn('Profile fetch failed, user will continue without profile data');
          return null;
        }
      } else if (profile) {
        console.log('✅ Profile loaded successfully');
        return { ...profile, supabaseUser };
      }
      
      return null;
    } catch (error) {
      console.error('💥 Error in loadUserProfile:', error);
      
      // Retry logic for network/timeout errors
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying profile load due to error (attempt ${retryCount + 2}/${maxRetries + 1})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return loadUserProfile(supabaseUser, retryCount + 1);
      }
      
      console.warn('Profile loading failed after all retries, user will continue without profile data');
      return null;
    }
  };

  // Initialize authentication with improved error handling and no forced sign-outs
  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing authentication...');
        
        // Set a fallback timeout to ensure loading doesn't hang indefinitely
        initTimeout = setTimeout(() => {
          if (mounted) {
            console.warn('⏰ Auth initialization taking longer than expected, continuing...');
            setLoading(false);
          }
        }, SESSION_INIT_TIMEOUT);
        
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = createTimeoutPromise(SESSION_INIT_TIMEOUT, 'Session initialization');
        
        let result;
        try {
          result = await Promise.race([
            sessionPromise,
            timeoutPromise
          ]);
        } catch (raceError: any) {
          if (!mounted) return;
          
          // Clear the fallback timeout since we got a response (even if it's an error)
          clearTimeout(initTimeout);
          
          // Handle timeout specifically as a warning, not an error
          if (raceError.message?.includes('timeout')) {
            console.warn('⏰ Session initialization timeout - continuing with no session');
            setLoading(false);
            setUser(null);
            setSession(null);
            return;
          }
          
          // Re-throw non-timeout errors to be handled by outer catch
          throw raceError;
        }
        
        const { data: { session: currentSession }, error } = result as any;
        
        if (!mounted) return;
        
        // Clear the fallback timeout since we got a response
        clearTimeout(initTimeout);
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          return;
        }

        setSession(currentSession);
        
        if (currentSession?.user) {
          console.log('✅ Found existing session for:', currentSession.user.email);
          try {
            const userProfile = await loadUserProfile(currentSession.user);
            if (mounted) {
              setUser(userProfile);
            }
          } catch (profileError) {
            console.error('💥 Failed to load profile during initialization:', profileError);
            if (mounted) {
              // Don't clear session, just set user to null
              setUser(null);
            }
          }
        } else {
          console.log('ℹ️ No existing session found');
          setUser(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('💥 Error initializing auth:', error);
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

  // Set up auth state listener with improved error handling
  useEffect(() => {
    console.log('👂 Setting up auth state listener...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔄 Auth state changed:', event, newSession?.user?.email || 'No user');
        
        setSession(newSession);

        if (event === 'SIGNED_IN' && newSession?.user) {
          console.log('✅ User signed in:', newSession.user.email);
          setLoading(true);
          
          try {
            const userProfile = await loadUserProfile(newSession.user);
            setUser(userProfile);
          } catch (profileError) {
            console.error('💥 Failed to load profile after sign in:', profileError);
            // Don't force sign out - just set user to null and continue
            setUser(null);
          } finally {
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          setUser(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
          console.log('🔄 Token refreshed for:', newSession.user.email);
          // Don't change loading state or reload profile on token refresh
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      console.log('🔐 Attempting sign in for:', email);
      
      const signInPromise = supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      const timeoutPromise = createTimeoutPromise(SIGN_IN_TIMEOUT, 'Sign in');

      const result = await Promise.race([
        signInPromise,
        timeoutPromise
      ]);

      const { data, error } = result as any;

      if (error) {
        console.error('❌ Sign in error:', error);
        throw error;
      }

      console.log('✅ Sign in successful for:', data.user?.email);
      // The auth state change listener will handle loading the profile
      
    } catch (error) {
      console.error('💥 Sign in failed:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    try {
      console.log('📝 Attempting sign up for:', email);
      
      const signUpPromise = supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      const timeoutPromise = createTimeoutPromise(SIGN_IN_TIMEOUT, 'Sign up');

      const result = await Promise.race([
        signUpPromise,
        timeoutPromise
      ]);

      const { data, error } = result as any;

      if (error) {
        console.error('❌ Sign up error:', error);
        throw error;
      }

      console.log('✅ Sign up successful for:', data.user?.email);
      // The auth state change listener will handle loading the profile
      
    } catch (error) {
      console.error('💥 Sign up failed:', error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      console.log('👋 Signing out...');
      
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = createTimeoutPromise(5000, 'Sign out');

      try {
        const result = await Promise.race([
          signOutPromise,
          timeoutPromise
        ]);

        const { error } = result as any;

        if (error && !error.message?.includes('timeout')) {
          console.error('❌ Sign out error:', error);
        }
      } catch (timeoutError) {
        console.warn('⏰ Sign out timeout, forcing local cleanup');
      }
      
      // Clear state immediately regardless of Supabase response
      setUser(null);
      setSession(null);
      setLoading(false);
      
      console.log('✅ Sign out completed');
      
    } catch (error) {
      console.error('💥 Sign out error:', error);
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
      const updatePromise = supabase
        .from('profile')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      const timeoutPromise = createTimeoutPromise(10000, 'Profile update');

      const result = await Promise.race([
        updatePromise,
        timeoutPromise
      ]);

      const { data, error } = result as any;

      if (error) {
        if (error.message?.includes('timeout')) {
          throw new Error('Profile update timed out. Please try again.');
        }
        throw error;
      }

      if (data) {
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};