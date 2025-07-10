
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, X, BookOpen } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Exam {
  id: string;
  subject: string;
  date: string;
  daysLeft: number;
  readiness: number;
}

const UpcomingExams: React.FC = () => {
  const { toast } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [newExam, setNewExam] = useState({
    subject: '',
    date: '',
    readiness: 0
  });

  // Load exams from localStorage on component mount
  useEffect(() => {
    const savedExams = localStorage.getItem('upcomingExams');
    if (savedExams) {
      try {
        const parsedExams = JSON.parse(savedExams);
        setExams(parsedExams);
      } catch (error) {
        console.error('Error parsing saved exams:', error);
      }
    }
  }, []);

  // Save exams to localStorage whenever exams change
  useEffect(() => {
    if (exams.length >= 0) {
      localStorage.setItem('upcomingExams', JSON.stringify(exams));
    }
  }, [exams]);

  const calculateDaysLeft = (dateString: string): number => {
    const examDate = new Date(dateString);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const addExam = () => {
    if (!newExam.subject.trim() || !newExam.date) {
      toast({
        title: "Error",
        description: "Please fill in subject and date",
        variant: "destructive",
      });
      return;
    }

    const examDate = new Date(newExam.date);
    const today = new Date();
    
    if (examDate <= today) {
      toast({
        title: "Error",
        description: "Exam date must be in the future",
        variant: "destructive",
      });
      return;
    }

    const exam: Exam = {
      id: Math.random().toString(36).substring(2, 9),
      subject: newExam.subject.trim(),
      date: examDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      daysLeft: calculateDaysLeft(newExam.date),
      readiness: newExam.readiness
    };

    setExams(prev => [...prev, exam]);
    setNewExam({ subject: '', date: '', readiness: 0 });
    setIsAddingExam(false);

    toast({
      title: "Exam added",
      description: `${exam.subject} exam has been added`,
    });
  };

  const removeExam = (examId: string) => {
    const examToRemove = exams.find(e => e.id === examId);
    setExams(prev => prev.filter(exam => exam.id !== examId));
    
    if (examToRemove) {
      toast({
        title: "Exam removed",
        description: `${examToRemove.subject} exam has been removed`,
      });
    }
  };

  const updateReadiness = (examId: string, readiness: number) => {
    setExams(prev => prev.map(exam => 
      exam.id === examId ? { ...exam, readiness } : exam
    ));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addExam();
    } else if (e.key === 'Escape') {
      setIsAddingExam(false);
      setNewExam({ subject: '', date: '', readiness: 0 });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Upcoming Exams</CardTitle>
          <Button 
            size="sm" 
            onClick={() => setIsAddingExam(true)}
            disabled={isAddingExam}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Exam
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add Exam Form */}
          {isAddingExam && (
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="space-y-3">
                <Input
                  placeholder="Subject name..."
                  value={newExam.subject}
                  onChange={(e) => setNewExam(prev => ({ ...prev, subject: e.target.value }))}
                  onKeyDown={handleKeyPress}
                  autoFocus
                />
                <Input
                  type="date"
                  value={newExam.date}
                  onChange={(e) => setNewExam(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Readiness:</label>
                  <Select
                    value={newExam.readiness.toString()}
                    onValueChange={(value) => setNewExam(prev => ({ ...prev, readiness: parseInt(value) }))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(value => (
                        <SelectItem key={value} value={value.toString()}>
                          {value}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addExam} size="sm">
                    Add Exam
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setIsAddingExam(false);
                      setNewExam({ subject: '', date: '', readiness: 0 });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Exams List */}
          {exams.map((exam) => (
            <div key={exam.id} className="border rounded-lg p-4 group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold">{exam.subject}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {exam.date} ({exam.daysLeft} days left)
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getReadinessColor(exam.readiness)}`}>
                    {exam.readiness}% Ready
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => removeExam(exam.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Progress value={exam.readiness} className="h-2" />
                <div className="flex items-center space-x-2">
                  <label className="text-xs text-muted-foreground">Update readiness:</label>
                  <Select
                    value={exam.readiness.toString()}
                    onValueChange={(value) => updateReadiness(exam.id, parseInt(value))}
                  >
                    <SelectTrigger className="w-20 h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(value => (
                        <SelectItem key={value} value={value.toString()}>
                          {value}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          {exams.length === 0 && !isAddingExam && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No upcoming exams</p>
              <p className="text-xs">Click "Add Exam" to get started</p>
            </div>
          )}

          {exams.length > 0 && (
            <div className="text-center text-xs text-muted-foreground mt-4">
              {exams.length} exam{exams.length !== 1 ? 's' : ''} scheduled
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get color based on readiness percentage
function getReadinessColor(readiness: number): string {
  if (readiness < 50) {
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  } else if (readiness < 75) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  } else {
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  }
}

export default UpcomingExams;
