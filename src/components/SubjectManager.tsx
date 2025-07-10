
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, BookOpen } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Subject {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

const SubjectManager: React.FC = () => {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isAddingSubject, setIsAddingSubject] = useState(false);

  const subjectColors = [
    'bg-blue-100 text-blue-800 border-blue-300',
    'bg-green-100 text-green-800 border-green-300',
    'bg-purple-100 text-purple-800 border-purple-300',
    'bg-orange-100 text-orange-800 border-orange-300',
    'bg-pink-100 text-pink-800 border-pink-300',
    'bg-teal-100 text-teal-800 border-teal-300',
    'bg-indigo-100 text-indigo-800 border-indigo-300',
    'bg-yellow-100 text-yellow-800 border-yellow-300',
  ];

  // Load subjects from localStorage on component mount
  useEffect(() => {
    const savedSubjects = localStorage.getItem('studySubjects');
    if (savedSubjects) {
      try {
        const parsedSubjects = JSON.parse(savedSubjects);
        setSubjects(parsedSubjects);
      } catch (error) {
        console.error('Error parsing saved subjects:', error);
        // Initialize with default subjects if parsing fails
        const defaultSubjects: Subject[] = [
          { id: '1', name: 'Mathematics', color: subjectColors[0], createdAt: new Date().toISOString() },
          { id: '2', name: 'Science', color: subjectColors[1], createdAt: new Date().toISOString() },
          { id: '3', name: 'Literature', color: subjectColors[2], createdAt: new Date().toISOString() },
        ];
        setSubjects(defaultSubjects);
      }
    } else {
      // Initialize with default subjects
      const defaultSubjects: Subject[] = [
        { id: '1', name: 'Mathematics', color: subjectColors[0], createdAt: new Date().toISOString() },
        { id: '2', name: 'Science', color: subjectColors[1], createdAt: new Date().toISOString() },
        { id: '3', name: 'Literature', color: subjectColors[2], createdAt: new Date().toISOString() },
      ];
      setSubjects(defaultSubjects);
    }
  }, []);

  // Save subjects to localStorage whenever subjects change
  useEffect(() => {
    if (subjects.length > 0) {
      localStorage.setItem('studySubjects', JSON.stringify(subjects));
    }
  }, [subjects]);

  const addSubject = () => {
    if (!newSubjectName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subject name",
        variant: "destructive",
      });
      return;
    }

    // Check if subject already exists
    if (subjects.some(subject => subject.name.toLowerCase() === newSubjectName.toLowerCase())) {
      toast({
        title: "Error",
        description: "This subject already exists",
        variant: "destructive",
      });
      return;
    }

    const newSubject: Subject = {
      id: Math.random().toString(36).substring(2, 9),
      name: newSubjectName.trim(),
      color: subjectColors[subjects.length % subjectColors.length],
      createdAt: new Date().toISOString(),
    };

    setSubjects(prev => [...prev, newSubject]);
    setNewSubjectName('');
    setIsAddingSubject(false);

    toast({
      title: "Subject added",
      description: `${newSubject.name} has been added to your subjects`,
    });
  };

  const removeSubject = (subjectId: string) => {
    const subjectToRemove = subjects.find(s => s.id === subjectId);
    setSubjects(prev => prev.filter(subject => subject.id !== subjectId));
    
    if (subjectToRemove) {
      toast({
        title: "Subject removed",
        description: `${subjectToRemove.name} has been removed from your subjects`,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addSubject();
    } else if (e.key === 'Escape') {
      setIsAddingSubject(false);
      setNewSubjectName('');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            My Subjects
          </CardTitle>
          <Button 
            size="sm" 
            onClick={() => setIsAddingSubject(true)}
            disabled={isAddingSubject}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Subject
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add Subject Form */}
          {isAddingSubject && (
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter subject name..."
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1"
                  autoFocus
                />
                <Button onClick={addSubject} size="sm">
                  Add
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsAddingSubject(false);
                    setNewSubjectName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="group relative flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <Badge variant="secondary" className={`${subject.color} flex-1 justify-center py-2`}>
                  {subject.name}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={() => removeSubject(subject.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          {subjects.length === 0 && !isAddingSubject && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No subjects added yet</p>
              <p className="text-xs">Click "Add Subject" to get started</p>
            </div>
          )}

          {subjects.length > 0 && (
            <div className="text-center text-xs text-muted-foreground mt-4">
              {subjects.length} subject{subjects.length !== 1 ? 's' : ''} added
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectManager;
