
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 gap-4">
        <SidebarTrigger />
        <div className="font-heading text-xl font-bold tracking-tight hidden md:flex">
          Healthwise Advisory Hub
        </div>
        <div className="flex-1 flex items-center md:ml-auto">
          <form className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 w-[200px] md:w-[300px] bg-background"
            />
          </form>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="font-medium hidden md:block">
            Welcome, <span className="text-brand-500">{user?.name}</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-gray-200">
            <img
              src={user?.avatar || '/placeholder.svg'}
              alt="User avatar"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
