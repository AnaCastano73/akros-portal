
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    // Add debug logging
    console.log('Index page - Auth state:', { isAuthenticated, isLoading, user });
    
    if (isLoading) {
      return; // Wait for auth state to be determined
    }
    
    if (!isAuthenticated) {
      // Not logged in, redirect to login
      console.log('Redirecting to login page');
      navigate('/login');
      return;
    }
    
    // User is authenticated, redirect based on role
    if (user) {
      console.log('User authenticated, redirecting based on role:', user.role);
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

  // Show a loading indicator during authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4 mx-auto"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // During redirecting, show minimal loading indicator
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
    </div>
  );
};

export default Index;
