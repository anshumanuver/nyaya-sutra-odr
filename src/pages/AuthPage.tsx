
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import PasswordResetForm from '@/components/auth/PasswordResetForm';

type AuthMode = 'login' | 'register' | 'reset';

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const navigate = useNavigate();
  const { user, profile, getRoleDashboardPath, loading } = useAuth();

  // Debug current auth state
  console.log('🔍 AuthPage state:', { 
    userExists: !!user, 
    profileExists: !!profile,
    userEmail: user?.email,
    profileRole: profile?.role,
    loading 
  });

  useEffect(() => {
    // Only redirect if we have both user and profile data AND loading is complete
    if (user && profile && !loading) {
      console.log('🎯 AuthPage: User authenticated with profile, redirecting...');
      const rolePath = getRoleDashboardPath();
      console.log('🗺️ Redirecting to:', rolePath);
      navigate(rolePath, { replace: true });
    } else if (user && !profile && !loading) {
      // User exists but no profile found - this shouldn't happen normally
      console.warn('⚠️ User exists but no profile found');
    }
  }, [user, profile, loading, navigate, getRoleDashboardPath]);

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    console.log('🔙 Navigating back to home');
    navigate('/');
  };

  const toggleMode = () => {
    const newMode = mode === 'login' ? 'register' : 'login';
    console.log('🔄 Toggling auth mode to:', newMode);
    setMode(newMode);
  };

  const showResetForm = () => {
    console.log('🔄 Showing reset form');
    setMode('reset');
  };

  const backToLogin = () => {
    console.log('🔄 Back to login form');
    setMode('login');
  };

  switch (mode) {
    case 'reset':
      return <PasswordResetForm onBack={backToLogin} />;
    case 'register':
      return <RegisterForm onBack={handleBack} onToggleMode={toggleMode} />;
    default:
      return <LoginForm onBack={handleBack} onToggleMode={toggleMode} onForgotPassword={showResetForm} />;
  }
};

export default AuthPage;
