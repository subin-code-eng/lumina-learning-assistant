
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
  const [isLoading, setIsLoading] = useState(false);

  // Check for system preference or saved preference on mount
  useEffect(() => {
    // Check if dark mode is saved in localStorage
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setDarkMode(settings.darkMode);
        setNotifications(settings.notifications !== undefined ? settings.notifications : true);
        setSoundEffects(settings.soundEffects !== undefined ? settings.soundEffects : true);
        
        // Apply dark mode to document if needed
        if (settings.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {
        console.error("Error parsing saved settings:", error);
        // Set defaults if there's an error
        setDefaults();
      }
    } else {
      setDefaults();
    }
  }, []);

  const setDefaults = () => {
    // Check for system preference if no saved setting
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDarkMode);
    setNotifications(true);
    setSoundEffects(true);
    if (prefersDarkMode) {
      document.documentElement.classList.add('dark');
    }
  };

  const handleSaveSettings = () => {
    setIsLoading(true);
    try {
      // Save to localStorage
      const settings = {
        darkMode,
        notifications,
        soundEffects
      };
      localStorage.setItem('appSettings', JSON.stringify(settings));
      
      // Apply dark mode immediately
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Play a sound if sound effects are enabled
      if (soundEffects) {
        playSuccessSound();
      }

      // Show notification if notifications are enabled
      toast.success("Settings saved", {
        description: "Your preferences have been updated"
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings", {
        description: "Please try again"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    // Apply the change immediately for better UX
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Play a toggle sound if sound effects are enabled
    if (soundEffects) {
      playToggleSound();
    }
  };

  const toggleNotifications = (checked: boolean) => {
    setNotifications(checked);
    
    // Play a toggle sound if sound effects are enabled
    if (soundEffects) {
      playToggleSound();
    }
    
    // Show example notification if enabling notifications
    if (checked) {
      setTimeout(() => {
        toast.info("Notifications enabled", {
          description: "You will now receive study reminders"
        });
      }, 500);
    }
  };

  const toggleSoundEffects = (checked: boolean) => {
    setSoundEffects(checked);
    
    // Play a sound immediately to demonstrate the setting
    if (checked) {
      playToggleSound();
    }
  };

  // Simple sound effect functions
  const playToggleSound = () => {
    try {
      const audio = new Audio();
      audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAADIAEBAAAAYABgsOERQXGhweIiUoKy4xNDc6PT9CRUhLTlFTV1pTVVhbXmFkZ2ptbXF0d3p9gIOGiYyPkpaYCQkMDxIVGBseICMmKSwvMjU4Oz5BREZJTFBTVlldYGNmaGxvcHN2eXyAg4aJjJCTlpcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQAA';
      audio.volume = 0.2;
      audio.play();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const playSuccessSound = () => {
    try {
      const audio = new Audio();
      audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAADIAEBAAAAwADB8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQAA';
      audio.volume = 0.3;
      audio.play();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  // Function to check if the user is a demo account
  const isDemoAccount = () => {
    // You can implement actual demo account logic here
    // For now, we'll check based on email, but you could add a custom claim or field in Supabase
    return user?.email?.includes('demo') || false;
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
              onCheckedChange={toggleNotifications}
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
                onCheckedChange={toggleSoundEffects}
              />
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {!isDemoAccount() && (
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
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Preferences"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Settings;
