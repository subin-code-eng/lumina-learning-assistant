
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Gamepad2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import MemoryGame from './MemoryGame';

interface RefreshmentBreakProps {
  defaultBreakTime?: number; // Default break time in minutes
}

const RefreshmentBreak: React.FC<RefreshmentBreakProps> = ({ defaultBreakTime = 5 }) => {
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [breakTime, setBreakTime] = useState(defaultBreakTime * 60); // Convert to seconds
  const [remainingTime, setRemainingTime] = useState(breakTime);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  
  const breakAudio = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      breakAudio.current = new Audio('/break-time.mp3');
      if (breakAudio.current) {
        breakAudio.current.load();
        breakAudio.current.volume = 0.5;
      }
    }
  }, []);
  
  // Reset timer when break time changes
  useEffect(() => {
    setRemainingTime(breakTime);
  }, [breakTime]);
  
  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isBreakActive && !isPaused && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            endBreak();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isBreakActive, isPaused, remainingTime]);
  
  const startBreak = () => {
    setIsBreakActive(true);
    setIsPaused(false);
    
    // Play break time notification
    if (breakAudio.current) {
      breakAudio.current.currentTime = 0;
      breakAudio.current.play().catch(err => console.error('Error playing sound:', err));
    }
    
    toast({
      title: "Break time started!",
      description: `Take a ${formatTime(breakTime)} refreshment break.`,
    });
  };
  
  const pauseBreak = () => {
    setIsPaused(true);
  };
  
  const resumeBreak = () => {
    setIsPaused(false);
  };
  
  const endBreak = () => {
    setIsBreakActive(false);
    setIsGameOpen(false);
    setRemainingTime(breakTime);
    
    toast({
      title: "Break time ended",
      description: "Time to get back to studying!",
    });
  };
  
  const openGame = () => {
    setIsGameOpen(true);
  };
  
  const closeGame = () => {
    setIsGameOpen(false);
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const progress = (remainingTime / breakTime) * 100;
  
  return (
    <>
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-4 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Refreshment Break</h3>
            </div>
            {isBreakActive && (
              <span className="text-sm font-medium">{formatTime(remainingTime)}</span>
            )}
          </div>
          
          {isBreakActive ? (
            <>
              <Progress value={progress} className="h-2 mb-3" />
              
              <div className="flex items-center justify-between">
                <div className="space-x-2">
                  {isPaused ? (
                    <Button size="sm" onClick={resumeBreak}>
                      <Play className="h-4 w-4 mr-1" />
                      Resume
                    </Button>
                  ) : (
                    <Button size="sm" onClick={pauseBreak}>
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                  )}
                  
                  <Button 
                    size="sm"
                    variant={isGameOpen ? "default" : "outline"}
                    onClick={isGameOpen ? closeGame : openGame}
                  >
                    <Gamepad2 className="h-4 w-4 mr-1" />
                    {isGameOpen ? "Close Game" : "Play Game"}
                  </Button>
                </div>
                
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={endBreak}
                >
                  End Break
                </Button>
              </div>
            </>
          ) : (
            <Button onClick={startBreak} className="w-full">
              <Gamepad2 className="h-4 w-4 mr-2" />
              Start Break ({defaultBreakTime} min)
            </Button>
          )}
        </CardContent>
      </Card>
      
      {/* Game Dialog */}
      <Dialog open={isGameOpen} onOpenChange={setIsGameOpen}>
        <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Memory Game</DialogTitle>
          </DialogHeader>
          <MemoryGame onClose={closeGame} timeLimit={Math.min(remainingTime, 180)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RefreshmentBreak;
