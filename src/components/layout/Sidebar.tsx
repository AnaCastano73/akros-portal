
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Book, FileText, Home, Settings, Users } from 'lucide-react';
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

  // Define navigation items based on user role
  const navigationItems = [
    {
      title: 'Dashboard',
      icon: Home,
      href: '/dashboard',
      roles: ['client', 'expert', 'employee', 'admin'],
    },
    {
      title: 'Courses',
      icon: Book,
      href: '/courses',
      roles: ['client', 'expert', 'employee', 'admin'],
    },
    {
      title: 'Documents',
      icon: FileText,
      href: '/documents',
      roles: ['client', 'expert', 'employee', 'admin'],
    },
  ];

  // Admin-specific navigation items
  const adminItems = [
    {
      title: 'User Management',
      icon: Users,
      href: '/admin/users',
      roles: ['admin'],
    },
    {
      title: 'Course Management',
      icon: Book,
      href: '/admin/courses',
      roles: ['admin'],
    },
    {
      title: 'Document Management',
      icon: FileText,
      href: '/admin/documents',
      roles: ['admin'],
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/admin/settings',
      roles: ['admin'],
    },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navigationItems.filter(
    item => user && item.roles.includes(user.role)
  );

  const filteredAdminItems = adminItems.filter(
    item => user && item.roles.includes(user.role)
  );

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
            {filteredNavItems.map((item) => (
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

        {filteredAdminItems.length > 0 && (
          <div className="px-4 py-2">
            <div className="text-xs uppercase text-muted-foreground mb-2">Administration</div>
            <SidebarMenu>
              {filteredAdminItems.map((item) => (
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
        )}
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
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
