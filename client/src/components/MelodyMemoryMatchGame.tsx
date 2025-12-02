import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Music, Loader2, Star, Sparkles, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";

interface Card {
  id: number;
  melodyId: number;
  melody: number[]; // Array of frequencies
  isFlipped: boolean;
  isMatched: boolean;
}

interface GameState {
  cards: Card[];
  flippedCards: number[];
  matchedPairs: number;
  score: number;
  isPlaying: boolean;
}

const MELODIES = [
  [262, 294, 330, 349], // C D E F
  [392, 440, 494, 523], // G A B C
  [330, 349, 392, 440], // E F G A
  [440, 392, 349, 330], // A G F E (descending)
];

function createDeck(): Card[] {
  const cards: Card[] = [];
  let id = 0;
  
  // Create pairs of cards
  MELODIES.forEach((melody, melodyId) => {
    // Add two cards with the same melody
    cards.push({
      id: id++,
      melodyId,
      melody,
      isFlipped: false,
      isMatched: false,
    });
    cards.push({
      id: id++,
      melodyId,
      melody,
      isFlipped: false,
      isMatched: false,
    });
  });
  
  // Shuffle the deck
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  
  return cards;
}

async function playMelody(melody: number[]): Promise<void> {
  for (const freq of melody) {
    await audioService.playNote(freq, 0.3);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export default function MelodyMemoryMatchGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    cards: createDeck(),
    flippedCards: [],
    matchedPairs: 0,
    score: 0,
    isPlaying: false,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [isCheckingMatch, setIsCheckingMatch] = useState(false);
  
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, []);

  const handleCardClick = useCallback(async (cardId: number) => {
    if (gameState.isPlaying || isCheckingMatch) return;
    
    const card = gameState.cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    
    // If already have 2 cards flipped, ignore
    if (gameState.flippedCards.length >= 2) return;
    
    // Flip the card and play its melody
    setGameState(prev => ({
      ...prev,
      cards: prev.cards.map(c => 
        c.id === cardId ? { ...c, isFlipped: true } : c
      ),
      flippedCards: [...prev.flippedCards, cardId],
      isPlaying: true,
    }));
    
    await playMelody(card.melody);
    
    setGameState(prev => ({ ...prev, isPlaying: false }));
    
    // Check if we now have 2 cards flipped
    const newFlippedCards = [...gameState.flippedCards, cardId];
    if (newFlippedCards.length === 2) {
      setIsCheckingMatch(true);
      
      const card1 = gameState.cards.find(c => c.id === newFlippedCards[0]);
      const card2 = gameState.cards.find(c => c.id === newFlippedCards[1]);
      
      if (card1 && card2 && card1.melodyId === card2.melodyId) {
        // Match found!
        await audioService.playSuccessTone();
        
        setGameState(prev => ({
          ...prev,
          cards: prev.cards.map(c => 
            newFlippedCards.includes(c.id) ? { ...c, isMatched: true } : c
          ),
          flippedCards: [],
          matchedPairs: prev.matchedPairs + 1,
          score: prev.score + 1,
        }));
        setIsCheckingMatch(false);
      } else {
        // No match - flip cards back after delay
        await audioService.playErrorTone();
        
        checkTimeoutRef.current = setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            cards: prev.cards.map(c => 
              newFlippedCards.includes(c.id) && !c.isMatched 
                ? { ...c, isFlipped: false } 
                : c
            ),
            flippedCards: [],
          }));
          setIsCheckingMatch(false);
          checkTimeoutRef.current = null;
        }, 1000);
      }
    }
  }, [gameState, isCheckingMatch]);

  const handleStartGame = async () => {
    await audioService.initialize();
    setGameStarted(true);
  };

  const handleNewGame = () => {
    setGameState({
      cards: createDeck(),
      flippedCards: [],
      matchedPairs: 0,
      score: 0,
      isPlaying: false,
    });
    setIsCheckingMatch(false);
  };

  const decorativeOrbs = generateDecorativeOrbs();

  if (!gameStarted) {
    return (
      <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
        <button
          onClick={() => setLocation("/games")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft size={24} />
          Main Menu
        </button>

        {decorativeOrbs.map((orb) => (
          <div key={orb.key} className={orb.className} />
        ))}
        
        <div className="text-center space-y-8 z-10 max-w-2xl">
          <div className="space-y-4">
            <h1 className={`${playfulTypography.headings.hero} ${playfulColors.gradients.title}`}>
              Melody Memory Match
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Flip cards to hear melodies and match identical pairs!
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-green-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎵</span>
                <span>Tap a card to flip it and hear its melody</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎯</span>
                <span>Find two cards with the same melody</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">⭐</span>
                <span>Match all 4 pairs to win!</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleStartGame}
            size="lg"
            className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
          >
            <Play className="w-8 h-8 mr-3" />
            Start Playing!
          </Button>
        </div>
      </div>
    );
  }

  const allMatched = gameState.matchedPairs === MELODIES.length;

  return (
    <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col p-4 relative overflow-hidden`}>
      {decorativeOrbs.map((orb) => (
        <div key={orb.key} className={orb.className} />
      ))}
      
      <div className="flex-1 flex flex-col items-center justify-center z-10 max-w-4xl mx-auto w-full">
        <ScoreDisplay score={gameState.score} total={MELODIES.length} />

        <div className="mt-8 mb-8 flex justify-center">
          <div className={`relative ${playfulAnimations.transitions.normal}`}>
            <Music 
              className={`w-32 h-32 ${
                allMatched ? 'text-green-600 animate-bounce' : 'text-green-500'
              }`}
            />
            {allMatched && (
              <Star className="absolute -top-4 -right-4 w-12 h-12 text-yellow-500 animate-bounce" />
            )}
          </div>
        </div>

        {allMatched ? (
          <div className="text-center space-y-6">
            <h2 className={`${playfulTypography.headings.h1} text-green-600`}>
              <Sparkles className="inline w-12 h-12 mr-2" />
              You Won!
              <Sparkles className="inline w-12 h-12 ml-2" />
            </h2>
            <Button
              onClick={handleNewGame}
              size="lg"
              className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
            >
              Play Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 w-full max-w-3xl">
            {gameState.cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isMatched || card.isFlipped || gameState.isPlaying || isCheckingMatch}
                className={`
                  aspect-square ${playfulShapes.rounded.card} ${playfulShapes.shadows.card}
                  transition-all duration-300 transform
                  ${card.isFlipped || card.isMatched 
                    ? 'bg-green-100 dark:bg-green-900 scale-105' 
                    : 'bg-white dark:bg-gray-800 hover:scale-105'
                  }
                  ${card.isMatched ? 'opacity-75' : ''}
                  disabled:cursor-not-allowed
                  flex items-center justify-center
                  border-4 ${card.isMatched ? 'border-green-500' : 'border-gray-300'}
                `}
              >
                {card.isFlipped || card.isMatched ? (
                  <Music className={`w-12 h-12 ${card.isMatched ? 'text-green-600' : 'text-green-500'}`} />
                ) : (
                  <div className="text-4xl">?</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

