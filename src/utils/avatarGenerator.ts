export const generateAvatarUrl = (name: string, size: number = 100): string => {
  // Clean the name and get initials
  const cleanName = name?.trim() || 'User';
  const initials = cleanName
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Create a hash from the name for consistent randomization
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const userHash = Math.abs(hash);

  // Study-themed avatar styles with educational elements
  const avatarStyles = [
    'adventurer',     // Professional looking avatars
    'avataaars',      // Cartoon style with accessories
    'big-smile',      // Happy, friendly avatars
    'bottts',         // Robot-like (AI theme)
    'fun-emoji',      // Emoji-based fun avatars
    'lorelei',        // Illustrated human avatars
    'personas',       // Professional personas
    'pixel-art'       // Retro pixel art style
  ];

  // Educational color schemes
  const colorSchemes = [
    { bg: '4F46E5', accent: 'FBBF24' }, // Indigo & Amber (Academic)
    { bg: '059669', accent: 'F59E0B' }, // Emerald & Orange (Nature/Growth)
    { bg: 'DC2626', accent: '3B82F6' }, // Red & Blue (Classic)
    { bg: '7C3AED', accent: '10B981' }, // Purple & Green (Creative)
    { bg: 'EA580C', accent: '6366F1' }, // Orange & Indigo (Energetic)
    { bg: '0891B2', accent: 'F59E0B' }, // Cyan & Amber (Tech)
    { bg: 'BE185D', accent: '22C55E' }, // Pink & Green (Vibrant)
    { bg: '7C2D12', accent: '3B82F6' }, // Brown & Blue (Earth)
    { bg: '1E40AF', accent: 'F97316' }, // Blue & Orange (Trust)
    { bg: '991B1B', accent: '059669' }  // Dark Red & Emerald (Bold)
  ];

  // Study-themed accessories and features
  const studyFeatures = [
    'glasses', 'book', 'graduation-cap', 'pencil', 'laptop', 
    'coffee', 'lightbulb', 'star', 'trophy', 'brain'
  ];

  // Select style, colors, and features based on user hash
  const selectedStyle = avatarStyles[userHash % avatarStyles.length];
  const selectedColors = colorSchemes[userHash % colorSchemes.length];
  const featureIndex = (userHash * 3) % studyFeatures.length;

  // Create unique seed combining name and style for consistency
  const avatarSeed = `${cleanName}-${selectedStyle}-study`;

  // Build avatar URL with study-themed parameters
  const baseUrl = `https://api.dicebear.com/9.x/${selectedStyle}/svg`;
  const params = new URLSearchParams({
    seed: avatarSeed,
    backgroundColor: selectedColors.bg,
    size: size.toString(),
    radius: '12',
    backgroundType: 'gradientLinear',
    backgroundRotation: ((userHash * 45) % 360).toString(),
    scale: '85'
  });

  // Add style-specific educational parameters
  if (selectedStyle === 'avataaars') {
    params.append('accessories', ['prescription01', 'prescription02', 'round', 'sunglasses'][userHash % 4]);
    params.append('top', ['shortHair', 'longHair', 'hat', 'graduationCap'][userHash % 4]);
  } else if (selectedStyle === 'adventurer') {
    params.append('eyes', ['variant01', 'variant02', 'variant03'][userHash % 3]);
    params.append('eyebrows', ['variant01', 'variant02'][userHash % 2]);
  } else if (selectedStyle === 'bottts') {
    params.append('colors', selectedColors.accent);
    params.append('textureChance', '75');
  } else if (selectedStyle === 'personas') {
    params.append('beard', ['variant01', 'variant02', ''][userHash % 3]);
    params.append('hair', ['variant01', 'variant02', 'variant03'][userHash % 3]);
  }

  return `${baseUrl}?${params.toString()}`;
};

export const getAvatarUrl = (profile: any, size: number = 100): string => {
  // If user has uploaded an avatar, use it
  if (profile?.avatar_url) {
    return profile.avatar_url;
  }
  
  // Otherwise generate an educational-themed automatic avatar
  const name = profile?.full_name || profile?.email || 'Study Buddy';
  return generateAvatarUrl(name, size);
};

// Generate initials fallback for when avatars fail to load
export const getInitials = (name: string): string => {
  if (!name) return 'SB'; // Study Buddy default
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Get study-themed background color for fallback avatars
export const getStudyThemeColor = (name: string): string => {
  const studyColors = [
    'bg-blue-500',    // Knowledge
    'bg-green-500',   // Growth
    'bg-purple-500',  // Creativity
    'bg-orange-500',  // Energy
    'bg-teal-500',    // Focus
    'bg-indigo-500',  // Wisdom
    'bg-pink-500',    // Innovation
    'bg-cyan-500',    // Technology
    'bg-emerald-500', // Success
    'bg-violet-500'   // Excellence
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return studyColors[Math.abs(hash) % studyColors.length];
};
