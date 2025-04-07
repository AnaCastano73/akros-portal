
import React from 'react';
import { DashboardWidget as WidgetType } from '@/contexts/DashboardConfigContext';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { Card, CardContent } from '@/components/ui/card';
import { BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AnnouncementsWidgetProps {
  widget: WidgetType;
  isEditing: boolean;
}

const mockAnnouncements = [
  {
    id: '1',
    title: 'New Course Available',
    content: 'Check out our new course on Financial Planning Basics.',
    date: new Date('2025-03-28'),
    priority: 'high'
  },
  {
    id: '2',
    title: 'System Maintenance',
    content: 'The portal will be down for maintenance on Saturday from 2-4 AM EST.',
    date: new Date('2025-04-02'),
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Certification Update',
    content: 'New certification requirements have been released for compliance professionals.',
    date: new Date('2025-04-05'),
    priority: 'low'
  }
];

export const AnnouncementsWidget: React.FC<AnnouncementsWidgetProps> = ({ widget, isEditing }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, widget: WidgetType) => {
    e.dataTransfer.setData('widget', JSON.stringify(widget));
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'high':
        return <Badge className="bg-red-500">Important</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500">Medium</Badge>;
      default:
        return <Badge className="bg-green-500">Info</Badge>;
    }
  };

  return (
    <DashboardWidget widget={widget} isEditing={isEditing} onDragStart={handleDragStart}>
      {mockAnnouncements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6">
          <BellRing className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-center">
            No announcements at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mockAnnouncements.slice(0, widget.config?.count || 3).map(announcement => (
            <Card key={announcement.id} className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold">{announcement.title}</div>
                  {getPriorityBadge(announcement.priority)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{announcement.content}</p>
                <div className="text-xs text-muted-foreground">
                  {announcement.date.toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
          <Button 
            variant="outline" 
            size="sm"
            className="w-full"
          >
            View All Announcements
          </Button>
        </div>
      )}
    </DashboardWidget>
  );
};
