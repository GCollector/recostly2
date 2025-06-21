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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          if (mounted) {
            setSession(null);
            setUser(null);
            setLoading(false);
          }
          return;
        }

        console.log('Initial session:', initialSession?.user?.email || 'No session');

        if (mounted) {
          setSession(initialSession);
          
          if (initialSession?.user) {
            await loadUserProfile(initialSession.user);
          } else {
            setUser(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.email || 'No user');
        
        if (!mounted) return;

        setSession(newSession);

        if (event === 'SIGNED_IN' && newSession?.user) {
          await loadUserProfile(newSession.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
          // Only reload profile if we don't have user data
          if (!user) {
            await loadUserProfile(newSession.user);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      }
    );

    const loadUserProfile = async (supabaseUser: SupabaseUser) => {
      try {
        console.log('Loading profile for:', supabaseUser.email);

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();

        if (error) {
          console.error('Profile fetch error:', error);
          
          // If profile doesn't exist, create it
          if (error.code === 'PGRST116') {
            console.log('Creating new profile...');
            
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
              throw createError;
            }

            if (createdProfile && mounted) {
              console.log('Profile created successfully');
              setUser({ ...createdProfile, supabaseUser });
              setLoading(false);
            }
          } else {
            throw error;
          }
        } else if (profile && mounted) {
          console.log('Profile loaded successfully');
          setUser({ ...profile, supabaseUser });
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      console.log('Sign in successful for:', data.user?.email);
      // Auth state change handler will handle loading the profile
      
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('Attempting sign up for:', email);
      
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
        throw error;
      }

      console.log('Sign up successful for:', data.user?.email);
      // Auth state change handler will handle loading the profile
      
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // Clear state immediately
      setUser(null);
      setSession(null);
      setLoading(false);
      
      console.log('Sign out successful');
      
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
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