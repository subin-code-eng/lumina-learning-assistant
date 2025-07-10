
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TaskData {
  totalTasks: number;
  completedTasks: number;
}

const DashboardSummary: React.FC = () => {
  const [taskData, setTaskData] = useState<TaskData>({ totalTasks: 4, completedTasks: 0 });
  const [focusTime, setFocusTime] = useState(135); // 2h 15m in minutes
  const [weeklyStreak, setWeeklyStreak] = useState(5);

  useEffect(() => {
    // Load initial task data from localStorage
    const loadTaskData = () => {
      const savedTasks = localStorage.getItem('studyTasks');
      if (savedTasks) {
        try {
          const tasks = JSON.parse(savedTasks);
          const completedTasks = tasks.filter((task: any) => task.completed).length;
          setTaskData({ totalTasks: tasks.length, completedTasks });
        } catch (error) {
          console.error('Error loading task data:', error);
        }
      }
    };

    loadTaskData();

    // Listen for task updates
    const handleTasksUpdated = (event: CustomEvent) => {
      const { totalTasks, completedTasks } = event.detail;
      setTaskData({ totalTasks, completedTasks });
    };

    window.addEventListener('tasksUpdated', handleTasksUpdated as EventListener);

    return () => {
      window.removeEventListener('tasksUpdated', handleTasksUpdated as EventListener);
    };
  }, []);

  const todayProgress = taskData.totalTasks > 0 ? Math.round((taskData.completedTasks / taskData.totalTasks) * 100) : 0;
  const focusProgress = Math.round((focusTime / 210) * 100); // Goal is 3h 30m (210 minutes)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Today's Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayProgress}%</div>
          <Progress value={todayProgress} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {taskData.completedTasks} of {taskData.totalTasks} tasks completed
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Focus Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.floor(focusTime / 60)}h {focusTime % 60}m
          </div>
          <Progress value={focusProgress} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">Goal: 3h 30m</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weeklyStreak} days</div>
          <div className="flex gap-1 mt-2">
            {[100, 100, 80, 100, 60, 0, 0].map((day, i) => (
              <div 
                key={i} 
                className="h-2 flex-1 rounded-full" 
                style={{
                  background: day ? `linear-gradient(90deg, hsl(var(--primary)) ${day}%, hsl(var(--muted)))` : 'hsl(var(--muted))'
                }}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Keep it up!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSummary;
