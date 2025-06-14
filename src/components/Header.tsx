
import React, { useState } from 'react';
import { Bell, Calendar, LogOut, Settings, User, Plus, BookOpen, Clock, Trophy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, useSearchParams } from 'react-router-dom';
import { getAvatarUrl } from '@/utils/avatarGenerator';
import { toast } from 'sonner';

const Header: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [notificationCount, setNotificationCount] = useState(3);
  
  // Get the avatar URL (either uploaded or auto-generated study-themed)
  const avatarUrl = getAvatarUrl(profile, 32);
  const userName = profile?.full_name || 'Study Buddy';

  // Mock study sessions for the selected date
  const getStudySessionsForDate = (date: Date | undefined) => {
    if (!date) return [];
    
    const sessions = [
      { time: '9:00 AM', subject: 'Mathematics', type: 'Review', duration: '1h' },
      { time: '2:00 PM', subject: 'Physics', type: 'Practice', duration: '2h' },
      { time: '7:00 PM', subject: 'Chemistry', type: 'Study', duration: '1.5h' }
    ];
    
    // Simulate different sessions for different dates
    const dayOfMonth = date.getDate();
    return sessions.slice(0, (dayOfMonth % 3) + 1);
  };

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: 'reminder',
      icon: BookOpen,
      title: 'Study Session Starting Soon',
      description: 'Mathematics review in 30 minutes',
      time: '30 min',
      color: 'text-blue-500'
    },
    {
      id: 2,
      type: 'achievement',
      icon: Trophy,
      title: 'Streak Achievement!',
      description: 'You completed 7 days of consistent study',
      time: '2h ago',
      color: 'text-yellow-500'
    },
    {
      id: 3,
      type: 'deadline',
      icon: Clock,
      title: 'Assignment Due Tomorrow',
      description: 'Physics lab report submission',
      time: '1 day',
      color: 'text-red-500'
    }
  ];

  const handleQuickSchedule = () => {
    toast.success('Quick study session scheduled!', {
      description: 'Added 1-hour session for today at 3:00 PM',
      duration: 3000,
    });
  };

  const handleNotificationClick = (notification: any) => {
    setNotificationCount(prev => Math.max(0, prev - 1));
    toast.info(`📚 ${notification.title}`, {
      description: notification.description,
      duration: 4000,
    });
  };

  const clearAllNotifications = () => {
    setNotificationCount(0);
    toast.success('All notifications cleared!');
  };

  // Simplified navigation handler
  const navigateToTab = (tab: string) => {
    if (currentTab === tab) return; // Don't navigate if already on tab
    
    if (tab === 'dashboard') {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  return (
    <header className="w-full py-4 px-6 flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-10 border-b">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <div className="mr-2 bg-primary/10 p-2 rounded-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
              <path d="M12 2L18 7V21H6V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 14.5C9 13.12 10.12 12 11.5 12C12.88 12 14 13.12 14 14.5C14 15.88 12.88 17 11.5 17C10.12 17 9 15.88 9 14.5Z" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AI Study Planner
          </h1>
        </Link>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Enhanced Calendar with Mini Calendar Popup */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-primary transition-all duration-200 hover:bg-primary/10 relative" 
              title="Study Calendar & Quick Schedule"
            >
              <Calendar className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-lg">Study Calendar</h3>
              <p className="text-sm text-muted-foreground">Schedule and view your study sessions</p>
            </div>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border-0"
            />
            <div className="p-4 border-t">
              <div className="mb-3">
                <h4 className="font-medium text-sm mb-2">
                  Sessions for {selectedDate?.toLocaleDateString()}
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {getStudySessionsForDate(selectedDate).map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-accent/50 rounded text-sm">
                      <div>
                        <span className="font-medium">{session.time}</span>
                        <span className="text-muted-foreground ml-2">{session.subject}</span>
                      </div>
                      <span className="text-xs bg-primary/10 px-2 py-1 rounded">{session.duration}</span>
                    </div>
                  ))}
                  {getStudySessionsForDate(selectedDate).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">No sessions scheduled</p>
                  )}
                </div>
              </div>
              <Button 
                onClick={handleQuickSchedule}
                className="w-full" 
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Quick Schedule
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Enhanced Bell with Notification Center */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-primary transition-all duration-200 hover:bg-primary/10 relative" 
              title="Notification Center"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
                  {notificationCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Notifications</h3>
                <p className="text-sm text-muted-foreground">Stay updated with your study progress</p>
              </div>
              {notificationCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllNotifications}
                  className="text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className="p-4 border-b hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full bg-accent ${notification.color}`}>
                      <notification.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <Button 
                variant="outline" 
                className="w-full" 
                size="sm"
                onClick={() => navigateToTab('dashboard')}
              >
                View All Activities
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl} alt={userName} />
                <AvatarFallback name={userName} />
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            {user && (
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => navigateToTab('profile')}
              className={currentTab === 'profile' ? 'bg-accent' : ''}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigateToTab('settings')}
              className={currentTab === 'settings' ? 'bg-accent' : ''}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
