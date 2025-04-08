
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Edit, Plus, Trash, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CreateCourseDialog } from '@/components/admin/CreateCourseDialog';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/types/course';

const CourseManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    document.title = 'Course Management - Healthwise Advisory Hub';
    
    if (user?.role === 'admin') {
      fetchCourses();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      // Fetch courses
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_modules (
            *,
            course_lessons (*)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match Course type
      const transformedCourses: Course[] = (data || []).map(course => {
        const modules = (course.course_modules || []).map(module => ({
          id: module.id,
          title: module.title,
          description: module.description || '',
          lessons: (module.course_lessons || []).map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            content: lesson.content,
            duration: lesson.duration || 0
          }))
        }));
        
        return {
          id: course.id,
          title: course.title,
          description: course.description,
          imageUrl: course.image_url || '/placeholder.svg',
          modules: modules,
          tags: course.tags || [],
          enrolledUsers: [], // Would need an additional query
          createdAt: new Date(course.created_at)
        };
      });
      
      setCourses(transformedCourses);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load courses',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is admin
  if (user?.role !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  // Delete course handler
  const handleDeleteCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);
        
      if (error) throw error;
      
      // Update local state
      setCourses(courses.filter(course => course.id !== courseId));
      
      toast({
        title: "Course deleted",
        description: "The course has been deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete course',
        variant: 'destructive',
      });
    }
  };

  // Edit course handler
  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsCreateDialogOpen(true);
  };

  const handleManageEnrollments = (course: Course) => {
    // This would open a dialog to manage course enrollments
    // For now, just show a toast
    toast({
      title: "Manage Enrollments",
      description: `You can manage enrollments for "${course.title}" here.`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mb-6 mx-auto"></div>
          <div className="bg-gray-200 h-96 rounded-md w-full mx-auto"></div>
        </div>
      </div>
    );
  }

  // Filter courses based on search term
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateDialogClose = () => {
    setIsCreateDialogOpen(false);
    setSelectedCourse(null);
    // Refresh courses after dialog closes
    fetchCourses();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-avenir">Course Management</h1>
          <p className="text-muted-foreground">
            Create and manage learning content
          </p>
        </div>
        <Button 
          className="bg-brand-500 hover:bg-brand-600"
          onClick={() => {
            setSelectedCourse(null);
            setIsCreateDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Course
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Courses</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead>Lessons</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Enrolled Users</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map(course => {
                // Count total lessons
                const lessonCount = course.modules.reduce(
                  (total, module) => total + module.lessons.length,
                  0
                );
                
                return (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="font-medium">{course.title}</div>
                    </TableCell>
                    <TableCell>{course.modules.length}</TableCell>
                    <TableCell>{lessonCount}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {course.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {course.enrolledUsers.length} users
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleManageEnrollments(course)}
                          title="Manage Enrollments"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditCourse(course)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredCourses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No courses found. Try adjusting your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateCourseDialog 
        isOpen={isCreateDialogOpen} 
        onOpenChange={handleCreateDialogClose} 
        editCourse={selectedCourse}
      />
    </div>
  );
};

export default CourseManagement;
