
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { BookText, Sparkles, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

const QuizGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Sample quiz questions by topic
  const sampleQuizzes: Record<string, QuizQuestion[]> = {
    "mathematics": [
      {
        id: "math1",
        question: "What is the value of π (pi) to two decimal places?",
        options: ["3.14", "3.15", "3.12", "3.17"],
        correctAnswer: 0
      },
      {
        id: "math2",
        question: "What is the square root of 144?",
        options: ["14", "12", "10", "16"],
        correctAnswer: 1
      },
      {
        id: "math3",
        question: "If y = 3x + 7 and x = 2, what is the value of y?",
        options: ["11", "13", "17", "10"],
        correctAnswer: 2
      },
      {
        id: "math4",
        question: "What is the area of a circle with radius 5?",
        options: ["25π", "10π", "5π", "15π"],
        correctAnswer: 0
      },
      {
        id: "math5",
        question: "If a triangle has angles of 30° and 60°, what is the third angle?",
        options: ["90°", "60°", "45°", "30°"],
        correctAnswer: 0
      }
    ],
    "science": [
      {
        id: "sci1",
        question: "Which element has the chemical symbol 'O'?",
        options: ["Gold", "Oxygen", "Osmium", "Oganesson"],
        correctAnswer: 1
      },
      {
        id: "sci2",
        question: "What is the speed of light in a vacuum?",
        options: ["300,000 m/s", "300,000 km/s", "3,000,000 m/s", "3,000,000 km/s"],
        correctAnswer: 1
      },
      {
        id: "sci3",
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Jupiter", "Mars", "Mercury"],
        correctAnswer: 2
      },
      {
        id: "sci4",
        question: "What is the chemical formula for water?",
        options: ["H2O", "CO2", "O2", "H2O2"],
        correctAnswer: 0
      },
      {
        id: "sci5",
        question: "What is the largest organ in the human body?",
        options: ["Brain", "Liver", "Heart", "Skin"],
        correctAnswer: 3
      }
    ],
    "history": [
      {
        id: "hist1",
        question: "In which year did World War II end?",
        options: ["1945", "1939", "1918", "1950"],
        correctAnswer: 0
      },
      {
        id: "hist2",
        question: "Who was the first president of the United States?",
        options: ["Thomas Jefferson", "John Adams", "George Washington", "Abraham Lincoln"],
        correctAnswer: 2
      },
      {
        id: "hist3",
        question: "Which ancient civilization built the pyramids?",
        options: ["Greeks", "Romans", "Mayans", "Egyptians"],
        correctAnswer: 3
      },
      {
        id: "hist4",
        question: "The Renaissance period began in which country?",
        options: ["France", "Italy", "England", "Spain"],
        correctAnswer: 1
      },
      {
        id: "hist5",
        question: "Who wrote the Declaration of Independence?",
        options: ["George Washington", "Benjamin Franklin", "Thomas Jefferson", "John Adams"],
        correctAnswer: 2
      }
    ],
    "literature": [
      {
        id: "lit1",
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["Charles Dickens", "Jane Austen", "William Shakespeare", "Mark Twain"],
        correctAnswer: 2
      },
      {
        id: "lit2",
        question: "Which novel begins with the line 'It was the best of times, it was the worst of times'?",
        options: ["Pride and Prejudice", "Great Expectations", "A Tale of Two Cities", "Moby Dick"],
        correctAnswer: 2
      },
      {
        id: "lit3",
        question: "Who wrote 'To Kill a Mockingbird'?",
        options: ["Harper Lee", "J.D. Salinger", "F. Scott Fitzgerald", "Ernest Hemingway"],
        correctAnswer: 0
      },
      {
        id: "lit4",
        question: "Which of these is NOT one of the Harry Potter books?",
        options: ["The Chamber of Secrets", "The Half-Blood Prince", "The Deathly Hallows", "The Golden Compass"],
        correctAnswer: 3
      },
      {
        id: "lit5",
        question: "Who created the character Sherlock Holmes?",
        options: ["Agatha Christie", "Arthur Conan Doyle", "Edgar Allan Poe", "H.G. Wells"],
        correctAnswer: 1
      }
    ]
  };

  const generateQuiz = () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic", {
        description: "A topic is required to generate quiz questions"
      });
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Check if we have a sample quiz for this topic
      let lowerTopic = topic.toLowerCase();
      let quizQuestions: QuizQuestion[] = [];
      
      if (lowerTopic.includes("math")) {
        quizQuestions = sampleQuizzes.mathematics;
      } else if (lowerTopic.includes("sci")) {
        quizQuestions = sampleQuizzes.science;
      } else if (lowerTopic.includes("hist")) {
        quizQuestions = sampleQuizzes.history;
      } else if (lowerTopic.includes("lit") || lowerTopic.includes("book") || lowerTopic.includes("novel")) {
        quizQuestions = sampleQuizzes.literature;
      } else {
        // Default to random questions from all topics
        const allTopics = Object.keys(sampleQuizzes);
        const randomQuestions: QuizQuestion[] = [];
        
        for (let i = 0; i < Math.min(questionCount, 5); i++) {
          const randomTopic = allTopics[Math.floor(Math.random() * allTopics.length)];
          const topicQuestions = sampleQuizzes[randomTopic];
          randomQuestions.push(topicQuestions[i % topicQuestions.length]);
        }
        
        quizQuestions = randomQuestions;
      }
      
      // Adjust for the requested number of questions
      quizQuestions = quizQuestions.slice(0, Math.min(questionCount, quizQuestions.length));
      
      setQuestions(quizQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setQuizSubmitted(false);
      setIsGenerating(false);
      
      toast.success("Quiz generated", {
        description: `${quizQuestions.length} questions on ${topic}`
      });
    }, 2000);
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    
    questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    const percentage = Math.round((correctCount / questions.length) * 100);
    setScore(percentage);
    setQuizSubmitted(true);
    
    toast.success("Quiz submitted", {
      description: `Your score: ${percentage}%`
    });
  };

  const startNewQuiz = () => {
    setQuestions([]);
    setTopic('');
    setQuizSubmitted(false);
    setSelectedAnswers({});
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isQuizComplete = Object.keys(selectedAnswers).length === questions.length;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <BookText className="h-5 w-5 text-primary" />
          AI Quiz Generator
        </CardTitle>
        <CardDescription>
          Generate customized quizzes on any topic to test your knowledge
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {questions.length === 0 ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Topic</label>
              <Input 
                placeholder="Enter a subject (e.g., Mathematics, History, Science)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Difficulty Level</label>
              <div className="flex space-x-4 mt-1">
                <Button 
                  variant={difficulty === 'easy' ? "default" : "outline"} 
                  onClick={() => setDifficulty('easy')}
                  size="sm"
                >
                  Easy
                </Button>
                <Button 
                  variant={difficulty === 'medium' ? "default" : "outline"} 
                  onClick={() => setDifficulty('medium')}
                  size="sm"
                >
                  Medium
                </Button>
                <Button 
                  variant={difficulty === 'hard' ? "default" : "outline"} 
                  onClick={() => setDifficulty('hard')}
                  size="sm"
                >
                  Hard
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Number of Questions</label>
              <div className="flex space-x-4 mt-1">
                <Button 
                  variant={questionCount === 5 ? "default" : "outline"} 
                  onClick={() => setQuestionCount(5)}
                  size="sm"
                >
                  5
                </Button>
                <Button 
                  variant={questionCount === 10 ? "default" : "outline"} 
                  onClick={() => setQuestionCount(10)}
                  size="sm"
                >
                  10
                </Button>
                <Button 
                  variant={questionCount === 15 ? "default" : "outline"} 
                  onClick={() => setQuestionCount(15)}
                  size="sm"
                >
                  15
                </Button>
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                className="w-full" 
                onClick={generateQuiz} 
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Quiz
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : quizSubmitted ? (
          <div className="space-y-6">
            <div className="text-center py-4">
              <h3 className="text-2xl font-bold">Quiz Results</h3>
              <p className="text-muted-foreground">Topic: {topic}</p>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-full max-w-xs">
                <Progress value={score} className="h-4" />
              </div>
              <p className="text-xl font-bold">{score}%</p>
              
              {score >= 80 ? (
                <p className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" /> Excellent work!
                </p>
              ) : score >= 60 ? (
                <p className="text-amber-600">Good effort!</p>
              ) : (
                <p className="text-red-600 flex items-center gap-1">
                  <XCircle className="h-4 w-4" /> Keep practicing!
                </p>
              )}
            </div>
            
            <Separator />
            
            <div className="space-y-6">
              <h4 className="font-medium">Review Questions</h4>
              
              {questions.map((q, index) => (
                <div key={q.id} className="border rounded-md p-4">
                  <p className="font-medium">{index + 1}. {q.question}</p>
                  <div className="mt-2 space-y-2">
                    {q.options.map((option, i) => (
                      <div 
                        key={i} 
                        className={`p-2 rounded ${
                          selectedAnswers[q.id] === i && q.correctAnswer === i
                            ? 'bg-green-100 border border-green-500'
                            : selectedAnswers[q.id] === i && q.correctAnswer !== i
                              ? 'bg-red-100 border border-red-500'
                              : q.correctAnswer === i
                                ? 'bg-green-50 border border-green-500'
                                : 'bg-slate-50'
                        }`}
                      >
                        {option}
                        {selectedAnswers[q.id] === i && q.correctAnswer === i && (
                          <CheckCircle className="h-4 w-4 inline ml-2 text-green-600" />
                        )}
                        {selectedAnswers[q.id] === i && q.correctAnswer !== i && (
                          <XCircle className="h-4 w-4 inline ml-2 text-red-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span className="text-sm">{topic} · {difficulty}</span>
            </div>
            
            <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="h-2" />
            
            <div className="py-4">
              <h3 className="text-xl font-medium mb-4">{currentQuestion.question}</h3>
              
              <RadioGroup 
                value={selectedAnswers[currentQuestion.id]?.toString()} 
                onValueChange={(value) => handleAnswerSelect(currentQuestion.id, parseInt(value))}
                className="space-y-3"
              >
                {currentQuestion.options.map((option, i) => (
                  <div key={i} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-slate-50">
                    <RadioGroupItem value={i.toString()} id={`option-${i}`} />
                    <Label htmlFor={`option-${i}`} className="flex-grow cursor-pointer">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {questions.length > 0 && !quizSubmitted ? (
          <>
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            {isLastQuestion ? (
              <Button 
                onClick={handleSubmitQuiz}
                disabled={!isQuizComplete}
              >
                Submit Quiz
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={!selectedAnswers[currentQuestion.id] && selectedAnswers[currentQuestion.id] !== 0}
              >
                Next
              </Button>
            )}
          </>
        ) : quizSubmitted ? (
          <Button onClick={startNewQuiz} className="w-full">
            Create New Quiz
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
};

export default QuizGenerator;
