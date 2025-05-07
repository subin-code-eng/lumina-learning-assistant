
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  time: string;
  subject: string;
}

const TodaysTasks: React.FC = () => {
  const [tasks, setTasks] = React.useState<Task[]>([
    { 
      id: '1', 
      title: 'Review Organic Chemistry Notes', 
      completed: true, 
      time: '09:00 - 10:30 AM',
      subject: 'Chemistry'
    },
    { 
      id: '2', 
      title: 'Practice Calculus Problems (Ch. 5-7)', 
      completed: false, 
      time: '11:00 AM - 12:30 PM',
      subject: 'Mathematics'
    },
    { 
      id: '3', 
      title: 'Read Literature Analysis Chapter', 
      completed: false, 
      time: '02:00 - 03:30 PM',
      subject: 'Literature'
    },
    { 
      id: '4', 
      title: 'Physics Lab Preparation', 
      completed: false, 
      time: '04:00 - 05:30 PM',
      subject: 'Physics'
    },
  ]);

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Today's Study Tasks</CardTitle>
          <div className="flex items-center text-muted-foreground text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className={`flex items-start p-3 rounded-lg transition-colors ${
                task.completed ? 'bg-muted/50' : 'bg-card hover:bg-muted/30'
              }`}
            >
              <Checkbox 
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={() => toggleTaskCompletion(task.id)}
                className="mt-1"
              />
              <div className="ml-3 flex-1">
                <label 
                  htmlFor={`task-${task.id}`}
                  className={`font-medium cursor-pointer ${
                    task.completed ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {task.title}
                </label>
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{task.time}</span>
                  <span className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                    {task.subject}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {tasks.filter(t => !t.completed).length === 0 && (
            <div className="text-center py-6">
              <p className="text-muted-foreground">All tasks completed! Great job! 🎉</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodaysTasks;
