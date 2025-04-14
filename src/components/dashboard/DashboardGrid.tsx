import React, { useState, useEffect } from 'react';
import { WidgetRegistry } from './WidgetRegistry';
import { useDashboardConfig, DashboardWidget } from '@/contexts/DashboardConfigContext';
import { Button } from '@/components/ui/button';
import { 
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from '@/components/ui/resizable';
import { Plus, Save, RotateCcw, Paintbrush, Layout, AlertTriangle } from 'lucide-react';
import { AddWidgetDialog } from './AddWidgetDialog';
import { BrandingDialog } from './BrandingDialog';
import { v4 as uuidv4 } from 'uuid';
import { Card } from '@/components/ui/card';

interface DashboardGridProps {
  isAdmin: boolean;
  userRole: string;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ isAdmin, userRole }) => {
  const { config, updateWidget, resetConfig, updateLayout } = useDashboardConfig();
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showBranding, setShowBranding] = useState(false);
  const [initialSetupDone, setInitialSetupDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Setup default widgets based on user role
  useEffect(() => {
    try {
      setIsLoading(true);
      if (!isAdmin && !initialSetupDone) {
        setupWidgetsByRole(userRole);
        setInitialSetupDone(true);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error setting up dashboard:", error);
      setHasError(true);
      setIsLoading(false);
    }
  }, [userRole, isAdmin, initialSetupDone]);

  const setupWidgetsByRole = (role: string) => {
    try {
      let newWidgets: DashboardWidget[] = [];
      
      if (role === 'client') {
        // For clients, we want to show only the new widgets
        newWidgets = [
          {
            id: uuidv4(),
            type: 'my-courses',
            title: 'My Courses',
            position: { x: 0, y: 0, w: 4, h: 2 },
          },
          {
            id: uuidv4(),
            type: 'my-roadmap',
            title: 'My Roadmap',
            position: { x: 4, y: 0, w: 4, h: 2 },
          },
          {
            id: uuidv4(),
            type: 'my-materials',
            title: 'My Materials',
            position: { x: 8, y: 0, w: 4, h: 2 },
          }
        ];
      } else if (role === 'expert' || role === 'employee') {
        // For experts and employees, remove stats and progress widgets
        newWidgets = config.widgets.filter(widget => 
          widget.type !== 'stats' && widget.type !== 'progress'
        );
      }
      
      // Update the widgets in the config without force reloading
      resetConfigWithWidgets(newWidgets, false);
    } catch (error) {
      console.error("Error in setupWidgetsByRole:", error);
      setHasError(true);
    }
  };

  const resetConfigWithWidgets = (widgets: DashboardWidget[], forceReload: boolean = true) => {
    try {
      // Create a new config with the specified widgets
      const newConfig = {
        ...config,
        widgets
      };
      
      // Set the new config to localStorage
      localStorage.setItem('dashboardConfig', JSON.stringify(newConfig));
      
      // Force a reload only if explicitly requested
      if (forceReload) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error in resetConfigWithWidgets:", error);
      setHasError(true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const widgetData = e.dataTransfer.getData('widget');
    if (!widgetData) return;

    const widget = JSON.parse(widgetData) as DashboardWidget;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate grid position based on drop coordinates
    const gridX = Math.floor((x / rect.width) * 12);
    const gridY = Math.floor(y / 100); // assuming each row is roughly 100px

    updateWidget({
      ...widget,
      position: {
        ...widget.position,
        x: gridX,
        y: gridY
      }
    });
  };

  const addNewWidget = (type: string, title: string) => {
    const newWidget: DashboardWidget = {
      id: uuidv4(),
      type: type as any,
      title,
      position: { x: 0, y: config.widgets.length, w: 6, h: 2 },
      config: {}
    };
    
    updateWidget(newWidget);
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (hasError) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center text-center p-4">
          <div className="mb-4 p-4 bg-amber-100 text-amber-700 rounded-full">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Dashboard Error</h3>
          <p className="text-muted-foreground mb-4">
            There was a problem loading your dashboard configuration.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full bg-brand-500 hover:bg-brand-600"
          >
            Refresh Dashboard
          </Button>
        </div>
      </Card>
    );
  }

  if (!isAdmin && !isEditing) {
    // Non-admin view
    return (
      <div className={`grid grid-cols-12 gap-4 relative`}>
        {config.widgets.map((widget) => (
          <div 
            key={widget.id}
            className={`col-span-${widget.position.w} row-span-${widget.position.h}`}
            style={{ 
              gridColumnStart: widget.position.x + 1,
              gridRowStart: widget.position.y + 1,
              gridColumnEnd: widget.position.x + widget.position.w + 1,
              gridRowEnd: widget.position.y + widget.position.h + 1,
            }}
          >
            <WidgetRegistry widget={widget} isEditing={false} />
          </div>
        ))}
      </div>
    );
  }

  // Admin edit view
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Dashboard Configuration</h2>
          <p className="text-muted-foreground">Customize your dashboard layout and appearance</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowBranding(true)}
          >
            <Paintbrush className="h-4 w-4 mr-2" />
            Branding
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              updateLayout(
                config.layout === 'grid' 
                  ? 'list' 
                  : config.layout === 'list' 
                    ? 'compact' 
                    : 'grid'
              );
            }}
          >
            <Layout className="h-4 w-4 mr-2" />
            Layout: {config.layout}
          </Button>
          <Button 
            variant={isEditing ? "default" : "outline"} 
            size="sm"
            onClick={toggleEditMode}
          >
            {isEditing ? 'Done' : 'Edit Dashboard'}
          </Button>
          {isEditing && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddWidget(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetConfig}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </>
          )}
        </div>
      </div>

      <div 
        className={`grid grid-cols-12 gap-4 p-4 min-h-[600px] relative rounded-lg ${
          isEditing ? 'border-2 border-dashed border-muted' : ''
        } ${isDragging ? 'border-brand-400 bg-brand-50/50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {config.widgets.map((widget) => (
          <div 
            key={widget.id}
            className={`col-span-${widget.position.w} row-span-${widget.position.h}`}
            style={{ 
              gridColumnStart: widget.position.x + 1,
              gridRowStart: widget.position.y + 1,
              gridColumnEnd: widget.position.x + widget.position.w + 1,
              gridRowEnd: widget.position.y + widget.position.h + 1,
            }}
          >
            <WidgetRegistry widget={widget} isEditing={isEditing} />
          </div>
        ))}

        {isEditing && config.widgets.length === 0 && (
          <div className="col-span-12 flex flex-col items-center justify-center h-64 text-muted-foreground">
            <p className="mb-4">Drag and drop widgets here or add a new widget</p>
            <Button 
              variant="outline" 
              onClick={() => setShowAddWidget(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
          </div>
        )}
      </div>

      <AddWidgetDialog 
        open={showAddWidget} 
        onClose={() => setShowAddWidget(false)} 
        onAddWidget={addNewWidget} 
      />

      <BrandingDialog 
        open={showBranding} 
        onClose={() => setShowBranding(false)} 
      />
    </div>
  );
};
