
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { Settings as SettingsIcon, Moon, Sun, Bell, Volume2, VolumeX } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  // Check for system preference or saved preference on mount
  useEffect(() => {
    // Check if dark mode is saved in localStorage
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setDarkMode(settings.darkMode);
        setNotifications(settings.notifications);
        setSoundEffects(settings.soundEffects);
        
        // Apply dark mode to document if needed
        if (settings.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {
        console.error("Error parsing saved settings:", error);
      }
    } else {
      // Check for system preference if no saved setting
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDarkMode);
      if (prefersDarkMode) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const handleSaveSettings = () => {
    // In a real app, you would save these to a user's profile in the database
    localStorage.setItem('appSettings', JSON.stringify({
      darkMode,
      notifications,
      soundEffects
    }));
    
    // Apply dark mode immediately
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast.success("Settings saved", {
      description: "Your preferences have been updated"
    });
  };

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    // Apply the change immediately for better UX
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          Application Settings
        </CardTitle>
        <CardDescription>Customize your study experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Dark Mode</h4>
              <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch 
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notifications</h4>
              <p className="text-sm text-muted-foreground">Receive alerts for study reminders</p>
            </div>
            <Switch 
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Sound Effects</h4>
              <p className="text-sm text-muted-foreground">Play sounds for actions and achievements</p>
            </div>
            <div className="flex items-center gap-2">
              <VolumeX className="h-4 w-4 text-muted-foreground" />
              <Switch 
                checked={soundEffects}
                onCheckedChange={setSoundEffects}
              />
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {!user?.isDemoAccount && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium">Email Preferences</h4>
                <p className="text-sm text-muted-foreground mb-2">Manage what emails you receive</p>
                
                <div className="space-y-2 ml-4">
                  <div className="flex items-center gap-2">
                    <Switch id="marketing" defaultChecked={false} />
                    <label htmlFor="marketing" className="text-sm cursor-pointer">Marketing emails</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch id="reminders" defaultChecked={true} />
                    <label htmlFor="reminders" className="text-sm cursor-pointer">Study reminders</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch id="updates" defaultChecked={true} />
                    <label htmlFor="updates" className="text-sm cursor-pointer">Product updates</label>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSaveSettings}>
          Save Preferences
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Settings;
