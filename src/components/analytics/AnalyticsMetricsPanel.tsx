
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, GraduationCap, Clock } from 'lucide-react';

interface AnalyticsMetricsPanelProps {
  data: any;
  loading: boolean;
}

export const AnalyticsMetricsPanel = ({ data, loading }: AnalyticsMetricsPanelProps) => {
  const metrics = [
    {
      title: 'Total Users',
      value: data?.summary.totalUsers || 0,
      change: '+12%',
      icon: Users,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      title: 'Documents Viewed',
      value: data?.summary.documentsViewed || 0,
      change: '+23%',
      icon: FileText,
      color: 'bg-green-100 text-green-700'
    },
    {
      title: 'Courses Completed',
      value: data?.summary.coursesCompleted || 0,
      change: '+8%',
      icon: GraduationCap,
      color: 'bg-purple-100 text-purple-700'
    },
    {
      title: 'Avg. Session Time',
      value: data?.summary.avgSessionTime ? `${Math.floor(data.summary.avgSessionTime / 60)}m ${data.summary.avgSessionTime % 60}s` : '0m',
      change: '+5%',
      icon: Clock,
      color: 'bg-amber-100 text-amber-700'
    }
  ];

  if (loading) {
    return (
      <>
        {[1, 2, 3, 4].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-5 w-24 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-12 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  return (
    <>
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className={`p-2 rounded-full ${metric.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{metric.change}</span> from last period
              </p>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
};
