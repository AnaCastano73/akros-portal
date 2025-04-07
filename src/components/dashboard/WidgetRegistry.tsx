
import React from 'react';
import { CourseWidget } from './widgets/CourseWidget';
import { DocumentWidget } from './widgets/DocumentWidget';
import { StatsWidget } from './widgets/StatsWidget';
import { ProgressWidget } from './widgets/ProgressWidget';
import { AnnouncementsWidget } from './widgets/AnnouncementsWidget';
import { CustomWidget } from './widgets/CustomWidget';
import { DashboardWidget } from '@/contexts/DashboardConfigContext';

interface WidgetRegistryProps {
  widget: DashboardWidget;
  isEditing: boolean;
}

export const WidgetRegistry: React.FC<WidgetRegistryProps> = ({ widget, isEditing }) => {
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
    default:
      return <div>Unknown widget type: {(widget as any).type}</div>;
  }
};
