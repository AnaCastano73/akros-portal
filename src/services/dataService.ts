
import { supabase } from '@/integrations/supabase/client';
import { supabaseTyped } from '@/integrations/supabase/types-extension';
import { Document } from '@/types/document';
import { Course, Module, Lesson, CourseProgress } from '@/types/course';
import { User, UserRole } from '@/types/auth';

// Document functions
export const getDocumentsForUser = async (userId: string): Promise<Document[]> => {
  if (!userId) return [];
  
  const { data, error } = await supabaseTyped
    .from('documents')
    .select('*')
    .or(`visible_to.cs.{${userId}},uploaded_by.eq.${userId}`);
    
  if (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
  
  // Transform data to match Document type
  return data.map((doc): Document => ({
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
  const { data: enrollments, error: enrollmentsError } = await supabaseTyped
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
  const { data: courses, error: coursesError } = await supabaseTyped
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
    const { data: modules, error: modulesError } = await supabaseTyped
      .from('course_modules')
      .select('*')
      .eq('course_id', course.id)
      .order('order_index', { ascending: true });
      
    if (modulesError) {
      console.error('Error fetching modules:', modulesError);
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnailUrl: course.image_url || '/placeholder.svg',
        modules: [],
        tags: course.tags || [],
        enrolledUsers: [],
        createdAt: new Date(course.created_at)
      };
    }
      
    const transformedModules: Module[] = await Promise.all((modules || []).map(async (mod) => {
      // Get lessons for this module
      const { data: lessons, error: lessonsError } = await supabaseTyped
        .from('course_lessons')
        .select('*')
        .eq('module_id', mod.id)
        .order('order_index', { ascending: true });
        
      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
        return {
          id: mod.id,
          title: mod.title,
          description: mod.description || '',
          lessons: [],
          order: mod.order_index
        };
      }

      const transformedLessons: Lesson[] = (lessons || []).map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        order: lesson.order_index
      }));
      
      return {
        id: mod.id,
        title: mod.title,
        description: mod.description || '',
        lessons: transformedLessons,
        order: mod.order_index
      };
    }));
    
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.image_url || '/placeholder.svg',
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
  const { data: enrollments, error: enrollmentsError } = await supabaseTyped
    .from('course_enrollments')
    .select('*')
    .eq('user_id', userId);
    
  if (enrollmentsError || !enrollments) {
    console.error('Error fetching enrollments:', enrollmentsError);
    return [];
  }
  
  // Get completed lessons for this user
  const { data: completedLessons, error: lessonsError } = await supabaseTyped
    .from('lesson_progress')
    .select('*')
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
    role: determineUserRole(u.email || '') as UserRole,
    avatar: u.user_metadata?.avatar_url || '/placeholder.svg'
  }));
};

// Helper function to determine user role based on email domain
// In a real app, you would fetch this from a database
const determineUserRole = (email: string): UserRole => {
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
