
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Brain, Clock, CheckCircle, XCircle, RefreshCw, Trophy, Target, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
}

interface QuizResult {
  score: number;
  total: number;
  timeSpent: number;
  subject: string;
}

const QuizGenerator: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [questionCount, setQuestionCount] = useState('5');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (quizStarted && !showResults && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleQuizComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, showResults, timeRemaining]);

  const generateQuestions = async () => {
    if (!subject.trim()) {
      toast({
        title: "Subject required",
        description: "Please enter a subject for the quiz",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Generate unique questions using AI
      const timestamp = Date.now();
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          query: `Generate exactly ${questionCount} unique multiple-choice questions about ${subject} at ${difficulty} level. 
          
          Important: Make these questions different from any previous quiz by including this unique identifier: ${timestamp}
          
          Format each question as:
          Q1: [Question text]
          A) [Option 1]
          B) [Option 2] 
          C) [Option 3]
          D) [Option 4]
          Correct: [Letter]
          Explanation: [Brief explanation of the correct answer]
          
          Make sure questions test practical understanding, not just memorization. Include varied question types: conceptual, application-based, and analytical.`,
          userPreferences: {
            learningStyle: 'reading/writing',
            difficulty: difficulty,
            responseLength: 'detailed',
            subjects: [subject]
          },
          conversationContext: []
        }
      });

      if (error) throw error;

      const response = data?.response || '';
      const parsedQuestions = parseQuestions(response);
      
      if (parsedQuestions.length === 0) {
        // Fallback questions if AI parsing fails
        const fallbackQuestions = generateFallbackQuestions(subject, parseInt(questionCount));
        setQuestions(fallbackQuestions);
      } else {
        setQuestions(parsedQuestions);
      }
      
      setSelectedAnswers(new Array(parsedQuestions.length).fill(-1));
      setQuizStarted(true);
      setStartTime(new Date());
      setCurrentQuestion(0);
      setShowResults(false);
      setShowExplanation(false);
      
      // Set timer (2 minutes per question)
      setTimeRemaining(parseInt(questionCount) * 120);
      
      toast({
        title: "Quiz Generated!",
        description: `${parsedQuestions.length} unique questions ready for ${subject}`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error generating quiz:', error);
      
      // Generate fallback questions
      const fallbackQuestions = generateFallbackQuestions(subject, parseInt(questionCount));
      setQuestions(fallbackQuestions);
      setSelectedAnswers(new Array(fallbackQuestions.length).fill(-1));
      setQuizStarted(true);
      setStartTime(new Date());
      setCurrentQuestion(0);
      setShowResults(false);
      
      setTimeRemaining(parseInt(questionCount) * 120);
      
      toast({
        title: "Quiz Generated",
        description: "Generated quiz with standard questions",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const parseQuestions = (response: string): Question[] => {
    const questionBlocks = response.split(/Q\d+:/).filter(block => block.trim());
    const parsedQuestions: Question[] = [];

    questionBlocks.forEach((block, index) => {
      try {
        const lines = block.trim().split('\n').filter(line => line.trim());
        if (lines.length < 6) return;

        const questionText = lines[0].trim();
        const options: string[] = [];
        let correctAnswer = 0;
        let explanation = '';

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.match(/^[A-D]\)/)) {
            options.push(line.substring(2).trim());
          } else if (line.startsWith('Correct:')) {
            const correctLetter = line.substring(8).trim().toUpperCase();
            correctAnswer = correctLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
          } else if (line.startsWith('Explanation:')) {
            explanation = line.substring(12).trim();
          }
        }

        if (questionText && options.length === 4 && explanation) {
          parsedQuestions.push({
            id: index + 1,
            question: questionText,
            options,
            correctAnswer,
            explanation,
            difficulty
          });
        }
      } catch (error) {
        console.error('Error parsing question:', error);
      }
    });

    return parsedQuestions;
  };

  const generateFallbackQuestions = (subject: string, count: number): Question[] => {
    const baseQuestions = [
      {
        question: `What is a fundamental concept in ${subject}?`,
        options: ["Basic principle", "Advanced theory", "Complex application", "Historical context"],
        correctAnswer: 0,
        explanation: "Understanding basic principles is essential for mastering any subject."
      },
      {
        question: `How would you apply ${subject} knowledge in practice?`,
        options: ["Through memorization", "Through practical application", "Through theory only", "Through passive reading"],
        correctAnswer: 1,
        explanation: "Practical application helps reinforce theoretical knowledge."
      },
      {
        question: `What is the best approach to study ${subject}?`,
        options: ["Random topics", "Structured learning", "Only advanced topics", "Skip fundamentals"],
        correctAnswer: 1,
        explanation: "Structured learning provides a solid foundation for understanding."
      },
      {
        question: `Why is ${subject} important in today's world?`,
        options: ["It's not important", "Has practical applications", "Only for academics", "Historical interest only"],
        correctAnswer: 1,
        explanation: "Most subjects have practical applications that benefit society."
      },
      {
        question: `What skill does studying ${subject} develop?`,
        options: ["Memory only", "Critical thinking", "Basic reading", "Simple recall"],
        correctAnswer: 1,
        explanation: "Studying any subject develops critical thinking and analytical skills."
      }
    ];

    return baseQuestions.slice(0, count).map((q, index) => ({
      id: index + 1,
      ...q,
      difficulty
    }));
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      handleQuizComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowExplanation(false);
    }
  };

  const handleQuizComplete = () => {
    if (!startTime) return;

    const endTime = new Date();
    const timeSpent = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
    const score = selectedAnswers.reduce((total, answer, index) => {
      return total + (answer === questions[index]?.correctAnswer ? 1 : 0);
    }, 0);

    const result: QuizResult = {
      score,
      total: questions.length,
      timeSpent,
      subject
    };

    setQuizResults(result);
    setShowResults(true);
    setQuizStarted(false);

    toast({
      title: "Quiz Completed!",
      description: `You scored ${score}/${questions.length} (${Math.round((score / questions.length) * 100)}%)`,
      variant: "default",
    });
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setQuizStarted(false);
    setStartTime(null);
    setQuizResults(null);
    setTimeRemaining(0);
    setShowExplanation(false);
    setSubject('');
    setDifficulty('intermediate');
    setQuestionCount('5');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults && quizResults) {
    const percentage = Math.round((quizResults.score / quizResults.total) * 100);
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center">
            <Trophy className="mr-2 h-6 w-6 text-yellow-500" />
            Quiz Results
          </CardTitle>
          <CardDescription>
            {subject} - {difficulty} level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-primary">
              {quizResults.score}/{quizResults.total}
            </div>
            <Progress value={percentage} className="w-full" />
            <div className="text-lg">
              {percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good job!" : "Keep practicing!"}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-muted rounded-lg p-3">
                <div className="font-medium">Score</div>
                <div className="text-2xl font-bold">{percentage}%</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="font-medium">Time</div>
                <div className="text-2xl font-bold">{formatTime(quizResults.timeSpent)}</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium">Review Your Answers:</h3>
            {questions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-3">
                <div className="flex items-start gap-2">
                  {selectedAnswers[index] === question.correctAnswer ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{question.question}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Your answer: {question.options[selectedAnswers[index]] || 'Not answered'}
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      Correct: {question.options[question.correctAnswer]}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {question.explanation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={resetQuiz} className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" />
            Take New Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (quizStarted && questions.length > 0) {
    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">
                Question {currentQuestion + 1} of {questions.length}
              </CardTitle>
              <CardDescription>{subject} - {difficulty}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <Badge variant={timeRemaining < 60 ? "destructive" : "default"}>
                {formatTime(timeRemaining)}
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-lg font-medium">{currentQ.question}</div>
          
          <div className="space-y-2">
            {currentQ.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswers[currentQuestion] === index ? "default" : "outline"}
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => handleAnswerSelect(index)}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + index)})</span>
                {option}
              </Button>
            ))}
          </div>

          {showExplanation && selectedAnswers[currentQuestion] !== -1 && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {selectedAnswers[currentQuestion] === currentQ.correctAnswer ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  {selectedAnswers[currentQuestion] === currentQ.correctAnswer ? "Correct!" : "Incorrect"}
                </span>
              </div>
              <div className="text-sm">{currentQ.explanation}</div>
              {selectedAnswers[currentQuestion] !== currentQ.correctAnswer && (
                <div className="text-sm mt-2 text-green-600">
                  Correct answer: {String.fromCharCode(65 + currentQ.correctAnswer)}) {currentQ.options[currentQ.correctAnswer]}
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {selectedAnswers[currentQuestion] !== -1 && !showExplanation && (
              <Button 
                variant="secondary"
                onClick={() => setShowExplanation(true)}
              >
                Show Answer
              </Button>
            )}
            
            <Button 
              onClick={currentQuestion === questions.length - 1 ? handleQuizComplete : handleNext}
              disabled={selectedAnswers[currentQuestion] === -1}
            >
              {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <Target className="mr-2 h-5 w-5 text-primary" />
          AI Quiz Generator
        </CardTitle>
        <CardDescription>
          Generate personalized quizzes with unique questions every time
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium" htmlFor="quiz-subject">Subject</label>
          <Input 
            id="quiz-subject"
            placeholder="E.g., Mathematics, History, Biology, Programming" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Difficulty Level</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Number of Questions</label>
            <Select value={questionCount} onValueChange={setQuestionCount}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Questions</SelectItem>
                <SelectItem value="5">5 Questions</SelectItem>
                <SelectItem value="10">10 Questions</SelectItem>
                <SelectItem value="15">15 Questions</SelectItem>
                <SelectItem value="20">20 Questions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full"
          onClick={generateQuestions}
          disabled={loading || !subject.trim()}
        >
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating Unique Quiz...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Generate New Quiz
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizGenerator;
