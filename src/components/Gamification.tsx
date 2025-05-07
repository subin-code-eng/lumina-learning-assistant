
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, Star, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock data for demonstration
const achievements = [
  {
    id: 1,
    name: 'Early Bird',
    description: 'Complete 5 study sessions before 9 AM',
    completed: true,
    icon: <Star className="h-5 w-5 text-yellow-500" />,
  },
  {
    id: 2,
    name: 'Perfect Streak',
    description: 'Complete your daily goals for 7 consecutive days',
    completed: false,
    progress: 5,
    total: 7,
    icon: <Zap className="h-5 w-5 text-orange-500" />,
  },
  {
    id: 3,
    name: 'Knowledge Master',
    description: 'Complete 50 study sessions in a single subject',
    completed: false,
    progress: 32,
    total: 50,
    icon: <Award className="h-5 w-5 text-primary" />,
  },
  {
    id: 4,
    name: 'Rapid Learner',
    description: 'Score 90% or higher on 3 consecutive quizzes',
    completed: true,
    icon: <TrendingUp className="h-5 w-5 text-green-500" />,
  },
  {
    id: 5,
    name: 'Study Marathon',
    description: 'Study for more than 3 hours in one session',
    completed: false,
    progress: 0,
    total: 1,
    icon: <Sparkles className="h-5 w-5 text-purple-500" />,
  },
];

const currentLevel = {
  level: 7,
  title: 'Advanced Scholar',
  currentXP: 3450,
  nextLevelXP: 4000,
};

const Gamification: React.FC = () => {
  const xpProgress = (currentLevel.currentXP / currentLevel.nextLevelXP) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Study Progress & Achievements
          </CardTitle>
          <CardDescription>Track your learning journey and unlock rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="font-medium">Level {currentLevel.level}: {currentLevel.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentLevel.currentXP} / {currentLevel.nextLevelXP} XP
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <span className="text-xl font-bold text-primary">{currentLevel.level}</span>
              </div>
            </div>
            <Progress value={xpProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(currentLevel.nextLevelXP - currentLevel.currentXP)} XP until next level
            </p>
          </div>

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
                        <Badge variant="secondary" className="ml-auto">Completed</Badge>
                      ) : null}
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
