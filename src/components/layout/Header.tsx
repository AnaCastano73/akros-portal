
import { Bell, Search, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { user } = useAuth();
  const { config } = useDashboardConfig();
  const navigate = useNavigate();

  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="flex h-16 items-center px-3 md:px-4 gap-2 md:gap-4">
        <SidebarTrigger className="md:hidden" />
        <div className="font-heading text-xl font-bold tracking-tight hidden md:flex">
          {config.brand.companyName}
        </div>
        <div className="flex-1 flex items-center justify-end md:ml-auto gap-2">
          <form className="relative max-w-sm hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 w-[120px] sm:w-[200px] md:w-[300px] bg-background"
            />
          </form>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground"
            onClick={() => navigate('/chat')}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          
          <NotificationDropdown />
          
          <div className="flex items-center gap-2">
            <div className="font-medium hidden md:block">
              <span className="text-brand-500">{user?.name}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
              <img
                src={user?.avatar || '/placeholder.svg'}
                alt="User avatar"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
