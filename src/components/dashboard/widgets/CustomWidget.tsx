
import React from 'react';
import { DashboardWidget as WidgetType } from '@/contexts/DashboardConfigContext';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';

interface CustomWidgetProps {
  widget: WidgetType;
  isEditing: boolean;
}

export const CustomWidget: React.FC<CustomWidgetProps> = ({ widget, isEditing }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, widget: WidgetType) => {
    e.dataTransfer.setData('widget', JSON.stringify(widget));
  };

  // Custom widget content is stored in the config
  const content = widget.config?.content || 'Custom widget content goes here';
  const htmlContent = { __html: content };

  return (
    <DashboardWidget widget={widget} isEditing={isEditing} onDragStart={handleDragStart}>
      <div className="p-4">
        <div dangerouslySetInnerHTML={htmlContent} />
      </div>
    </DashboardWidget>
  );
};
