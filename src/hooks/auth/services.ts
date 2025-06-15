
import { supabase } from '@/integrations/supabase/client';

export const authService = {
  signUp: async (email: string, password: string, userData: any) => {
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
  },

  signIn: async (email: string, password: string) => {
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
  },

  signOut: async () => {
    console.log('🚪 Attempting signout');
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('❌ Signout error:', error);
    } else {
      console.log('✅ Signout successful');
    }

    return { error };
  }
};
