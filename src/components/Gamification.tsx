
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, Star, Sparkles, TrendingUp, Zap, BookOpen, Trophy, Medal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

// Achievement definitions with tracking logic
const achievementDefinitions = [
  {
    id: 1,
    name: 'Early Bird',
    description: 'Complete 5 study sessions before 9 AM',
    icon: <Star className="h-5 w-5 text-yellow-500" />,
    xpReward: 50,
    checkFunction: (data: any) => data.earlySessionsCount >= 5,
  },
  {
    id: 2,
    name: 'Perfect Streak',
    description: 'Complete your daily goals for 7 consecutive days',
    icon: <Zap className="h-5 w-5 text-orange-500" />,
    xpReward: 100,
    checkFunction: (data: any) => data.streakDays >= 7,
  },
  {
    id: 3,
    name: 'Knowledge Master',
    description: 'Complete 50 study sessions in a single subject',
    icon: <Award className="h-5 w-5 text-primary" />,
    xpReward: 200,
    checkFunction: (data: any) => Math.max(...Object.values(data.subjectCounts as number[]), 0) >= 50,
  },
  {
    id: 4,
    name: 'Rapid Learner',
    description: 'Score 90% or higher on 3 consecutive quizzes',
    icon: <TrendingUp className="h-5 w-5 text-green-500" />,
    xpReward: 75,
    checkFunction: (data: any) => data.highScoreStreak >= 3,
  },
  {
    id: 5,
    name: 'Study Marathon',  
    description: 'Study for more than 3 hours in one session',
    icon: <Sparkles className="h-5 w-5 text-purple-500" />,
    xpReward: 150,
    checkFunction: (data: any) => data.longestSession >= 180,
  },
];

const dailyChallenges = [
  { 
    id: 1, 
    name: 'Complete 2 study tasks', 
    xpReward: 30,
    checkFunction: (data: any) => data.completedTasks >= 2,
  },
  { 
    id: 2, 
    name: 'Study for 1 hour straight', 
    xpReward: 25,
    checkFunction: (data: any) => data.focusTime >= 60,
  },
  { 
    id: 3, 
    name: 'Create 1 set of flashcards', 
    xpReward: 20,
    checkFunction: (data: any) => data.flashcardsCreated >= 1,
  }
];

const levelThresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000];

const levelTitles = [
  "Novice Learner",
  "Curious Student", 
  "Knowledge Seeker", 
  "Dedicated Scholar", 
  "Wisdom Apprentice", 
  "Knowledge Adept", 
  "Advanced Scholar", 
  "Wisdom Master", 
  "Learning Sage", 
  "Enlightened Master"
];

