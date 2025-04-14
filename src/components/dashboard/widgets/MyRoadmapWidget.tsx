
import React from 'react';
import { DashboardWidget as WidgetType } from '@/contexts/DashboardConfigContext';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MyRoadmapWidgetProps {
  widget: WidgetType;
  isEditing: boolean;
}

export const MyRoadmapWidget: React.FC<MyRoadmapWidgetProps> = ({ widget, isEditing }) => {
  const navigate = useNavigate();
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, widget: WidgetType) => {
    e.dataTransfer.setData('widget', JSON.stringify(widget));
  };

  const viewRoadmap = () => {
    // This would navigate to the roadmap page, for now we'll just display a placeholder
    alert('Roadmap feature coming soon!');
    // navigate('/roadmap'); // Uncomment when the roadmap page is created
  };

  return (
    <DashboardWidget widget={widget} isEditing={isEditing} onDragStart={handleDragStart}>
      <div className="flex flex-col items-center text-center p-4">
        <div className="mb-4 p-4 bg-purple-100 text-purple-700 rounded-full">
          <Map className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Personalized Roadmap</h3>
        <p className="text-muted-foreground mb-4">
          See your recommended learning path and next steps customized for your needs.
        </p>
        <Button 
          onClick={viewRoadmap} 
          className="w-full bg-brand-500 hover:bg-brand-600"
        >
          View My Roadmap
        </Button>
      </div>
    </DashboardWidget>
  );
};
