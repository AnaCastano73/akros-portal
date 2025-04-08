
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { UserRole } from '@/types/auth';
import { getUserRoles, assignRoleToUser, removeRoleFromUser } from '@/services/dataService';
import { toast } from '@/hooks/use-toast';

interface UserRoleManagerProps {
  userId: string;
  currentRole: UserRole;
  onRoleChange?: (newPrimaryRole: UserRole) => void;
}

export function UserRoleManager({ userId, currentRole, onRoleChange }: UserRoleManagerProps) {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const availableRoles: UserRole[] = ['client', 'employee', 'expert', 'admin'];
  
  useEffect(() => {
    const fetchUserRoles = async () => {
      setIsLoading(true);
      try {
        const roles = await getUserRoles(userId);
        setUserRoles(roles);
      } catch (error) {
        console.error('Error fetching user roles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserRoles();
  }, [userId]);
  
  const handleRoleToggle = async (role: UserRole, isChecked: boolean) => {
    setIsSaving(true);
    try {
      let success;
      
      if (isChecked) {
        // Add role
        success = await assignRoleToUser(userId, role);
        if (success) {
          setUserRoles(prev => [...prev, role]);
          toast({
            title: 'Role added',
            description: `User has been granted ${role} role`,
          });
        }
      } else {
        // Remove role - don't allow removing all roles
        if (userRoles.length <= 1) {
          toast({
            title: 'Cannot remove role',
            description: 'User must have at least one role',
            variant: 'destructive',
          });
          return;
        }
        
        success = await removeRoleFromUser(userId, role);
        if (success) {
          setUserRoles(prev => prev.filter(r => r !== role));
          toast({
            title: 'Role removed',
            description: `User's ${role} role has been removed`,
          });
        }
      }
      
      // If primary role might have changed, notify parent
      if (success && onRoleChange) {
        // Primary role is determined by priority: admin > expert > employee > client
        const newRoles = isChecked 
          ? [...userRoles, role] 
          : userRoles.filter(r => r !== role);
        
        let newPrimaryRole: UserRole = 'client';
        if (newRoles.includes('admin')) newPrimaryRole = 'admin';
        else if (newRoles.includes('expert')) newPrimaryRole = 'expert';
        else if (newRoles.includes('employee')) newPrimaryRole = 'employee';
        
        onRoleChange(newPrimaryRole);
      }
    } catch (error) {
      console.error('Error toggling role:', error);
      toast({
        title: 'Error updating roles',
        description: 'There was a problem updating user roles',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return <div className="py-4 text-center">Loading user roles...</div>;
  }
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Current Primary Role:</h3>
        <Badge className="capitalize">{currentRole}</Badge>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Assigned Roles:</h3>
        <div className="space-y-2">
          {availableRoles.map(role => (
            <div key={role} className="flex items-center space-x-2">
              <Checkbox 
                id={`role-${role}`}
                checked={userRoles.includes(role)}
                onCheckedChange={(checked) => 
                  handleRoleToggle(role, checked as boolean)
                }
                disabled={isSaving}
              />
              <label 
                htmlFor={`role-${role}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
              >
                {role}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        <p>Note: The primary role is determined by priority:</p>
        <p>Admin &gt; Expert &gt; Employee &gt; Client</p>
      </div>
    </div>
  );
}
