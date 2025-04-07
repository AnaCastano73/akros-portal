
import { toast } from "@/hooks/use-toast";
import { Course, EnrollmentRequest } from "@/types/course";
import { COURSES } from "./mockData";

/**
 * Get a course by ID
 */
export const getCourseById = async (courseId: string): Promise<Course | null> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Find the course by ID
  const course = COURSES.find(course => course.id === courseId);
  return course || null;
};

/**
 * Enroll a user in a course
 */
export const enrollInCourse = async (enrollmentRequest: EnrollmentRequest): Promise<boolean> => {
  const { courseId, userEmail, userName, paymentIntentId } = enrollmentRequest;
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    // Find the course
    const course = COURSES.find(c => c.id === courseId);
    
    if (!course) {
      throw new Error('Course not found');
    }
    
    // If paid course, verify payment (in a real app, you'd validate with Stripe)
    if (course.price > 0 && !paymentIntentId) {
      throw new Error('Payment required for this course');
    }

    // In a real app, you would:
    // 1. Create/update the user record if needed
    // 2. Add the course to the user's enrolled courses
    // 3. Send a welcome email
    // 4. Create analytics record
    
    // For this mock implementation, we'll just log success
    console.log(`User ${userName} (${userEmail}) enrolled in course: ${course.title}`);
    
    // Simulate email notification
    console.log(`✉️ Sending enrollment confirmation email to ${userEmail}`);
    
    return true;
  } catch (error) {
    console.error('Enrollment error:', error);
    return false;
  }
};

/**
 * Get a list of all public courses available for enrollment
 */
export const getPublicCourses = async (): Promise<Course[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return all courses (in a real app, you'd filter for public courses only)
  return COURSES;
};
