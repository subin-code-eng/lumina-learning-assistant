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

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'followUp' | 'feedback' | 'standard';
}

interface UserPreference {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading/writing';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  responseLength: 'concise' | 'detailed';
  subjects: string[];
}

const AITutor: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI tutor. I can help you with any subject - from mathematics and science to languages and history. What would you like to learn today?",
      sender: 'ai',
      timestamp: new Date(),
      type: 'standard'
    }
  ]);
  
  const [input, setInput] = useState('');
  const [longQuery, setLongQuery] = useState('');
  const [showLongForm, setShowLongForm] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showTutorPreferences, setShowTutorPreferences] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  const [userPreferences, setUserPreferences] = useState<UserPreference>({
    learningStyle: 'visual',
    difficulty: 'intermediate',
    responseLength: 'detailed',
    subjects: ['Mathematics', 'Science', 'History']
  });
  
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isTyping && !showLongForm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTyping, showLongForm]);

  const callAIEndpoint = async (userQuery: string): Promise<{response: string, error?: boolean, offline?: boolean}> => {
    try {
      setApiError(null);
      
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          query: userQuery,
          userPreferences,
          conversationContext: conversationContext.slice(-3)
        }
      });
      
      if (error) {
        console.error('AI endpoint error:', error);
        throw new Error(error.message || 'API request failed');
      }
      
      if (!data?.response) {
        throw new Error('No response from AI service');
      }
      
      // Check if response indicates offline mode
      if (data.offline) {
        setIsOfflineMode(true);
        return { response: data.response, offline: true };
      }
      
      setIsOfflineMode(false);
      return { response: data.response };
    } catch (error) {
      console.error('AI call failed:', error);
      setIsOfflineMode(true);
      
      return { 
        response: getFallbackResponse(userQuery),
        error: true,
        offline: true
      };
    }
  };

  const getFallbackResponse = (query: string) => {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('math') || queryLower.includes('equation') || queryLower.includes('calculus')) {
      return "**Mathematics Help:**\n\nFor math problems, I recommend:\n- Breaking complex problems into smaller steps\n- Understanding the underlying concepts rather than just memorizing formulas\n- Practice with similar problems to build confidence\n- Use visual aids like graphs or diagrams when possible\n\nWhat specific math topic would you like help with?";
    } else if (queryLower.includes('science') || queryLower.includes('biology') || queryLower.includes('chemistry') || queryLower.includes('physics')) {
      return "**Science Learning:**\n\nScience concepts are best understood through:\n- Real-world examples and applications\n- Connecting new information to what you already know\n- Creating concept maps to visualize relationships\n- Hands-on experiments or demonstrations when possible\n\nWhich science topic interests you most?";
    } else if (queryLower.includes('history')) {
      return "**History Study Tips:**\n\nWhen studying history, focus on:\n- **Understanding causation** rather than just memorizing dates and names\n- Creating timelines to see how events connect\n- Comparing historical events to contemporary situations\n- Understanding the broader context and consequences\n\nWhat historical period or event would you like to explore?";
    } else if (queryLower.includes('language') || queryLower.includes('grammar') || queryLower.includes('writing')) {
      return "**Language Learning:**\n\nEffective language study involves:\n- Consistent daily practice\n- Immersion through reading, listening, and speaking\n- Focus on practical communication over perfect grammar\n- Building vocabulary through context and usage\n\nWhat language skills would you like to improve?";
    }
    
    return "**Study Tips:**\n\nHere are some proven learning strategies:\n- **Active recall**: Test yourself frequently\n- **Spaced repetition**: Review material at increasing intervals\n- **Elaborative questioning**: Ask yourself 'why' and 'how'\n- **Teaching others**: Explain concepts to solidify understanding\n\nWhat subject or topic would you like to focus on today?";
  };

  const handleSend = async (customInput?: string) => {
    const messageText = customInput || input;
    if (!messageText.trim()) return;
    
    setApiError(null);
    
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
    
    if (customInput) {
      setLongQuery('');
      setShowLongForm(false);
    }
    
    // Update conversation context
    setConversationContext(prev => {
      const updated = [...prev, messageText];
      return updated.slice(-3);
    });
    
    try {
      // Add a thinking delay for better UX
      setTimeout(async () => {
        setIsThinking(false);
        
        const aiResponseData = await callAIEndpoint(messageText);
        const aiResponse = aiResponseData.response;
        
        simulateTypingResponse(aiResponse, !!aiResponseData.error);
        
        if (aiResponseData.offline) {
          setApiError("Enhanced Study Mode - Using curated learning guidance");
        }
      }, 800);
    } catch (error) {
      console.error("Error in handleSend:", error);
      setIsTyping(false);
      setIsThinking(false);
      setApiError("Enhanced Study Mode - Using curated learning guidance");
      
      const fallbackResponse = getFallbackResponse(messageText);
      simulateTypingResponse(fallbackResponse, true);
    }
  };

  const simulateTypingResponse = (fullResponse: string, isErrorResponse: boolean = false) => {
    const words = fullResponse.split(' ');
    let currentResponse = '';
    let wordIndex = 0;
    
    const typingSpeed = 40;
    
    const typingMessageId = Date.now().toString();
    const typingMessage: Message = {
      id: typingMessageId,
      text: '',
      sender: 'ai',
      timestamp: new Date(),
      type: isErrorResponse ? 'feedback' : 'standard'
    };
    
    setMessages(prev => [...prev, typingMessage]);
    
    const typingInterval = setInterval(() => {
      if (wordIndex < words.length) {
        currentResponse += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
        wordIndex++;
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === typingMessageId 
              ? { ...msg, text: currentResponse } 
              : msg
          )
        );
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, typingSpeed);
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

  const clearConversation = () => {
    setMessages([
      {
        id: '1',
        text: "Hi! I'm your AI tutor. I can help you with any subject - from mathematics and science to languages and history. What would you like to learn today?",
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

  const updatePreference = (key: keyof UserPreference, value: any) => {
    setUserPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    
    toast.success("Preference updated", {
      description: "Your learning preferences have been updated"
    });
  };

  const suggestedPrompts = [
    "Explain quantum physics in simple terms",
    "Help me understand calculus derivatives", 
    "What caused World War I?",
    "How do I write a compelling essay?",
    "Explain photosynthesis step by step"
  ];

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
              <CardTitle className="text-lg">Advanced AI Tutor</CardTitle>
              <CardDescription className="text-xs flex items-center gap-1">
                <Lightbulb className="h-3 w-3" /> 
                {isOfflineMode ? "Enhanced Study Mode" : "Your personalized learning companion"}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs" 
              onClick={() => setShowTutorPreferences(!showTutorPreferences)}
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
                <label className="text-xs font-medium">Difficulty Level:</label>
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
            </div>
              
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs" 
                onClick={() => setShowTutorPreferences(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
        
        {apiError && (
          <Alert className="mt-2 bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-700">Enhanced Learning Mode</AlertTitle>
            <AlertDescription className="text-blue-600">
              <div className="space-y-2">
                <p>Using curated study guidance and proven learning techniques.</p>
                {isOfflineMode && (
                  <p className="text-xs">
                    💡 <strong>Tip:</strong> To enable full AI capabilities, add a Gemini API key to your Supabase Edge Function Secrets.
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden pb-0 px-3">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4 pb-4">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[90%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <Avatar className={msg.sender === 'user' ? 'bg-secondary h-8 w-8' : 'bg-primary h-8 w-8'}>
                    <AvatarFallback>{msg.sender === 'user' ? 'U' : 'AI'}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div 
                      className={`rounded-lg p-3 text-sm ${
                        msg.sender === 'user' 
                          ? 'bg-secondary text-secondary-foreground' 
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <div className="markdown-content">
                        {msg.sender === 'ai' ? (
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        ) : (
                          msg.text
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground px-1">
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <Avatar className="bg-primary h-8 w-8">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg bg-muted p-3 text-sm flex items-center">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      
      {messages.length <= 2 && !isTyping && !apiError && (
        <div className="px-4 py-2">
          <p className="text-xs text-muted-foreground mb-2 flex items-center">
            <BookOpen className="h-3 w-3 mr-1" />
            Try asking:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, i) => (
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
      
      <div className="px-4 py-1">
        <button 
          onClick={toggleLongForm} 
          className="text-xs text-primary hover:underline flex items-center"
        >
          {showLongForm ? (
            <>
              <MessageCircle className="h-3 w-3 mr-1" />
              Use quick input
            </>
          ) : (
            <>
              <Edit className="h-3 w-3 mr-1" />
              Ask a detailed question...
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
              placeholder="Ask me anything about your studies..."
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
