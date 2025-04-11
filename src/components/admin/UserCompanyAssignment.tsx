
import { useState, useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabaseTyped } from '@/integrations/supabase/types-extension';
import { toast } from '@/hooks/use-toast';

interface Company {
  id: string;
  name: string;
}

interface UserCompanyAssignmentProps {
  userId: string;
  currentCompanyId: string | null;
  onCompanyChange?: (companyId: string | null) => void;
}

export function UserCompanyAssignment({ 
  userId, 
  currentCompanyId, 
  onCompanyChange 
}: UserCompanyAssignmentProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchCompanies();
  }, []);
  
  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseTyped
        .from('companies')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCompanyChange = async (companyId: string | null) => {
    try {
      const { error } = await supabaseTyped
        .from('profiles')
        .update({ company_id: companyId })
        .eq('id', userId);
        
      if (error) throw error;
      
      if (onCompanyChange) {
        onCompanyChange(companyId);
      }
      
      toast({
        title: 'Company Updated',
        description: companyId 
          ? 'User has been assigned to the company' 
          : 'User has been removed from company',
      });
    } catch (error: any) {
      console.error('Error updating user company:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user company',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return <div className="py-4 text-center">Loading companies...</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="company">Company Assignment</Label>
        <Select
          value={currentCompanyId || ''}
          onValueChange={(value) => handleCompanyChange(value || null)}
        >
          <SelectTrigger id="company">
            <SelectValue placeholder="Not assigned to a company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Not assigned to a company</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Assign this user to a company for organization-based access and branding.
        </p>
      </div>
    </div>
  );
}
