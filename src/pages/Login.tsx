
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-brand-500 flex items-center justify-center text-white text-2xl font-bold font-heading">
              A
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 font-heading">
            Akros Advisory
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your personalized dashboard
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
