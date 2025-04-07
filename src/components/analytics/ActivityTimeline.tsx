
import { Card } from '@/components/ui/card';
import { FileText, MessageSquare, GraduationCap, Users, Clock } from 'lucide-react';

interface ActivityTimelineProps {
  days?: number;
}

export const ActivityTimeline = ({ days = 7 }: ActivityTimelineProps) => {
  // Generate mock activity data
  const generateMockActivity = () => {
    const activities = [
      {
        id: 1,
        type: 'document',
        icon: FileText,
        title: 'Health Protocol Guide',
        action: 'was viewed by',
        user: 'Michael Chen',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      },
      {
        id: 2,
        type: 'course',
        icon: GraduationCap,
        title: 'Advanced Nutritional Science',
        action: 'was completed by',
        user: 'Sarah Johnson',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      },
      {
        id: 3,
        type: 'message',
        icon: MessageSquare,
        title: 'New question asked',
        action: 'in the forum by',
        user: 'Robert Smith',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      },
      {
        id: 4,
        type: 'user',
        icon: Users,
        title: 'New user registered',
        action: '',
        user: 'Jennifer Williams',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      },
      {
        id: 5,
        type: 'document',
        icon: FileText,
        title: 'Wellness Assessment Form',
        action: 'was uploaded by',
        user: 'David Taylor',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      },
    ];
    
    // Add more activities for longer time periods
    if (days > 7) {
      activities.push(
        {
          id: 6,
          type: 'course',
          icon: GraduationCap,
          title: 'Fundamentals of Health Coaching',
          action: 'was started by',
          user: '12 new users',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
        },
        {
          id: 7,
          type: 'message',
          icon: MessageSquare,
          title: 'Weekly discussion thread',
          action: 'was active with 25 new comments from',
          user: 'multiple users',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
        }
      );
    }
    
    return activities;
  };
  
  const activities = generateMockActivity();
  
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }
  };
  
  const getIconColor = (type: string) => {
    switch (type) {
      case 'document':
        return 'bg-blue-100 text-blue-700';
      case 'course':
        return 'bg-green-100 text-green-700';
      case 'message':
        return 'bg-purple-100 text-purple-700';
      case 'user':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = activity.icon;
        return (
          <div key={activity.id} className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${getIconColor(activity.type)}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium">{activity.title}</span> {activity.action} <span className="font-medium">{activity.user}</span>
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {formatTimeAgo(activity.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
