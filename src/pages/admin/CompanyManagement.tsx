
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Building, Plus, Users, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CompanyDetailsDialog } from '@/components/admin/CompanyDetailsDialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

const CompanyManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    document.title = 'Company Management - Healthwise';
    
    // Fetch companies if admin
    if (user?.role === 'admin') {
      fetchCompanies();
    }
  }, [user]);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const { data: companiesData, error } = await supabase
        .from('companies')
        .select('*');
      
      if (error) throw error;
      
      // For each company, count the number of users
      const companiesWithUserCount = await Promise.all(
        companiesData.map(async (company) => {
          const { count, error: countError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', company.id);
          
          return {
            ...company,
            user_count: count || 0
          };
        })
      );
      
      setCompanies(companiesWithUserCount);
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load companies',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is admin
  if (user?.role !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  const handleCreateCompany = () => {
    setSelectedCompany(null);
    setIsDetailsOpen(true);
  };

  const handleViewCompanyDetails = (company: Company) => {
    setSelectedCompany(company);
    setIsDetailsOpen(true);
  };

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.domain?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Company Management</h1>
          <p className="text-muted-foreground">
            Manage companies and their user accounts
          </p>
        </div>
        <Button className="bg-brand-500 hover:bg-brand-600" onClick={handleCreateCompany}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Company
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Companies</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    <div className="flex justify-center items-center h-24">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCompanies.length > 0 ? (
                filteredCompanies.map(company => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {company.logo_url ? (
                            <img 
                              src={company.logo_url} 
                              alt={company.name} 
                              className="h-full w-full rounded-full object-cover" 
                            />
                          ) : (
                            <Building className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <span className="font-medium">{company.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{company.domain || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {company.user_count}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCompanyDetails(company)}
                        >
                          Manage
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Company Branding"
                          onClick={() => navigate(`/admin/company/${company.id}/branding`)}
                        >
                          <Palette className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    No companies found. Try adjusting your search or create a new company.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <CompanyDetailsDialog 
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        company={selectedCompany}
        onSuccess={fetchCompanies}
      />
    </div>
  );
};

export default CompanyManagement;
