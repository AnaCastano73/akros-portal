
export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  content?: string;
  resources?: Resource[];
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
  visibleTo: ('client' | 'expert' | 'employee' | 'admin')[];
}

export interface CourseProgress {
  userId: string;
  courseId: string;
  completedLessons: string[]; // IDs of completed lessons
  lastAccessed: Date;
}
