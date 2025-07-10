
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define the schema for task validation
const addTaskSchema = z.object({
  title: z.string().min(3, { message: "Task title must be at least 3 characters" }),
  time: z.string().min(5, { message: "Time is required" }),
  subject: z.string().min(1, { message: "Subject is required" }),
});

interface Task {
  id: string;
  title: string;
  completed: boolean;
  time: string;
  subject: string;
}

// Custom hook for task persistence
const usePersistentTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const defaultTasks: Task[] = [
    { 
      id: '1', 
      title: 'Review Organic Chemistry Notes', 
      completed: false, 
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
  ];

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('studyTasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Error parsing saved tasks:', error);
        setTasks(defaultTasks);
      }
    } else {
      setTasks(defaultTasks);
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('studyTasks', JSON.stringify(tasks));
      
      // Dispatch custom event for gamification system
      const completedTasks = tasks.filter(task => task.completed);
      window.dispatchEvent(new CustomEvent('tasksUpdated', { 
        detail: { 
          totalTasks: tasks.length, 
          completedTasks: completedTasks.length,
          tasks: tasks
        } 
      }));
    }
  }, [tasks]);

  return [tasks, setTasks] as const;
};

const TodaysTasks: React.FC = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [tasks, setTasks] = usePersistentTasks();

  const form = useForm<z.infer<typeof addTaskSchema>>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: {
      title: '',
      time: '',
      subject: '',
    },
  });

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      
      const toggledTask = updatedTasks.find(task => task.id === taskId);
      if (toggledTask?.completed) {
        toast({
          title: "Task completed!",
          description: `Great job completing "${toggledTask.title}"!`,
        });
      }
      
      return updatedTasks;
    });
  };

  const onSubmit = (data: z.infer<typeof addTaskSchema>) => {
    // Generate a random ID (in a real app, this would come from the backend)
    const newId = Math.random().toString(36).substring(2, 9);
    
    // Create the new task
    const newTask: Task = {
      id: newId,
      title: data.title,
      time: data.time,
      subject: data.subject,
      completed: false
    };
    
    // Add the new task to the list
    setTasks(prevTasks => [...prevTasks, newTask]);
    
    // Reset the form and hide it
    form.reset();
    setShowForm(false);
    
    // Show a success toast
    toast({
      title: "Task added",
      description: "Your study task has been added successfully",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Today's Study Tasks</CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-muted-foreground text-sm flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowForm(!showForm)}
            >
              <Plus className="h-4 w-4 mr-1" /> 
              Add Task
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="mb-6 p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Add New Study Task</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Review Chapter 4 Notes" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. 2:00 - 3:30 PM" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. Mathematics" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      form.reset();
                      setShowForm(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Task</Button>
                </div>
              </form>
            </Form>
          </div>
        )}

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
          
          {tasks.filter(t => !t.completed).length === 0 && tasks.length > 0 && (
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
