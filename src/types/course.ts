
export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  articleUrl?: string;
  content?: string;
  resources?: Resource[];
  quiz?: Quiz;
  order: number;
}

export interface Resource {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'image' | 'video' | 'other';
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  modules: Module[];
  tags: string[];
  price: number; // Price in cents (0 for free courses)
  visibleTo: ('client' | 'expert' | 'employee' | 'admin')[];
  assignedUsers?: string[]; // For individual course assignments
}

export interface CourseProgress {
  userId: string;
  courseId: string;
  completedLessons: string[]; // IDs of completed lessons
  lastAccessed: Date;
  enrollmentDate: Date; // When the user enrolled in the course
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple_choice" | "short_answer";
  options?: QuizOption[];
  correctAnswers?: string[];
}

export interface QuizOption {
  id: string;
  text: string;
}

// New enrollment interface for the external enrollment flow
export interface EnrollmentRequest {
  courseId: string;
  userId?: string; // Optional if user is not yet registered
  userEmail: string;
  userName: string; 
  paymentIntentId?: string; // For paid courses with Stripe
}
