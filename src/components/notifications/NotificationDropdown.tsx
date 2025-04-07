
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/types/notification';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { format, isToday, isYesterday } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
    
    setOpen(false);
  };
  
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };
  
  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.created_at);
    let key = '';
    
    if (isToday(date)) {
      key = 'Today';
    } else if (isYesterday(date)) {
      key = 'Yesterday';
    } else {
      key = format(date, 'MMMM d, yyyy');
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    
    groups[key].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 h-5 min-w-0 flex items-center justify-center" 
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={markAllAsRead}>Mark all as read</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/notifications')}>View all</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <ScrollArea className="h-[calc(100vh-20rem)] max-h-80">
          {Object.keys(groupedNotifications).length > 0 ? (
            <div className="px-1">
              {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                <div key={date} className="py-2">
                  <div className="sticky top-0 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    {date}
                  </div>
                  <div className="space-y-1">
                    {dateNotifications.map(notification => (
                      <button
                        key={notification.id}
                        className={`w-full p-3 text-left rounded-md hover:bg-muted transition-colors ${!notification.read ? 'bg-muted/50' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-medium text-sm">{notification.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(notification.created_at), 'h:mm a')}
                          </div>
                        </div>
                        <div className="text-xs mt-1 text-muted-foreground">
                          {notification.content}
                        </div>
                        {!notification.read && (
                          <div className="mt-1.5">
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          )}
        </ScrollArea>
        
        <div className="p-2 border-t">
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/notifications')}>
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
