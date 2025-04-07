import { User } from '@/types/auth';
import { Course } from '@/types/course';
import { Document } from '@/types/document';

// Mock data for users
export const USERS: User[] = [
  {
    id: 'u1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    avatar: '/avatars/1.png'
  },
  {
    id: 'u2',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@example.com',
    role: 'advisor',
    avatar: '/avatars/2.png'
  },
  {
    id: 'u3',
    name: 'Emily White',
    email: 'emily.white@example.com',
    role: 'client',
    avatar: '/avatars/3.png'
  },
  {
    id: 'u4',
    name: 'David Lee',
    email: 'david.lee@example.com',
    role: 'client',
    avatar: '/avatars/4.png'
  }
];

// Mock data for courses
export const COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Financial Planning Basics',
    description: 'Learn the fundamentals of financial planning.',
    instructor: 'Dr. Sarah Chen',
    duration: '4 weeks',
    enrolledUsers: ['u3', 'u4']
  },
  {
    id: 'c2',
    title: 'Investment Strategies for Beginners',
    description: 'Discover how to invest wisely and grow your wealth.',
    instructor: 'John Doe',
    duration: '6 weeks',
    enrolledUsers: ['u2', 'u3']
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
