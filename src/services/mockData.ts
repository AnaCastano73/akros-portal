import { Course, CourseProgress } from '@/types/course';
import { Document } from '@/types/document';
import { User, UserRole } from '@/types/auth';

// Mock Users
export const USERS: User[] = [
  { id: '1', name: 'Client User', email: 'client@example.com', role: 'client', avatar: '/placeholder.svg' },
  { id: '2', name: 'Expert User', email: 'expert@example.com', role: 'expert', avatar: '/placeholder.svg' },
  { id: '3', name: 'Employee User', email: 'employee@example.com', role: 'employee', avatar: '/placeholder.svg' },
  { id: '4', name: 'Admin User', email: 'admin@example.com', role: 'admin', avatar: '/placeholder.svg' },
];

// Mock Courses
export const COURSES: Course[] = [
  {
    id: '1',
    title: 'Digital Health Foundations',
    description: 'Learn the basics of digital health technology and its applications in modern healthcare.',
    thumbnailUrl: '/placeholder.svg',
    tags: ['Foundations', 'Technology'],
    enrolledUsers: ['1', '2', '3', '4'], // All users enrolled
    modules: [
      {
        id: 'm1',
        title: 'Introduction to Digital Health',
        description: 'Overview of the digital health landscape',
        order: 1,
        lessons: [
          {
            id: 'l1',
            title: 'What is Digital Health?',
            description: 'Defining digital health and its key components',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            order: 1,
            resources: [
              {
                id: 'r1',
                name: 'Digital Health Overview',
                url: '#',
                type: 'pdf'
              }
            ]
          },
          {
            id: 'l2',
            title: 'The Evolution of Healthcare Technology',
            description: 'How technology has transformed healthcare over time',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            order: 2,
            resources: []
          }
        ]
      },
      {
        id: 'm2',
        title: 'Key Technologies in Digital Health',
        description: 'Explore the most important technologies driving digital health',
        order: 2,
        lessons: [
          {
            id: 'l3',
            title: 'Telemedicine and Virtual Care',
            description: 'How remote healthcare delivery is changing patient care',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            order: 1,
            resources: []
          }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Digital Health Strategy',
    description: 'Develop effective strategies for implementing digital health solutions in organizations.',
    thumbnailUrl: '/placeholder.svg',
    tags: ['Strategy', 'Leadership'],
    enrolledUsers: ['1', '2', '4'], // Client, Expert, and Admin enrolled
    modules: [
      {
        id: 'm3',
        title: 'Strategic Planning for Digital Health',
        description: 'How to create an effective digital health strategy',
        order: 1,
        lessons: [
          {
            id: 'l4',
            title: 'Assessing Organizational Readiness',
            description: 'Tools and methods to determine if your organization is ready for digital transformation',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            order: 1,
            resources: []
          }
        ]
      }
    ]
  },
  {
    id: '3',
    title: 'Health Data Analytics',
    description: 'Master the techniques for analyzing health data and generating actionable insights.',
    thumbnailUrl: '/placeholder.svg',
    tags: ['Analytics', 'Data'],
    enrolledUsers: ['2', '3', '4'], // Expert, Employee, and Admin enrolled
    modules: [
      {
        id: 'm4',
        title: 'Introduction to Health Analytics',
        description: 'The fundamentals of data analytics in healthcare',
        order: 1,
        lessons: [
          {
            id: 'l5',
            title: 'Types of Healthcare Data',
            description: 'Understanding the various types of data in healthcare systems',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            order: 1,
            resources: []
          }
        ]
      }
    ]
  }
];

// Mock Course Progress
export const COURSE_PROGRESS: CourseProgress[] = [
  {
    userId: '1',
    courseId: '1',
    completedLessons: ['l1'],
    lastAccessed: new Date('2025-04-05')
  },
  {
    userId: '2',
    courseId: '1',
    completedLessons: ['l1', 'l2'],
    lastAccessed: new Date('2025-04-06')
  },
  {
    userId: '3',
    courseId: '3',
    completedLessons: ['l5'],
    lastAccessed: new Date('2025-04-07')
  }
];

// Mock Documents
export const DOCUMENTS: Document[] = [
  {
    id: 'd1',
    name: 'Client Onboarding Guide.pdf',
    url: '#',
    type: 'application/pdf',
    size: 2500000,
    uploadedBy: '4',
    uploadedAt: new Date('2025-03-15'),
    category: 'Onboarding',
    visibleTo: ['1'],
    reviewed: false
  },
  {
    id: 'd2',
    name: 'Expert Contract.pdf',
    url: '#',
    type: 'application/pdf',
    size: 1800000,
    uploadedBy: '4',
    uploadedAt: new Date('2025-03-20'),
    category: 'Contracts',
    visibleTo: ['2'],
    reviewed: true
  },
  {
    id: 'd3',
    name: 'Employee Handbook.pdf',
    url: '#',
    type: 'application/pdf',
    size: 3500000,
    uploadedBy: '4',
    uploadedAt: new Date('2025-03-25'),
    category: 'HR Documents',
    visibleTo: ['3'],
    reviewed: false
  },
  {
    id: 'd4',
    name: 'Technology Assessment Template.docx',
    url: '#',
    type: 'application/docx',
    size: 500000,
    uploadedBy: '2',
    uploadedAt: new Date('2025-04-01'),
    category: 'Templates',
    visibleTo: ['1', '2', '3', '4'],
    reviewed: true,
    comments: [
      {
        id: 'c1',
        userId: '4',
        userName: 'Admin User',
        content: 'Great template! Let\'s use this for all new clients.',
        createdAt: new Date('2025-04-02')
      }
    ]
  }
];

// Helper function to get courses for a specific user
export const getCoursesForUser = (userId: string): Course[] => {
  return COURSES.filter(course => course.enrolledUsers.includes(userId));
};

// Helper function to get documents for a specific user
export const getDocumentsForUser = (userId: string): Document[] => {
  return DOCUMENTS.filter(doc => doc.visibleTo.includes(userId));
};

// Helper function to get course progress for a user
export const getCourseProgressForUser = (userId: string): CourseProgress[] => {
  return COURSE_PROGRESS.filter(progress => progress.userId === userId);
};
