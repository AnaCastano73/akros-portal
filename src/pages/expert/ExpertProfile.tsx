
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Edit, User, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ExpertProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock data - would come from backend
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: 'Expert in digital health technology with over 10 years of experience in telehealth and remote patient monitoring systems.',
    specialties: 'Telehealth, Remote Patient Monitoring, Healthcare Analytics',
    avatar: ''
  });

  useEffect(() => {
    document.title = 'Profile - Healthwise Advisory Hub';
    
    // Load profile data
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        avatar: user.avatar || '/placeholder.svg'
      }));
    }
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [user]);

  // Redirect if not an expert
  if (user && user.role !== 'expert') {
    navigate('/dashboard');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mb-6 mx-auto"></div>
        </div>
      </div>
    );
  }

  const handleSaveProfile = () => {
    // In a real app, save to backend
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleAvatarUpload = () => {
    // Mock implementation for image upload
    toast({
      title: "Avatar uploaded",
      description: "Your profile picture has been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-heading">Expert Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile information and specialties
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>
                Update your profile picture visible to clients and team members
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback>
                  <User className="h-16 w-16 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <Button 
                onClick={handleAvatarUpload}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload New Photo
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Manage your personal and professional information
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  readOnly={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  readOnly
                  className="bg-muted"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  readOnly={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specialties">Specialties</Label>
                <Textarea
                  id="specialties"
                  value={profile.specialties}
                  onChange={(e) => setProfile({ ...profile, specialties: e.target.value })}
                  readOnly={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                  placeholder="Enter your specialties separated by commas"
                />
              </div>
            </CardContent>
            {isEditing && (
              <CardFooter>
                <Button 
                  onClick={handleSaveProfile}
                  className="ml-auto bg-brand-500 hover:bg-brand-600"
                >
                  Save Changes
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExpertProfile;
