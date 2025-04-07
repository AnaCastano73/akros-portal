
import React from 'react';
import { DashboardWidget as WidgetType } from '@/contexts/DashboardConfigContext';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { Card, CardContent } from '@/components/ui/card';
import { Book, FileText, Users, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCoursesForUser, getDocumentsForUser } from '@/services/mockData';

interface StatItemProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<any>;
  colorClass: string;
}

const StatItem: React.FC<StatItemProps> = ({ title, value, icon: Icon, colorClass }) => (
  <div className="flex items-center gap-4">
    <div className={`p-3 rounded-full ${colorClass}`}>
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  </div>
);

interface StatsWidgetProps {
  widget: WidgetType;
  isEditing: boolean;
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({ widget, isEditing }) => {
  const { user } = useAuth();
  
  if (!user) return null;

  // Get relevant data for the user
  const userCourses = getCoursesForUser(user.id);
  const userDocuments = getDocumentsForUser(user.id);

  // Get stats based on user role
  const getStats = () => {
    const stats = [
      {
        title: 'Enrolled Courses',
        value: userCourses.length,
        icon: Book,
        color: 'bg-blue-100 text-blue-700',
      },
      {
        title: 'Documents',
        value: userDocuments.length,
        icon: FileText,
        color: 'bg-amber-100 text-amber-700',
      },
    ];

    if (user.role === 'admin') {
      stats.push({
        title: 'Total Users',
        value: 4, // Mock value
        icon: Users,
        color: 'bg-purple-100 text-purple-700',
      });
      stats.push({
        title: 'Completion Rate',
        value: 68, // Changed from string '68%' to number 68
        icon: GraduationCap, // Fixed: Changed from Graduation to GraduationCap
        color: 'bg-green-100 text-green-700',
      });
    }

    return stats;
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, widget: WidgetType) => {
    e.dataTransfer.setData('widget', JSON.stringify(widget));
  };

  return (
    <DashboardWidget widget={widget} isEditing={isEditing} onDragStart={handleDragStart}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {getStats().map((stat, index) => (
          <CardContent key={index} className="p-4">
            <StatItem
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              colorClass={stat.color}
            />
          </CardContent>
        ))}
      </div>
    </DashboardWidget>
  );
};
