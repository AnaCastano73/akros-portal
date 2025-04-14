
import React from 'react';
import { CourseWidget } from './widgets/CourseWidget';
import { DocumentWidget } from './widgets/DocumentWidget';
import { StatsWidget } from './widgets/StatsWidget';
import { ProgressWidget } from './widgets/ProgressWidget';
import { AnnouncementsWidget } from './widgets/AnnouncementsWidget';
import { CustomWidget } from './widgets/CustomWidget';
import { MyCoursesWidget } from './widgets/MyCoursesWidget';
import { MyRoadmapWidget } from './widgets/MyRoadmapWidget';
import { MyMaterialsWidget } from './widgets/MyMaterialsWidget';
import { DashboardWidget } from '@/contexts/DashboardConfigContext';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

// Simple error boundary component
class WidgetErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Widget error:", error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="h-full">
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm text-center text-muted-foreground">
              There was a problem loading this widget.
            </p>
          </CardContent>
        </Card>
      );
    }
    
    return this.props.children;
  }
}

interface WidgetRegistryProps {
  widget: DashboardWidget;
  isEditing: boolean;
}

export const WidgetRegistry: React.FC<WidgetRegistryProps> = ({ widget, isEditing }) => {
  const renderWidget = () => {
    try {
      switch (widget.type) {
        case 'courses':
          return <CourseWidget widget={widget} isEditing={isEditing} />;
        case 'documents':
          return <DocumentWidget widget={widget} isEditing={isEditing} />;
        case 'stats':
          return <StatsWidget widget={widget} isEditing={isEditing} />;
        case 'progress':
          return <ProgressWidget widget={widget} isEditing={isEditing} />;
        case 'announcements':
          return <AnnouncementsWidget widget={widget} isEditing={isEditing} />;
        case 'custom':
          return <CustomWidget widget={widget} isEditing={isEditing} />;
        case 'my-courses':
          return <MyCoursesWidget widget={widget} isEditing={isEditing} />;
        case 'my-roadmap':
          return <MyRoadmapWidget widget={widget} isEditing={isEditing} />;
        case 'my-materials':
          return <MyMaterialsWidget widget={widget} isEditing={isEditing} />;
        default:
          return (
            <Card className="h-full">
              <CardContent className="p-4">
                <p className="text-center text-muted-foreground">
                  Unknown widget type: {(widget as any).type}
                </p>
              </CardContent>
            </Card>
          );
      }
    } catch (error) {
      console.error(`Error rendering widget ${widget.type}:`, error);
      return (
        <Card className="h-full">
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm text-center text-muted-foreground">
              Error loading widget
            </p>
          </CardContent>
        </Card>
      );
    }
  };

  return (
    <WidgetErrorBoundary>
      {renderWidget()}
    </WidgetErrorBoundary>
  );
};
