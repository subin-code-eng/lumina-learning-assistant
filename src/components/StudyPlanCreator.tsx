
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Calendar, Clock, BookOpen, RefreshCw, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface StudyPlan {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  difficulty: string;
  duration_days: number;
  created_at: string;
}

const StudyPlanCreator: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Intermediate');
  const [subject, setSubject] = useState('');
  const [goals, setGoals] = useState('');
  const [timePreference, setTimePreference] = useState('morning');
  const [duration, setDuration] = useState('14');
  const [recentPlans, setRecentPlans] = useState<StudyPlan[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  
  // Map duration selections to days
  const durationMap: Record<string, string> = {
    '7': '1 week',
    '14': '2 weeks',
    '30': '1 month',
    '60': '2 months',
    '90': '3 months'
  };

  // Fetch user's recent study plans
  useEffect(() => {
    const fetchRecentPlans = async () => {
      if (!user) return;
      
      setLoadingPlans(true);
      try {
        const { data, error } = await supabase
          .from('study_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (error) throw error;
        
        if (data) {
          setRecentPlans(data);
        }
      } catch (error) {
        console.error('Error fetching study plans:', error);
      } finally {
        setLoadingPlans(false);
      }
    };
    
    fetchRecentPlans();
  }, [user, showSuccess]);

  const handleCreatePlan = async () => {
    if (!user) {
      toast.error("Authentication required", {
        description: "Please login to create a study plan"
      });
      return;
    }
    
    if (!subject.trim()) {
      toast.error("Subject required", {
        description: "Please enter a subject for your study plan"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Save the study plan to Supabase
      const { data, error } = await supabase
        .from('study_plans')
        .insert({
          user_id: user.id,
          title: `${subject} Study Plan`,
          description: goals || `Study plan for ${subject}`,
          subject: subject,
          difficulty: selectedDifficulty,
          duration_days: parseInt(duration)
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      // Show success state
      setShowSuccess(true);
      
      // Reset success state after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      
      // Reset form
      setSubject('');
      setGoals('');
      setSelectedDifficulty('Intermediate');
      setTimePreference('morning');
      setDuration('14');
    } catch (error) {
      console.error('Error creating study plan:', error);
      toast.error("Failed to create study plan", {
        description: "Please try again later"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
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
      
      {showSuccess && (
        <div className="px-6 pb-3">
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-600 dark:text-green-400">Study Plan Created</AlertTitle>
            <AlertDescription className="text-green-600/80 dark:text-green-400/80">
              Your personalized study plan has been successfully created.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
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
                <SelectItem value="7">1 week</SelectItem>
                <SelectItem value="14">2 weeks</SelectItem>
                <SelectItem value="30">1 month</SelectItem>
                <SelectItem value="60">2 months</SelectItem>
                <SelectItem value="90">3 months</SelectItem>
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
        
        {/* Recent Study Plans */}
        {recentPlans.length > 0 && (
          <div className="pt-4">
            <h3 className="text-sm font-medium mb-2">Your Recent Study Plans</h3>
            <div className="space-y-2">
              {recentPlans.map((plan) => (
                <div 
                  key={plan.id} 
                  className="p-2 border rounded-lg text-sm hover:bg-muted/50 transition-colors"
                >
                  <div className="font-medium">{plan.title}</div>
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>{plan.difficulty} • {plan.duration_days} days</span>
                    <span>{formatDate(plan.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {loadingPlans && (
          <div className="text-sm text-muted-foreground text-center">
            Loading your study plans...
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full gradient-bg hover:opacity-90 transition-opacity"
          onClick={handleCreatePlan}
          disabled={loading || !subject.trim()}
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
