
import React, { createContext, useState, useContext, useEffect } from 'react';

export interface DashboardWidget {
  id: string;
  type: 'courses' | 'documents' | 'stats' | 'progress' | 'announcements' | 'custom' | 'my-courses' | 'my-roadmap' | 'my-materials';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config?: Record<string, any>;
}

export interface BrandConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  companyName: string;
  domain: string;
  favicon: string;
}

export interface DashboardConfig {
  widgets: DashboardWidget[];
  brand: BrandConfig;
  layout: 'grid' | 'list' | 'compact';
}

// Define role-specific default widgets
const clientWidgets: DashboardWidget[] = [
  {
    id: 'my-courses-widget',
    type: 'my-courses',
    title: 'My Courses',
    position: { x: 0, y: 0, w: 4, h: 2 },
  },
  {
    id: 'my-roadmap-widget',
    type: 'my-roadmap',
    title: 'My Roadmap',
    position: { x: 4, y: 0, w: 4, h: 2 },
  },
  {
    id: 'my-materials-widget',
    type: 'my-materials',
    title: 'My Materials',
    position: { x: 8, y: 0, w: 4, h: 2 },
  }
];

const expertEmployeeWidgets: DashboardWidget[] = [
  {
    id: 'courses-widget',
    type: 'courses',
    title: 'Recent Courses',
    position: { x: 0, y: 0, w: 8, h: 2 },
  },
  {
    id: 'documents-widget',
    type: 'documents',
    title: 'Recent Documents',
    position: { x: 8, y: 0, w: 4, h: 2 },
  }
];

const adminWidgets: DashboardWidget[] = [
  {
    id: 'courses-widget',
    type: 'courses',
    title: 'Recent Courses',
    position: { x: 0, y: 0, w: 8, h: 2 },
  },
  {
    id: 'documents-widget',
    type: 'documents',
    title: 'Recent Documents',
    position: { x: 8, y: 0, w: 4, h: 2 },
  },
  {
    id: 'stats-widget',
    type: 'stats',
    title: 'Statistics',
    position: { x: 0, y: 2, w: 12, h: 1 },
  },
  {
    id: 'progress-widget',
    type: 'progress',
    title: 'Learning Progress',
    position: { x: 0, y: 3, w: 6, h: 2 },
  }
];

const defaultConfig: DashboardConfig = {
  widgets: adminWidgets,
  brand: {
    primaryColor: '#19ac91',
    secondaryColor: '#0d8a76',
    accentColor: '#3db9a4',
    logoUrl: '/placeholder.svg',
    companyName: 'Akros Advisory',
    domain: 'akrosadvisory.com',
    favicon: '/favicon.ico'
  },
  layout: 'grid'
};

interface DashboardConfigContextType {
  config: DashboardConfig;
  updateWidget: (widget: DashboardWidget) => void;
  removeWidget: (widgetId: string) => void;
  addWidget: (widget: DashboardWidget) => void;
  updateBrand: (brand: Partial<BrandConfig>) => void;
  updateLayout: (layout: 'grid' | 'list' | 'compact') => void;
  resetConfig: () => void;
  getDefaultWidgetsForRole: (role: string) => DashboardWidget[];
  initializeWidgetsForRole: (role: string) => void;
}

const DashboardConfigContext = createContext<DashboardConfigContextType>({
  config: defaultConfig,
  updateWidget: () => {},
  removeWidget: () => {},
  addWidget: () => {},
  updateBrand: () => {},
  updateLayout: () => {},
  resetConfig: () => {},
  getDefaultWidgetsForRole: () => [],
  initializeWidgetsForRole: () => {},
});

export const useDashboardConfig = () => useContext(DashboardConfigContext);

export const DashboardConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<DashboardConfig>(() => {
    const savedConfig = localStorage.getItem('dashboardConfig');
    return savedConfig ? JSON.parse(savedConfig) : defaultConfig;
  });

  // Function to get default widgets based on role
  const getDefaultWidgetsForRole = (role: string): DashboardWidget[] => {
    switch (role) {
      case 'client':
        return [...clientWidgets];
      case 'expert':
      case 'employee':
        return [...expertEmployeeWidgets];
      case 'admin':
      default:
        return [...adminWidgets];
    }
  };

  // Initialize widgets based on user role
  const initializeWidgetsForRole = (role: string) => {
    const widgets = getDefaultWidgetsForRole(role);
    setConfig(prev => ({
      ...prev,
      widgets
    }));
  };

  useEffect(() => {
    localStorage.setItem('dashboardConfig', JSON.stringify(config));
  }, [config]);

  const updateWidget = (updatedWidget: DashboardWidget) => {
    setConfig(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget => 
        widget.id === updatedWidget.id ? updatedWidget : widget
      ),
    }));
  };

  const removeWidget = (widgetId: string) => {
    setConfig(prev => ({
      ...prev,
      widgets: prev.widgets.filter(widget => widget.id !== widgetId),
    }));
  };

  const addWidget = (newWidget: DashboardWidget) => {
    setConfig(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
    }));
  };

  const updateBrand = (brandUpdates: Partial<BrandConfig>) => {
    setConfig(prev => ({
      ...prev,
      brand: {
        ...prev.brand,
        ...brandUpdates,
      },
    }));
  };

  const updateLayout = (layout: 'grid' | 'list' | 'compact') => {
    setConfig(prev => ({
      ...prev,
      layout,
    }));
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
  };

  return (
    <DashboardConfigContext.Provider
      value={{
        config,
        updateWidget,
        removeWidget,
        addWidget,
        updateBrand,
        updateLayout,
        resetConfig,
        getDefaultWidgetsForRole,
        initializeWidgetsForRole
      }}
    >
      {children}
    </DashboardConfigContext.Provider>
  );
};
