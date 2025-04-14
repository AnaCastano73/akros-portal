
import React from 'react';
import { DashboardWidget as WidgetType } from '@/contexts/DashboardConfigContext';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book } from 'lucide-react';

interface MyCoursesWidgetProps {
  widget: WidgetType;
  isEditing: boolean;
}

export const MyCoursesWidget: React.FC<MyCoursesWidgetProps> = ({ widget, isEditing }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, widget: WidgetType) => {
    e.dataTransfer.setData('widget', JSON.stringify(widget));
  };

  const redirectToThinkify = () => {
    window.open('https://thinkify.com', '_blank');
  };

  return (
    <DashboardWidget widget={widget} isEditing={isEditing} onDragStart={handleDragStart}>
      <div className="flex flex-col items-center text-center p-4">
        <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded-full">
          <Book className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Learning Resources</h3>
        <p className="text-muted-foreground mb-4">
          Access all your online courses and learning materials in one place.
        </p>
        <Button 
          onClick={redirectToThinkify} 
          className="w-full bg-brand-500 hover:bg-brand-600"
        >
          Access My Courses
        </Button>
      </div>
    </DashboardWidget>
  );
};
