
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnalyticsMetricsPanel } from '@/components/analytics/AnalyticsMetricsPanel';
import { UsageChart } from '@/components/analytics/UsageChart';
import { EngagementChart } from '@/components/analytics/EngagementChart';
import { ActivityTimeline } from '@/components/analytics/ActivityTimeline';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download, Calendar, BarChart2, LineChart, PieChart, Users, Clock, FileIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DateRangePicker } from '@/components/analytics/DateRangePicker';

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7days');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  
  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    document.title = 'Analytics - Healthwise Advisory Hub';
    loadAnalyticsData();
  }, [timeRange, activeTab]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch actual analytics data from Supabase
      // For demo purposes, we're generating mock data
      const mockData = generateMockAnalyticsData(timeRange, activeTab);
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockAnalyticsData = (range: string, type: string) => {
    // Generate different mock data based on the selected time range and tab
    const days = range === '7days' ? 7 : range === '30days' ? 30 : 90;
    
    let data: any = {
      summary: {
        totalUsers: 128 + Math.floor(Math.random() * 20),
        activeUsers: 84 + Math.floor(Math.random() * 15),
        documentsViewed: 326 + Math.floor(Math.random() * 50),
        coursesCompleted: 47 + Math.floor(Math.random() * 10),
        avgSessionTime: Math.floor(120 + Math.random() * 60)
      },
      timeData: Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        return {
          date: date.toISOString().split('T')[0],
          activeUsers: Math.floor(10 + Math.random() * 40),
          pageViews: Math.floor(50 + Math.random() * 200),
          documentAccess: Math.floor(20 + Math.random() * 30),
          courseProgress: Math.floor(5 + Math.random() * 15)
        };
      }),
      userDistribution: [
        { name: 'Admin', value: 5 },
        { name: 'Expert', value: 23 },
        { name: 'Regular User', value: 100 }
      ],
      contentUsage: [
        { name: 'Courses', value: 45 },
        { name: 'Documents', value: 35 },
        { name: 'Discussions', value: 20 }
      ]
    };
    
    return data;
  };

  const handleExport = () => {
    // In a real implementation, this would generate and download actual reports
    console.log(`Exporting ${activeTab} analytics data in ${exportFormat} format`);
    
    // Just close the dialog for demo purposes
    setIsExportOpen(false);
    
    // Show a toast notification
    window.alert('Export feature would download a report in real implementation');
  };

  if (isLoading && !analyticsData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mb-6 mx-auto"></div>
          <div className="bg-gray-200 h-96 rounded-md w-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor platform usage, user engagement, and content performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setIsExportOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full border-b pb-0">
          <TabsTrigger value="overview" className="data-[state=active]:border-brand-500">Overview</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:border-brand-500">User Activity</TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:border-brand-500">Content Performance</TabsTrigger>
          <TabsTrigger value="engagement" className="data-[state=active]:border-brand-500">Engagement</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsMetricsPanel 
              data={analyticsData}
              loading={isLoading}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Activity</CardTitle>
                <CardDescription>Daily active users and session time</CardDescription>
              </CardHeader>
              <CardContent>
                <UsageChart 
                  data={analyticsData?.timeData || []}
                  dataKeys={['activeUsers', 'pageViews']}
                  colors={['#19ac91', '#3db9a4']}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Usage</CardTitle>
                <CardDescription>Document and course interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <EngagementChart 
                  data={analyticsData?.contentUsage || []}
                />
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Timeline of platform events</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityTimeline days={timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <div className="grid grid-cols-1 gap-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
                <CardDescription>Detailed user activity metrics would be displayed here</CardDescription>
              </CardHeader>
              <CardContent className="h-96 flex items-center justify-center">
                <p className="text-muted-foreground">This tab would contain detailed user analytics in a real implementation</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="content">
          <div className="grid grid-cols-1 gap-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Analytics</CardTitle>
                <CardDescription>Document and course usage metrics would be displayed here</CardDescription>
              </CardHeader>
              <CardContent className="h-96 flex items-center justify-center">
                <p className="text-muted-foreground">This tab would contain detailed content analytics in a real implementation</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="engagement">
          <div className="grid grid-cols-1 gap-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Analytics</CardTitle>
                <CardDescription>User engagement metrics would be displayed here</CardDescription>
              </CardHeader>
              <CardContent className="h-96 flex items-center justify-center">
                <p className="text-muted-foreground">This tab would contain detailed engagement analytics in a real implementation</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Analytics Report</DialogTitle>
            <DialogDescription>
              Choose a format for your analytics export
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                <SelectItem value="json">JSON Data</SelectItem>
                <SelectItem value="excel">Excel Spreadsheet</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              Your report will include all data for {activeTab} from the selected time period.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportOpen(false)}>Cancel</Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Analytics;
