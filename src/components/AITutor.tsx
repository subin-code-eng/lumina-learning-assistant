
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, SendIcon, Sparkles, User } from 'lucide-react';

// Types for chat messages
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AITutor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI study assistant. How can I help you with your studies today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate AI response with simple predefined answers
    setTimeout(() => {
      const lowercaseInput = input.toLowerCase();
      let response = "I'm not sure how to help with that. Could you provide more details about your question?";
      
      // Simple pattern matching for demo purposes
      if (lowercaseInput.includes('study') && lowercaseInput.includes('plan')) {
        response = "To create an effective study plan, first identify your goals and deadlines. Then break down the material into manageable chunks. I can help you organize a schedule that includes spaced repetition for better retention.";
      } else if (lowercaseInput.includes('motivat')) {
        response = "Staying motivated can be challenging. Try setting small, achievable goals and rewarding yourself after completing them. Also, remember why you started - connecting your studies to your bigger life goals can help maintain motivation.";
      } else if (lowercaseInput.includes('exam') || lowercaseInput.includes('test')) {
        response = "For exam preparation, start early and create a structured review schedule. Use active recall techniques like practice tests rather than passive reading. I can help you design a comprehensive exam prep strategy.";
      } else if (lowercaseInput.includes('remember') || lowercaseInput.includes('memorize')) {
        response = "For better memorization, try spaced repetition, active recall through self-testing, and creating meaningful connections between new information and things you already know. Memory palaces and visualization techniques can also be very effective.";
      }
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="w-full h-[500px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          AI Study Tutor
        </CardTitle>
        <CardDescription>
          Ask any study-related question and get personalized help
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto pb-0">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className={msg.sender === 'user' ? 'bg-secondary' : 'bg-primary'}>
                  {msg.sender === 'user' ? (
                    <>
                      <AvatarFallback>U</AvatarFallback>
                      <User className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <AvatarFallback>AI</AvatarFallback>
                      <Sparkles className="h-4 w-4" />
                    </>
                  )}
                </Avatar>
                <div>
                  <div 
                    className={`rounded-lg p-3 text-sm ${
                      msg.sender === 'user' 
                        ? 'bg-secondary text-secondary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[80%]">
                <Avatar className="bg-primary">
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
      </CardContent>
      <CardFooter className="pt-4">
        <form 
          className="flex w-full gap-2" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your studies..."
            className="flex-grow"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
            <SendIcon className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default AITutor;
