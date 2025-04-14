
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [searchParams] = useSearchParams();
  const [referralParams, setReferralParams] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, isLoading]);

  // Capture all URL parameters on component mount
  useEffect(() => {
    const params: Record<string, string> = {};
    
    // Add course parameter if present
    const course = searchParams.get('course');
    if (course) {
      params.course = course;
    }
    
    // Capture any other parameters that might be valuable for tracking
    const utm_source = searchParams.get('utm_source');
    if (utm_source) {
      params.utm_source = utm_source;
    }
    
    const utm_medium = searchParams.get('utm_medium');
    if (utm_medium) {
      params.utm_medium = utm_medium;
    }
    
    const utm_campaign = searchParams.get('utm_campaign');
    if (utm_campaign) {
      params.utm_campaign = utm_campaign;
    }
    
    setReferralParams(params);
    
    // Check for signup tab parameter
    const tab = searchParams.get('tab');
    if (tab === 'signup') {
      setActiveTab('signup');
      toast({
        title: "Welcome!",
        description: "Create an account to get started.",
      });
    }
  }, [searchParams]);

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
            <SignupForm onSwitchTab={() => setActiveTab("login")} referralParams={referralParams} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
