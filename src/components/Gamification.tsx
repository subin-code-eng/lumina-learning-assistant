
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
    checkFunction: (data: any) => Math.max(...Object.values(data.subjectCounts as number[])) >= 50,
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

        return newStats;
      });
    };

    window.addEventListener('tasksUpdated', handleTasksUpdated as EventListener);

    return () => {
      window.removeEventListener('tasksUpdated', handleTasksUpdated as EventListener);
    };
  }, [setUserStats]);

  // Check for newly completed achievements
  useEffect(() => {
    achievementDefinitions.forEach(achievement => {
      if (!completedAchievements.includes(achievement.id) && achievement.checkFunction(userStats)) {
        setCompletedAchievements(prev => [...prev, achievement.id]);
        addXP(achievement.xpReward);
        toast({
          title: "Achievement Unlocked!",
          description: `${achievement.name} - +${achievement.xpReward} XP!`,
        });
      }
    });
  }, [userStats, completedAchievements, setCompletedAchievements]);

  const addXP = (xp: number) => {
    setCurrentLevel(prev => {
      const newXP = prev.currentXP + xp;
      let newLevel = prev.level;
      let newNextLevelXP = prev.nextLevelXP;

      // Check for level up
      while (newLevel < levelThresholds.length - 1 && newXP >= levelThresholds[newLevel]) {
        newLevel++;
        newNextLevelXP = levelThresholds[newLevel] || newNextLevelXP;
      }

      if (newLevel > prev.level) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
        
        toast({
          title: "Level Up!",
          description: `Congratulations! You've reached Level ${newLevel}: ${levelTitles[newLevel-1]}`,
          variant: "default",
          className: "border-primary",
        });
      }

      return {
        level: newLevel,
        title: levelTitles[newLevel-1] || 'Master Scholar',
        currentXP: newXP,
        nextLevelXP: newNextLevelXP,
      };
    });
  };

  const completeChallenge = (challengeId: number, xp: number) => {
    if (completedChallenges.includes(challengeId)) return;
    
    toast({
      title: "Challenge completed!",
      description: `You earned ${xp} XP!`,
    });
    
    addXP(xp);
    setCompletedChallenges(prev => [...prev, challengeId]);
  };

  const xpProgress = currentLevel.nextLevelXP > 0 ? (currentLevel.currentXP / currentLevel.nextLevelXP) * 100 : 100;

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

  // Generate daily challenges with completion status
  const activeChallenges = dailyChallenges.map(challenge => {
    const isCompleted = completedChallenges.includes(challenge.id);
    return {
      ...challenge,
      completed: isCompleted,
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
                  {currentLevel.currentXP} / {currentLevel.nextLevelXP} XP
                </p>
              </div>
              <div className={`rounded-full bg-primary/10 p-3 ${showCelebration ? 'ring-2 ring-primary ring-offset-2 animate-bounce' : ''}`}>
                <span className="text-xl font-bold text-primary">{currentLevel.level}</span>
              </div>
            </div>
            <Progress value={xpProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(currentLevel.nextLevelXP - currentLevel.currentXP)} XP until next level
            </p>
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
                  <div className="flex items-center">
                    <BookOpen className={`h-5 w-5 mr-3 ${
                      challenge.completed ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <span className={challenge.completed ? 'line-through' : ''}>
                      {challenge.name}
                    </span>
                  </div>
                  
                  {!challenge.completed ? (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => completeChallenge(challenge.id, challenge.xpReward)}
                    >
                      +{challenge.xpReward} XP
                    </Button>
                  ) : (
                    <Badge variant="secondary">Completed</Badge>
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
                          value={(achievement.progress / achievement.total) * 100} 
                          className="h-1.5" 
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {achievement.progress} / {achievement.total} completed
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
