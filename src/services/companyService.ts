import { supabase } from '@/integrations/supabase/client';
import { supabaseTyped } from '@/integrations/supabase/types-extension';
import { Company, CompanyBranding } from '@/types/company';
import { User } from '@/types/auth';

export const getAllCompanies = async (): Promise<Company[]> => {
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');
      
    if (error) throw error;
    
    return companies.map(company => ({
      id: company.id,
      name: company.name,
      logoUrl: company.logo_url,
      primaryColor: company.primary_color,
      secondaryColor: company.secondary_color,
      accentColor: company.accent_color,
      domain: company.domain,
      createdAt: new Date(company.created_at),
      updatedAt: new Date(company.updated_at)
    }));
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
};

export const getCompanyById = async (companyId: string): Promise<Company | null> => {
  try {
    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();
      
    if (error) throw error;
    
    return {
      id: company.id,
      name: company.name,
      logoUrl: company.logo_url,
      primaryColor: company.primary_color,
      secondaryColor: company.secondary_color,
      accentColor: company.accent_color,
      domain: company.domain,
      createdAt: new Date(company.created_at),
      updatedAt: new Date(company.updated_at)
    };
  } catch (error) {
    console.error('Error fetching company:', error);
    return null;
  }
};

export const getUserCompany = async (userId: string): Promise<Company | null> => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', userId)
      .single();
      
    if (profileError || !profile?.company_id) return null;
    
    return getCompanyById(profile.company_id);
  } catch (error) {
    console.error('Error fetching user company:', error);
    return null;
  }
};

export const createCompany = async (companyData: {
  name: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  domain?: string;
}): Promise<Company | null> => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert({
        name: companyData.name,
        logo_url: companyData.logoUrl,
        primary_color: companyData.primaryColor,
        secondary_color: companyData.secondaryColor,
        accent_color: companyData.accentColor,
        domain: companyData.domain
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      logoUrl: data.logo_url,
      primaryColor: data.primary_color,
      secondaryColor: data.secondary_color,
      accentColor: data.accent_color,
      domain: data.domain,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error creating company:', error);
    return null;
  }
};

export const updateCompany = async (
  companyId: string, 
  companyData: Partial<Omit<Company, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<boolean> => {
  try {
    const updateData: any = {};
    
    if (companyData.name) updateData.name = companyData.name;
    if (companyData.logoUrl !== undefined) updateData.logo_url = companyData.logoUrl;
    if (companyData.primaryColor !== undefined) updateData.primary_color = companyData.primaryColor;
    if (companyData.secondaryColor !== undefined) updateData.secondary_color = companyData.secondaryColor;
    if (companyData.accentColor !== undefined) updateData.accent_color = companyData.accentColor;
    if (companyData.domain !== undefined) updateData.domain = companyData.domain;
    
    const { error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', companyId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating company:', error);
    return false;
  }
};

export const assignUserToCompany = async (userId: string, companyId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ company_id: companyId })
      .eq('id', userId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error assigning user to company:', error);
    return false;
  }
};

export const getCompanyBranding = async (companyId: string): Promise<CompanyBranding | null> => {
  try {
    const { data, error } = await supabase
      .from('company_branding')
      .select('*')
      .eq('company_id', companyId)
      .single();
      
    if (error) {
      // If no branding exists yet, create a default one
      if (error.code === 'PGRST116') {
        return createCompanyBranding(companyId, {});
      }
      throw error;
    }
    
    return {
      id: data.id,
      companyId: data.company_id,
      logoUrl: data.logo_url,
      faviconUrl: data.favicon_url,
      primaryColor: data.primary_color,
      secondaryColor: data.secondary_color,
      accentColor: data.accent_color,
      backgroundColor: data.background_color,
      textColor: data.text_color,
      companyName: data.company_name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error fetching company branding:', error);
    return null;
  }
};

export const createCompanyBranding = async (
  companyId: string,
  brandingData: Partial<Omit<CompanyBranding, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>>
): Promise<CompanyBranding | null> => {
  try {
    const { data, error } = await supabase
      .from('company_branding')
      .insert({
        company_id: companyId,
        logo_url: brandingData.logoUrl,
        favicon_url: brandingData.faviconUrl,
        primary_color: brandingData.primaryColor,
        secondary_color: brandingData.secondaryColor,
        accent_color: brandingData.accentColor,
        background_color: brandingData.backgroundColor,
        text_color: brandingData.textColor,
        company_name: brandingData.companyName
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      companyId: data.company_id,
      logoUrl: data.logo_url,
      faviconUrl: data.favicon_url,
      primaryColor: data.primary_color,
      secondaryColor: data.secondary_color,
      accentColor: data.accent_color,
      backgroundColor: data.background_color,
      textColor: data.text_color,
      companyName: data.company_name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error creating company branding:', error);
    return null;
  }
};

export const updateCompanyBranding = async (
  companyId: string,
  brandingData: Partial<Omit<CompanyBranding, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>>
): Promise<boolean> => {
  try {
    // Check if branding exists first
    const { data: existingBranding, error: checkError } = await supabase
      .from('company_branding')
      .select('id')
      .eq('company_id', companyId)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    // If no branding exists, create it
    if (!existingBranding) {
      await createCompanyBranding(companyId, brandingData);
      return true;
    }
    
    // Otherwise update the existing branding
    const updateData: any = {};
    
    if (brandingData.logoUrl !== undefined) updateData.logo_url = brandingData.logoUrl;
    if (brandingData.faviconUrl !== undefined) updateData.favicon_url = brandingData.faviconUrl;
    if (brandingData.primaryColor !== undefined) updateData.primary_color = brandingData.primaryColor;
    if (brandingData.secondaryColor !== undefined) updateData.secondary_color = brandingData.secondaryColor;
    if (brandingData.accentColor !== undefined) updateData.accent_color = brandingData.accentColor;
    if (brandingData.backgroundColor !== undefined) updateData.background_color = brandingData.backgroundColor;
    if (brandingData.textColor !== undefined) updateData.text_color = brandingData.textColor;
    if (brandingData.companyName !== undefined) updateData.company_name = brandingData.companyName;
    
    const { error } = await supabase
      .from('company_branding')
      .update(updateData)
      .eq('company_id', companyId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating company branding:', error);
    return false;
  }
};

export const getCompanyUsers = async (companyId: string): Promise<User[]> => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, name, email, avatar, company_id')
      .eq('company_id', companyId);
      
    if (error) throw error;
    
    // For each profile, get their primary role
    const usersWithRoles = await Promise.all(profiles.map(async (profile) => {
      const { data: roleData, error: roleError } = await supabase
        .rpc('get_primary_role', { _user_id: profile.id });
        
      if (roleError) {
        console.error('Error fetching role for user:', profile.id, roleError);
        return null;
      }
      
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name || profile.email.split('@')[0] || 'Unknown',
        role: roleData,
        avatar: profile.avatar || '/placeholder.svg',
        companyId: profile.company_id
      };
    }));
    
    // Filter out any null values (from errors)
    return usersWithRoles.filter(Boolean) as User[];
  } catch (error) {
    console.error('Error fetching company users:', error);
    return [];
  }
};
