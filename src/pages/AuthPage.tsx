
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import PasswordResetForm from '@/components/auth/PasswordResetForm';

type AuthMode = 'login' | 'register' | 'reset';

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const navigate = useNavigate();
  const { user, profile, getRoleDashboardPath } = useAuth();

  // Redirect if already authenticated based on role
  if (user && profile) {
    const rolePath = getRoleDashboardPath();
    navigate(rolePath);
    return null;
  }

  const handleBack = () => {
    navigate('/');
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  const showResetForm = () => {
    setMode('reset');
  };

  const backToLogin = () => {
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
