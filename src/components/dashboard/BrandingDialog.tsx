
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDashboardConfig } from '@/contexts/DashboardConfigContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

interface BrandingDialogProps {
  open: boolean;
  onClose: () => void;
}

export const BrandingDialog: React.FC<BrandingDialogProps> = ({
  open,
  onClose,
}) => {
  const { config, updateBrand } = useDashboardConfig();
  const { toast } = useToast();
  
  const [branding, setBranding] = useState({
    primaryColor: config.brand.primaryColor,
    secondaryColor: config.brand.secondaryColor,
    accentColor: config.brand.accentColor,
    logoUrl: config.brand.logoUrl,
    companyName: config.brand.companyName,
    domain: config.brand.domain,
    favicon: config.brand.favicon,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBranding(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    updateBrand(branding);
    onClose();
    
    toast({
      title: "Branding updated",
      description: "Your branding changes have been applied.",
    });

    // In a real app, we would also update the CSS variables for colors
    document.documentElement.style.setProperty('--primary', branding.primaryColor);
    document.documentElement.style.setProperty('--secondary', branding.secondaryColor);
    document.documentElement.style.setProperty('--accent', branding.accentColor);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>White Labeling & Branding</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="colors">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="logo">Logo & Identity</TabsTrigger>
            <TabsTrigger value="domain">Domain</TabsTrigger>
          </TabsList>
          
          <TabsContent value="colors" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  id="primaryColor"
                  name="primaryColor"
                  value={branding.primaryColor}
                  onChange={handleChange}
                  className="w-10 h-10 p-1"
                />
                <Input
                  type="text"
                  name="primaryColor"
                  value={branding.primaryColor}
                  onChange={handleChange}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  id="secondaryColor"
                  name="secondaryColor"
                  value={branding.secondaryColor}
                  onChange={handleChange}
                  className="w-10 h-10 p-1"
                />
                <Input
                  type="text"
                  name="secondaryColor"
                  value={branding.secondaryColor}
                  onChange={handleChange}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  id="accentColor"
                  name="accentColor"
                  value={branding.accentColor}
                  onChange={handleChange}
                  className="w-10 h-10 p-1"
                />
                <Input
                  type="text"
                  name="accentColor"
                  value={branding.accentColor}
                  onChange={handleChange}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-md mt-4">
              <div className="text-sm text-muted-foreground mb-2">Preview:</div>
              <div className="flex flex-wrap gap-2">
                <div 
                  className="w-16 h-16 rounded-md" 
                  style={{ backgroundColor: branding.primaryColor }}
                ></div>
                <div 
                  className="w-16 h-16 rounded-md" 
                  style={{ backgroundColor: branding.secondaryColor }}
                ></div>
                <div 
                  className="w-16 h-16 rounded-md" 
                  style={{ backgroundColor: branding.accentColor }}
                ></div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="logo" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                type="text"
                id="companyName"
                name="companyName"
                value={branding.companyName}
                onChange={handleChange}
              />
              <p className="text-sm text-muted-foreground">
                This will be displayed in the header and titles.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                type="text"
                id="logoUrl"
                name="logoUrl"
                value={branding.logoUrl}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-sm text-muted-foreground">
                Enter a URL to your logo image. Recommended size: 200x50px.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="favicon">Favicon URL</Label>
              <Input
                type="text"
                id="favicon"
                name="favicon"
                value={branding.favicon}
                onChange={handleChange}
                placeholder="https://example.com/favicon.ico"
              />
              <p className="text-sm text-muted-foreground">
                URL to your site favicon. Recommended size: 32x32px.
              </p>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-md mt-4 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="text-sm text-muted-foreground mb-2">Logo Preview:</div>
                <img 
                  src={branding.logoUrl} 
                  alt="Logo preview" 
                  className="max-w-[200px] max-h-[50px] object-contain bg-white p-2 rounded"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="domain" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Custom Domain</Label>
              <Input
                type="text"
                id="domain"
                name="domain"
                value={branding.domain}
                onChange={handleChange}
                placeholder="learn.yourcompany.com"
              />
              <p className="text-sm text-muted-foreground">
                Enter the domain you'd like to use for this portal.
              </p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
              <h3 className="text-amber-800 font-medium mb-1">Custom Domain Setup</h3>
              <p className="text-sm text-amber-700">
                To use a custom domain, you'll need to set up DNS records. For detailed instructions, 
                please contact your administrator or refer to our documentation.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Branding
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
