
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CourseCard } from '@/components/courses/CourseCard';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { Book, BookOpen, FileText, Users, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCoursesForRole, getCourseProgressForUser, getDocumentsForUser, COURSES, DOCUMENTS } from '@/services/mockData';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Dashboard - Healthwise Advisory Hub';
  }, []);

  if (!user) return null;

  // Get relevant data for the user
  const userCourses = getCoursesForRole(user.role);
  const courseProgress = getCourseProgressForUser(user.id);
  const userDocuments = getDocumentsForUser(user.id);

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

  // Get recent courses (first 3)
  const recentCourses = userCourses.slice(0, 3);

  // Get recent documents (first 2)
  const recentDocuments = userDocuments.slice(0, 2);

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
    }

    return stats;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, <span className="text-brand-600 font-medium">{user.name}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="capitalize">
            {user.role}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getStats().map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold font-heading">Recent Courses</h2>
            <Button 
              variant="outline" 
              onClick={() => navigate('/courses')}
            >
              View All
            </Button>
          </div>
          {recentCourses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 min-h-[200px]">
                <div className="bg-brand-100 p-3 rounded-full text-brand-500 mb-4">
                  <Book className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-medium mb-2">No courses yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  You don't have any courses assigned to you yet.
                </p>
                <Button 
                  className="bg-brand-500 hover:bg-brand-600"
                  onClick={() => navigate('/courses')}
                >
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentCourses.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  progress={getProgressPercentage(course.id)}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-8">
            <h2 className="text-2xl font-semibold font-heading">Recent Documents</h2>
            <Button 
              variant="outline"
              onClick={() => navigate('/documents')}
            >
              View All
            </Button>
          </div>
          {recentDocuments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 min-h-[200px]">
                <div className="bg-amber-100 p-3 rounded-full text-amber-500 mb-4">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-medium mb-2">No documents yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  You don't have any documents available yet.
                </p>
                <Button 
                  className="bg-brand-500 hover:bg-brand-600"
                  onClick={() => navigate('/documents')}
                >
                  View Documents
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentDocuments.map(document => (
                <DocumentCard 
                  key={document.id} 
                  document={document} 
                  onMarkAsReviewed={(id, reviewed) => {
                    const doc = DOCUMENTS.find(d => d.id === id);
                    if (doc) {
                      doc.reviewed = reviewed;
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold font-heading">Continue Learning</h2>
          {courseProgress.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 min-h-[200px]">
                <div className="bg-green-100 p-3 rounded-full text-green-500 mb-4">
                  <Play className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-medium mb-2">No courses in progress</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start a course to track your progress here.
                </p>
                <Button 
                  className="bg-brand-500 hover:bg-brand-600"
                  onClick={() => navigate('/courses')}
                >
                  Start Learning
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {courseProgress.map(progress => {
                const course = COURSES.find(c => c.id === progress.courseId);
                if (!course) return null;
                
                return (
                  <Card key={progress.courseId}>
                    <CardHeader className="pb-2">
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
                    <CardFooter>
                      <Button 
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
