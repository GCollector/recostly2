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

// Timeout constants - reduced for better UX
const SIGN_IN_TIMEOUT = 8000; // 8 seconds
const PROFILE_LOAD_TIMEOUT = 6000; // 6 seconds
const SESSION_INIT_TIMEOUT = 8000; // 8 seconds

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to create a timeout promise
  function createTimeoutPromise(ms: number, operation: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operation} timeout after ${ms}ms`));
      }, ms);
    });
  }

  // Improved profile loading with better error handling
  const loadUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      console.log('📝 Loading profile for user:', supabaseUser.email);

      // First, try to get existing profile
      const profilePromise = supabase
        .from('profile')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle(); // Use maybeSingle to handle no rows gracefully

      const timeoutPromise = createTimeoutPromise(PROFILE_LOAD_TIMEOUT, 'Profile loading');

      const { data: profile, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      if (error) {
        console.error('❌ Profile fetch error:', error);
        // Don't throw on profile errors - just log and continue
        console.warn('Profile fetch failed, user will remain signed in but without profile data');
        return null;
      }

      // If no profile exists, try to create one
      if (!profile) {
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
            console.warn('Profile creation failed, user will remain signed in but without profile data');
            return null;
          }

          if (createdProfile) {
            console.log('✅ Profile created successfully');
            return { ...createdProfile, supabaseUser };
          }
        } catch (createError) {
          console.error('💥 Error creating profile:', createError);
          console.warn('Profile creation failed due to error, user will remain signed in but without profile data');
          return null;
        }
      } else {
        console.log('✅ Profile loaded successfully');
        return { ...profile, supabaseUser };
      }
      
      return null;
    } catch (error) {
      console.error('💥 Error in loadUserProfile:', error);
      console.warn('Profile loading failed, user will remain signed in but without profile data');
      return null;
    }
  };

  // Initialize authentication with improved error handling
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing authentication...');
        
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = createTimeoutPromise(SESSION_INIT_TIMEOUT, 'Session initialization');
        
        const { data: { session: currentSession }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (!mounted) return;
        
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
          setLoading(false);
          setUser(null);
          setSession(null);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
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

      const { data, error } = await Promise.race([
        signInPromise,
        timeoutPromise
      ]) as any;

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

      const { data, error } = await Promise.race([
        signUpPromise,
        timeoutPromise
      ]) as any;

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