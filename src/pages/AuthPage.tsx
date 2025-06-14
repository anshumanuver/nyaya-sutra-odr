
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already authenticated
  if (user) {
    navigate('/dashboard/claimant');
    return null;
  }

  const handleBack = () => {
    navigate('/');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <>
      {isLogin ? (
        <LoginForm onBack={handleBack} onToggleMode={toggleMode} />
      ) : (
        <RegisterForm onBack={handleBack} onToggleMode={toggleMode} />
      )}
    </>
  );
};

export default AuthPage;
