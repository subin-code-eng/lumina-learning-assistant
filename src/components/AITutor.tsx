
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, SendIcon, Sparkles, User, RefreshCw, Download, Lightbulb, Heart, BookOpen, GraduationCap, Edit, AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const { user } = useAuth();
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
  const [apiError, setApiError] = useState<string | null>(null);
  
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
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

  // Save conversation to Supabase if user is logged in
  useEffect(() => {
    const saveConversationToServer = async () => {
      if (!user || messages.length <= 1) return;
      
      try {
        // Create a properly typed parameter object for the RPC call
        const rpcParams = {
          p_user_id: user.id,
          p_conversation_title: `Conversation ${new Date().toLocaleDateString()}`,
          p_messages: JSON.parse(JSON.stringify(messages)) // Serialize and deserialize to ensure proper JSON format
        };
        
        const { error } = await supabase.rpc('save_ai_conversation', rpcParams);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error saving conversation:', error);
      }
    };
    
    // Save conversation when it's updated
    const saveTimeout = setTimeout(saveConversationToServer, 2000);
    return () => clearTimeout(saveTimeout);
  }, [messages, user]);

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

  // Function to call the AI API
  const callAIEndpoint = async (userQuery: string): Promise<string> => {
    try {
      setApiError(null);
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          query: userQuery,
          userPreferences,
          conversationContext: conversationContext.slice(-5) // Last 5 exchanges for context
        }
      });
      
      if (error) {
        console.error('Error calling AI endpoint:', error);
        setApiError("Connection issue. Please try again.");
        return "I'm having trouble connecting to my knowledge base right now. Could you try with a different question?";
      }
      
      if (!data?.response) {
        setApiError("No response received from AI service.");
        return "I'm having trouble processing your request right now. Please try again in a moment.";
      }
      
      return data.response;
    } catch (error) {
      console.error('Error calling AI endpoint:', error);
      setApiError("Technical issue. Please try again later.");
      return "I apologize for the inconvenience. My systems are experiencing some temporary issues. Let's try a different approach - ask me about general study techniques or learning methods.";
    }
  };

  const handleSend = async (customInput?: string) => {
    const messageText = customInput || input;
    if (!messageText.trim()) return;
    
    // Reset any previous errors
    setApiError(null);
    
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
    
    try {
      // Generate follow-up questions based on user input for later use
      generateFollowUpQuestions(messageText);
      
      // Simulate AI thinking time (shorter for better experience)
      setTimeout(() => {
        setIsThinking(false);
        
        // Call AI API and simulate typing the response
        callAIEndpoint(messageText).then(aiResponse => {
          simulateTypingResponse(aiResponse);
        }).catch(error => {
          console.error("Error getting AI response:", error);
          setApiError("Failed to get AI response.");
          simulateTypingResponse("I'm having trouble processing your request. Please try again.");
        });
      }, 700 + Math.random() * 800); // Random thinking time between 0.7-1.5s
    } catch (error) {
      console.error("Error in handleSend:", error);
      setIsTyping(false);
      setIsThinking(false);
      setApiError("Failed to process message.");
      toast.error("Something went wrong", {
        description: "Failed to process your message. Please try again."
      });
    }
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
    }, 20); // Speed of typing (faster than before)
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

  const clearConversation = () => {
    setMessages([
      {
        id: '1',
        text: "Hello! I'm your AI study partner. How can I help with your studies today?",
        sender: 'ai',
        timestamp: new Date(),
        type: 'standard'
      }
    ]);
    setConversationContext([]);
    setApiError(null);
    toast.success("Conversation cleared", {
      description: "Started a new conversation"
    });
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
            <Button
              variant="ghost"
              size="icon"
              onClick={clearConversation}
              title="Clear conversation"
            >
              <RefreshCw className="h-4 w-4" />
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
        
        {apiError && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Issue</AlertTitle>
            <AlertDescription>
              {apiError} The AI tutor is currently unavailable. Please try again later or check if your OpenAI API key has been properly configured.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden pb-0 px-3 relative" ref={scrollAreaRef}>
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
                        
                        <div className="markdown-content">
                          {msg.sender === 'ai' ? (
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          ) : (
                            msg.text.split('\n').map((line, i) => (
                              <React.Fragment key={i}>
                                {line}
                                {i !== msg.text.split('\n').length - 1 && <br />}
                              </React.Fragment>
                            ))
                          )}
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
      {messages.length <= 2 && !isTyping && !apiError && (
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

      <style>{`
        .markdown-content p {
          margin-bottom: 0.5rem;
        }
        .markdown-content ul, .markdown-content ol {
          margin-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .markdown-content li {
          margin-bottom: 0.25rem;
        }
        .markdown-content h1, .markdown-content h2, .markdown-content h3 {
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        .markdown-content code {
          background-color: rgba(0, 0, 0, 0.1);
          padding: 0.1rem 0.2rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }
        .markdown-content pre {
          background-color: rgba(0, 0, 0, 0.1);
          padding: 0.5rem;
          border-radius: 0.25rem;
          overflow-x: auto;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </Card>
  );
};

export default AITutor;
