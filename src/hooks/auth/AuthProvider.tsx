
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from './context';
import { Profile } from './types';
import { authService } from './services';
import { getRoleDashboardPath } from './utils';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch profile data
  const fetchProfile = async (userId: string) => {
    console.log('👤 Fetching profile for user:', userId);
    try {
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching profile:', error);
        return null;
      } else if (!userProfile) {
        console.warn('⚠️ No profile found for user:', userId);
        return null;
      } else {
        console.log('✅ Profile fetched successfully:', userProfile);
        return userProfile as Profile;
      }
    } catch (err) {
      console.error('❌ Unexpected error in profile fetch:', err);
      return null;
    }
  };

  // Auth state listener
  useEffect(() => {
    console.log('🔄 AuthProvider: Setting up auth state listener');
    setLoading(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);

        // If user is logged in, fetch their profile
        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        
        // Set loading to false only after profile is fetched (or user is null)
        setLoading(false);
      }
    );

    // Check for existing session and handle it
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          return;
        }

        console.log('📋 Initial session check:', session?.user?.email || 'No session');
        
        setSession(session);
        setUser(session?.user ?? null);

        // If user exists, fetch their profile
        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('❌ Error initializing auth:', err);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  console.log('🔍 Auth Provider State:', {
    userEmail: user?.email,
    profileRole: profile?.role,
    loading,
    sessionExists: !!session
  });

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp: authService.signUp,
      signIn: authService.signIn,
      signOut: authService.signOut,
      getRoleDashboardPath: () => getRoleDashboardPath(profile)
    }}>
      {children}
    </AuthContext.Provider>
  );
};
