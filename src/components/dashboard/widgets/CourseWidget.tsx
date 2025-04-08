
import React, { useState, useEffect } from 'react';
import { DashboardWidget as WidgetType } from '@/contexts/DashboardConfigContext';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { CourseCard } from '@/components/courses/CourseCard';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getCoursesForUser, getCourseProgressForUser } from '@/services/dataService';
import { Course, CourseProgress } from '@/types/course';

interface CourseWidgetProps {
  widget: WidgetType;
  isEditing: boolean;
}

export const CourseWidget: React.FC<CourseWidgetProps> = ({ widget, isEditing }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
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
      const [courses, progress] = await Promise.all([
        getCoursesForUser(user.id),
        getCourseProgressForUser(user.id)
      ]);
      
      setUserCourses(courses);
      setCourseProgress(progress);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate progress percentages for user's courses
  const getProgressPercentage = (courseId: string) => {
    const progress = courseProgress.find(p => p.courseId === courseId);
    if (!progress) return 0;
    
    const course = userCourses.find(c => c.id === courseId);
    if (!course) return 0;
    
    const totalLessons = course.modules.reduce(
      (total, module) => total + module.lessons.length, 
      0
    );
    
    if (totalLessons === 0) return 0;
    return Math.round((progress.completedLessons.length / totalLessons) * 100);
  };

  // Get recent courses (limited by widget size)
  const displayCount = widget.config?.count || 2;
  const recentCourses = userCourses.slice(0, displayCount);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, widget: WidgetType) => {
    e.dataTransfer.setData('widget', JSON.stringify(widget));
  };

  if (isLoading) {
    return (
      <DashboardWidget widget={widget} isEditing={isEditing} onDragStart={handleDragStart}>
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </DashboardWidget>
    );
  }

  return (
    <DashboardWidget widget={widget} isEditing={isEditing} onDragStart={handleDragStart}>
      {recentCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-4">
          <p className="text-muted-foreground text-center mb-4">
            You don't have any courses assigned yet.
          </p>
          <Button 
            onClick={() => navigate('/courses')}
            className="bg-brand-500 hover:bg-brand-600"
          >
            Browse Courses
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {recentCourses.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                progress={getProgressPercentage(course.id)}
              />
            ))}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full"
            onClick={() => navigate('/courses')}
          >
            View All Courses
          </Button>
        </div>
      )}
    </DashboardWidget>
  );
};
