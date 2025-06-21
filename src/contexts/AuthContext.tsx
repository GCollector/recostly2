import React, { createContext, useContext, useState, useEffect } from 'react';
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

// Unique symbol to identify timeout
const TIMEOUT_SYMBOL = Symbol('timeout');

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      console.log('📝 Loading profile for user:', supabaseUser.email);

      // Create timeout promise that resolves with timeout symbol
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      const timeoutPromise = new Promise((resolve) => 
        setTimeout(() => resolve(TIMEOUT_SYMBOL), 10000)
      );

      const result = await Promise.race([profilePromise, timeoutPromise]);

      // Check if timeout occurred
      if (result === TIMEOUT_SYMBOL) {
        console.warn('⏰ Profile fetch timeout - continuing without profile');
        return null;
      }

      const { data: profile, error } = result as any;

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

          const createPromise = supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();

          const createTimeoutPromise = new Promise((resolve) => 
            setTimeout(() => resolve(TIMEOUT_SYMBOL), 10000)
          );

          const createResult = await Promise.race([
            createPromise, 
            createTimeoutPromise
          ]);

          // Check if creation timeout occurred
          if (createResult === TIMEOUT_SYMBOL) {
            console.warn('⏰ Profile creation timeout - continuing without profile');
            return null;
          }

          const { data: createdProfile, error: createError } = createResult as any;

          if (createError) {
            console.error('❌ Error creating profile:', createError);
            return null;
          }

          if (createdProfile) {
            console.log('✅ Profile created successfully');
            return { ...createdProfile, supabaseUser };
          }
        }
        
        return null;
      } else if (profile) {
        console.log('✅ Profile loaded successfully');
        return { ...profile, supabaseUser };
      }
      
      return null;
    } catch (error) {
      console.error('💥 Error in loadUserProfile:', error);
      return null; // Return null instead of throwing
    }
  };

  // Initialize authentication
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing authentication...');
        
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          return;
        }

        setSession(currentSession);
        
        if (currentSession?.user) {
          console.log('✅ Found existing session for:', currentSession.user.email);
          const userProfile = await loadUserProfile(currentSession.user);
          if (mounted) {
            setUser(userProfile);
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

    // Set timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⏰ Auth initialization timeout - forcing loading to false');
        setLoading(false);
        setUser(null);
        setSession(null);
      }
    }, 8000); // 8 second timeout

    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
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
          
          const userProfile = await loadUserProfile(newSession.user);
          setUser(userProfile);
          setLoading(false);
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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

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
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Sign out error:', error);
      }
      
      // Clear state immediately regardless of error
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