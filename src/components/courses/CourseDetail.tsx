
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Course, CourseProgress, Lesson as LessonType } from '@/types/course';
import { Check, ArrowLeft, Play, FileText } from 'lucide-react';

interface CourseDetailProps {
  course: Course;
  progress?: CourseProgress;
  onCompleteLessonClick: (lessonId: string) => void;
}

export function CourseDetail({
  course,
  progress,
  onCompleteLessonClick,
}: CourseDetailProps) {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState(course.modules[0]?.id);
  const [activeLesson, setActiveLesson] = useState<LessonType | null>(null);

  // Calculate progress
  const totalLessons = course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );
  const completedLessons = progress?.completedLessons.length || 0;
  const progressPercentage = totalLessons
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  const handleLessonClick = (lesson: LessonType) => {
    setActiveLesson(lesson);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/courses')}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
        <div className="flex gap-2">
          {course.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-brand-100 text-brand-800">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{course.title}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Course Progress</span>
                    <span className="text-sm font-medium">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{course.modules.length}</div>
                    <div className="text-sm text-muted-foreground">Modules</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{totalLessons}</div>
                    <div className="text-sm text-muted-foreground">Lessons</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{completedLessons}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {activeLesson ? (
            <Card>
              <CardHeader>
                <Button 
                  variant="ghost" 
                  className="mb-2 -ml-2" 
                  onClick={() => setActiveLesson(null)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to modules
                </Button>
                <CardTitle>{activeLesson.title}</CardTitle>
                <CardDescription>{activeLesson.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeLesson.videoUrl && (
                  <div className="aspect-video bg-muted rounded-md overflow-hidden">
                    <iframe
                      src={activeLesson.videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
                
                {activeLesson.content && (
                  <div className="prose max-w-none">
                    <p>{activeLesson.content}</p>
                  </div>
                )}
                
                {activeLesson.resources && activeLesson.resources.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Resources</h3>
                    <div className="space-y-2">
                      {activeLesson.resources.map(resource => (
                        <a
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 rounded-md bg-secondary hover:bg-secondary/80"
                        >
                          <FileText className="h-5 w-5 mr-2 text-brand-500" />
                          <span>{resource.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => onCompleteLessonClick(activeLesson.id)}
                    className={`${
                      progress?.completedLessons.includes(activeLesson.id)
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-brand-500 hover:bg-brand-600'
                    }`}
                  >
                    {progress?.completedLessons.includes(activeLesson.id) ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Completed
                      </>
                    ) : (
                      'Mark as Complete'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs
              defaultValue={activeModule}
              value={activeModule}
              onValueChange={setActiveModule}
            >
              <TabsList className="grid grid-cols-2 sm:grid-cols-3 w-full h-auto">
                {course.modules.map((module) => (
                  <TabsTrigger key={module.id} value={module.id} className="py-2">
                    {module.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              {course.modules.map((module) => (
                <TabsContent key={module.id} value={module.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{module.title}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {module.lessons.map((lesson) => {
                          const isCompleted = progress?.completedLessons.includes(lesson.id);
                          
                          return (
                            <div key={lesson.id}>
                              <div 
                                className="flex items-center justify-between p-3 rounded-md bg-secondary/50 hover:bg-secondary cursor-pointer"
                                onClick={() => handleLessonClick(lesson)}
                              >
                                <div className="flex items-center">
                                  <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                                    isCompleted ? 'bg-green-100 text-green-700' : 'bg-brand-100 text-brand-700'
                                  }`}>
                                    {isCompleted ? (
                                      <Check className="h-4 w-4" />
                                    ) : (
                                      <Play className="h-4 w-4" />
                                    )}
                                  </div>
                                  <div>
                                    <h3 className="font-medium">{lesson.title}</h3>
                                    <p className="text-sm text-muted-foreground">{lesson.description}</p>
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation(); 
                                    handleLessonClick(lesson);
                                  }}
                                >
                                  {isCompleted ? 'Review' : 'Start'}
                                </Button>
                              </div>
                              {module.lessons.indexOf(lesson) < module.lessons.length - 1 && (
                                <Separator className="my-2" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Modules</h3>
                <p className="font-semibold">{course.modules.length}</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Lessons</h3>
                <p className="font-semibold">{totalLessons}</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Last Accessed</h3>
                <p className="font-semibold">
                  {progress?.lastAccessed
                    ? new Date(progress.lastAccessed).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
