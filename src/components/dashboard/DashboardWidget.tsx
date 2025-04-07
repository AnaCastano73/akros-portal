
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { GripVertical, X, Settings } from 'lucide-react';
import { DashboardWidget as WidgetType } from '@/contexts/DashboardConfigContext';
import { useDashboardConfig } from '@/contexts/DashboardConfigContext';
import { Button } from '@/components/ui/button';

interface DashboardWidgetProps {
  widget: WidgetType;
  children: React.ReactNode;
  isEditing: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, widget: WidgetType) => void;
  onSettingsClick?: () => void;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  widget,
  children,
  isEditing,
  onDragStart,
  onSettingsClick
}) => {
  const { removeWidget } = useDashboardConfig();
  
  return (
    <Card className="shadow-md h-full">
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-center justify-between">
          {isEditing && (
            <div 
              className="cursor-move mr-2" 
              draggable={isEditing}
              onDragStart={(e) => onDragStart(e, widget)}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <CardTitle className="text-lg flex-1">{widget.title}</CardTitle>
          {isEditing && (
            <div className="flex items-center gap-1">
              {onSettingsClick && (
                <Button variant="ghost" size="sm" onClick={onSettingsClick} className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => removeWidget(widget.id)} 
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
