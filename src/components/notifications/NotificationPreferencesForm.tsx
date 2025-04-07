
import { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MessageSquare, AtSign, FileText, Activity, Bell, BellRing, Mail } from 'lucide-react';

export const NotificationPreferencesForm = () => {
  const { preferences, updatePreferences, requestNotificationPermission } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  
  if (!preferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Loading preferences...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-4">
            <div className="animate-spin h-6 w-6 border-t-2 border-brand-500 rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const handleToggle = async (field: string, value: boolean) => {
    setIsLoading(true);
    
    if (field === 'browser_notifications' && value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setIsLoading(false);
        return;
      }
    }
    
    await updatePreferences({ [field]: value } as any);
    setIsLoading(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Control what notifications you receive and how you receive them
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Notification Types</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-brand-500" />
                <Label htmlFor="new-messages">New messages</Label>
              </div>
              <Switch
                id="new-messages"
                checked={preferences.new_messages}
                onCheckedChange={(checked) => handleToggle('new_messages', checked)}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AtSign className="h-4 w-4 text-brand-500" />
                <Label htmlFor="mentions">Mentions</Label>
              </div>
              <Switch
                id="mentions"
                checked={preferences.mentions}
                onCheckedChange={(checked) => handleToggle('mentions', checked)}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-brand-500" />
                <Label htmlFor="document-updates">Document updates</Label>
              </div>
              <Switch
                id="document-updates"
                checked={preferences.document_updates}
                onCheckedChange={(checked) => handleToggle('document_updates', checked)}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-brand-500" />
                <Label htmlFor="status-changes">Status changes</Label>
              </div>
              <Switch
                id="status-changes"
                checked={preferences.status_changes}
                onCheckedChange={(checked) => handleToggle('status_changes', checked)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Notification Channels</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-brand-500" />
                <Label htmlFor="in-app">In-app notifications</Label>
              </div>
              <Switch
                id="in-app"
                checked={true}
                disabled={true}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BellRing className="h-4 w-4 text-brand-500" />
                <Label htmlFor="browser">Browser notifications</Label>
              </div>
              <Switch
                id="browser"
                checked={preferences.browser_notifications}
                onCheckedChange={(checked) => handleToggle('browser_notifications', checked)}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-brand-500" />
                <Label htmlFor="push">Mobile push notifications</Label>
              </div>
              <Switch
                id="push"
                checked={preferences.push_notifications}
                onCheckedChange={(checked) => handleToggle('push_notifications', checked)}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-brand-500" />
                <Label htmlFor="email">Email notifications</Label>
              </div>
              <Switch
                id="email"
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => handleToggle('email_notifications', checked)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => requestNotificationPermission()}
            disabled={preferences.browser_notifications || isLoading}
          >
            Enable Browser Notifications
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
