
import React, { useState, useEffect } from 'react';
import { DashboardWidget as WidgetType } from '@/contexts/DashboardConfigContext';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCoursesForUser, getCourseProgressForUser } from '@/services/dataService';
import { Course, CourseProgress } from '@/types/course';

interface ProgressWidgetProps {
  widget: WidgetType;
  isEditing: boolean;
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({ widget, isEditing }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [courses, progressData] = await Promise.all([
        getCoursesForUser(user.id),
        getCourseProgressForUser(user.id)
      ]);
      
      setUserCourses(courses);
      setProgress(progressData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate progress percentages for user's courses
  const getProgressPercentage = (courseId: string) => {
    const courseProgress = progress.find(p => p.courseId === courseId);
    if (!courseProgress) return 0;
    
    const course = userCourses.find(c => c.id === courseId);
    if (!course) return 0;
    
    const totalLessons = course.modules.reduce(
      (total, module) => total + module.lessons.length, 
      0
    );
    
    if (totalLessons === 0) return 0;
    return Math.round((courseProgress.completedLessons.length / totalLessons) * 100);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, widget: WidgetType) => {
    e.dataTransfer.setData('widget', JSON.stringify(widget));
  };

  if (isLoading) {
    return (
      <DashboardWidget widget={widget} isEditing={isEditing} onDragStart={handleDragStart}>
        <div className="animate-pulse space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-md border p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </DashboardWidget>
    );
  }

  return (
    <DashboardWidget widget={widget} isEditing={isEditing} onDragStart={handleDragStart}>
      {progress.length === 0 ? (
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
          {progress.slice(0, widget.config?.count || 3).map(progressItem => {
            const course = userCourses.find(c => c.id === progressItem.courseId);
            if (!course) return null;
            
            return (
              <Card key={progressItem.courseId} className="border shadow-sm">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>
                    Last accessed: {progressItem.lastAccessed.toLocaleDateString()}
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
