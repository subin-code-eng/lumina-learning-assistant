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
  const [processingMatch, setProcessingMatch] = useState<boolean>(false);
  
  const audioSuccess = useRef<HTMLAudioElement | null>(null);
  const audioFlip = useRef<HTMLAudioElement | null>(null);
  const audioMatch = useRef<HTMLAudioElement | null>(null);
  const audioGameOver = useRef<HTMLAudioElement | null>(null);
  
  // Define card emojis
  const emojis = ['🚀', '🎮', '🎯', '🏆', '🎨', '🎭', '🎲', '🎪', '🎹', '🎸', '🧠', '📚'];
  
  // Initialize game
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Create audio elements with better error handling
      try {
        audioSuccess.current = new Audio('/success.mp3');
        audioFlip.current = new Audio('/flip.mp3');
        audioMatch.current = new Audio('/match.mp3');
        audioGameOver.current = new Audio('/gameover.mp3');
        
        // Set volume and preload
        [audioSuccess, audioFlip, audioMatch, audioGameOver].forEach(audioRef => {
          if (audioRef.current) {
            audioRef.current.volume = 0.3;
            audioRef.current.preload = 'auto';
          }
        });
      } catch (error) {
        console.warn('Audio files not found, continuing without sound');
      }
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
    if (flippedCards.length !== 2 || processingMatch) return;
    
    setProcessingMatch(true);
    
    const [firstCardId, secondCardId] = flippedCards;
    const firstCard = cards.find(card => card.id === firstCardId);
    const secondCard = cards.find(card => card.id === secondCardId);
    
    if (!firstCard || !secondCard) {
      setFlippedCards([]);
      setProcessingMatch(false);
      return;
    }
    
    // Check if the cards match by comparing their emoji values
    if (firstCard.emoji === secondCard.emoji) {
      // Match found!
      setTimeout(() => {
        setCards(prevCards => 
          prevCards.map(card => 
            card.id === firstCardId || card.id === secondCardId
              ? { ...card, matched: true }
              : card
          )
        );
        
        setMatchedPairs(prev => prev + 1);
        setFlippedCards([]);
        setMoves(prev => prev + 1);
        setProcessingMatch(false);
        
        playSound('match');
      }, 500);
    } else {
      // No match - flip back after delay
      setTimeout(() => {
        setCards(prevCards => 
          prevCards.map(card => 
            (card.id === firstCardId || card.id === secondCardId) && !card.matched
              ? { ...card, flipped: false }
              : card
          )
        );
        setFlippedCards([]);
        setMoves(prev => prev + 1);
        setProcessingMatch(false);
      }, 1000);
    }
  }, [flippedCards, cards, processingMatch]);
  
  const initializeGame = () => {
    // Create pairs of cards
    const gameEmojis = emojis.slice(0, 6); // Use 6 pairs for 12 cards
    const cardPairs = [...gameEmojis, ...gameEmojis];
    
    const shuffledCards = cardPairs
      .map((emoji, index) => ({
        id: index,
        value: emoji,
        emoji: emoji,
        flipped: false,
        matched: false,
      }))
      .sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimeRemaining(timeLimit);
    setGameOver(false);
    setProcessingMatch(false);
  };
  
  const handleCardClick = (cardId: number) => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    if (gameOver || processingMatch || flippedCards.length >= 2) return;
    
    const clickedCard = cards.find(card => card.id === cardId);
    
    if (!clickedCard || clickedCard.flipped || clickedCard.matched || flippedCards.includes(cardId)) return;
    
    // Flip the card
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === cardId ? { ...card, flipped: true } : card
      )
    );
    
    setFlippedCards(prev => [...prev, cardId]);
    playSound('flip');
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
        description: `You matched ${matchedPairs} out of ${gameEmojis.length} pairs.`,
      });
    }
    
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
          console.warn('Could not play audio:', err);
        });
      }
    } catch (error) {
      console.warn('Audio playback error:', error);
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const gameEmojis = emojis.slice(0, 6);
  
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
              <span className="font-medium">Pairs:</span> {matchedPairs}/{gameEmojis.length}
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
        />
        
        {/* Game grid */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {cards.map(card => (
            <div 
              key={card.id} 
              className={`aspect-square rounded-lg cursor-pointer transform transition-all duration-300 ${
                card.matched ? 'opacity-60' : ''
              } ${!gameStarted || gameOver || processingMatch ? 'pointer-events-none' : ''}`}
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
