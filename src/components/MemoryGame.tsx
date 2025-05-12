import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Gamepad2, X } from 'lucide-react';

// Card types for the memory game
type MemoryCard = {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
  emoji: string;
};

interface MemoryGameProps {
  onClose: () => void;
  timeLimit?: number; // Time limit in seconds
}

const MemoryGame: React.FC<MemoryGameProps> = ({ onClose, timeLimit = 180 }) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(timeLimit);
  const [gameOver, setGameOver] = useState<boolean>(false);
  
  const audioSuccess = useRef<HTMLAudioElement | null>(null);
  const audioFlip = useRef<HTMLAudioElement | null>(null);
  const audioMatch = useRef<HTMLAudioElement | null>(null);
  const audioGameOver = useRef<HTMLAudioElement | null>(null);
  
  // Define card emojis
  const emojis = ['🚀', '🎮', '🎯', '🏆', '🎨', '🎭', '🎲', '🎪', '🎹', '🎸', '🧠', '📚'];
  
  // Initialize game
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Create audio elements
      audioSuccess.current = new Audio('/success.mp3');
      audioFlip.current = new Audio('/flip.mp3');
      audioMatch.current = new Audio('/match.mp3');
      audioGameOver.current = new Audio('/gameover.mp3');
      
      // Preload audio
      if (audioSuccess.current) audioSuccess.current.load();
      if (audioFlip.current) audioFlip.current.load();
      if (audioMatch.current) audioMatch.current.load();
      if (audioGameOver.current) audioGameOver.current.load();
      
      // Reduce volume
      if (audioSuccess.current) audioSuccess.current.volume = 0.3;
      if (audioFlip.current) audioFlip.current.volume = 0.2;
      if (audioMatch.current) audioMatch.current.volume = 0.3;
      if (audioGameOver.current) audioGameOver.current.volume = 0.3;
    }
    
    initializeGame();
  }, []);
  
  // Timer effect
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);
  
  // Check for game completion
  useEffect(() => {
    if (matchedPairs === emojis.length && gameStarted && !gameOver) {
      endGame(true);
    }
  }, [matchedPairs, gameStarted, emojis.length, gameOver]);
  
  // Check for matches when two cards are flipped
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstCardId, secondCardId] = flippedCards;
      const firstCard = cards.find(card => card.id === firstCardId);
      const secondCard = cards.find(card => card.id === secondCardId);
      
      // Ensure we found both cards
      if (firstCard && secondCard) {
        // Check if the cards match
        if (firstCard.value === secondCard.value) {
          // Match found - update cards to be matched and stay flipped
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === firstCardId || card.id === secondCardId
                ? { ...card, matched: true, flipped: true }
                : card
            )
          );
          
          // Increment matched pairs counter
          setMatchedPairs(prev => prev + 1);
          
          // Clear flipped cards array to allow next selections
          setFlippedCards([]);
          
          // Play match sound
          playSound('match');
        } else {
          // No match - Flip back after delay
          setTimeout(() => {
            setCards(prevCards => 
              prevCards.map(card => 
                (card.id === firstCardId || card.id === secondCardId) && !card.matched 
                  ? { ...card, flipped: false } 
                  : card
              )
            );
            setFlippedCards([]);
          }, 800);
        }
        
        // Increment moves counter
        setMoves(prev => prev + 1);
      }
    }
  }, [flippedCards, cards]);
  
  const initializeGame = () => {
    // Create pairs of cards with the same value
    const cardValues = [...emojis, ...emojis]
      .map((value, index) => ({ 
        id: index, 
        value: Math.floor(index / 2).toString(),
        flipped: false,
        matched: false,
        emoji: value
      }))
      .sort(() => Math.random() - 0.5); // Shuffle the cards
    
    setCards(cardValues);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimeRemaining(timeLimit);
    setGameOver(false);
  };
  
  const handleCardClick = (cardId: number) => {
    // Start game on first card click
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    // Ignore clicks if game is over or if two cards are already flipped
    if (gameOver || flippedCards.length >= 2) return;
    
    const clickedCard = cards.find(card => card.id === cardId);
    
    // Ignore clicks on already flipped or matched cards
    if (!clickedCard || clickedCard.flipped || clickedCard.matched) return;
    
    // Flip the card
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === cardId ? { ...card, flipped: true } : card
      )
    );
    
    playSound('flip');
    
    // Add the card to flipped cards
    setFlippedCards(prev => [...prev, cardId]);
  };
  
  const endGame = (won: boolean) => {
    setGameOver(true);
    setGameStarted(false);
    
    if (won) {
      playSound('success');
      toast({
        title: "Great job!",
        description: `You matched all pairs in ${moves} moves with ${formatTime(timeRemaining)} left!`,
      });
    } else {
      playSound('gameover');
      toast({
        title: "Time's up!",
        description: `You matched ${matchedPairs} out of ${emojis.length} pairs.`,
      });
    }
    
    // Auto close after 3 seconds if game is complete
    if (won || timeRemaining <= 0) {
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  };
  
  const restartGame = () => {
    initializeGame();
    setGameStarted(true);
  };
  
  const playSound = (type: 'flip' | 'match' | 'success' | 'gameover') => {
    try {
      let audioToPlay: HTMLAudioElement | null = null;
      
      switch(type) {
        case 'flip':
          audioToPlay = audioFlip.current;
          break;
        case 'match':
          audioToPlay = audioMatch.current;
          break;
        case 'success':
          audioToPlay = audioSuccess.current;
          break;
        case 'gameover':
          audioToPlay = audioGameOver.current;
          break;
      }
      
      if (audioToPlay) {
        audioToPlay.currentTime = 0;
        audioToPlay.play().catch(err => {
          console.error('Error playing sound:', err);
        });
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Memory Game</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Game stats */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex space-x-4">
            <div>
              <span className="font-medium">Moves:</span> {moves}
            </div>
            <div>
              <span className="font-medium">Pairs:</span> {matchedPairs}/{emojis.length}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Time:</span> 
            <span className={timeRemaining < 30 ? "text-red-500 font-bold" : ""}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
        
        {/* Timer bar */}
        <Progress 
          value={(timeRemaining / timeLimit) * 100} 
          className="h-2 mb-4"
          color={timeRemaining < 30 ? "red" : undefined}
        />
        
        {/* Game grid */}
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-4">
          {cards.map(card => (
            <div 
              key={card.id} 
              className={`aspect-square rounded-lg cursor-pointer transform transition-all duration-300 ${
                card.matched ? 'opacity-60' : ''
              } ${card.flipped ? 'rotate-y-180' : ''}`}
              onClick={() => handleCardClick(card.id)}
            >
              <div className={`w-full h-full flex items-center justify-center text-2xl font-bold rounded-lg border-2 ${
                card.flipped || card.matched 
                  ? 'bg-primary/10 border-primary' 
                  : 'bg-secondary hover:bg-secondary/80'
              }`}>
                {(card.flipped || card.matched) ? (
                  <span className="text-3xl">{card.emoji}</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        
        {/* Game controls */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={restartGame}>
            Restart Game
          </Button>
          <Button variant="default" onClick={onClose}>
            Close Game
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemoryGame;
