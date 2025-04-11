
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CompanyBranding } from '@/types/company';
import { toast } from '@/hooks/use-toast';
import { getCompanyBranding, updateCompanyBranding } from '@/services/companyService';
import { FileUpload } from '@/components/ui/file-upload';

interface CompanyBrandingFormProps {
  companyId: string;
  onBrandingUpdated?: () => void;
}

export function CompanyBrandingForm({ companyId, onBrandingUpdated }: CompanyBrandingFormProps) {
  const [branding, setBranding] = useState<CompanyBranding | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [favicon, setFavicon] = useState<File | null>(null);
  const [customName, setCustomName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#8B5CF6');
  const [secondaryColor, setSecondaryColor] = useState('#D6BCFA');
  const [accentColor, setAccentColor] = useState('#F97316');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [textColor, setTextColor] = useState('#000000');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (companyId) {
      fetchBranding();
    }
  }, [companyId]);

  const fetchBranding = async () => {
    setIsLoading(true);
    try {
      const brandingData = await getCompanyBranding(companyId);
      if (brandingData) {
        setBranding(brandingData);
        setCustomName(brandingData.companyName || '');
        setPrimaryColor(brandingData.primaryColor || '#8B5CF6');
        setSecondaryColor(brandingData.secondaryColor || '#D6BCFA');
        setAccentColor(brandingData.accentColor || '#F97316');
        setBackgroundColor(brandingData.backgroundColor || '#FFFFFF');
        setTextColor(brandingData.textColor || '#000000');
      }
    } catch (error) {
      console.error('Error fetching branding:', error);
      toast({
        title: 'Error',
        description: 'Failed to load company branding',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert logo and favicon to data URLs if selected
      let logoDataUrl: string | undefined;
      let faviconDataUrl: string | undefined;
      
      if (logo) {
        logoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(logo);
        });
      }
      
      if (favicon) {
        faviconDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(favicon);
        });
      }
      
      const success = await updateCompanyBranding(companyId, {
        companyName: customName || null,
        logoUrl: logoDataUrl,
        faviconUrl: faviconDataUrl,
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        textColor
      });
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Company branding updated successfully',
        });
        
        if (onBrandingUpdated) {
          onBrandingUpdated();
        }
        
        // Refresh branding data
        fetchBranding();
      } else {
        throw new Error('Failed to update branding');
      }
    } catch (error: any) {
      console.error('Error updating branding:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update company branding',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const ColorPreview = () => (
    <div className="border rounded-md p-4 space-y-4">
      <h3 className="text-base font-medium">Brand Preview</h3>
      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col items-center">
          <div 
            style={{ backgroundColor: primaryColor }}
            className="h-16 w-16 rounded-md shadow-sm"
          ></div>
          <span className="text-xs mt-2">Primary</span>
        </div>
        <div className="flex flex-col items-center">
          <div 
            style={{ backgroundColor: secondaryColor }}
            className="h-16 w-16 rounded-md shadow-sm"
          ></div>
          <span className="text-xs mt-2">Secondary</span>
        </div>
        <div className="flex flex-col items-center">
          <div 
            style={{ backgroundColor: accentColor }}
            className="h-16 w-16 rounded-md shadow-sm"
          ></div>
          <span className="text-xs mt-2">Accent</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="border">
            <div 
              style={{ backgroundColor, color: textColor }}
              className="h-16 w-16 rounded-md shadow-sm flex items-center justify-center"
            >
              <span style={{ color: textColor }}>Aa</span>
            </div>
          </div>
          <span className="text-xs mt-2">Background</span>
        </div>
      </div>
      
      <div className="pt-4 border-t mt-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border overflow-hidden flex items-center justify-center">
            {branding?.logoUrl || logo ? (
              <img 
                src={logo ? URL.createObjectURL(logo) : branding?.logoUrl || ''} 
                alt="Logo" 
                className="max-h-full max-w-full object-contain" 
              />
            ) : (
              <span className="text-xs text-muted-foreground">No logo</span>
            )}
          </div>
          <div className="font-medium">{customName || 'Company Name'}</div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <button 
            className="px-4 py-2 rounded text-white text-sm"
            style={{ backgroundColor: primaryColor }}
          >
            Primary Button
          </button>
          <button 
            className="px-4 py-2 rounded text-sm border"
            style={{ color: primaryColor, borderColor: primaryColor }}
          >
            Secondary Button
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-100 rounded-md"></div>
        <div className="h-24 bg-gray-100 rounded-md"></div>
        <div className="h-64 bg-gray-100 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium mb-2">Custom Branding</h3>
        <p className="text-sm text-muted-foreground">
          Customize the appearance of the company portal with branding elements.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {(branding?.logoUrl || logo) && (
                <div className="h-16 w-16 rounded-md border overflow-hidden flex items-center justify-center bg-gray-50">
                  <img 
                    src={logo ? URL.createObjectURL(logo) : branding?.logoUrl || ''} 
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
          
          <div className="space-y-2">
            <Label>Favicon</Label>
            <div className="flex items-center gap-4">
              {(branding?.faviconUrl || favicon) && (
                <div className="h-16 w-16 rounded-md border overflow-hidden flex items-center justify-center bg-gray-50">
                  <img 
                    src={favicon ? URL.createObjectURL(favicon) : branding?.faviconUrl || ''} 
                    alt="Favicon" 
                    className="max-h-full max-w-full object-contain" 
                  />
                </div>
              )}
              <div className="flex-1">
                <FileUpload
                  onChange={setFavicon}
                  value={favicon}
                  accept="image/*"
                  maxSize={1}
                  buttonText="Select favicon"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customName">Custom Portal Name (optional)</Label>
            <Input
              id="customName"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Override default company name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex">
                <Input
                  id="primaryColor"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-9 p-1"
                />
                <Input 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 ml-2"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-9 p-1"
                />
                <Input 
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 ml-2"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex">
                <Input
                  id="accentColor"
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-12 h-9 p-1"
                />
                <Input 
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 ml-2"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-9 p-1"
                />
                <Input 
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 ml-2"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <div className="flex">
                <Input
                  id="textColor"
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-12 h-9 p-1"
                />
                <Input 
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 ml-2"
                />
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full mt-4"
          >
            {isSaving ? 'Saving...' : 'Save Branding'}
          </Button>
        </div>
        
        <ColorPreview />
      </div>
    </div>
  );
}
