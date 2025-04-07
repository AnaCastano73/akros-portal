
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Book, FileText, Calendar } from 'lucide-react';

const ExpertContributions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data for expert contributions
  const [contributions, setContributions] = useState({
    courses: [
      {
        id: '1',
        title: 'Introduction to Digital Health Technologies',
        role: 'Lead Author',
        status: 'Published',
        date: '2023-10-15',
        modulesCount: 5,
        lessonsCount: 12
      },
      {
        id: '2',
        title: 'Remote Patient Monitoring: Best Practices',
        role: 'Contributor',
        status: 'In Review',
        date: '2023-12-03',
        modulesCount: 3,
        lessonsCount: 8
      }
    ],
    articles: [
      {
        id: '1',
        title: 'The Future of Telehealth Post-Pandemic',
        status: 'Published',
        date: '2023-09-22',
        readTime: '8 min read',
        tags: ['Telehealth', 'Digital Health', 'Healthcare Policy']
      },
      {
        id: '2',
        title: 'Integrating AI into Clinical Decision Support Systems',
        status: 'Published',
        date: '2023-11-07',
        readTime: '12 min read',
        tags: ['AI', 'Clinical Decision Support', 'Digital Health']
      },
      {
        id: '3',
        title: 'Privacy Concerns in Health Wearables',
        status: 'Draft',
        date: '2024-01-18',
        readTime: '10 min read',
        tags: ['Wearables', 'Privacy', 'Data Security']
      }
    ]
  });

  useEffect(() => {
    document.title = 'My Contributions - Healthwise Advisory Hub';
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Redirect if not an expert
  if (user && user.role !== 'expert') {
    navigate('/dashboard');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mb-6 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-heading">My Contributions</h1>
        <p className="text-muted-foreground">
          View and manage the courses and articles you have contributed to
        </p>
      </div>
      
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="courses">
          <div className="grid grid-cols-1 gap-4">
            {contributions.courses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 min-h-[200px]">
                  <div className="bg-brand-100 p-3 rounded-full text-brand-500 mb-4">
                    <Book className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No courses yet</h3>
                  <p className="text-muted-foreground text-center">
                    You haven't contributed to any courses yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              contributions.courses.map(course => (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{new Date(course.date).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>{course.modulesCount} modules</span>
                          <span className="mx-2">•</span>
                          <span>{course.lessonsCount} lessons</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{course.role}</Badge>
                          <Badge 
                            className={
                              course.status === 'Published' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }
                          >
                            {course.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Book className="h-8 w-8 text-brand-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="articles">
          <div className="grid grid-cols-1 gap-4">
            {contributions.articles.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 min-h-[200px]">
                  <div className="bg-brand-100 p-3 rounded-full text-brand-500 mb-4">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No articles yet</h3>
                  <p className="text-muted-foreground text-center">
                    You haven't published any articles yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              contributions.articles.map(article => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{new Date(article.date).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>{article.readTime}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {article.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                        <Badge 
                          className={
                            article.status === 'Published' 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }
                        >
                          {article.status}
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-brand-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpertContributions;
