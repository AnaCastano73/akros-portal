
import { User, UserRole } from '@/types/auth';
import { Course, CourseProgress } from '@/types/course';
import { Document } from '@/types/document';

// Mock data for users
export const USERS: User[] = [
  {
    id: 'u1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin' as UserRole,
    avatar: '/avatars/1.png'
  },
  {
    id: 'u2',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@example.com',
    role: 'expert' as UserRole, // Changed from "advisor" to match UserRole type
    avatar: '/avatars/2.png'
  },
  {
    id: 'u3',
    name: 'Emily White',
    email: 'emily.white@example.com',
    role: 'client' as UserRole,
    avatar: '/avatars/3.png'
  },
  {
    id: 'u4',
    name: 'David Lee',
    email: 'david.lee@example.com',
    role: 'client' as UserRole,
    avatar: '/avatars/4.png'
  }
];

// Mock data for courses with modules
export const COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Financial Planning Basics',
    description: 'Learn the fundamentals of financial planning.',
    thumbnailUrl: '/placeholder.svg',
    modules: [
      {
        id: 'm1',
        title: 'Introduction to Financial Planning',
        description: 'Learn the basics of financial planning',
        order: 1,
        lessons: [
          {
            id: 'l1',
            title: 'What is Financial Planning?',
            description: 'An overview of financial planning concepts',
            content: 'Financial planning is the process of...',
            order: 1
          },
          {
            id: 'l2',
            title: 'Setting Financial Goals',
            description: 'How to set achievable financial goals',
            content: 'When setting financial goals, it is important to...',
            order: 2
          }
        ]
      }
    ],
    tags: ['finance', 'planning', 'basics'],
    enrolledUsers: ['u3', 'u4']
  },
  {
    id: 'c2',
    title: 'Investment Strategies for Beginners',
    description: 'Discover how to invest wisely and grow your wealth.',
    thumbnailUrl: '/placeholder.svg',
    modules: [
      {
        id: 'm2',
        title: 'Introduction to Investing',
        description: 'Learn the basics of investing',
        order: 1,
        lessons: [
          {
            id: 'l3',
            title: 'Investment Basics',
            description: 'Understanding the fundamentals of investing',
            content: 'Investing is the act of allocating resources...',
            order: 1
          }
        ]
      }
    ],
    tags: ['investing', 'finance', 'wealth'],
    enrolledUsers: ['u2', 'u3']
  }
];

// Mock data for course progress
export const COURSE_PROGRESS: CourseProgress[] = [
  {
    userId: 'u3',
    courseId: 'c1',
    completedLessons: ['l1'],
    lastAccessed: new Date('2023-07-15')
  },
  {
    userId: 'u4',
    courseId: 'c1',
    completedLessons: [],
    lastAccessed: new Date('2023-07-10')
  },
  {
    userId: 'u2',
    courseId: 'c2',
    completedLessons: ['l3'],
    lastAccessed: new Date('2023-07-20')
  }
];

// Mock data for documents
export const DOCUMENTS: Document[] = [
  {
    id: 'd1',
    name: 'Risk Assessment Report.pdf',
    url: '/mock-files/report.pdf',
    type: 'application/pdf',
    size: 2500000,
    uploadedBy: 'u1',
    uploadedAt: new Date('2023-05-15'),
    category: 'Final Deliverables',
    visibleTo: ['u1', 'u2', 'u3'],
    reviewed: true,
    comments: [
      {
        id: 'c1',
        userId: 'u2',
        userName: 'Dr. Sarah Chen',
        content: 'Great report, very thorough analysis.',
        createdAt: new Date('2023-05-16')
      }
    ]
  },
  {
    id: 'd2',
    name: 'Investment Strategy Worksheet.xlsx',
    url: '/mock-files/worksheet.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 1200000,
    uploadedBy: 'u2',
    uploadedAt: new Date('2023-06-01'),
    category: 'Client Materials',
    visibleTo: ['u1', 'u3'],
    reviewed: false
  },
  {
    id: 'd3',
    name: 'Retirement Planning Guide.pdf',
    url: '/mock-files/guide.pdf',
    type: 'application/pdf',
    size: 3500000,
    uploadedBy: 'u3',
    uploadedAt: new Date('2023-06-10'),
    category: 'Client Materials',
    visibleTo: ['u1', 'u2', 'u4'],
    reviewed: true
  },
  {
    id: 'd4',
    name: 'Tax Optimization Strategies.docx',
    url: '/mock-files/tax-strategies.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 890000,
    uploadedBy: 'u2',
    uploadedAt: new Date('2023-06-15'),
    category: 'Final Deliverables',
    visibleTo: ['u1', 'u4'],
    reviewed: false
  },
  {
    id: 'd5',
    name: 'Meeting Minutes - June 2023.pdf',
    url: '/mock-files/minutes.pdf',
    type: 'application/pdf',
    size: 450000,
    uploadedBy: 'u1',
    uploadedAt: new Date('2023-06-30'),
    category: 'Meeting Notes',
    visibleTo: ['u1', 'u2', 'u3', 'u4'],
    reviewed: true
  },
  {
    id: 'd6',
    name: 'Financial Quiz.pdf',
    url: '/mock-files/quiz.pdf',
    type: 'application/pdf',
    size: 350000,
    uploadedBy: 'u3',
    uploadedAt: new Date('2023-07-05'),
    category: 'Session Homework',
    visibleTo: ['u2', 'u4'],
    reviewed: false
  },
  {
    id: 'd7',
    name: 'Market Analysis - Q2 2023.pptx',
    url: '/mock-files/market-analysis.pptx',
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    size: 4200000,
    uploadedBy: 'u2',
    uploadedAt: new Date('2023-07-15'),
    category: 'Client Materials',
    visibleTo: ['u1', 'u2', 'u3', 'u4'],
    reviewed: true
  },
  {
    id: 'd8',
    name: 'Budget Tracker Template.xlsx',
    url: '/mock-files/budget-tracker.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 980000,
    uploadedBy: 'u3',
    uploadedAt: new Date('2023-07-20'),
    category: 'Session Homework',
    visibleTo: ['u1', 'u4'],
    reviewed: false
  }
];

// Function to simulate fetching user data by ID
export const getUserById = (id: string) => {
  return USERS.find(user => user.id === id);
};

// Function to simulate fetching course data by ID
export const getCourseById = (id: string) => {
  return COURSES.find(course => course.id === id);
};

// Function to simulate fetching documents for a specific user
export const getDocumentsForUser = (userId: string) => {
  return DOCUMENTS.filter(doc => doc.visibleTo.includes(userId));
};

// Function to get courses for a specific user
export const getCoursesForUser = (userId: string) => {
  return COURSES.filter(course => course.enrolledUsers.includes(userId));
};

// Function to get course progress for a specific user
export const getCourseProgressForUser = (userId: string) => {
  return COURSE_PROGRESS.filter(progress => progress.userId === userId);
};

