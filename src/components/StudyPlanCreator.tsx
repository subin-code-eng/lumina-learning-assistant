import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Calendar, Clock, BookOpen, RefreshCw, Check, FileText, Plus, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ReactMarkdown from 'react-markdown';

interface StudyPlan {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  difficulty: string;
  duration_days: number;
  created_at: string;
  user_id: string;
  updated_at: string;
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
  const [showPlans, setShowPlans] = useState(false);
  const [allStudyPlans, setAllStudyPlans] = useState<StudyPlan[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<string>('');
  const [showGeneratedPlan, setShowGeneratedPlan] = useState(false);

  useEffect(() => {
    const fetchRecentPlans = async () => {
      if (!user) return;
      
      setLoadingPlans(true);
      try {
        const { data, error } = await supabase
          .from('study_plans')
          .select('id, title, description, subject, difficulty, duration_days, created_at, user_id, updated_at')
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

  const generateAIStudyPlan = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          query: `Create a comprehensive ${duration}-day study plan for ${subject} at ${selectedDifficulty} level. Goals: ${goals}. Preferred study time: ${timePreference}. 
          
          Structure the plan with:
          - Daily learning objectives and topics
          - Specific study methods and techniques
          - Practice exercises and assignments
          - Review sessions and progress checkpoints
          - Time allocation for each activity
          
          Format clearly with headers and bullet points for easy reading.`,
          userPreferences: {
            learningStyle: 'visual',
            difficulty: selectedDifficulty.toLowerCase(),
            responseLength: 'detailed',
            subjects: [subject]
          },
          conversationContext: []
        }
      });
      
      if (error) {
        console.error('AI function error:', error);
        throw error;
      }
      
      return data?.response || generateFallbackPlan();
    } catch (error) {
      console.error('Error generating AI study plan:', error);
      return generateFallbackPlan();
    }
  };

  const generateFallbackPlan = () => {
    return `# ${subject} Study Plan (${duration} days)

## Week 1: Foundation Building
**Days 1-7: Core Concepts**
- **Daily Goal**: 45-60 minutes of focused study during ${timePreference}
- Review fundamental concepts and terminology
- Create comprehensive notes and summaries
- Complete basic practice exercises
- **Checkpoint**: Self-assessment quiz on Day 7

## Week 2: Application & Practice
**Days 8-14: Skill Development**
- Work on intermediate-level problems
- Apply concepts in practical scenarios
- Group study or discussion sessions
- Create mind maps connecting key ideas
- **Final Review**: Comprehensive practice test

## Daily Schedule (${timePreference}):
- **25 minutes**: Focused study session
- **5 minutes**: Short break
- **25 minutes**: Practice/application
- **5 minutes**: Review and note-taking

## Study Techniques:
- Active recall and spaced repetition
- Teach concepts to others or explain aloud
- Use visual aids and diagrams
- Regular self-testing

## Success Indicators:
- Daily completion of study goals
- Improved confidence in core concepts
- Ability to solve problems independently
- Ready for assessment by Day ${duration}`;
  };

  const handleCreatePlan = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to create a study plan",
        variant: "destructive"
      });
      return;
    }
    
    if (!subject.trim()) {
      toast({
        title: "Subject required",
        description: "Please enter a subject for your study plan",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Generate AI study plan
      const aiPlan = await generateAIStudyPlan();
      setGeneratedPlan(aiPlan);
      setShowGeneratedPlan(true);
      
      // Save the study plan to Supabase with the ai_generated_plan column
      const { data, error } = await supabase
        .from('study_plans')
        .insert({
          user_id: user.id,
          title: `${subject} Study Plan`,
          description: goals || `AI-generated study plan for ${subject}`,
          subject: subject,
          difficulty: selectedDifficulty,
          duration_days: parseInt(duration),
          ai_generated_plan: aiPlan
        })
        .select();
      
      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      setShowSuccess(true);
      
      toast({
        title: "Study Plan Created Successfully!",
        description: `Your personalized ${subject} study plan has been generated and saved.`,
        variant: "default",
      });
      
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
      toast({
        title: "Study plan created with limited features",
        description: "Your plan was generated but some AI features may be limited",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudyPlans = async () => {
    if (!user) return;
    
    setLoadingPlans(true);
    try {
      const { data, error } = await supabase
        .from('study_plans')
        .select('id, title, description, subject, difficulty, duration_days, created_at, user_id, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setAllStudyPlans(data);
        setShowPlans(true);
      }
    } catch (error) {
      console.error('Error fetching all study plans:', error);
      toast({
        title: "Failed to load study plans",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoadingPlans(false);
    }
  };

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
          <Brain className="mr-2 h-5 w-5 text-primary" />
          AI Study Plan Generator
        </CardTitle>
        <CardDescription>
          Get a personalized, AI-generated study plan tailored to your goals and schedule
        </CardDescription>
      </CardHeader>
      
      {showSuccess && (
        <div className="px-6 pb-3">
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-600 dark:text-green-400">Study Plan Generated Successfully!</AlertTitle>
            <AlertDescription className="text-green-600/80 dark:text-green-400/80">
              Your personalized study plan has been created and saved to your account.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium" htmlFor="subject">Subject</label>
          <Input 
            id="subject" 
            placeholder="E.g., Calculus, World History, Spanish, Chemistry" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium" htmlFor="goals">Your learning goals</label>
          <Textarea 
            id="goals" 
            placeholder="What do you want to achieve? E.g., Pass the final exam, understand derivatives, improve conversational skills"
            className="min-h-[80px]"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              Preferred study time
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
              Study duration
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
                className="flex-1"
                onClick={() => setSelectedDifficulty(level)}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        {showGeneratedPlan && generatedPlan && (
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Brain className="mr-1 h-4 w-4" />
              Your AI-Generated Study Plan
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 max-h-80 overflow-y-auto">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{generatedPlan}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
        
        {recentPlans.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Recent Study Plans</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchAllStudyPlans}
                disabled={loadingPlans}
              >
                <FileText className="mr-1 h-4 w-4" />
                View All
              </Button>
            </div>
            <div className="space-y-2">
              {recentPlans.map((plan) => (
                <div 
                  key={plan.id} 
                  className="p-3 border rounded-lg text-sm hover:bg-muted/50 transition-colors"
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
        
        {showPlans && allStudyPlans.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-medium">All Study Plans</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPlans(false)}
              >
                Hide
              </Button>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allStudyPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>{plan.subject}</TableCell>
                      <TableCell>{plan.difficulty}</TableCell>
                      <TableCell>{plan.duration_days} days</TableCell>
                      <TableCell>{formatDate(plan.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
              Generating Study Plan...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Generate AI Study Plan
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StudyPlanCreator;
