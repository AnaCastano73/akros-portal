
import { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogClose, DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Building, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types/auth';

interface Company {
  id: string;
  name: string;
  domain: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  created_at: string;
  updated_at: string;
  user_count?: number;
}

interface CompanyDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
  onSuccess?: () => void;
}

export function CompanyDetailsDialog({ 
  isOpen, 
  onOpenChange, 
  company, 
  onSuccess 
}: CompanyDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [isLoading, setIsLoading] = useState(false);
  const [companyUsers, setCompanyUsers] = useState<UserType[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserType[]>([]);
  const [companyData, setCompanyData] = useState<{
    name: string;
    domain: string;
    logo_url: string;
  }>({
    name: '',
    domain: '',
    logo_url: '',
  });

  useEffect(() => {
    if (company) {
      setCompanyData({
        name: company.name,
        domain: company.domain || '',
        logo_url: company.logo_url || '',
      });
      
      if (isOpen) {
        fetchCompanyUsers();
        fetchAvailableUsers();
      }
    } else {
      // Reset for new company creation
      setCompanyData({
        name: '',
        domain: '',
        logo_url: '',
      });
    }
  }, [company, isOpen]);
  
  const fetchCompanyUsers = async () => {
    if (!company) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, avatar')
        .eq('company_id', company.id);
        
      if (error) throw error;
      
      // For each profile, get the primary role
      const usersWithRoles = await Promise.all(
        data.map(async (profile) => {
          const { data: roleData, error: roleError } = await supabase
            .rpc('get_primary_role', { _user_id: profile.id });
            
          if (roleError) throw roleError;
          
          return {
            id: profile.id,
            name: profile.name || profile.email.split('@')[0],
            email: profile.email,
            role: roleData,
            avatar: profile.avatar
          };
        })
      );
      
      setCompanyUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching company users:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load company users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchAvailableUsers = async () => {
    if (!company) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, avatar')
        .is('company_id', null);
        
      if (error) throw error;
      
      // For each profile, get the primary role
      const usersWithRoles = await Promise.all(
        data.map(async (profile) => {
          const { data: roleData, error: roleError } = await supabase
            .rpc('get_primary_role', { _user_id: profile.id });
            
          if (roleError) throw roleError;
          
          return {
            id: profile.id,
            name: profile.name || profile.email.split('@')[0],
            email: profile.email,
            role: roleData,
            avatar: profile.avatar
          };
        })
      );
      
      setAvailableUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching available users:', error);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveCompany = async () => {
    setIsLoading(true);
    try {
      if (!companyData.name) {
        toast({
          title: 'Validation Error',
          description: 'Company name is required',
          variant: 'destructive',
        });
        return;
      }
      
      if (company) {
        // Update existing company
        const { error } = await supabase
          .from('companies')
          .update({
            name: companyData.name,
            domain: companyData.domain || null,
            logo_url: companyData.logo_url || null,
          })
          .eq('id', company.id);
          
        if (error) throw error;
        
        toast({
          title: 'Company Updated',
          description: `${companyData.name} has been updated successfully`,
        });
      } else {
        // Create new company
        const { error } = await supabase
          .from('companies')
          .insert({
            name: companyData.name,
            domain: companyData.domain || null,
            logo_url: companyData.logo_url || null,
          });
          
        if (error) throw error;
        
        toast({
          title: 'Company Created',
          description: `${companyData.name} has been created successfully`,
        });
      }
      
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving company:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save company',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddUserToCompany = async (userId: string) => {
    if (!company) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ company_id: company.id })
        .eq('id', userId);
        
      if (error) throw error;
      
      toast({
        title: 'User Added',
        description: 'User has been added to the company',
      });
      
      fetchCompanyUsers();
      fetchAvailableUsers();
    } catch (error: any) {
      console.error('Error adding user to company:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add user to company',
        variant: 'destructive',
      });
    }
  };
  
  const handleRemoveUserFromCompany = async (userId: string) => {
    if (!company) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ company_id: null })
        .eq('id', userId);
        
      if (error) throw error;
      
      toast({
        title: 'User Removed',
        description: 'User has been removed from the company',
      });
      
      fetchCompanyUsers();
      fetchAvailableUsers();
    } catch (error: any) {
      console.error('Error removing user from company:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove user from company',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {company ? `Edit ${company.name}` : 'Create New Company'}
          </DialogTitle>
          <DialogDescription>
            {company ? 'Update company details and manage users' : 'Set up a new company profile'}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Company Details
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="flex items-center gap-2"
              disabled={!company}
            >
              <User className="h-4 w-4" />
              Company Users
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={companyData.name}
                  onChange={handleInputChange}
                  placeholder="Acme Corporation"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  name="domain"
                  value={companyData.domain}
                  onChange={handleInputChange}
                  placeholder="acme.com"
                />
                <p className="text-xs text-muted-foreground">
                  Domain is used for user authentication and branding.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  name="logo_url"
                  value={companyData.logo_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4 mt-4">
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-4">Assigned Users</h3>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-24">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                </div>
              ) : companyUsers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gray-200">
                              <img 
                                src={user.avatar || '/placeholder.svg'} 
                                alt={user.name} 
                                className="h-full w-full rounded-full object-cover" 
                              />
                            </div>
                            <span>{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className="capitalize">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveUserFromCompany(user.id)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No users assigned to this company yet.
                </div>
              )}
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-4">Available Users</h3>
              
              {availableUsers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gray-200">
                              <img 
                                src={user.avatar || '/placeholder.svg'} 
                                alt={user.name} 
                                className="h-full w-full rounded-full object-cover" 
                              />
                            </div>
                            <span>{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className="capitalize">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleAddUserToCompany(user.id)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add to Company
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No available users to add.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleSaveCompany}
            disabled={isLoading}
            className="bg-brand-500 hover:bg-brand-600"
          >
            {isLoading ? 'Saving...' : (company ? 'Update Company' : 'Create Company')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
