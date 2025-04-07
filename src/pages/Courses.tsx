
import { useState, useEffect } from 'react';
import { CoursesList } from '@/components/courses/CoursesList';
import { useAuth } from '@/contexts/AuthContext';
import { getCoursesForRole, getCourseProgressForUser } from '@/services/mockData';

const Courses = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Courses - Healthwise Advisory Hub';
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (!user || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mb-6 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-md"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const userCourses = getCoursesForRole(user.role);
  const progress = getCourseProgressForUser(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-heading">Courses</h1>
        <p className="text-muted-foreground">
          Browse and access your available courses
        </p>
      </div>
      
      <CoursesList courses={userCourses} progress={progress} />
    </div>
  );
};

export default Courses;
