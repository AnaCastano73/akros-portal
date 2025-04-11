
import { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogClose, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Company } from '@/types/company';
import { toast } from '@/hooks/use-toast';
import { createCompany, updateCompany } from '@/services/companyService';
import { FileUpload } from '@/components/ui/file-upload';

interface CompanyFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
  onCompanyUpdated?: () => void;
}

export function CompanyFormDialog({ 
  isOpen, 
  onOpenChange, 
  company, 
  onCompanyUpdated 
}: CompanyFormDialogProps) {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const isEditing = !!company;

  useEffect(() => {
    if (company) {
      setName(company.name);
      setDomain(company.domain || '');
      setLogoUrl(company.logoUrl || null);
    } else {
      resetForm();
    }
  }, [company, isOpen]);

  const resetForm = () => {
    setName('');
    setDomain('');
    setLogo(null);
    setLogoUrl(null);
  };

  const validateForm = () => {
    if (!name.trim()) {
      toast({
        title: 'Form Error',
        description: 'Company name is required.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Convert logo to data URL if a new file was selected
      let logoDataUrl = logoUrl;
      if (logo) {
        logoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(logo);
        });
      }
      
      if (isEditing && company) {
        // Update existing company
        const success = await updateCompany(company.id, {
          name,
          domain: domain || null,
          logoUrl: logoDataUrl
        });
        
        if (success) {
          toast({
            title: 'Success',
            description: 'Company updated successfully.',
          });
          if (onCompanyUpdated) onCompanyUpdated();
          onOpenChange(false);
        } else {
          throw new Error('Failed to update company');
        }
      } else {
        // Create new company
        const newCompany = await createCompany({
          name,
          domain: domain || undefined,
          logoUrl: logoDataUrl || undefined
        });
        
        if (newCompany) {
          toast({
            title: 'Success',
            description: 'Company created successfully.',
          });
          if (onCompanyUpdated) onCompanyUpdated();
          onOpenChange(false);
        } else {
          throw new Error('Failed to create company');
        }
      }
    } catch (error: any) {
      console.error('Error saving company:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while saving the company',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Company' : 'Add New Company'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the company details below.'
              : 'Fill in the details to create a new company.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter company name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="domain">Domain (optional)</Label>
            <Input
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g., example.com"
            />
            <p className="text-xs text-muted-foreground">
              Used for email address matching and branding
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Company Logo (optional)</Label>
            <div className="flex items-center gap-4">
              {(logoUrl || logo) && (
                <div className="h-16 w-16 rounded-md border overflow-hidden flex items-center justify-center bg-gray-50">
                  <img 
                    src={logo ? URL.createObjectURL(logo) : logoUrl || ''} 
                    alt="Company logo" 
                    className="max-h-full max-w-full object-contain" 
                  />
                </div>
              )}
              <div className="flex-1">
                <FileUpload
                  onChange={setLogo}
                  value={logo}
                  accept="image/*"
                  maxSize={2}
                  buttonText="Select logo"
                />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Company' : 'Create Company'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
