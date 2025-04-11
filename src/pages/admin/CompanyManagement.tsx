
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Building, Edit, PlusCircle, Users, Paintbrush } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Company } from '@/types/company';
import { toast } from '@/hooks/use-toast';
import { getAllCompanies } from '@/services/companyService';
import { CompanyDetailsDialog } from '@/components/admin/CompanyDetailsDialog';
import { CompanyFormDialog } from '@/components/admin/CompanyFormDialog';

const CompanyManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    document.title = 'Company Management - Healthwise Advisory Hub';
    
    // Fetch companies if admin
    if (user?.role === 'admin') {
      fetchCompanies();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const companiesData = await getAllCompanies();
      setCompanies(companiesData);
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

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.domain?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewCompanyDetails = (company: Company) => {
    setSelectedCompany(company);
    setIsDetailsOpen(true);
  };

  const handleAddCompany = () => {
    setSelectedCompany(null);
    setIsFormOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsFormOpen(true);
  };

  const handleCompanyUpdated = () => {
    fetchCompanies();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mb-6 mx-auto"></div>
          <div className="bg-gray-200 h-96 rounded-md w-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Company Management</h1>
          <p className="text-muted-foreground">
            Manage companies and their users
          </p>
        </div>
        <Button className="bg-brand-500 hover:bg-brand-600" onClick={handleAddCompany}>
          <PlusCircle className="mr-2 h-4 w-4" />
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
              {filteredCompanies.map(company => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
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
                      <span className="font-medium">{company.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{company.domain || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      <Users className="h-3 w-3" />
                      <span>Manage Users</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="Edit Company"
                        onClick={() => handleEditCompany(company)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="Customize Branding"
                      >
                        <Paintbrush className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCompanyDetails(company)}
                      >
                        View Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCompanies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    No companies found. Try adjusting your search or add a new company.
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
        onCompanyUpdated={handleCompanyUpdated}
      />
      
      <CompanyFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        company={selectedCompany}
        onCompanyUpdated={handleCompanyUpdated}
      />
    </div>
  );
};

export default CompanyManagement;
