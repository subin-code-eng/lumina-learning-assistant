import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Save, Upload, Camera } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { getAvatarUrl } from '@/utils/avatarGenerator';

const Profile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [name, setName] = useState(profile?.full_name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleSave = () => {
    updateProfile({ full_name: name });
    setIsEditing(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: publicUrl });

      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Get the avatar URL (either uploaded or auto-generated study-themed)
  const avatarUrl = getAvatarUrl(profile, 80);
  const userName = name || 'Study Buddy';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">User Profile</CardTitle>
        <CardDescription>Manage your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl} alt={userName} />
              <AvatarFallback name={userName} className="text-xl" />
            </Avatar>
            <div className="absolute -bottom-2 -right-2">
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 shadow-lg transition-colors">
                  {isUploadingImage ? (
                    <Upload className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploadingImage}
                />
              </label>
            </div>
          </div>
          <div className="text-center">
            <h3 className="font-medium text-lg">{userName}</h3>
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