// Custom hook for gamification persistence
const useGamificationData = () => {
  const [currentLevel, setCurrentLevel] = useState({
    level: 1,
    title: 'Novice Learner',
    currentXP: 0,
    nextLevelXP: 100,
  });
  
  const [userStats, setUserStats] = useState({
    completedTasks: 0,
    focusTime: 0,
    flashcardsCreated: 0,
    earlySessionsCount: 0,
    streakDays: 1,
    subjectCounts: {} as Record<string, number>,
    highScoreStreak: 0,
    longestSession: 0,
  });

  const [completedAchievements, setCompletedAchievements] = useState<number[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([]);

  // Reset daily challenges at midnight
  useEffect(() => {
    const checkDateReset = () => {
      const lastResetDate = localStorage.getItem('lastChallengeReset');
      const today = new Date().toDateString();
      
      if (lastResetDate !== today) {
        setCompletedChallenges([]);
        localStorage.setItem('lastChallengeReset', today);
        localStorage.removeItem('completedChallenges');
      }
    };

    checkDateReset();
    const interval = setInterval(checkDateReset, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Load data from localStorage
  useEffect(() => {
    const savedLevel = localStorage.getItem('gamificationLevel');
    const savedStats = localStorage.getItem('userStats');
    const savedAchievements = localStorage.getItem('completedAchievements');
    const savedChallenges = localStorage.getItem('completedChallenges');

    if (savedLevel) {
      try {
        setCurrentLevel(JSON.parse(savedLevel));
      } catch (error) {
        console.error('Error loading level data:', error);
      }
    }

    if (savedStats) {
      try {
        setUserStats(JSON.parse(savedStats));
      } catch (error) {
        console.error('Error loading user stats:', error);
      }
    }

    if (savedAchievements) {
      try {
        setCompletedAchievements(JSON.parse(savedAchievements));
      } catch (error) {
        console.error('Error loading achievements:', error);
      }
    }

    if (savedChallenges) {
      try {
        setCompletedChallenges(JSON.parse(savedChallenges));
      } catch (error) {
        console.error('Error loading challenges:', error);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('gamificationLevel', JSON.stringify(currentLevel));
  }, [currentLevel]);

  useEffect(() => {
    localStorage.setItem('userStats', JSON.stringify(userStats));
  }, [userStats]);

  useEffect(() => {
    localStorage.setItem('completedAchievements', JSON.stringify(completedAchievements));
  }, [completedAchievements]);

  useEffect(() => {
    localStorage.setItem('completedChallenges', JSON.stringify(completedChallenges));
  }, [completedChallenges]);

  return {
    currentLevel,
    setCurrentLevel,
    userStats,
    setUserStats,
    completedAchievements,
    setCompletedAchievements,
    completedChallenges,
    setCompletedChallenges,
  };
};

const Gamification: React.FC = () => {
  const {
    currentLevel,
    setCurrentLevel,
    userStats,
    setUserStats,
    completedAchievements,
    setCompletedAchievements,
    completedChallenges,
    setCompletedChallenges,
  } = useGamificationData();

  const [showCelebration, setShowCelebration] = useState(false);

  // Listen for task updates
  useEffect(() => {
    const handleTasksUpdated = (event: CustomEvent) => {
      const { completedTasks, tasks } = event.detail;
      
      console.log('Tasks updated event received:', { completedTasks, tasks });
      
      // Update user stats based on completed tasks
      setUserStats(prev => {
        const newStats = { ...prev, completedTasks };
        
        // Count tasks by subject
        const subjectCounts: Record<string, number> = {};
        tasks.forEach((task: any) => {
          if (task.completed) {
            subjectCounts[task.subject] = (subjectCounts[task.subject] || 0) + 1;
          }
        });
        newStats.subjectCounts = subjectCounts;

        // Update focus time based on completed tasks (simulate study time)
        newStats.focusTime = completedTasks * 30; // 30 minutes per completed task

        console.log('Updated user stats:', newStats);

        return newStats;
      });
    };

    window.addEventListener('tasksUpdated', handleTasksUpdated as EventListener);

    return () => {
      window.removeEventListener('tasksUpdated', handleTasksUpdated as EventListener);
    };
  }, [setUserStats]);

  // Function to add XP and handle level progression
  const addXP = (xp: number) => {
    console.log(`Adding ${xp} XP. Current level before:`, currentLevel);
    
    setCurrentLevel(prev => {
      const newTotalXP = prev.currentXP + xp;
      console.log(`New total XP: ${newTotalXP}`);
      
      // Find the correct level based on total XP
      let newLevel = 1;
      for (let i = levelThresholds.length - 1; i >= 0; i--) {
        if (newTotalXP >= levelThresholds[i]) {
          newLevel = i + 1;
          break;
        }
      }
      
      // Calculate next level XP threshold
      const nextLevelXP = levelThresholds[newLevel] || levelThresholds[levelThresholds.length - 1];

      console.log(`Calculated level: ${newLevel}, Next level XP threshold: ${nextLevelXP}`);

      // Check if we leveled up
      if (newLevel > prev.level) {
        console.log(`LEVEL UP! From ${prev.level} to ${newLevel}`);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
        
        toast({
          title: "🎉 Level Up!",
          description: `Congratulations! You've reached Level ${newLevel}: ${levelTitles[newLevel-1]}`,
          variant: "default",
          className: "border-primary",
        });
      }

      const newLevelData = {
        level: newLevel,
        title: levelTitles[newLevel-1] || 'Master Scholar',
        currentXP: newTotalXP,
        nextLevelXP: nextLevelXP,
      };

      console.log('New level data:', newLevelData);
      return newLevelData;
    });
  };

  // Check for newly completed achievements
  useEffect(() => {
    console.log('Checking achievements with stats:', userStats);
    
    achievementDefinitions.forEach(achievement => {
      if (!completedAchievements.includes(achievement.id) && achievement.checkFunction(userStats)) {
        console.log(`Achievement unlocked: ${achievement.name}`);
        setCompletedAchievements(prev => [...prev, achievement.id]);
        addXP(achievement.xpReward);
        toast({
          title: "🏆 Achievement Unlocked!",
          description: `${achievement.name} - +${achievement.xpReward} XP!`,
        });
      }
    });
  }, [userStats, completedAchievements, setCompletedAchievements]);

  // Check for newly completed daily challenges
  useEffect(() => {
    console.log('Checking daily challenges with stats:', userStats);
    
    dailyChallenges.forEach(challenge => {
      if (!completedChallenges.includes(challenge.id) && challenge.checkFunction(userStats)) {
        console.log(`Daily challenge completed: ${challenge.name}`);
        setCompletedChallenges(prev => [...prev, challenge.id]);
        addXP(challenge.xpReward);
        toast({
          title: "✅ Daily Challenge Completed!",
          description: `${challenge.name} - +${challenge.xpReward} XP!`,
        });
      }
    });
  }, [userStats, completedChallenges, setCompletedChallenges]);

  const completeChallengeManualy = (challengeId: number, xp: number) => {
    const challenge = dailyChallenges.find(c => c.id === challengeId);
    if (!challenge || completedChallenges.includes(challengeId)) return;
    
    console.log(`Manually completing challenge: ${challenge.name}, XP: ${xp}`);
    
    toast({
      title: "🎯 Challenge Completed!",
      description: `You earned ${xp} XP!`,
    });
    
    addXP(xp);
    setCompletedChallenges(prev => [...prev, challengeId]);
  };

  // Calculate XP progress for current level
  const getCurrentLevelXP = () => {
    const currentLevelMin = levelThresholds[currentLevel.level - 1] || 0;
    const nextLevelMin = levelThresholds[currentLevel.level] || levelThresholds[levelThresholds.length - 1];
    const currentLevelProgress = currentLevel.currentXP - currentLevelMin;
    const totalLevelXP = nextLevelMin - currentLevelMin;
    
    return {
      current: Math.max(0, currentLevelProgress),
      total: Math.max(1, totalLevelXP),
      percentage: totalLevelXP > 0 ? Math.min(100, (currentLevelProgress / totalLevelXP) * 100) : 100
    };
  };

  const levelProgress = getCurrentLevelXP();

  // Generate achievements with current progress
  const achievements = achievementDefinitions.map(def => {
    const isCompleted = completedAchievements.includes(def.id);
    let progress = 0;
    let total = 1;

    // Calculate progress for incomplete achievements
    if (!isCompleted) {
      switch (def.id) {
        case 1: // Early Bird
          progress = userStats.earlySessionsCount;
          total = 5;
          break;
        case 2: // Perfect Streak
          progress = userStats.streakDays;
          total = 7;
          break;
        case 3: // Knowledge Master
          progress = Math.max(...Object.values(userStats.subjectCounts), 0);
          total = 50;
          break;
        case 4: // Rapid Learner
          progress = userStats.highScoreStreak;
          total = 3;
          break;
        case 5: // Study Marathon
          progress = userStats.longestSession;
          total = 180;
          break;
      }
    }

    return {
      ...def,
      completed: isCompleted,
      progress,
      total,
    };
  });

  // Generate daily challenges with completion status and progress
  const activeChallenges = dailyChallenges.map(challenge => {
    const isCompleted = completedChallenges.includes(challenge.id);
    const canComplete = challenge.checkFunction(userStats);
    
    let progress = 0;
    let total = 1;
    
    // Calculate progress for incomplete challenges
    if (!isCompleted) {
      switch (challenge.id) {
        case 1: // Complete 2 study tasks
          progress = userStats.completedTasks;
          total = 2;
          break;
        case 2: // Study for 1 hour straight
          progress = userStats.focusTime;
          total = 60;
          break;
        case 3: // Create 1 set of flashcards
          progress = userStats.flashcardsCreated;
          total = 1;
          break;
      }
    }
    
    return {
      ...challenge,
      completed: isCompleted,
      canComplete,
      progress,
      total,
    };
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Study Progress & Achievements
          </CardTitle>
          <CardDescription>Track your learning journey and unlock rewards</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Level indicator with celebration animation */}
          <div className={`mb-6 relative ${showCelebration ? 'animate-pulse' : ''}`}>
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="font-medium">Level {currentLevel.level}: {currentLevel.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentLevel.currentXP} Total XP | {levelProgress.current} / {levelProgress.total} XP to next level
                </p>
              </div>
              <div className={`rounded-full bg-primary/10 p-3 ${showCelebration ? 'ring-2 ring-primary ring-offset-2 animate-bounce' : ''}`}>
                <span className="text-xl font-bold text-primary">{currentLevel.level}</span>
              </div>
            </div>
            <Progress value={levelProgress.percentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.max(0, levelProgress.total - levelProgress.current)} XP until next level
            </p>
          </div>

          {/* User Stats Display */}
          <div className="mb-6 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium mb-2">Current Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Tasks Completed:</span>
                <span className="ml-2 font-medium">{userStats.completedTasks}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Focus Time:</span>
                <span className="ml-2 font-medium">{userStats.focusTime} min</span>
              </div>
              <div>
                <span className="text-muted-foreground">Flashcards:</span>
                <span className="ml-2 font-medium">{userStats.flashcardsCreated}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Streak:</span>
                <span className="ml-2 font-medium">{userStats.streakDays} days</span>
              </div>
            </div>
          </div>

          {/* Daily Challenges */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Daily Challenges</h3>
            <div className="space-y-2 mb-3">
              {activeChallenges.map((challenge) => (
                <div 
                  key={challenge.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    challenge.completed ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <BookOpen className={`h-5 w-5 mr-3 ${
                        challenge.completed ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <span className={challenge.completed ? 'line-through' : ''}>
                        {challenge.name}
                      </span>
                    </div>
                    
                    {!challenge.completed && challenge.total > 1 && (
                      <div className="mt-2 ml-8">
                        <Progress 
                          value={(Math.min(challenge.progress, challenge.total) / challenge.total) * 100} 
                          className="h-1.5" 
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.min(challenge.progress, challenge.total)} / {challenge.total} completed
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {!challenge.completed ? (
                    <Button 
                      size="sm" 
                      variant={challenge.canComplete ? "default" : "outline"}
                      disabled={!challenge.canComplete}
                      onClick={() => completeChallengeManualy(challenge.id, challenge.xpReward)}
                    >
                      {challenge.canComplete ? `Claim +${challenge.xpReward} XP` : `+${challenge.xpReward} XP`}
                    </Button>
                  ) : (
                    <Badge variant="secondary">✅ Completed</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h3 className="font-medium mb-4">Achievements</h3>
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`flex items-center p-3 rounded-lg border ${
                    achievement.completed ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'
                  }`}
                >
                  <div className={`rounded-full p-2 mr-3 ${achievement.completed ? 'bg-primary/10' : 'bg-muted'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{achievement.name}</h4>
                      {achievement.completed ? (
                        <Badge variant="secondary" className="ml-auto">+{achievement.xpReward} XP</Badge>
                      ) : (
                        <Badge variant="outline" className="ml-auto">+{achievement.xpReward} XP</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {!achievement.completed && achievement.total > 1 ? (
                      <div className="mt-2">
                        <Progress 
                          value={(Math.min(achievement.progress, achievement.total) / achievement.total) * 100} 
                          className="h-1.5" 
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.min(achievement.progress, achievement.total)} / {achievement.total} completed
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Gamification;
