
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("login");

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, isLoading]);

  // Check URL parameters for redirect to signup
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tab = queryParams.get('tab');
    if (tab === 'signup') {
      setActiveTab('signup');
      toast({
        title: "Welcome!",
        description: "Create an account to get started.",
      });
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 font-heading">
            Akros Advisory
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your personalized dashboard
          </p>
        </div>
        
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm onSwitchTab={() => setActiveTab("signup")} />
          </TabsContent>
          <TabsContent value="signup">
            <SignupForm onSwitchTab={() => setActiveTab("login")} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
