
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Book, FileText, Home, Settings, Users, User, Edit, BookOpen, FileSignature, Building, MessageCircle, Bell, BarChart2, LogOut, Palette } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Define common navigation items
  const commonItems = [
    {
      title: 'Dashboard',
      icon: Home,
      href: '/dashboard',
      roles: ['client', 'expert', 'employee', 'admin'],
    },
    {
      title: 'Chat',
      icon: MessageCircle,
      href: '/chat',
      roles: ['client', 'expert', 'employee', 'admin'],
    },
    {
      title: 'Notifications',
      icon: Bell,
      href: '/notifications',
      roles: ['client', 'expert', 'employee', 'admin'],
    },
  ];

  // Role-specific navigation items
  const clientItems = [
    {
      title: 'Courses',
      icon: Book,
      href: '/courses',
      roles: ['client'],
    },
    {
      title: 'Documents',
      icon: FileText,
      href: '/documents',
      roles: ['client'],
    },
  ];

  const expertItems = [
    {
      title: 'My Profile',
      icon: User,
      href: '/expert/profile',
      roles: ['expert'],
    },
    {
      title: 'My Contributions',
      icon: FileSignature,
      href: '/expert/contributions',
      roles: ['expert'],
    },
    {
      title: 'Documents',
      icon: FileText,
      href: '/documents',
      roles: ['expert'],
    },
  ];

  const employeeItems = [
    {
      title: 'Courses',
      icon: Book,
      href: '/courses',
      roles: ['employee'],
    },
    {
      title: 'Documents',
      icon: FileText,
      href: '/documents',
      roles: ['employee'],
    },
  ];

  // Admin-specific navigation items
  const adminLinks = [
    {
      title: 'User Management',
      href: '/admin/users',
      icon: Users,
    },
    {
      title: 'Company Management',
      href: '/admin/companies',
      icon: Building,
    },
    {
      title: 'Course Enrollments',
      href: '/admin/courses',
      icon: BookOpen,
    },
    {
      title: 'Document Management',
      href: '/admin/documents',
      icon: FileText,
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart2,
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  // Filter navigation items based on user role
  const getNavItems = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'client':
        return [...commonItems, ...clientItems];
      case 'expert':
        return [...commonItems, ...expertItems];
      case 'employee':
        return [...commonItems, ...employeeItems];
      case 'admin':
        return [...commonItems, ...adminLinks];
      default:
        return commonItems;
    }
  };

  const navItems = getNavItems();

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold">
            H
          </div>
          <div className="font-heading font-bold tracking-tight">
            Healthwise
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-4 py-2">
          <div className="text-xs uppercase text-muted-foreground mb-2">Main Navigation</div>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate(item.href)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-200">
              <img src={user?.avatar || '/placeholder.svg'} alt="User avatar" className="h-full w-full rounded-full object-cover" />
            </div>
            <div>
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
