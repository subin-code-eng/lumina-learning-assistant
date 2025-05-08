
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, SendIcon, Sparkles, User, RefreshCw, Download, Lightbulb, Heart, BookOpen, GraduationCap, Edit } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Types for chat messages
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'followUp' | 'feedback' | 'standard';
}

// User preference type
interface UserPreference {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading/writing';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  responseLength: 'concise' | 'detailed';
  subjects: string[];
}

const AITutor: React.FC = () => {
  // State for messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI study partner. How can I help with your studies today? I can explain difficult concepts, help you prepare for exams, or answer specific questions about your courses.",
      sender: 'ai',
      timestamp: new Date(),
      type: 'standard'
    }
  ]);
  
  // User input states
  const [input, setInput] = useState('');
  const [longQuery, setLongQuery] = useState('');
  const [showLongForm, setShowLongForm] = useState(false);
  
  // UI states
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showTutorPreferences, setShowTutorPreferences] = useState(false);
  
  // User learning preferences
  const [userPreferences, setUserPreferences] = useState<UserPreference>({
    learningStyle: 'visual',
    difficulty: 'intermediate',
    responseLength: 'detailed',
    subjects: ['Mathematics', 'Science', 'History']
  });
  
  // Conversation context tracking
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  
  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Track conversation topics for personalization
  useEffect(() => {
    if (messages.length > 1) {
      const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
      if (lastUserMessage) {
        // Extract topics from user message
        const userText = lastUserMessage.text.toLowerCase();
        
        // Simple topic detection
        if (userText.includes('math') || userText.includes('equation') || userText.includes('calculus')) {
          setCurrentTopic('mathematics');
        } else if (userText.includes('history') || userText.includes('war') || userText.includes('century')) {
          setCurrentTopic('history');
        } else if (userText.includes('science') || userText.includes('biology') || userText.includes('physics')) {
          setCurrentTopic('science');
        }
        
        // Update conversation context
        setConversationContext(prev => [...prev, lastUserMessage.text]);
      }
    }
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus on input when not typing
  useEffect(() => {
    if (!isTyping && !showLongForm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTyping, showLongForm]);

  // Suggested prompts based on learning style and preferences
  const generateSuggestedPrompts = () => {
    const basePrompts = [
      "Can you explain how photosynthesis works?",
      "Help me understand quadratic equations",
      "What are the key events of World War II?",
      "How should I prepare for my history exam?",
      "Create a study plan for learning calculus"
    ];
    
    // Add personalized prompts based on user preferences
    if (userPreferences.subjects.includes('Mathematics')) {
      basePrompts.push("What's the best way to memorize mathematical formulas?");
    }
    
    if (userPreferences.learningStyle === 'visual') {
      basePrompts.push("Can you describe concepts with visual analogies?");
    }
    
    return basePrompts;
  };

  const handleSend = (customInput?: string) => {
    const messageText = customInput || input;
    if (!messageText.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      type: 'standard'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setIsThinking(true);
    
    // Clear long form if it was used
    if (customInput) {
      setLongQuery('');
      setShowLongForm(false);
    }
    
    // Generate follow-up questions based on user input for later use
    generateFollowUpQuestions(messageText);
    
    // Simulate AI thinking time (shorter for better experience)
    setTimeout(() => {
      setIsThinking(false);
      
      // Start "typing" the response word by word
      simulateTypingResponse(generateAdaptiveResponse(messageText));
    }, 700 + Math.random() * 800); // Random thinking time between 0.7-1.5s
  };

  const simulateTypingResponse = (fullResponse: string) => {
    const words = fullResponse.split(' ');
    let currentResponse = '';
    let wordIndex = 0;
    
    // Temporary message for typing effect
    const typingMessageId = Date.now().toString();
    const typingMessage: Message = {
      id: typingMessageId,
      text: '',
      sender: 'ai',
      timestamp: new Date(),
      type: 'standard'
    };
    
    setMessages(prev => [...prev, typingMessage]);
    
    // Simulate typing one word at a time (faster than before for better UX)
    const typingInterval = setInterval(() => {
      if (wordIndex < words.length) {
        currentResponse += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
        wordIndex++;
        
        // Update the message with what's "typed" so far
        setMessages(prev => 
          prev.map(msg => 
            msg.id === typingMessageId 
              ? { ...msg, text: currentResponse } 
              : msg
          )
        );
      } else {
        // Typing complete
        clearInterval(typingInterval);
        setIsTyping(false);
        
        // After a short delay, add follow-up questions if appropriate
        if (Math.random() > 0.4) { // 60% chance of follow-up
          setTimeout(() => {
            addFollowUpMessage();
          }, 1000);
        }
      }
    }, 25); // Speed of typing (faster than before)
  };

  const addFollowUpMessage = () => {
    if (followUpQuestions.length > 0) {
      // Choose a random follow-up
      const randomIndex = Math.floor(Math.random() * followUpQuestions.length);
      const followUp = followUpQuestions[randomIndex];
      
      // Add as a follow-up message
      const followUpMessage: Message = {
        id: 'followup-' + Date.now().toString(),
        text: followUp,
        sender: 'ai',
        timestamp: new Date(),
        type: 'followUp'
      };
      
      setMessages(prev => [...prev, followUpMessage]);
      
      // Remove the used question
      setFollowUpQuestions(prev => prev.filter((_, i) => i !== randomIndex));
    }
  };

  const generateFollowUpQuestions = (userQuery: string) => {
    const lowercaseQuery = userQuery.toLowerCase();
    let questions: string[] = [];
    
    // Generate contextual follow-up questions
    if (lowercaseQuery.includes('study') && lowercaseQuery.includes('plan')) {
      questions = [
        "Would you like me to help you create a personalized study schedule?",
        "Do you prefer to study in short sessions or longer blocks of time?",
        "Is there a specific exam or subject you're preparing for?"
      ];
    } else if (lowercaseQuery.includes('math') || lowercaseQuery.includes('equation')) {
      questions = [
        "Would you like to see more practice problems on this topic?",
        "Are there specific aspects of this math concept that you find particularly challenging?",
        "Would you like me to explain this in a different way with more visual examples?"
      ];
    } else if (lowercaseQuery.includes('exam') || lowercaseQuery.includes('test')) {
      questions = [
        "How much time do you have before the exam?",
        "Would you like me to create a study plan specifically for this exam?",
        "What topics do you find most challenging for this subject?"
      ];
    } else {
      // Default follow-ups
      questions = [
        "Would you like me to explain this topic in more detail?",
        "Is there anything specific about this topic that you'd like to focus on?",
        "How does this relate to what you're currently studying?"
      ];
    }
    
    setFollowUpQuestions(questions);
  };

  const generateAdaptiveResponse = (query: string): string => {
    const lowercaseQuery = query.toLowerCase();
    let response = "";
    
    // Adapt response based on user preferences
    const detailedExplanation = userPreferences.responseLength === 'detailed';
    const isVisualLearner = userPreferences.learningStyle === 'visual';
    const difficultyLevel = userPreferences.difficulty;
    
    // More detailed responses with adaptive content
    if (lowercaseQuery.includes('study') && lowercaseQuery.includes('plan')) {
      response = `Creating an effective study plan involves several key principles. ${detailedExplanation ? "Let's break this down in detail:" : "Here's a brief overview:"}\n\n`;
      
      response += "1. **Assessment**: Take time to identify which topics need most attention\n";
      response += "2. **Scheduling**: Allocate focused sessions with regular breaks\n";
      response += "3. **Active recall**: Test yourself on the material rather than just re-reading\n";
      response += "4. **Spaced repetition**: Review material at increasing intervals\n";
      response += "5. **Practice testing**: Use past papers or create mock tests\n\n";
      
      if (detailedExplanation) {
        response += "Research shows that spacing out your study sessions over time is much more effective than cramming. This is because spaced learning allows your brain to form stronger neural connections.\n\n";
        
        response += isVisualLearner ? 
          "Try creating a visual calendar or timeline for your study plan, using color-coding for different subjects. This can help you see the big picture of your study schedule at a glance.\n\n" :
          "Consider recording yourself summarizing key concepts and listening to these recordings during walks or other downtime.\n\n";
      }
      
      response += "Would you like me to help you develop a personalized study plan for a specific subject or exam? I can tailor it to your available time and learning preferences.";
    } 
    else if (lowercaseQuery.includes('photosynthesis')) {
      response = `Photosynthesis is the process by which plants convert light energy into chemical energy. ${difficultyLevel === 'beginner' ? "Think of it as plants making their own food using sunlight!" : "It's a complex biochemical process that sustains most life on Earth."}\n\n`;
      
      response += "The basic equation is:\n6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂\n\n";
      
      if (detailedExplanation) {
        response += "This process occurs primarily in the chloroplasts of plant cells, specifically in structures called thylakoids. The process has two main stages:\n\n";
        response += "1. **Light-dependent reactions**: These occur in the thylakoid membrane and require direct light energy to produce ATP and NADPH while releasing oxygen.\n\n";
        response += "2. **Light-independent reactions** (Calvin cycle): These occur in the stroma and use the ATP and NADPH from the first stage to convert CO₂ into glucose.\n\n";
        
        if (difficultyLevel === 'advanced') {
          response += "The electron transport chain in the thylakoid membrane is crucial for the generation of ATP through chemiosmosis. Photosystems I and II contain chlorophyll molecules that capture specific wavelengths of light, initiating the electron flow.\n\n";
        }
      }
      
      if (isVisualLearner) {
        response += "Visualize this as a solar-powered factory: sunlight provides the energy, CO₂ and water are the raw materials, and glucose and oxygen are the products. The chloroplasts are the factory buildings containing all the necessary machinery.\n\n";
      }
      
      response += "This remarkable process is the foundation of most food chains on Earth and produces the oxygen we breathe. Would you like me to explain any specific part of photosynthesis in more detail?";
    }
    else if (lowercaseQuery.includes('quadratic')) {
      response = `A quadratic equation takes the form ax² + bx + c = 0, where a, b, and c are constants and a ≠ 0. ${difficultyLevel === 'beginner' ? "These equations create parabolas (U-shaped curves) when graphed." : "These second-degree polynomial equations have interesting properties and applications."}\n\n`;
      
      response += "There are several methods to solve quadratic equations:\n\n";
      
      if (isVisualLearner) {
        response += "Imagine a U-shaped curve crossing the x-axis. The points where it crosses are your solutions!\n\n";
      }
      
      response += "1. **Factoring**: Find factors p, q, r, s such that ax² + bx + c = (px + q)(rx + s)\n";
      response += "2. **Quadratic Formula**: x = (-b ± √(b² - 4ac)) / 2a\n";
      
      if (detailedExplanation || difficultyLevel === 'advanced') {
        response += "3. **Completing the Square**: Rearrange to (x + d)² = e form\n\n";
        response += "The discriminant b² - 4ac tells you about the nature of the solutions:\n";
        response += "- If b² - 4ac > 0: Two distinct real solutions\n";
        response += "- If b² - 4ac = 0: One repeated real solution\n";
        response += "- If b² - 4ac < 0: Two complex conjugate solutions\n\n";
        
        if (difficultyLevel === 'advanced') {
          response += "The quadratic formula is derived from the completing the square method, showing the elegant connection between different algebraic approaches.\n\n";
        }
      }
      
      response += "Would you like to see an example solved step-by-step, or would you prefer to practice with a specific problem?";
    }
    else if (lowercaseQuery.includes('motivat')) {
      response = "Staying motivated with your studies can be challenging. Here are some evidence-based strategies that might help:\n\n";
      
      response += "**Connect to Your 'Why'**:\n";
      response += "- Clearly define why your education matters to your long-term goals\n";
      response += "- Visualize your future self benefiting from your current efforts\n\n";
      
      response += "**Set Effective Goals**:\n";
      response += "- Break large goals into smaller, achievable milestones\n";
      response += "- Track progress visibly to see how far you've come\n\n";
      
      if (detailedExplanation) {
        response += "**Optimize Your Environment**:\n";
        response += "- Create a dedicated, distraction-free study space\n";
        response += "- Use app blockers during study sessions\n\n";
        
        response += "**Maintain Well-being**:\n";
        response += "- Regular exercise boosts cognitive function and mood\n";
        response += "- Adequate sleep improves memory consolidation\n";
      }
      
      response += "Remember that motivation naturally fluctuates. On days when motivation is low, rely on established routines and habits to carry you through.\n\n";
      
      response += "What specific aspect of motivation are you struggling with? I'd be happy to provide more targeted strategies.";
    }
    else if (lowercaseQuery.includes('help') || lowercaseQuery.includes('what can you')) {
      response = "I'm your AI study assistant, and I'm here to help you succeed in your academic journey. Here's what I can do for you:\n\n";
      
      response += "**Explain Concepts**: I can break down complex topics into understandable parts and provide examples that match your learning style.\n\n";
      
      response += "**Study Support**: I can create personalized study plans, suggest effective techniques, and help you prepare for exams with practice questions.\n\n";
      
      response += "**Answer Questions**: I'm here to provide detailed answers to your subject-specific questions and clarify confusing topics from your coursework.\n\n";
      
      if (detailedExplanation) {
        response += "**Skill Development**: I can guide you through academic writing processes, help with research methodologies, and suggest resources for further learning.\n\n";
        
        response += "**Motivation and Productivity**: I can provide strategies to overcome procrastination, help establish effective study habits, and offer encouragement during challenging academic periods.\n\n";
      }
      
      response += "Feel free to ask about any subject you're studying. What would you like help with today?";
    }
    else {
      // Generic response with personalization based on learning preferences
      response = `That's an interesting question about ${query.split(' ').slice(0, 3).join(' ')}...\n\n`;
      
      if (isVisualLearner) {
        response += "I'd be happy to explain this with visual analogies and diagrams to help you understand better. ";
      } else if (userPreferences.learningStyle === 'kinesthetic') {
        response += "I can suggest some hands-on activities that might help you grasp this concept better. ";
      }
      
      response += "To give you the most helpful response, I'd need to understand a bit more about your specific needs. Are you looking for an explanation of this topic, studying for a test, or trying to solve a particular problem?\n\n";
      
      response += "Let me know how I can best support your learning goals, and I'll tailor my response accordingly.";
    }
    
    return response;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleLongForm = () => {
    setShowLongForm(!showLongForm);
  };

  const handleLongFormSubmit = () => {
    if (longQuery.trim()) {
      handleSend(longQuery);
    }
  };

  const saveConversation = () => {
    const conversation = messages.map(msg => 
      `[${msg.sender === 'user' ? 'You' : 'AI Tutor'}]: ${msg.text}`
    ).join('\n\n');
    
    const blob = new Blob([conversation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-tutor-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Conversation saved", {
      description: "Your conversation has been downloaded as a text file"
    });
  };

  const togglePreferences = () => {
    setShowTutorPreferences(!showTutorPreferences);
  };

  const updatePreference = (key: keyof UserPreference, value: any) => {
    setUserPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Provide feedback
    toast.success("Preference updated", {
      description: "Your learning preferences have been updated"
    });
  };

  const handleFollowUpClick = (question: string) => {
    handleSend(question);
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-primary">
              <AvatarFallback>AI</AvatarFallback>
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </Avatar>
            <div>
              <CardTitle className="text-lg">Interactive AI Tutor</CardTitle>
              <CardDescription className="text-xs flex items-center gap-1">
                <Lightbulb className="h-3 w-3" /> 
                Personalized learning assistant
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs" 
              onClick={togglePreferences}
              title="Learning preferences"
            >
              <Edit className="h-4 w-4 mr-1" />
              Preferences
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={saveConversation} 
              title="Save conversation"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Learning preferences section */}
        {showTutorPreferences && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm space-y-3">
            <h4 className="font-medium flex items-center gap-1">
              <GraduationCap className="h-4 w-4" /> 
              Learning Preferences
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Learning Style:</label>
                <select 
                  className="w-full mt-1 text-xs p-1 rounded border bg-background text-foreground"
                  value={userPreferences.learningStyle}
                  onChange={(e) => updatePreference('learningStyle', e.target.value)}
                >
                  <option value="visual">Visual</option>
                  <option value="auditory">Auditory</option>
                  <option value="kinesthetic">Kinesthetic</option>
                  <option value="reading/writing">Reading/Writing</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs font-medium">Explanation Level:</label>
                <select 
                  className="w-full mt-1 text-xs p-1 rounded border bg-background text-foreground"
                  value={userPreferences.difficulty}
                  onChange={(e) => updatePreference('difficulty', e.target.value as any)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs font-medium">Response Detail:</label>
                <select 
                  className="w-full mt-1 text-xs p-1 rounded border bg-background text-foreground"
                  value={userPreferences.responseLength}
                  onChange={(e) => updatePreference('responseLength', e.target.value as any)}
                >
                  <option value="concise">Concise</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
            </div>
              
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs" 
                onClick={togglePreferences}
              >
                Close preferences
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden pb-0 px-3 relative">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4 pb-4">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'followUp' ? (
                  <div className="w-full px-10 my-1">
                    <Button 
                      variant="outline" 
                      className="text-sm w-full justify-start hover:bg-primary/5 border-dashed"
                      onClick={() => handleFollowUpClick(msg.text)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2 text-primary" />
                      {msg.text}
                    </Button>
                  </div>
                ) : (
                  <div className={`flex gap-2 max-w-[90%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <Avatar className={msg.sender === 'user' ? 'bg-secondary h-8 w-8' : 'bg-primary h-8 w-8'}>
                      {msg.sender === 'user' ? (
                        <AvatarFallback>U</AvatarFallback>
                      ) : (
                        <>
                          <AvatarFallback>AI</AvatarFallback>
                          <Sparkles className="h-4 w-4" />
                        </>
                      )}
                    </Avatar>
                    <div className="space-y-1">
                      <div 
                        className={`rounded-lg p-3 text-sm ${
                          msg.sender === 'user' 
                            ? 'bg-secondary text-secondary-foreground' 
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {currentTopic && msg.sender === 'ai' && !msg.text.startsWith("That's an interesting") && (
                          <Badge variant="outline" className="mb-2 text-xs font-normal opacity-70">
                            {currentTopic}
                          </Badge>
                        )}
                        
                        <div>
                          {msg.text.split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                              {line}
                              {i !== msg.text.split('\n').length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground px-1 flex items-center">
                        <span>{formatTime(msg.timestamp)}</span>
                        {msg.sender === 'ai' && (
                          <span className="ml-2 flex items-center">
                            <Heart className="h-3 w-3 text-red-400 mr-1" />
                            <span className="sr-only">Learning assistant</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <Avatar className="bg-primary h-8 w-8">
                    <AvatarFallback>AI</AvatarFallback>
                    <Sparkles className="h-4 w-4" />
                  </Avatar>
                  <div className="rounded-lg bg-muted p-3 text-sm flex items-center">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="ml-2">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            {isTyping && !isThinking && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <Avatar className="bg-primary h-8 w-8">
                    <AvatarFallback>AI</AvatarFallback>
                    <Sparkles className="h-4 w-4" />
                  </Avatar>
                  <div className="rounded-lg bg-muted p-3 text-sm flex items-center">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      
      {/* Suggested prompts */}
      {messages.length <= 2 && !isTyping && (
        <div className="px-4 py-2">
          <p className="text-xs text-muted-foreground mb-2 flex items-center">
            <BookOpen className="h-3 w-3 mr-1" />
            Suggested questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {generateSuggestedPrompts().map((prompt, i) => (
              <Button 
                key={i} 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => handleSend(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Long form toggle */}
      <div className="px-4 py-1">
        <button 
          onClick={toggleLongForm} 
          className="text-xs text-primary hover:underline flex items-center"
        >
          {showLongForm ? (
            <>
              <MessageCircle className="h-3 w-3 mr-1" />
              Use single-line input
            </>
          ) : (
            <>
              <Edit className="h-3 w-3 mr-1" />
              Ask a longer question...
            </>
          )}
        </button>
      </div>
      
      <CardFooter className="pt-2">
        {showLongForm ? (
          <div className="w-full space-y-2">
            <Textarea
              value={longQuery}
              onChange={(e) => setLongQuery(e.target.value)}
              placeholder="Type your detailed question here..."
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleLongFormSubmit} 
                disabled={!longQuery.trim() || isTyping}
              >
                <SendIcon className="h-4 w-4 mr-2" />
                Send Question
              </Button>
            </div>
          </div>
        ) : (
          <form 
            className="flex w-full gap-2" 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your studies..."
              className="flex-grow"
              disabled={isTyping}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
              <SendIcon className="h-4 w-4" />
            </Button>
          </form>
        )}
      </CardFooter>
    </Card>
  );
};

export default AITutor;
