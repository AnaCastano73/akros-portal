
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Building, Globe, BellRing, Shield, Save } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock settings data
  const [settings, setSettings] = useState({
    general: {
      companyName: 'Akros Advisory',
      supportEmail: 'support@akrosadvisory.com',
      websiteUrl: 'https://akrosadvisory.com'
    },
    notifications: {
      emailNotifications: true,
      newUserAlert: true,
      documentUploadAlert: true,
      courseCompletionAlert: false
    },
    security: {
      twoFactorAuth: false,
      passwordExpiry: 90,
      sessionTimeout: 30
    }
  });

  useEffect(() => {
    document.title = 'Settings - Akros Advisory';
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Redirect if not an admin
  if (user && user.role !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  const handleSaveSettings = (section: string) => {
    // In a real app, save to backend
    toast({
      title: "Settings updated",
      description: `${section} settings have been successfully updated.`,
    });
  };

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-heading">System Settings</h1>
        <p className="text-muted-foreground">
          Manage application settings and configurations
        </p>
      </div>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Update your organization's general information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={settings.general.companyName}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: {
                      ...settings.general,
                      companyName: e.target.value
                    }
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.general.supportEmail}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: {
                      ...settings.general,
                      supportEmail: e.target.value
                    }
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={settings.general.websiteUrl}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: {
                      ...settings.general,
                      websiteUrl: e.target.value
                    }
                  })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSaveSettings('General')}
                className="ml-auto bg-brand-500 hover:bg-brand-600"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BellRing className="mr-2 h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure system notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-y-0 py-2">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <Switch
                  id="emailNotifications"
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      emailNotifications: checked
                    }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between space-y-0 py-2">
                <Label htmlFor="newUserAlert">New User Registration Alerts</Label>
                <Switch
                  id="newUserAlert"
                  checked={settings.notifications.newUserAlert}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      newUserAlert: checked
                    }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between space-y-0 py-2">
                <Label htmlFor="documentUploadAlert">Document Upload Alerts</Label>
                <Switch
                  id="documentUploadAlert"
                  checked={settings.notifications.documentUploadAlert}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      documentUploadAlert: checked
                    }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between space-y-0 py-2">
                <Label htmlFor="courseCompletionAlert">Course Completion Alerts</Label>
                <Switch
                  id="courseCompletionAlert"
                  checked={settings.notifications.courseCompletionAlert}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      courseCompletionAlert: checked
                    }
                  })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSaveSettings('Notification')}
                className="ml-auto bg-brand-500 hover:bg-brand-600"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure system security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-y-0 py-2">
                <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                <Switch
                  id="twoFactorAuth"
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    security: {
                      ...settings.security,
                      twoFactorAuth: checked
                    }
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                <Input
                  id="passwordExpiry"
                  type="number"
                  min="0"
                  value={settings.security.passwordExpiry}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: {
                      ...settings.security,
                      passwordExpiry: parseInt(e.target.value)
                    }
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="1"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: {
                      ...settings.security,
                      sessionTimeout: parseInt(e.target.value)
                    }
                  })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSaveSettings('Security')}
                className="ml-auto bg-brand-500 hover:bg-brand-600"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
