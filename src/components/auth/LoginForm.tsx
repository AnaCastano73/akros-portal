
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Sign in to your account</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-sm text-brand-500 hover:text-brand-600">
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-brand-500 hover:bg-brand-600" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
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
          <a href="#" className="text-brand-500 hover:text-brand-600">
            Contact administrator
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};
