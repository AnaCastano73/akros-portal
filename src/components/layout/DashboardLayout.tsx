
import { Outlet, Navigate } from 'react-router-dom';
import { AppSidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useDashboardConfig } from '@/contexts/DashboardConfigContext';
import { useEffect } from 'react';

export function DashboardLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { config } = useDashboardConfig();

  // Apply branding when the component mounts or when the config changes
  useEffect(() => {
    // Update the document title
    document.title = `${config.brand.companyName} Dashboard`;
    
    // Update the favicon
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      existingFavicon.setAttribute('href', config.brand.favicon);
    } else {
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.href = config.brand.favicon;
      document.head.appendChild(favicon);
    }

    // Apply color scheme to CSS variables
    document.documentElement.style.setProperty('--primary', config.brand.primaryColor.replace('#', 'hsl('));
    document.documentElement.style.setProperty('--accent', config.brand.accentColor.replace('#', 'hsl('));
    
    // Update brand color variables in the :root
    const brandVars = [
      { name: '--brand-50', value: '#eefaf7' },
      { name: '--brand-100', value: '#d5f2ec' },
      { name: '--brand-200', value: '#ade5da' },
      { name: '--brand-300', value: '#76d1c0' },
      { name: '--brand-400', value: config.brand.accentColor },
      { name: '--brand-500', value: config.brand.primaryColor },
      { name: '--brand-600', value: config.brand.secondaryColor },
      { name: '--brand-700', value: '#0c7061' },
      { name: '--brand-800', value: '#0d584e' },
      { name: '--brand-900', value: '#0e4942' },
      { name: '--brand-950', value: '#052e28' },
    ];
    
    brandVars.forEach(({ name, value }) => {
      document.documentElement.style.setProperty(name, value);
    });
  }, [config.brand]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col md:flex-row w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 w-full">
          <Header />
          <main className="flex-1 p-3 md:p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
