
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Key, LogIn } from 'lucide-react';

interface LoginFormProps {
  onSwitchTab?: () => void;
}

export const LoginForm = ({ onSwitchTab }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-sm text-brand-500 hover:text-brand-600">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button 
                type="button" 
                className="absolute right-3 top-3 text-muted-foreground"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-brand-500 hover:bg-brand-600" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : (
              <span className="flex items-center justify-center">
                <LogIn className="h-4 w-4 mr-2" />
                Sign in
              </span>
            )}
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Demo accounts:</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setEmail('client@example.com');
                setPassword('password');
              }}
            >
              Client
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setEmail('expert@example.com');
                setPassword('password');
              }}
            >
              Expert
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setEmail('employee@example.com');
                setPassword('password');
              }}
            >
              Employee
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setEmail('admin@example.com');
                setPassword('password');
              }}
            >
              Admin
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button 
            type="button"
            onClick={onSwitchTab} 
            className="text-brand-500 hover:text-brand-600"
          >
            Sign up now
          </button>
        </p>
      </CardFooter>
    </Card>
  );
};
