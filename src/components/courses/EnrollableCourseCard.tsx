
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course } from '@/types/course';
import { CourseCard } from './CourseCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface EnrollableCourseCardProps {
  course: Course;
  progress?: number;
}

export function EnrollableCourseCard({ course, progress }: EnrollableCourseCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isEnrolling, setIsEnrolling] = useState(false);
  
  const handleEnroll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEnrolling(true);
    
    // Redirect to enrollment page
    navigate(`/enroll/${course.id}`);
  };
  
  return (
    <div className="relative group">
      <CourseCard course={course} progress={progress} />
      
      {/* Overlay with enroll button for courses without progress */}
      {!progress && (
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
          <Button 
            className="bg-brand-500 hover:bg-brand-600"
            onClick={handleEnroll}
            disabled={isEnrolling}
          >
            {isEnrolling ? 'Processing...' : 'Enroll Now'}
          </Button>
        </div>
      )}
      
      {/* Price tag */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow text-sm font-medium">
        {course.price === 0 ? 'Free' : `$${(course.price / 100).toFixed(2)}`}
      </div>
    </div>
  );
}
