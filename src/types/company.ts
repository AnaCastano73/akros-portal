
export interface Company {
  id: string;
  name: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
  domain?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyBranding {
  id: string;
  companyId: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  companyName?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
