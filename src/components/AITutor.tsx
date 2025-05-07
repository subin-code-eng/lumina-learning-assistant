
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, SendIcon, Sparkles, User, RefreshCw, Download } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';

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
      text: "Hello! I'm your AI study assistant. How can I help you with your studies today? I can explain complex topics, help you prepare for exams, create study plans, or answer specific questions about your coursework.",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [longQuery, setLongQuery] = useState('');
  const [showLongForm, setShowLongForm] = useState(false);

  // Suggested prompts
  const suggestedPrompts = [
    "Can you explain how photosynthesis works?",
    "Help me understand quadratic equations",
    "What are the key events of World War II?",
    "How should I prepare for my history exam?",
    "Create a study plan for learning calculus"
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (customInput?: string) => {
    const messageText = customInput || input;
    if (!messageText.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
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
    
    // Simulate AI thinking time
    setTimeout(() => {
      setIsThinking(false);
      
      // Start "typing" the response word by word
      simulateTypingResponse(generateResponse(messageText));
    }, 1000 + Math.random() * 1000); // Random thinking time between 1-2s
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
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, typingMessage]);
    
    // Simulate typing one word at a time
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
      }
    }, 50); // Speed of typing
  };

  const generateResponse = (query: string): string => {
    const lowercaseQuery = query.toLowerCase();
    
    // More detailed responses for ChatGPT-like experience
    if (lowercaseQuery.includes('study') && lowercaseQuery.includes('plan')) {
      return "Creating an effective study plan involves several key principles. First, assess your available time and set realistic goals. I recommend breaking your material into manageable chunks and scheduling specific times for each topic. \n\nHere's a sample structure:\n\n1. **Assessment**: Take 30 minutes to identify which topics need most attention\n2. **Scheduling**: Allocate 2-3 hour focused sessions with 5-10 minute breaks every 25-30 minutes\n3. **Active recall**: Don't just read - quiz yourself on the material\n4. **Spaced repetition**: Review material at increasing intervals\n5. **Practice testing**: Use past papers or create mock tests\n\nWould you like me to help you develop a personalized study plan for a specific subject or exam?";
    } else if (lowercaseQuery.includes('photosynthesis')) {
      return "Photosynthesis is the process by which plants, algae, and some bacteria convert light energy, usually from the sun, into chemical energy in the form of glucose or other sugars.\n\nThe basic equation is:\n6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂\n\nThis process occurs primarily in the chloroplasts of plant cells, specifically in structures called thylakoids. The process has two main stages:\n\n1. **Light-dependent reactions**: These occur in the thylakoid membrane and require direct light energy to produce ATP and NADPH while releasing oxygen.\n\n2. **Light-independent reactions** (Calvin cycle): These occur in the stroma and use the ATP and NADPH from the first stage to convert CO₂ into glucose.\n\nChlorophyll, the green pigment in plants, is essential for capturing light energy. This remarkable process is the foundation of most food chains on Earth and produces the oxygen we breathe.";
    } else if (lowercaseQuery.includes('quadratic')) {
      return "A quadratic equation takes the form ax² + bx + c = 0, where a, b, and c are constants and a ≠ 0.\n\nThere are several methods to solve quadratic equations:\n\n1. **Factoring**: If you can find factors p and q such that ax² + bx + c = (px + q)(rx + s), then the solutions are where px + q = 0 or rx + s = 0.\n\n2. **Quadratic Formula**: x = (-b ± √(b² - 4ac)) / 2a\n   This formula gives all solutions to any quadratic equation.\n\n3. **Completing the Square**: Rearranging the equation to the form (x + d)² = e.\n\nThe discriminant b² - 4ac tells you about the nature of the solutions:\n- If b² - 4ac > 0: Two distinct real solutions\n- If b² - 4ac = 0: One repeated real solution\n- If b² - 4ac < 0: Two complex conjugate solutions\n\nWould you like to see an example worked out step-by-step?";
    } else if (lowercaseQuery.includes('world war ii') || lowercaseQuery.includes('world war 2')) {
      return "World War II (1939-1945) was the deadliest global conflict in history. Here are the key events:\n\n**Causes and Beginnings**:\n- Rise of fascism and Nazism in Europe\n- Germany's invasion of Poland on September 1, 1939\n- Britain and France declaring war on Germany\n\n**Major Phases**:\n1. **Early German successes (1939-1941)**: Blitzkrieg tactics, fall of France, Battle of Britain\n2. **Axis expansion (1940-1942)**: Germany invades USSR, Japan attacks Pearl Harbor\n3. **Turning point (1942-1943)**: Battles of Stalingrad, El Alamein, and Midway\n4. **Allied offensive (1943-1945)**: D-Day landings, Allied bombing campaigns\n5. **Axis defeat (1945)**: Fall of Berlin, atomic bombings of Japan\n\n**Significant Impacts**:\n- Holocaust: Systematic murder of six million Jews and millions of others\n- Emergence of the US and USSR as superpowers\n- Formation of the United Nations\n- Beginning of the Cold War\n\nThis conflict reshaped global politics, economics, and society in profound ways that still influence our world today.";
    } else if (lowercaseQuery.includes('exam')) {
      return "Effective exam preparation combines good study habits with strategic planning. Here's a comprehensive approach:\n\n**1-2 Weeks Before**:\n- Create a study schedule with specific topics for each day\n- Review all course materials and organize your notes\n- Identify key concepts and potential exam topics\n- Form a study group if helpful for your learning style\n\n**Days Before**:\n- Practice with past papers or sample questions\n- Focus on weak areas identified during practice\n- Use active recall techniques (flashcards, self-quizzing)\n- Explain concepts out loud as if teaching someone\n\n**Day Before**:\n- Light review of key concepts only\n- Prepare everything you'll need (ID, pens, calculator)\n- Get a good night's sleep (7-9 hours)\n- Avoid cramming or learning new material\n\n**Exam Day**:\n- Have a nutritious meal before the exam\n- Arrive early to settle nerves\n- Read instructions carefully\n- Budget your time according to marks per question\n- Start with questions you're confident about\n\nWould you like more specific strategies for a particular subject or exam format?";
    } else if (lowercaseQuery.includes('motivat')) {
      return "Staying motivated during your studies is both an art and a science. Here are evidence-based strategies that can help:\n\n**Connect to Your 'Why'**:\n- Clearly define why your education matters to your long-term goals\n- Visualize your future self benefiting from your current efforts\n- Create a vision board or written statement of purpose\n\n**Set Effective Goals**:\n- Break large goals into smaller, achievable milestones\n- Use SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)\n- Track progress visibly to see how far you've come\n\n**Optimize Your Environment**:\n- Create a dedicated, distraction-free study space\n- Use app blockers during study sessions\n- Find or create an accountability group\n\n**Maintain Well-being**:\n- Regular exercise boosts cognitive function and mood\n- Adequate sleep improves memory consolidation\n- Healthy nutrition supports brain function\n\n**Use Psychological Techniques**:\n- Implementation intentions: \"If situation X arises, I will do Y\"\n- Pomodoro technique: 25-minute focus sessions with breaks\n- Temptation bundling: pair studying with something enjoyable\n\nRemember that motivation naturally fluctuates. The key is building systems and habits that carry you through low-motivation periods.";
    } else if (lowercaseQuery.includes('remember') || lowercaseQuery.includes('memorize')) {
      return "Improving memory retention involves using techniques backed by cognitive science. Here are the most effective methods:\n\n**Spaced Repetition**:\n- Review information at gradually increasing intervals\n- Apps like Anki automate this process\n- Most efficient for long-term retention\n\n**Active Recall**:\n- Test yourself instead of simply re-reading\n- Close your notes and try to explain concepts\n- Create practice questions for each topic\n\n**Memory Techniques**:\n- Memory Palace: Associate information with locations in a familiar place\n- Chunking: Group information into meaningful units\n- Mnemonics: Create acronyms or vivid associations\n- Story Method: Weave information into a narrative\n\n**Enhance Learning Conditions**:\n- Get sufficient sleep (crucial for memory consolidation)\n- Study in various environments to strengthen neural connections\n- Teach concepts to someone else (Feynman Technique)\n- Use multiple modalities (visual, auditory, kinesthetic)\n\nThe most powerful approach combines these techniques for different types of material. What specifically are you trying to memorize? I can suggest a tailored strategy.";
    } else if (lowercaseQuery.includes('help') || lowercaseQuery.includes('what can you')) {
      return "As your AI study assistant, I can help you in numerous ways:\n\n**Explain Concepts**:\n- Break down complex topics into understandable parts\n- Provide analogies and examples for difficult subjects\n- Explain the relationships between different concepts\n\n**Study Support**:\n- Create personalized study plans and schedules\n- Suggest effective study techniques based on your learning style\n- Help you prepare for exams with practice questions\n\n**Answer Questions**:\n- Provide detailed answers to subject-specific questions\n- Clarify confusing topics from your coursework\n- Help troubleshoot difficult problems\n\n**Skill Development**:\n- Guide you through academic writing processes\n- Help with research methodologies\n- Suggest resources for further learning\n\n**Motivation and Productivity**:\n- Provide strategies to overcome procrastination\n- Help establish effective study habits\n- Offer encouragement during challenging academic periods\n\nFeel free to ask about any subject you're studying, from mathematics and sciences to humanities and languages. What would you like help with today?";
    } else {
      // Generic response for other queries
      return "That's an interesting question about " + query.split(' ').slice(0, 3).join(' ') + "...\n\nTo give you the most helpful response, I'd need to understand a bit more about your specific needs. Are you looking for an explanation of this topic, studying for a test, or trying to solve a particular problem? \n\nI can provide detailed explanations, create study guides, help with problem-solving, or suggest learning resources. Just let me know what would be most helpful for your learning goals, and I'll tailor my response accordingly.";
    }
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
              <CardDescription className="text-xs">
                Powered by advanced language models
              </CardDescription>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={saveConversation} title="Save conversation">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto pb-0 px-3">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
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
                        : 'bg-muted'
                    }`}
                  >
                    {msg.text.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i !== msg.text.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
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
      </CardContent>
      
      {/* Suggested prompts */}
      {messages.length <= 2 && !isTyping && (
        <div className="px-4 py-2">
          <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
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
      
      {/* Long form toggle */}
      <div className="px-4 py-1">
        <button 
          onClick={toggleLongForm} 
          className="text-xs text-primary hover:underline flex items-center"
        >
          {showLongForm ? "Use single-line input" : "Ask a longer question..."}
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
