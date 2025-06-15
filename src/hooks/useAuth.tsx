
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  getRoleDashboardPath: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data: userProfile, error }) => {
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
      })
      .finally(() => setLoading(false));
  }, [user]);

  const signUp = async (email: string, password: string, userData: any) => {
    console.log('📝 Attempting signup for:', email);
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    });

    if (error) {
      console.error('❌ Signup error:', error);
    } else {
      console.log('✅ Signup successful for:', email);
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Attempting signin for:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Signin error:', error);
    } else {
      console.log('✅ Signin successful for:', email);
    }

    return { error };
  };

  const signOut = async () => {
    console.log('🚪 Attempting signout');
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('❌ Signout error:', error);
    } else {
      console.log('✅ Signout successful');
    }

    return { error };
  };

  const getRoleDashboardPath = (): string => {
    console.log('🗺️ Getting dashboard path for profile:', profile);
    if (!profile) {
      console.log('⚠️ No profile found, defaulting to claimant dashboard');
      return '/dashboard/claimant';
    }

    const path = (() => {
      switch (profile.role) {
        case 'mediator': return '/dashboard/mediator';
        case 'admin': return '/dashboard/admin';
        case 'respondent': return '/dashboard/respondent';
        default: return '/dashboard/claimant';
      }
    })();

    console.log('🎯 Dashboard path determined:', path, 'for role:', profile.role);
    return path;
  };

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
      signUp,
      signIn,
      signOut,
      getRoleDashboardPath
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
