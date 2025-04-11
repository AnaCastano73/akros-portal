
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Key, User, UserPlus, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SignupFormProps {
  onSwitchTab?: () => void;
}

export const SignupForm = ({ onSwitchTab }: SignupFormProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Function to send user data to Zapier through our edge function
  const sendToZapier = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
  }, token: string) => {
    try {
      console.log("Sending user data to Zapier:", userData);
      
      const { error } = await supabase.functions.invoke('send-to-zapier', {
        body: { userData },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (error) {
        console.error("Error sending data to Zapier:", error);
      } else {
        console.log("Data sent to Zapier successfully");
      }
    } catch (error) {
      console.error("Exception sending data to Zapier:", error);
    }
  };

  // Function to send user data to SharePoint Excel through our edge function
  const updateSharePointExcel = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
  }) => {
    try {
      console.log("Sending user data to SharePoint Excel:", userData);
      
      const { error } = await supabase.functions.invoke('update-sharepoint-excel', {
        body: { userData },
      });
      
      if (error) {
        console.error("Error updating SharePoint Excel:", error);
      } else {
        console.log("SharePoint Excel update triggered successfully");
      }
    } catch (error) {
      console.error("Exception updating SharePoint Excel:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are the same",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Prepare the name to be stored in user meta data for profiles
      const fullName = `${firstName} ${lastName}`.trim();
      
      // First, check if email already exists to provide better error messages
      const { data: existingUser, error: checkError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false
        }
      });
      
      if (existingUser?.user) {
        throw new Error('This email is already registered. Please use a different email or try logging in.');
      }
      
      // Proceed with signup
      console.log("Attempting to sign up with email:", email);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            name: fullName,
            company: company || null,
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (signUpError) throw signUpError;
      
      console.log("Signup response:", data);
      
      // Get session token for Zapier function authorization
      if (data?.session?.access_token) {
        // Send user data to Zapier
        await sendToZapier({
          firstName,
          lastName,
          email,
          company: company || undefined
        }, data.session.access_token);
      }
      
      // Send user data to SharePoint Excel
      await updateSharePointExcel({
        firstName,
        lastName,
        email,
        company: company || undefined
      });
      
      // Check if email confirmation is required
      if (data?.user && !data.user.confirmed_at) {
        toast({
          title: "Registration successful",
          description: "Your account has been created. Please check your email for verification.",
        });
        
        // Switch to login tab after successful signup
        if (onSwitchTab) {
          onSwitchTab();
        }
      } else {
        // If email confirmation is not required, auto-login the user
        try {
          await login(email, password);
          toast({
            title: "Registration successful",
            description: "Your account has been created and you're now logged in.",
          });
          navigate('/dashboard');
        } catch (loginError) {
          console.error('Auto-login failed:', loginError);
          // If auto-login fails, redirect to login page
          if (onSwitchTab) {
            onSwitchTab();
          }
        }
      }
    } catch (error: any) {
      console.error('Signup failed:', error);
      
      // Handle specific error cases
      if (error.message.includes('already registered')) {
        toast({
          title: "Email already registered",
          description: "This email is already in use. Please use a different email or try logging in.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration failed",
          description: error.message || "An error occurred during registration.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create an account</CardTitle>
        <CardDescription className="text-center">
          Enter your details to register for an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="first-name"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="last-name"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="company"
                type="text"
                placeholder="Acme Inc. (Optional)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-email"
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
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-password"
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

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button 
                type="button" 
                className="absolute right-3 top-3 text-muted-foreground"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-brand-500 hover:bg-brand-600" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : (
              <span className="flex items-center justify-center">
                <UserPlus className="h-4 w-4 mr-2" />
                Create account
              </span>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <button 
            type="button"
            onClick={onSwitchTab} 
            className="text-brand-500 hover:text-brand-600"
          >
            Sign in
          </button>
        </p>
      </CardFooter>
    </Card>
  );
};
