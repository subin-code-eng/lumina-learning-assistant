
import React, { useState } from 'react';
import { Bell, Calendar, LogOut, Settings, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, useSearchParams } from 'react-router-dom';
import { getAvatarUrl } from '@/utils/avatarGenerator';

const Header: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Get the avatar URL (either uploaded or auto-generated study-themed)
  const avatarUrl = getAvatarUrl(profile, 32);
  const userName = profile?.full_name || 'Study Buddy';

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
        {/* Simplified Calendar with Basic Calendar Popup */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-primary transition-all duration-200 hover:bg-primary/10" 
              title="Calendar"
            >
              <Calendar className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border-0"
            />
          </PopoverContent>
        </Popover>

        {/* Simple Bell Icon (no functionality) */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-primary transition-all duration-200 hover:bg-primary/10" 
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Button>

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
