
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save, Building } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { BrandingDialog } from '@/components/dashboard/BrandingDialog';
import { supabase } from '@/integrations/supabase/client';

interface Company {
  id: string;
  name: string;
  domain: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
}

interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  companyName: string;
  domain: string;
  favicon: string;
}

const CompanyBranding = () => {
  const { companyId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [brandingOpen, setBrandingOpen] = useState(false);
  const [brandingConfig, setBrandingConfig] = useState<BrandingConfig>({
    primaryColor: '#8B5CF6',
    secondaryColor: '#D6BCFA',
    accentColor: '#F97316',
    logoUrl: '',
    companyName: '',
    domain: '',
    favicon: '',
  });
  
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId, user]);
  
  const fetchCompanyData = async () => {
    setIsLoading(true);
    try {
      // Get company details
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
        
      if (companyError) throw companyError;
      
      setCompany(companyData);
      
      // Get company branding if exists
      const { data: brandingData, error: brandingError } = await supabase
        .from('company_branding')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();
        
      if (brandingError && brandingError.code !== 'PGRST116') {
        throw brandingError;
      }
      
      // Set branding config from data or defaults from company
      setBrandingConfig({
        primaryColor: brandingData?.primary_color || companyData.primary_color || '#8B5CF6',
        secondaryColor: brandingData?.secondary_color || companyData.secondary_color || '#D6BCFA',
        accentColor: brandingData?.accent_color || companyData.accent_color || '#F97316',
        logoUrl: brandingData?.logo_url || companyData.logo_url || '',
        companyName: brandingData?.company_name || companyData.name || '',
        domain: brandingData?.company_id ? companyData.domain || '' : '',
        favicon: brandingData?.favicon_url || '',
      });
    } catch (error: any) {
      console.error('Error fetching company data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load company data',
        variant: 'destructive',
      });
      navigate('/admin/companies');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenBrandingDialog = () => {
    setBrandingOpen(true);
  };
  
  const handleSaveBranding = async (branding: BrandingConfig) => {
    if (!company) return;
    
    setIsLoading(true);
    try {
      // First update company
      const { error: companyError } = await supabase
        .from('companies')
        .update({
          name: branding.companyName,
          domain: branding.domain || null,
          logo_url: branding.logoUrl || null,
          primary_color: branding.primaryColor,
          secondary_color: branding.secondaryColor,
          accent_color: branding.accentColor,
        })
        .eq('id', company.id);
        
      if (companyError) throw companyError;
      
      // Then check if branding record exists and update or insert
      const { data: existingBranding, error: checkError } = await supabase
        .from('company_branding')
        .select('id')
        .eq('company_id', company.id)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingBranding) {
        // Update existing branding
        const { error: updateError } = await supabase
          .from('company_branding')
          .update({
            company_name: branding.companyName,
            logo_url: branding.logoUrl || null,
            favicon_url: branding.favicon || null,
            primary_color: branding.primaryColor,
            secondary_color: branding.secondaryColor,
            accent_color: branding.accentColor,
          })
          .eq('id', existingBranding.id);
          
        if (updateError) throw updateError;
      } else {
        // Insert new branding
        const { error: insertError } = await supabase
          .from('company_branding')
          .insert({
            company_id: company.id,
            company_name: branding.companyName,
            logo_url: branding.logoUrl || null,
            favicon_url: branding.favicon || null,
            primary_color: branding.primaryColor,
            secondary_color: branding.secondaryColor,
            accent_color: branding.accentColor,
          });
          
        if (insertError) throw insertError;
      }
      
      toast({
        title: 'Branding Updated',
        description: 'Company branding has been updated successfully',
      });
      
      // Refresh company data
      fetchCompanyData();
    } catch (error: any) {
      console.error('Error updating company branding:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update company branding',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
  
  if (!company) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/companies')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <h2 className="text-xl font-medium text-gray-600">Company not found</h2>
            <p className="text-muted-foreground">The company you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/companies')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
          <h1 className="text-3xl font-bold tracking-tight font-heading">{company.name} Branding</h1>
        </div>
        <Button className="bg-brand-500 hover:bg-brand-600" onClick={handleOpenBrandingDialog}>
          Edit Branding
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Name</h3>
              <p>{company.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Domain</h3>
              <p>{company.domain || 'Not set'}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Brand Colors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <h3 className="text-sm font-medium mb-2">Primary</h3>
                <div 
                  className="h-20 w-full rounded-md border"
                  style={{ backgroundColor: brandingConfig.primaryColor }}
                />
                <p className="text-xs mt-1 text-center">{brandingConfig.primaryColor}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Secondary</h3>
                <div 
                  className="h-20 w-full rounded-md border"
                  style={{ backgroundColor: brandingConfig.secondaryColor }}
                />
                <p className="text-xs mt-1 text-center">{brandingConfig.secondaryColor}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Accent</h3>
                <div 
                  className="h-20 w-full rounded-md border"
                  style={{ backgroundColor: brandingConfig.accentColor }}
                />
                <p className="text-xs mt-1 text-center">{brandingConfig.accentColor}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Brand Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Logo</h3>
              {brandingConfig.logoUrl ? (
                <div className="p-4 bg-gray-50 rounded-md border flex justify-center">
                  <img 
                    src={brandingConfig.logoUrl}
                    alt={`${company.name} logo`}
                    className="max-h-16 object-contain"
                  />
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-md border text-center text-muted-foreground">
                  No logo set
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Favicon</h3>
              {brandingConfig.favicon ? (
                <div className="p-4 bg-gray-50 rounded-md border flex justify-center">
                  <img 
                    src={brandingConfig.favicon}
                    alt={`${company.name} favicon`}
                    className="h-8 w-8 object-contain"
                  />
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-md border text-center text-muted-foreground">
                  No favicon set
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <div className="bg-gray-800 p-4 flex items-center gap-4">
              {brandingConfig.logoUrl ? (
                <img 
                  src={brandingConfig.logoUrl}
                  alt="Company logo"
                  className="h-8 object-contain"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
                  {company.name.charAt(0)}
                </div>
              )}
              <span className="text-white font-bold">{brandingConfig.companyName || company.name}</span>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-3">Sample Dashboard</h2>
                <p className="text-gray-600">This is how the dashboard will look with your branding.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div 
                  className="p-4 rounded-md text-white"
                  style={{ backgroundColor: brandingConfig.primaryColor }}
                >
                  Primary Card
                </div>
                <div 
                  className="p-4 rounded-md text-gray-800"
                  style={{ backgroundColor: brandingConfig.secondaryColor }}
                >
                  Secondary Card
                </div>
                <div 
                  className="p-4 rounded-md text-white"
                  style={{ backgroundColor: brandingConfig.accentColor }}
                >
                  Accent Card
                </div>
              </div>
              
              <div className="space-y-4">
                <button 
                  className="px-4 py-2 rounded-md text-white"
                  style={{ backgroundColor: brandingConfig.primaryColor }}
                >
                  Primary Button
                </button>
                <button 
                  className="px-4 py-2 rounded-md ml-2 text-gray-800 border"
                  style={{ borderColor: brandingConfig.secondaryColor }}
                >
                  Secondary Button
                </button>
                <button 
                  className="px-4 py-2 rounded-md ml-2 text-white"
                  style={{ backgroundColor: brandingConfig.accentColor }}
                >
                  Accent Button
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <BrandingDialog
        open={brandingOpen}
        onClose={() => setBrandingOpen(false)}
      />
    </div>
  );
};

export default CompanyBranding;
