
import React from 'react';
import { DashboardWidget as WidgetType } from '@/contexts/DashboardConfigContext';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getCourseProgressForUser, COURSES } from '@/services/mockData';
import { useNavigate } from 'react-router-dom';

interface ProgressWidgetProps {
  widget: WidgetType;
  isEditing: boolean;
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({ widget, isEditing }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;

  const courseProgress = getCourseProgressForUser(user.id);

  // Calculate progress percentages for user's courses
  const getProgressPercentage = (courseId: string) => {
    const progress = courseProgress.find(p => p.courseId === courseId);
    if (!progress) return 0;
    
    const course = COURSES.find(c => c.id === courseId);
    if (!course) return 0;
    
    const totalLessons = course.modules.reduce(
      (total, module) => total + module.lessons.length, 
      0
    );
    
    return Math.round((progress.completedLessons.length / totalLessons) * 100);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, widget: WidgetType) => {
    e.dataTransfer.setData('widget', JSON.stringify(widget));
  };

  return (
    <DashboardWidget widget={widget} isEditing={isEditing} onDragStart={handleDragStart}>
      {courseProgress.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-4">
          <p className="text-muted-foreground text-center mb-4">
            Start a course to track your progress here.
          </p>
          <Button 
            onClick={() => navigate('/courses')}
            className="bg-brand-500 hover:bg-brand-600"
          >
            Start Learning
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {courseProgress.slice(0, widget.config?.count || 3).map(progress => {
            const course = COURSES.find(c => c.id === progress.courseId);
            if (!course) return null;
            
            return (
              <Card key={progress.courseId} className="border shadow-sm">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>
                    Last accessed: {new Date(progress.lastAccessed).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span className="font-medium">{getProgressPercentage(course.id)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-brand-500 h-2 rounded-full" 
                      style={{ width: `${getProgressPercentage(course.id)}%` }}
                    ></div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 pb-4">
                  <Button 
                    size="sm"
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="w-full bg-brand-500 hover:bg-brand-600"
                  >
                    Continue Learning
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardWidget>
  );
};
