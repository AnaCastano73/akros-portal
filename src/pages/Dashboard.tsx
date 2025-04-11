
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { DashboardConfigProvider } from '@/contexts/DashboardConfigContext';

const Dashboard = () => {
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Dashboard - Akros Advisory Hub';
  }, []);

  if (!user) return null;

  return (
    <DashboardConfigProvider>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-heading">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, <span className="text-brand-600 font-medium">{user.name}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="capitalize">
              {user.role}
            </Badge>
          </div>
        </div>

        <DashboardGrid isAdmin={user.role === 'admin'} />
      </div>
    </DashboardConfigProvider>
  );
};

export default Dashboard;
