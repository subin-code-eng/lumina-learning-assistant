
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Save } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [name, setName] = useState(profile?.full_name || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    updateProfile({ full_name: name });
    setIsEditing(false);
  };

  const getInitials = () => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">User Profile</CardTitle>
        <CardDescription>Manage your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-20 w-20 bg-primary text-primary-foreground">
            <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="font-medium text-lg">{name}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {user?.email_confirmed_at && (
              <span className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-2">
                <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                Verified
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            {isEditing ? (
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            ) : (
              <div className="p-2 bg-muted rounded-md mt-1">{name}</div>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium">Email Address</label>
            <div className="p-2 bg-muted rounded-md mt-1 flex justify-between items-center">
              {user?.email}
              {user?.email_confirmed_at ? (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Verified</span>
              ) : (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Unverified</span>
              )}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Account ID</label>
            <div className="p-2 bg-muted rounded-md mt-1 text-xs font-mono truncate">
              {user?.id || 'Not available'}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={() => {
              setName(profile?.full_name || '');
              setIsEditing(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            <User className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default Profile;
