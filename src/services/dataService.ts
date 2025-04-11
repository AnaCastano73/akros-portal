
import { supabase } from '@/integrations/supabase/client';
import { supabaseTyped } from '@/integrations/supabase/types-extension';
import { Document } from '@/types/document';
import { Course, Module, Lesson, CourseProgress } from '@/types/course';
import { User, UserRole, UserProfile } from '@/types/auth';
import { Json } from '@/integrations/supabase/types';

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
  return data.map((doc): Document => {
    return {
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
      metadata: doc.metadata,
      annotations: [],
      comments: []
    };
  });
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
        enrolledUsers: []
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
        description: '', // Add a default empty description
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
  try {
    // Get all profiles with their roles
    const { data: profiles, error: profilesError } = await supabaseTyped
      .from('profiles')
      .select('*');
      
    if (profilesError) throw profilesError;
    
    // For each profile, get their primary role
    const users = await Promise.all((profiles || []).map(async (profile) => {
      const { data: roleData, error: roleError } = await supabase
        .rpc('get_primary_role', { _user_id: profile.id });
        
      if (roleError) {
        console.error('Error fetching role for user:', profile.id, roleError);
        // Default to client role if there's an error getting role
        return {
          id: profile.id,
          email: profile.email,
          name: profile.name || profile.email.split('@')[0] || 'Unknown',
          role: 'client' as UserRole,
          avatar: profile.avatar || '/placeholder.svg',
          company_id: profile.company_id
        };
      }
      
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name || profile.email.split('@')[0] || 'Unknown',
        role: roleData as UserRole,
        avatar: profile.avatar || '/placeholder.svg',
        company_id: profile.company_id
      };
    }));
    
    // Filter out any null values (from errors)
    const validUsers = users.filter(Boolean) as User[];
    
    console.log('Retrieved users:', validUsers.length);
    return validUsers;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// Role functions
export const getUserRoles = async (userId: string): Promise<UserRole[]> => {
  if (!userId) return [];
  
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return data.map(item => item.role as UserRole);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!userId) return null;
  
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) throw profileError;
    
    // Get primary role
    const { data: roleData, error: roleError } = await supabase
      .rpc('get_primary_role', { _user_id: userId });
      
    if (roleError) throw roleError;
    
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      avatar: profile.avatar,
      role: roleData as UserRole
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Admin role functions
export const assignRoleToUser = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role });
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error assigning role to user:', error);
    return false;
  }
};

export const removeRoleFromUser = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .match({ user_id: userId, role });
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error removing role from user:', error);
    return false;
  }
};

export const updateUserProfile = async (
  userId: string, 
  profileData: {name?: string; avatar?: string}
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};
