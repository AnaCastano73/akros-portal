
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CourseDetail } from '@/components/courses/CourseDetail';
import { useAuth } from '@/contexts/AuthContext';
import { COURSES, COURSE_PROGRESS } from '@/services/mockData';
import { useToast } from '@/components/ui/use-toast';

const CourseView = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mx-auto">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-200 h-64 rounded-md"></div>
              <div className="bg-gray-200 h-96 rounded-md"></div>
            </div>
            <div className="bg-gray-200 h-64 rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  const course = COURSES.find(c => c.id === id);
  
  if (!course) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
        <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist.</p>
        <button
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-md"
          onClick={() => navigate('/courses')}
        >
          Back to Courses
        </button>
      </div>
    );
  }

  // Check if user is enrolled in this course
  if (!course.enrolledUsers.includes(user.id)) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-muted-foreground mb-6">You are not enrolled in this course.</p>
        <button
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-md"
          onClick={() => navigate('/courses')}
        >
          Back to Courses
        </button>
      </div>
    );
  }

  document.title = `${course.title} - Healthwise Advisory Hub`;

  // Get or create progress for this user
  let progress = COURSE_PROGRESS.find(p => p.userId === user.id && p.courseId === course.id);
  
  if (!progress) {
    progress = {
      userId: user.id,
      courseId: course.id,
      completedLessons: [],
      lastAccessed: new Date()
    };
    COURSE_PROGRESS.push(progress);
  } else {
    // Update last accessed
    progress.lastAccessed = new Date();
  }

  const handleCompleteLessonClick = (lessonId: string) => {
    if (!progress) return;
    
    // Toggle lesson completion status
    if (progress.completedLessons.includes(lessonId)) {
      progress.completedLessons = progress.completedLessons.filter(id => id !== lessonId);
      toast({
        title: 'Lesson marked as incomplete',
        description: 'Your progress has been updated.',
      });
    } else {
      progress.completedLessons.push(lessonId);
      toast({
        title: 'Lesson completed',
        description: 'Your progress has been saved!',
      });
    }
  };

  return (
    <CourseDetail 
      course={course} 
      progress={progress}
      onCompleteLessonClick={handleCompleteLessonClick}
    />
  );
};

export default CourseView;
