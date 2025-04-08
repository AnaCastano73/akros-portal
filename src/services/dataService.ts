
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/types/document';
import { Course, Module, Lesson, CourseProgress } from '@/types/course';
import { User } from '@/types/auth';

// Document functions
export const getDocumentsForUser = async (userId: string): Promise<Document[]> => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .or(`visible_to.cs.{${userId}},uploaded_by.eq.${userId}`);
    
  if (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
  
  // Transform data to match Document type
  return data.map((doc: any): Document => ({
    id: doc.id,
    name: doc.name,
    url: doc.url,
    type: doc.type,
    size: doc.size,
    uploadedBy: doc.uploaded_by,
    uploadedAt: new Date(doc.uploaded_at),
    category: doc.category,
    visibleTo: doc.visible_to,
    reviewed: doc.reviewed || false,
    version: doc.version || 1,
    tags: doc.tags || [],
    metadata: doc.metadata || {},
    annotations: [],
    comments: []
  }));
};

// Course functions
export const getCoursesForUser = async (userId: string): Promise<Course[]> => {
  if (!userId) return [];
  
  // Get enrolled courses for the user
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('course_enrollments')
    .select('course_id')
    .eq('user_id', userId);
    
  if (enrollmentsError) {
    console.error('Error fetching enrollments:', enrollmentsError);
    return [];
  }
  
  if (!enrollments || enrollments.length === 0) {
    return [];
  }
  
  // Get course details for the enrolled courses
  const courseIds = enrollments.map(enrollment => enrollment.course_id);
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('*')
    .in('id', courseIds);
    
  if (coursesError || !courses) {
    console.error('Error fetching courses:', coursesError);
    return [];
  }
  
  // Transform data to match Course type
  return Promise.all(courses.map(async (course): Promise<Course> => {
    // Get modules for this course
    const { data: modules } = await supabase
      .from('course_modules')
      .select('*, course_lessons(*)')
      .eq('course_id', course.id)
      .order('order_index', { ascending: true });
      
    const transformedModules: Module[] = (modules || []).map(mod => ({
      id: mod.id,
      title: mod.title,
      description: mod.description || '',
      lessons: (mod.course_lessons || []).map((lesson: any): Lesson => ({
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
      modules: transformedModules,
      tags: course.tags || [],
      enrolledUsers: [], // This would require another query
      createdAt: new Date(course.created_at)
    };
  }));
};

export const getCourseProgressForUser = async (userId: string): Promise<CourseProgress[]> => {
  if (!userId) return [];
  
  // Get user enrollments with course info
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('course_enrollments')
    .select('*, course_id')
    .eq('user_id', userId);
    
  if (enrollmentsError || !enrollments) {
    console.error('Error fetching enrollments:', enrollmentsError);
    return [];
  }
  
  // Get completed lessons for this user
  const { data: completedLessons, error: lessonsError } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .eq('completed', true);
    
  if (lessonsError) {
    console.error('Error fetching lesson progress:', lessonsError);
    return [];
  }
  
  return enrollments.map(enrollment => ({
    courseId: enrollment.course_id,
    userId: userId,
    completedLessons: (completedLessons || []).map(lesson => lesson.lesson_id),
    lastAccessed: new Date(enrollment.last_accessed)
  }));
};

// User functions
export const getAllUsers = async (): Promise<User[]> => {
  // This requires admin privileges, which is handled by Supabase RLS
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  
  // Map to our User type
  return users.map(u => ({
    id: u.id,
    email: u.email || '',
    name: `${u.user_metadata?.first_name || ''} ${u.user_metadata?.last_name || ''}`.trim() || u.email?.split('@')[0] || 'Unknown',
    role: determineUserRole(u.email || ''),
    avatar: u.user_metadata?.avatar_url || '/placeholder.svg'
  }));
};

// Helper function to determine user role based on email domain
// In a real app, you would fetch this from a database
const determineUserRole = (email: string) => {
  if (email.endsWith('admin.akrosadvisory.com')) {
    return 'admin';
  } else if (email.endsWith('expert.akrosadvisory.com')) {
    return 'expert';
  } else if (email.endsWith('employee.akrosadvisory.com')) {
    return 'employee';
  } else {
    return 'client';
  }
};
