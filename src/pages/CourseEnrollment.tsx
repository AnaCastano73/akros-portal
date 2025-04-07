
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { enrollInCourse, getCourseById } from '@/services/enrollmentService';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Course } from '@/types/course';

const CourseEnrollment = () => {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [step, setStep] = useState<'details' | 'account' | 'payment' | 'processing'>('details');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Check if there's a success parameter (coming back from payment)
  const paymentStatus = searchParams.get('status');
  const paymentIntent = searchParams.get('payment_intent');
  
  useEffect(() => {
    if (paymentStatus === 'success' && paymentIntent) {
      setPaymentSuccess(true);
      setStep('processing');
      handleEnrollment(paymentIntent);
    }
  }, [paymentStatus, paymentIntent]);

  useEffect(() => {
    document.title = 'Course Enrollment - Akros Advisory';
    
    // If user is logged in, prefill email and name
    if (user) {
      setEmail(user.email);
      setName(user.name);
    }
    
    if (!courseId) {
      toast({
        title: 'Error',
        description: 'No course specified for enrollment',
        variant: 'destructive',
      });
      navigate('/courses');
      return;
    }
    
    const fetchCourse = async () => {
      try {
        const courseData = await getCourseById(courseId);
        if (!courseData) {
          throw new Error('Course not found');
        }
        setCourse(courseData);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load course details',
          variant: 'destructive',
        });
        navigate('/courses');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourse();
  }, [courseId, navigate, user]);

  const proceedToAccount = () => {
    if (!agreeTerms) {
      toast({
        title: 'Agreement Required',
        description: 'Please agree to the terms and conditions to continue',
        variant: 'destructive',
      });
      return;
    }
    
    setStep('account');
  };
  
  const proceedToPayment = async () => {
    // Validate required fields
    if (!email || !name) {
      toast({
        title: 'Missing Information',
        description: 'Please provide all required information',
        variant: 'destructive',
      });
      return;
    }
    
    // If not authenticated, validate password
    if (!isAuthenticated) {
      if (!password) {
        toast({
          title: 'Password Required',
          description: 'Please create a password for your account',
          variant: 'destructive',
        });
        return;
      }
      
      if (password !== confirmPassword) {
        toast({
          title: 'Password Mismatch',
          description: 'Passwords do not match',
          variant: 'destructive',
        });
        return;
      }
      
      if (password.length < 8) {
        toast({
          title: 'Password Too Short',
          description: 'Password must be at least 8 characters long',
          variant: 'destructive',
        });
        return;
      }
    }
    
    // If the course is free, skip payment
    if (course && course.price === 0) {
      setStep('processing');
      await handleEnrollment();
      return;
    }
    
    // For paid courses, proceed to payment
    setStep('payment');
    
    // Simulate redirecting to a payment processor
    // In a real implementation, this would redirect to Stripe or similar
    setTimeout(() => {
      // Simulate successful payment and returning to this page
      setPaymentSuccess(true);
      setStep('processing');
      handleEnrollment('mock_payment_intent_id');
    }, 2000); // Simulate payment processing delay
  };
  
  const handleEnrollment = async (paymentIntentId?: string) => {
    try {
      if (!course) return;
      
      // If user is not authenticated, attempt to login or create account
      if (!isAuthenticated) {
        try {
          // In a real implementation, this would create a new account or login
          await login(email, password);
        } catch (error) {
          toast({
            title: 'Authentication Error',
            description: 'Failed to create or login to your account',
            variant: 'destructive',
          });
          return;
        }
      }
      
      // Now enroll the user in the course
      await enrollInCourse({
        courseId: course.id,
        userEmail: email,
        userName: name,
        paymentIntentId: paymentIntentId,
      });
      
      toast({
        title: 'Enrollment Successful',
        description: `You've been enrolled in ${course.title}`,
      });
      
      // Redirect to the course
      navigate(`/courses/${course.id}`);
    } catch (error) {
      toast({
        title: 'Enrollment Failed',
        description: 'There was an error enrolling you in this course',
        variant: 'destructive',
      });
      // Reset to account step
      setStep('account');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-pulse text-center">
          <div className="h-6 w-32 bg-gray-200 rounded-md mx-auto mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded-md mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/courses')}>Browse Courses</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="h-14 w-14 bg-brand-500 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold">
            A
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Akros Advisory</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{step === 'processing' ? 'Processing Enrollment' : 'Course Enrollment'}</CardTitle>
            <CardDescription>
              {step === 'details' && `Enroll in ${course.title}`}
              {step === 'account' && 'Create or sign in to your account'}
              {step === 'payment' && `Complete payment for ${course.title}`}
              {step === 'processing' && 'Please wait while we process your enrollment'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {step === 'details' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{course.title}</h3>
                  <p className="text-gray-600">{course.description}</p>
                  {course.thumbnailUrl && (
                    <img 
                      src={course.thumbnailUrl} 
                      alt={course.title} 
                      className="w-full h-40 object-cover rounded-md mt-2"
                    />
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Price:</span>
                    <span className="font-semibold">
                      {course.price === 0 ? 'Free' : `$${(course.price / 100).toFixed(2)}`}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={agreeTerms} 
                    onCheckedChange={(checked) => setAgreeTerms(!!checked)} 
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the terms and conditions and privacy policy
                  </Label>
                </div>
              </div>
            )}
            
            {step === 'account' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    disabled={isAuthenticated}
                    placeholder="your@email.com" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    disabled={isAuthenticated}
                    placeholder="John Doe" 
                    required 
                  />
                </div>
                
                {!isAuthenticated && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="password">Create Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="******" 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        placeholder="******" 
                        required 
                      />
                    </div>
                  </>
                )}
              </div>
            )}
            
            {step === 'payment' && (
              <div className="space-y-4">
                <div className="border rounded-md p-4 bg-gray-50">
                  <div className="flex justify-between mb-2">
                    <span>Course:</span>
                    <span>{course.title}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${(course.price / 100).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="text-center">
                    <p className="mb-4">Redirecting to payment processor...</p>
                    <div className="animate-spin h-6 w-6 border-2 border-brand-500 rounded-full border-t-transparent mx-auto"></div>
                  </div>
                </div>
              </div>
            )}
            
            {step === 'processing' && (
              <div className="text-center py-4">
                <div className="animate-spin h-8 w-8 border-4 border-brand-500 rounded-full border-t-transparent mx-auto mb-4"></div>
                <p>{paymentSuccess ? 'Finalizing your enrollment...' : 'Processing your request...'}</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            {step === 'details' && (
              <Button 
                className="w-full bg-brand-500 hover:bg-brand-600" 
                onClick={proceedToAccount}
              >
                Continue
              </Button>
            )}
            
            {step === 'account' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setStep('details')}
                >
                  Back
                </Button>
                <Button 
                  className="bg-brand-500 hover:bg-brand-600" 
                  onClick={proceedToPayment}
                >
                  {course.price === 0 ? 'Enroll Now' : 'Proceed to Payment'}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Having trouble? <a href="#" className="text-brand-500 hover:underline">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseEnrollment;
