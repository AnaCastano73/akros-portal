
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { DashboardConfigProvider } from '@/contexts/DashboardConfigContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    document.title = 'Dashboard - Akros Advisory Hub';
    
    // Add error event listener to catch any unhandled fetch errors
    const handleError = () => {
      setHasError(true);
    };
    
    window.addEventListener('unhandledrejection', handleError);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setHasError(false);
    
    // Force a refresh after a small delay
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (hasError) {
    return (
      <Card className="p-6 max-w-xl mx-auto mt-8">
        <h2 className="text-xl font-bold mb-4">Connection Issue</h2>
        <p className="mb-4">There was a problem connecting to the server. This might be due to a temporary network issue.</p>
        <Button 
          onClick={handleRetry} 
          disabled={isRetrying}
          className="flex items-center gap-2"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Reconnecting...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Retry Connection
            </>
          )}
        </Button>
      </Card>
    );
  }

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

        <DashboardGrid isAdmin={user.role === 'admin'} userRole={user.role} />
      </div>
    </DashboardConfigProvider>
  );
};

export default Dashboard;
