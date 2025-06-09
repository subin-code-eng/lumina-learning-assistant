export const generateAvatarUrl = (name: string, size: number = 100): string => {
  // Clean the name and get initials
  const cleanName = name?.trim() || 'User';
  const initials = cleanName
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Generate a consistent color based on the name
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#10AC84', '#EE5A6F', '#C44569', '#F8B500', '#6C5CE7'
  ];
  
  // Create a simple hash from the name to pick a consistent color
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const backgroundColor = colors[colorIndex];

  // Use DiceBear API for more professional avatars
  const style = 'initials';
  const seed = encodeURIComponent(cleanName);
  
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=${backgroundColor.replace('#', '')}&size=${size}&radius=50&fontSize=36&fontWeight=600&textColor=ffffff`;
};

export const getAvatarUrl = (profile: any, size: number = 100): string => {
  // If user has uploaded an avatar, use it
  if (profile?.avatar_url) {
    return profile.avatar_url;
  }
  
  // Otherwise generate an automatic avatar
  const name = profile?.full_name || 'User';
  return generateAvatarUrl(name, size);
};
