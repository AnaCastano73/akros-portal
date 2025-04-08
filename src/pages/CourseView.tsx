
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Course } from '@/types/course';
import { getCoursesForUser } from '@/services/dataService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { supabaseTyped } from '@/integrations/supabase/types-extension';

const CourseView = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && courseId) {
      fetchCourseData();
      fetchCompletedLessons();
    }
  }, [user, courseId]);

  const fetchCourseData = async () => {
    if (!user || !courseId) return;
    
    setIsLoading(true);
    try {
      const courses = await getCoursesForUser(user.id);
      const foundCourse = courses.find(c => c.id === courseId);
      
      if (foundCourse) {
        setCourse(foundCourse);
        // Set first module as active if there are modules
        if (foundCourse.modules.length > 0) {
          setActiveModule(foundCourse.modules[0].id);
          // Set first lesson as active if there are lessons
          if (foundCourse.modules[0].lessons.length > 0) {
            setActiveLesson(foundCourse.modules[0].lessons[0].id);
          }
        }
        
        // Update last accessed timestamp
        await supabaseTyped
          .from('course_enrollments')
          .update({ last_accessed: new Date().toISOString() })
          .eq('course_id', courseId)
          .eq('user_id', user.id);
      } else {
        toast({
          title: "Course not found",
          description: "The requested course could not be found or you don't have access to it.",
          variant: "destructive"
        });
        navigate('/courses');
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast({
        title: "Error",
        description: "An error occurred while loading the course.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompletedLessons = async () => {
    if (!user || !courseId) return;
    
    try {
      const { data, error } = await supabaseTyped
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('completed', true);
        
      if (error) throw error;
      
      setCompletedLessons((data || []).map(item => item.lesson_id));
    } catch (error) {
      console.error('Error fetching completed lessons:', error);
    }
  };

  const handleMarkLessonComplete = async (lessonId: string) => {
    if (!user || !courseId) return;
    
    try {
      // First check if there's an existing record
      const { data: existingProgress } = await supabaseTyped
        .from('lesson_progress')
        .select('id')
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id)
        .single();
      
      if (existingProgress) {
        // Update existing record
        await supabaseTyped
          .from('lesson_progress')
          .update({ 
            completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id);
      } else {
        // Create new record
        await supabaseTyped
          .from('lesson_progress')
          .insert({
            lesson_id: lessonId,
            user_id: user.id,
            completed: true,
            completed_at: new Date().toISOString()
          });
      }
      
      // Update local state
      setCompletedLessons(prev => [...prev, lessonId]);
      
      toast({
        title: "Progress saved",
        description: "Lesson marked as completed."
      });
      
      // Check if all lessons are completed
      if (course) {
        const allLessons = course.modules.flatMap(module => module.lessons.map(lesson => lesson.id));
        const updatedCompletedLessons = [...completedLessons, lessonId];
        
        if (allLessons.every(id => updatedCompletedLessons.includes(id))) {
          // All lessons completed, mark course as completed
          await supabaseTyped
            .from('course_enrollments')
            .update({ completed: true })
            .eq('course_id', courseId)
            .eq('user_id', user.id);
            
          toast({
            title: "Course completed!",
            description: "Congratulations on completing this course!"
          });
        }
      }
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
      toast({
        title: "Error",
        description: "Failed to save your progress.",
        variant: "destructive"
      });
    }
  };

  if (isLoading || !course) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mb-6 mx-auto"></div>
          <div className="h-96 bg-gray-200 rounded-md w-full mx-auto"></div>
        </div>
      </div>
    );
  }

  const currentModule = course.modules.find(m => m.id === activeModule);
  const currentLesson = currentModule?.lessons.find(l => l.id === activeLesson);
  const isLessonCompleted = currentLesson ? completedLessons.includes(currentLesson.id) : false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/courses')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Button>
        
        <div className="text-sm text-muted-foreground">
          {completedLessons.length} of {course.modules.flatMap(m => m.lessons).length} lessons completed
        </div>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-heading">{course.title}</h1>
        <p className="text-muted-foreground">
          {course.description}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="space-y-4">
            <h3 className="font-medium">Course Modules</h3>
            
            <div className="space-y-2">
              {course.modules.map(module => (
                <div key={module.id} className="space-y-1">
                  <button
                    className={`w-full rounded-md p-2 text-left font-medium hover:bg-secondary transition-colors ${
                      activeModule === module.id ? 'bg-secondary' : ''
                    }`}
                    onClick={() => {
                      setActiveModule(module.id);
                      if (module.lessons.length > 0) {
                        setActiveLesson(module.lessons[0].id);
                      }
                    }}
                  >
                    {module.title}
                  </button>
                  
                  {activeModule === module.id && (
                    <div className="pl-4 space-y-1">
                      {module.lessons.map(lesson => (
                        <button
                          key={lesson.id}
                          className={`w-full rounded-md p-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2 ${
                            activeLesson === lesson.id ? 'bg-secondary' : ''
                          }`}
                          onClick={() => setActiveLesson(lesson.id)}
                        >
                          {completedLessons.includes(lesson.id) ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span>{lesson.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          {currentLesson ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{currentLesson.title}</h2>
                  {isLessonCompleted ? (
                    <div className="flex items-center text-green-500 font-medium">
                      <CheckCircle className="h-5 w-5 mr-1" />
                      Completed
                    </div>
                  ) : (
                    <Button 
                      onClick={() => handleMarkLessonComplete(currentLesson.id)} 
                      variant="outline"
                    >
                      Mark as Completed
                    </Button>
                  )}
                </div>
                
                <Tabs defaultValue="content">
                  <TabsList>
                    <TabsTrigger value="content">Lesson Content</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content" className="prose prose-slate max-w-none mt-4">
                    {/* Simple rendering - in a real app, you'd use a rich text renderer here */}
                    <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                  </TabsContent>
                  
                  <TabsContent value="resources" className="mt-4">
                    <div className="space-y-4">
                      {/* This would display lesson resources */}
                      <p className="text-muted-foreground">No resources available for this lesson.</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-64 border border-dashed rounded-md">
              <div className="text-center">
                <h3 className="font-medium mb-2">No Lesson Selected</h3>
                <p className="text-muted-foreground">Select a lesson from the module menu to begin.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseView;
