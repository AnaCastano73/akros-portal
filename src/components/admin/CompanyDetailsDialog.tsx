
import { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogClose 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Company } from '@/types/company';
import { User } from '@/types/auth';
import { toast } from '@/hooks/use-toast';
import { Building, Users, Paintbrush } from 'lucide-react';
import { CompanyBrandingForm } from './CompanyBrandingForm';
import { getCompanyUsers, assignUserToCompany } from '@/services/companyService';
import { getAllUsers } from '@/services/dataService';

interface CompanyDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
  onCompanyUpdated?: () => void;
}

export function CompanyDetailsDialog({ 
  isOpen, 
  onOpenChange, 
  company,
  onCompanyUpdated 
}: CompanyDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [companyUsers, setCompanyUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (isOpen && company) {
      fetchCompanyUsers();
      fetchAllUsers();
    }
  }, [isOpen, company]);

  const fetchCompanyUsers = async () => {
    if (!company) return;
    
    setIsLoading(true);
    try {
      const users = await getCompanyUsers(company.id);
      setCompanyUsers(users);
    } catch (error) {
      console.error('Error fetching company users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load company users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    setIsLoading(true);
    try {
      const users = await getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error fetching all users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUserToCompany = async (userId: string) => {
    if (!company) return;
    
    setIsLoading(true);
    try {
      const success = await assignUserToCompany(userId, company.id);
      if (success) {
        toast({
          title: 'Success',
          description: 'User added to company',
        });
        fetchCompanyUsers();
      } else {
        throw new Error('Failed to add user to company');
      }
    } catch (error: any) {
      console.error('Error adding user to company:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add user to company',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!company) return null;
  
  const nonCompanyUsers = allUsers.filter(
    user => !companyUsers.some(companyUser => companyUser.id === user.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {company.logoUrl ? (
                <img 
                  src={company.logoUrl} 
                  alt={company.name} 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <Building className="h-4 w-4 text-gray-500" />
              )}
            </div>
            <span>{company.name}</span>
          </DialogTitle>
          <DialogDescription>
            {company.domain ? `Domain: ${company.domain}` : 'No domain specified'}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Paintbrush className="h-4 w-4" />
              Branding
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Company Name</h3>
                <p className="text-base">{company.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Domain</h3>
                <p className="text-base">{company.domain || '—'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                <p className="text-base">{company.createdAt.toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                <p className="text-base">{company.updatedAt.toLocaleDateString()}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4 py-4">
            <h3 className="text-base font-medium">Company Users ({companyUsers.length})</h3>
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-md"></div>
                ))}
              </div>
            ) : companyUsers.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {companyUsers.map(user => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full overflow-hidden">
                              <img 
                                src={user.avatar || '/placeholder.svg'} 
                                alt="" 
                                className="h-full w-full object-cover" 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="capitalize">{user.role}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 border border-dashed rounded-md">
                <p className="text-muted-foreground">No users in this company yet</p>
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="text-base font-medium mb-2">Add Users to Company</h3>
              {nonCompanyUsers.length > 0 ? (
                <div className="border rounded-md p-4 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select users to add to this company:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {nonCompanyUsers.slice(0, 6).map(user => (
                      <div key={user.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full overflow-hidden">
                            <img 
                              src={user.avatar || '/placeholder.svg'} 
                              alt="" 
                              className="h-full w-full object-cover" 
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleAddUserToCompany(user.id)}
                          disabled={isLoading}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                  {nonCompanyUsers.length > 6 && (
                    <p className="text-xs text-muted-foreground text-center">
                      {nonCompanyUsers.length - 6} more users available
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 border border-dashed rounded-md">
                  <p className="text-muted-foreground">All users are already assigned to this company</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="branding" className="py-4">
            <CompanyBrandingForm 
              companyId={company.id} 
              onBrandingUpdated={() => {
                if (onCompanyUpdated) onCompanyUpdated();
              }}
            />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
