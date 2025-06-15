
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

  // Auth state listener
  useEffect(() => {
    console.log('🔄 AuthProvider: Setting up auth state listener');
    setLoading(true);

    // Always sync session and user on auth state change (DO NOT fetch profile here!)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false); // Update loading as soon as session/user is set
      }
    );

    // Check for existing session and update user/session immediately
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ Error getting session:', error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        console.log('📋 Initial session check:', session?.user?.email || 'No session');
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Separate effect to fetch profile when user changes
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    
    setLoading(true);
    console.log('👤 Fetching profile for:', user.id);
    
    const fetchProfile = async () => {
      try {
        const { data: userProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('❌ Error fetching profile:', error);
          setProfile(null);
        } else if (!userProfile) {
          console.warn('⚠️ No profile found for user:', user.id);
          setProfile(null);
        } else {
          console.log('✅ Profile fetched successfully:', userProfile);
          setProfile(userProfile as Profile);
        }
      } catch (err) {
        console.error('❌ Unexpected error in profile fetch:', err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

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
