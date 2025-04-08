
import React, { useState, useEffect } from 'react';
import { DashboardWidget as WidgetType } from '@/contexts/DashboardConfigContext';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { Card, CardContent } from '@/components/ui/card';
import { Book, FileText, Users, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getDocumentsForUser, getCoursesForUser, getAllUsers } from '@/services/dataService';

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
  const [stats, setStats] = useState<Array<{
    title: string;
    value: number | string;
    icon: React.ComponentType<any>;
    color: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get relevant data for the user
      const userCourses = await getCoursesForUser(user.id);
      const userDocuments = await getDocumentsForUser(user.id);
      
      const baseStats = [
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

      // Add admin-specific stats
      if (user.role === 'admin') {
        const allUsers = await getAllUsers();
        
        baseStats.push({
          title: 'Total Users',
          value: allUsers.length,
          icon: Users,
          color: 'bg-purple-100 text-purple-700',
        });
        
        // Completion rate would require more complex data analysis
        // This is a placeholder calculation
        const completionRate = 68; // Placeholder
        baseStats.push({
          title: 'Completion Rate',
          value: completionRate,
          icon: GraduationCap,
          color: 'bg-green-100 text-green-700',
        });
      }
      
      setStats(baseStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats on error
      setStats([
        {
          title: 'Enrolled Courses',
          value: 0,
          icon: Book,
          color: 'bg-blue-100 text-blue-700',
        },
        {
          title: 'Documents',
          value: 0,
          icon: FileText,
          color: 'bg-amber-100 text-amber-700',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, widget: WidgetType) => {
    e.dataTransfer.setData('widget', JSON.stringify(widget));
  };
  
  if (isLoading) {
    return (
      <DashboardWidget widget={widget} isEditing={isEditing} onDragStart={handleDragStart}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <CardContent key={index} className="p-4">
              <div className="animate-pulse flex items-center gap-4">
                <div className="bg-gray-200 h-12 w-12 rounded-full"></div>
                <div className="space-y-2 w-full">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </CardContent>
          ))}
        </div>
      </DashboardWidget>
    );
  }

  return (
    <DashboardWidget widget={widget} isEditing={isEditing} onDragStart={handleDragStart}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
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
