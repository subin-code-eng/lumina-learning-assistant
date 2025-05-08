
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Calendar, Clock, BookOpen, RefreshCw } from 'lucide-react';

const StudyPlanCreator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Intermediate');
  const [subject, setSubject] = useState('');
  const [goals, setGoals] = useState('');
  const [timePreference, setTimePreference] = useState('morning');
  const [duration, setDuration] = useState('2weeks');

  const handleCreatePlan = () => {
    if (!subject.trim()) {
      toast.error("Subject required", {
        description: "Please enter a subject for your study plan"
      });
      return;
    }
    
    setLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      setLoading(false);
      toast.success("Study plan created", {
        description: "Your personalized study plan has been created and added to your calendar"
      });
    }, 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-primary" />
          Create AI Study Plan
        </CardTitle>
        <CardDescription>
          Let our AI create a personalized study plan based on your goals and schedule
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium" htmlFor="subject">Subject</label>
          <Input 
            id="subject" 
            placeholder="E.g., Mathematics, History, Physics" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium" htmlFor="goals">Your study goals</label>
          <Textarea 
            id="goals" 
            placeholder="What do you want to achieve? E.g., Master calculus concepts for final exam"
            className="min-h-[100px]"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              Study time preference
            </label>
            <Select 
              value={timePreference}
              onValueChange={setTimePreference}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning (6AM - 12PM)</SelectItem>
                <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                <SelectItem value="evening">Evening (5PM - 10PM)</SelectItem>
                <SelectItem value="night">Night (10PM - 6AM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              Duration
            </label>
            <Select 
              value={duration}
              onValueChange={setDuration}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1week">1 week</SelectItem>
                <SelectItem value="2weeks">2 weeks</SelectItem>
                <SelectItem value="1month">1 month</SelectItem>
                <SelectItem value="custom">Custom duration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">Difficulty level</label>
          <div className="flex gap-2 pt-2">
            {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
              <Button 
                key={level} 
                variant={selectedDifficulty === level ? "default" : "outline"}
                size="sm"
                className={`flex-1 ${selectedDifficulty === level ? "" : "dark:text-foreground dark:hover:text-foreground"}`}
                onClick={() => setSelectedDifficulty(level)}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full gradient-bg hover:opacity-90 transition-opacity"
          onClick={handleCreatePlan}
          disabled={loading}
        >
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Creating your plan...
            </>
          ) : (
            'Generate AI Study Plan'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StudyPlanCreator;
