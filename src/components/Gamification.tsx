
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, Star, Sparkles, TrendingUp, Zap, BookOpen, Trophy, Medal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

// Mock data for demonstration
const achievements = [
  {
    id: 1,
    name: 'Early Bird',
    description: 'Complete 5 study sessions before 9 AM',
    completed: true,
    icon: <Star className="h-5 w-5 text-yellow-500" />,
    xpReward: 50,
  },
  {
    id: 2,
    name: 'Perfect Streak',
    description: 'Complete your daily goals for 7 consecutive days',
    completed: false,
    progress: 5,
    total: 7,
    icon: <Zap className="h-5 w-5 text-orange-500" />,
    xpReward: 100,
  },
  {
    id: 3,
    name: 'Knowledge Master',
    description: 'Complete 50 study sessions in a single subject',
    completed: false,
    progress: 32,
    total: 50,
    icon: <Award className="h-5 w-5 text-primary" />,
    xpReward: 200,
  },
  {
    id: 4,
    name: 'Rapid Learner',
    description: 'Score 90% or higher on 3 consecutive quizzes',
    completed: true,
    icon: <TrendingUp className="h-5 w-5 text-green-500" />,
    xpReward: 75,
  },
  {
    id: 5,
    name: 'Study Marathon',
    description: 'Study for more than 3 hours in one session',
    completed: false,
    progress: 0,
    total: 1,
    icon: <Sparkles className="h-5 w-5 text-purple-500" />,
    xpReward: 150,
  },
];

const dailyChallenges = [
  { 
    id: 1, 
    name: 'Complete 2 quizzes', 
    xpReward: 30,
    completed: false 
  },
  { 
    id: 2, 
    name: 'Study for 1 hour straight', 
    xpReward: 25,
    completed: false 
  },
  { 
    id: 3, 
    name: 'Create 1 set of flashcards', 
    xpReward: 20,
    completed: false 
  }
];

const levelThresholds = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 10000];

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

const Gamification: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState({
    level: 7,
    title: 'Advanced Scholar',
    currentXP: 3450,
    nextLevelXP: 4000,
  });
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState<number[]>([]);

  const xpProgress = (currentLevel.currentXP / currentLevel.nextLevelXP) * 100;

  const playSuccessSound = () => {
    const audio = new Audio('/reward.mp3');
    audio.volume = 0.5;
    audio.play().catch(err => console.error("Could not play sound:", err));
  };

  const completeChallenge = (challengeId: number, xp: number) => {
    if (challengeCompleted.includes(challengeId)) return;
    
    // Play sound effect
    playSuccessSound();
    
    // Show toast
    toast({
      title: "Challenge completed!",
      description: `You earned ${xp} XP!`,
    });
    
    // Update XP and potentially level
    const newXP = currentLevel.currentXP + xp;
    let newLevel = currentLevel.level;
    let newNextLevelXP = currentLevel.nextLevelXP;
    
    // Check if leveled up
    if (newXP >= currentLevel.nextLevelXP && newLevel < 10) {
      newLevel++;
      newNextLevelXP = levelThresholds[newLevel];
      setShowCelebration(true);
      
      // Hide celebration after 3 seconds
      setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
      
      // Show level up toast
      toast({
        title: "Level Up!",
        description: `Congratulations! You've reached Level ${newLevel}: ${levelTitles[newLevel-1]}`,
        variant: "default",
        className: "border-primary",
      });
    }
    
    // Update state
    setCurrentLevel({
      level: newLevel,
      title: levelTitles[newLevel-1],
      currentXP: newXP,
      nextLevelXP: newNextLevelXP,
    });
    
    // Mark challenge as completed
    setChallengeCompleted([...challengeCompleted, challengeId]);
  };

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
              {dailyChallenges.map((challenge) => (
                <div 
                  key={challenge.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    challengeCompleted.includes(challenge.id) ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center">
                    <BookOpen className={`h-5 w-5 mr-3 ${
                      challengeCompleted.includes(challenge.id) ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <span className={challengeCompleted.includes(challenge.id) ? 'line-through' : ''}>
                      {challenge.name}
                    </span>
                  </div>
                  
                  {!challengeCompleted.includes(challenge.id) ? (
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
                    {!achievement.completed && 'progress' in achievement ? (
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
