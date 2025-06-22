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

// Timeout constants
const SIGN_IN_TIMEOUT = 10000; // 10 seconds
const PROFILE_LOAD_TIMEOUT = 8000; // 8 seconds
const SESSION_INIT_TIMEOUT = 10000; // 10 seconds (increased from 5 seconds)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to create a timeout promise
  const createTimeoutPromise = (ms: number, operation: string) => {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operation} timeout after ${ms}ms`));
      }, ms);
    });
  };

  // Force sign out function
  const forceSignOut = async (reason: string) => {
    console.warn(`🚨 Force sign out triggered: ${reason}`);
    
    try {
      // Clear state immediately
      setUser(null);
      setSession(null);
      setLoading(false);
      
      // Try to sign out from Supabase (don't wait for response)
      supabase.auth.signOut().catch(() => {
        console.log('Supabase signOut failed during force logout, but continuing');
      });
      
      console.log('✅ Force sign out completed');
    } catch (error) {
      console.error('Error during force sign out:', error);
      // Ensure state is cleared even if there's an error
      setUser(null);
      setSession(null);
      setLoading(false);
    }
  };

  const loadUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      console.log('📝 Loading profile for user:', supabaseUser.email);

      // Race between profile loading and timeout
      const profilePromise = supabase
        .from('profile')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      const timeoutPromise = createTimeoutPromise(PROFILE_LOAD_TIMEOUT, 'Profile loading');

      const { data: profile, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

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
                  supabaseUser.email?.split('@')[0] || 
                  'User',
            tier: 'basic' as const
          };

          // Race between profile creation and timeout
          const createPromise = supabase
            .from('profile')
            .insert(newProfile)
            .select()
            .single();

          const createTimeoutPromise = createTimeoutPromise(PROFILE_LOAD_TIMEOUT, 'Profile creation');

          const { data: createdProfile, error: createError } = await Promise.race([
            createPromise,
            createTimeoutPromise
          ]) as any;

          if (createError) {
            console.error('❌ Error creating profile:', createError);
            throw new Error(`Profile creation failed: ${createError.message}`);
          }

          if (createdProfile) {
            console.log('✅ Profile created successfully');
            return { ...createdProfile, supabaseUser };
          }
        } else {
          throw new Error(`Profile fetch failed: ${error.message}`);
        }
        
        return null;
      } else if (profile) {
        console.log('✅ Profile loaded successfully');
        return { ...profile, supabaseUser };
      }
      
      return null;
    } catch (error) {
      console.error('💥 Error in loadUserProfile:', error);
      
      // If it's a timeout error, force sign out
      if (error instanceof Error && error.message.includes('timeout')) {
        await forceSignOut(`Profile loading timeout: ${error.message}`);
      }
      
      throw error;
    }
  };

  // Initialize authentication
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing authentication...');
        
        // Race between session fetch and timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = createTimeoutPromise(SESSION_INIT_TIMEOUT, 'Session initialization');
        
        const { data: { session: currentSession }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (!mounted) return;
        
        if (error) {
          console.error('❌ Error getting session:', error);
          if (error.message?.includes('timeout')) {
            await forceSignOut(`Session initialization timeout: ${error.message}`);
          } else {
            setLoading(false);
          }
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
              // Don't force sign out here, just clear the user state
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
          if (error instanceof Error && error.message.includes('timeout')) {
            await forceSignOut(`Auth initialization timeout: ${error.message}`);
          } else {
            setLoading(false);
            setUser(null);
            setSession(null);
          }
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Set up auth state listener
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
            // Force sign out if profile loading fails
            await forceSignOut(`Profile loading failed after sign in: ${profileError instanceof Error ? profileError.message : 'Unknown error'}`);
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
      
      // Race between sign in and timeout
      const signInPromise = supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      const timeoutPromise = createTimeoutPromise(SIGN_IN_TIMEOUT, 'Sign in');

      const { data, error } = await Promise.race([
        signInPromise,
        timeoutPromise
      ]) as any;

      if (error) {
        console.error('❌ Sign in error:', error);
        
        // If it's a timeout, force sign out to clear any partial state
        if (error.message?.includes('timeout')) {
          await forceSignOut(`Sign in timeout: ${error.message}`);
        }
        
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
      
      // Race between sign up and timeout
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

      const { data, error } = await Promise.race([
        signUpPromise,
        timeoutPromise
      ]) as any;

      if (error) {
        console.error('❌ Sign up error:', error);
        
        // If it's a timeout, force sign out to clear any partial state
        if (error.message?.includes('timeout')) {
          await forceSignOut(`Sign up timeout: ${error.message}`);
        }
        
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
      
      // Race between sign out and timeout
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = createTimeoutPromise(5000, 'Sign out');

      try {
        const { error } = await Promise.race([
          signOutPromise,
          timeoutPromise
        ]) as any;

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
      // Race between profile update and timeout
      const updatePromise = supabase
        .from('profile')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      const timeoutPromise = createTimeoutPromise(8000, 'Profile update');

      const { data, error } = await Promise.race([
        updatePromise,
        timeoutPromise
      ]) as any;

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