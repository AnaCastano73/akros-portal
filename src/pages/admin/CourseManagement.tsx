
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { supabaseTyped } from '@/integrations/supabase/types-extension';
import { getAllUsers } from '@/services/dataService';
import { User } from '@/types/auth';

const CourseManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<{
    userId: string;
    userName: string;
    courseId: string;
    courseName: string;
    enrolledAt: string;
    lastAccessed: string;
    completed: boolean;
  }[]>([]);

  useEffect(() => {
    document.title = 'Course Management - Healthwise Advisory Hub';
    
    if (user?.role === 'admin') {
      fetchUsersAndEnrollments();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchUsersAndEnrollments = async () => {
    setIsLoading(true);
    try {
      // Fetch all users
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      
      // Fetch course enrollments from Supabase
      const { data: enrollmentData, error: enrollmentError } = await supabaseTyped
        .from('course_enrollments')
        .select(`
          id,
          enrolled_at,
          last_accessed,
          completed,
          user_id,
          course_id,
          courses(title)
        `);
      
      if (enrollmentError) throw enrollmentError;
      
      // Transform enrollment data
      const transformedEnrollments = enrollmentData.map(enrollment => {
        const enrolledUser = allUsers.find(u => u.id === enrollment.user_id);
        
        return {
          userId: enrollment.user_id,
          userName: enrolledUser?.name || 'Unknown User',
          courseId: enrollment.course_id,
          courseName: enrollment.courses?.title || 'Unknown Course',
          enrolledAt: new Date(enrollment.enrolled_at).toLocaleDateString(),
          lastAccessed: new Date(enrollment.last_accessed).toLocaleDateString(),
          completed: enrollment.completed || false
        };
      });
      
      setEnrollments(transformedEnrollments);
    } catch (error: any) {
      console.error('Error fetching enrollments:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load course enrollments',
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

  const openThinkificDashboard = () => {
    window.open('https://app.thinkific.com/manage/admin', '_blank');
  };

  // Filter enrollments based on search term
  const filteredEnrollments = enrollments.filter(enrollment => 
    enrollment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-avenir">Course Management</h1>
          <p className="text-muted-foreground">
            View and manage course enrollments
          </p>
        </div>
        <button 
          className="flex items-center gap-2 text-brand-500 hover:text-brand-600"
          onClick={openThinkificDashboard}
        >
          <ExternalLink className="h-4 w-4" />
          Open Thinkific Dashboard
        </button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Course Enrollments</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user or course..."
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
                <TableHead>User</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Enrolled On</TableHead>
                <TableHead>Last Accessed</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.map((enrollment, index) => (
                <TableRow key={`${enrollment.userId}-${enrollment.courseId}-${index}`}>
                  <TableCell>
                    <div className="font-medium">{enrollment.userName}</div>
                  </TableCell>
                  <TableCell>{enrollment.courseName}</TableCell>
                  <TableCell>{enrollment.enrolledAt}</TableCell>
                  <TableCell>{enrollment.lastAccessed}</TableCell>
                  <TableCell>
                    <Badge variant={enrollment.completed ? "success" : "secondary"}>
                      {enrollment.completed ? "Completed" : "In Progress"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEnrollments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    No enrollments found. Try adjusting your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseManagement;
