
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
  // Remove visibleTo array and replace with enrolledUsers
  enrolledUsers: string[]; // Array of user IDs that are enrolled in this course
}

export interface CourseProgress {
  userId: string;
  courseId: string;
  completedLessons: string[]; // IDs of completed lessons
  lastAccessed: Date;
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
