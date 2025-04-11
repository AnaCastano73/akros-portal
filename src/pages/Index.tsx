
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return; // Wait for auth state to be determined
    }
    
    if (!isAuthenticated) {
      // Not logged in, redirect to login
      navigate('/login');
      return;
    }
    
    // User is authenticated, redirect based on role
    if (user) {
      switch (user.role) {
        case 'admin':
          navigate('/admin/users');
          break;
        case 'expert':
          navigate('/expert/profile');
          break;
        case 'client':
        case 'employee':
        default:
          navigate('/dashboard');
          break;
      }
    }
  }, [navigate, isAuthenticated, user, isLoading]);

  // During loading or redirecting, show nothing
  return null;
};

export default Index;
