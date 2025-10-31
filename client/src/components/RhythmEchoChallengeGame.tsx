import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { audioService } from "@/lib/audioService";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Button } from "@/components/ui/button";
import {Play, HelpCircle, Music2, Loader2, Star, Sparkles, Drum, ChevronLeft} from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";

interface RhythmPattern {
  beats: number[]; // Timestamps in ms relative to start
  totalDuration: number; // Total duration in ms
}

interface RhythmRound {
  pattern: RhythmPattern;
  difficulty: number; // 2-3 beats for beginner
}

interface GameState {
  currentRound: RhythmRound | null;
  score: number;
  totalQuestions: number;
  isPlaying: boolean;
  isRecording: boolean;
  feedback: {
    show: boolean;
    isCorrect: boolean;
  } | null;
}

const TOLERANCE_MS = 75; // Lenient tolerance as per spec
const NOTE_FREQUENCY = 440; // A4 note for rhythm taps
const NOTE_DURATION = 0.15; // Short tap sound

function generateRhythmPattern(difficulty: number): RhythmPattern {
  const beatCount = Math.floor(Math.random() * 2) + 2; // 2-3 beats
  const beats: number[] = [];
  
  // Generate simple rhythm patterns
  const patterns = [
    [0, 500, 1000], // Even beats
    [0, 400, 800], // Slightly faster
    [0, 600, 1200], // Slower
    [0, 300, 900], // Syncopated
    [0, 500], // Two beats
  ];
  
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  const actualBeats = selectedPattern.slice(0, beatCount);
  
  return {
    beats: actualBeats,
    totalDuration: Math.max(...actualBeats) + 500,
  };
}

function validateRhythmEcho(pattern: number[], userTaps: number[]): boolean {
  if (pattern.length !== userTaps.length) return false;

  // Empty patterns match
  if (pattern.length === 0) return true;

  // Normalize both patterns to start at 0
  const normalizedPattern = pattern.map(t => t - pattern[0]);
  const normalizedTaps = userTaps.map(t => t - userTaps[0]);

  // Check each tap is within tolerance
  for (let i = 0; i < normalizedPattern.length; i++) {
    const diff = Math.abs(normalizedPattern[i] - normalizedTaps[i]);
    if (diff > TOLERANCE_MS) return false;
  }

  return true;
}

export default function RhythmEchoChallengeGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentRound: null,
    score: 0,
    totalQuestions: 0,
    isPlaying: false,
    isRecording: false,
    feedback: null,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [isLoadingNextRound, setIsLoadingNextRound] = useState(false);
  const [userTaps, setUserTaps] = useState<number[]>([]);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [showVisualBeats, setShowVisualBeats] = useState<boolean[]>([]);

  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nextRoundTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      if (nextRoundTimeoutRef.current) clearTimeout(nextRoundTimeoutRef.current);
      if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
    };
  }, []);

  const playPattern = useCallback(async (pattern: RhythmPattern) => {
    setGameState(prev => ({ ...prev, isPlaying: true, feedback: null }));
    setShowVisualBeats([]);
    
    const startTime = Date.now();
    
    for (let i = 0; i < pattern.beats.length; i++) {
      const beatTime = pattern.beats[i];
      const delay = beatTime - (Date.now() - startTime);
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Show visual feedback
      setShowVisualBeats(prev => {
        const newBeats = [...prev];
        newBeats[i] = true;
        return newBeats;
      });
      
      await audioService.playNote(NOTE_FREQUENCY, NOTE_DURATION);
      
      // Hide visual feedback after a short time
      setTimeout(() => {
        setShowVisualBeats(prev => {
          const newBeats = [...prev];
          newBeats[i] = false;
          return newBeats;
        });
      }, 200);
    }
    
    setGameState(prev => ({ ...prev, isPlaying: false, isRecording: true }));
    setRecordingStartTime(Date.now());
    setUserTaps([]);
  }, []);

  const startNewRound = useCallback(async () => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (nextRoundTimeoutRef.current) {
      clearTimeout(nextRoundTimeoutRef.current);
      nextRoundTimeoutRef.current = null;
    }
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }

    const newRound: RhythmRound = {
      pattern: generateRhythmPattern(1),
      difficulty: 1,
    };
    
    setGameState(prev => ({
      ...prev,
      currentRound: newRound,
      feedback: null,
      isRecording: false,
    }));
    setUserTaps([]);
    setRecordingStartTime(null);
    
    autoPlayTimeoutRef.current = setTimeout(() => {
      playPattern(newRound.pattern);
      autoPlayTimeoutRef.current = null;
    }, 500);
  }, [playPattern]);

  const handleTap = useCallback(() => {
    if (!gameState.isRecording || !recordingStartTime || !gameState.currentRound) return;
    
    const tapTime = Date.now() - recordingStartTime;
    const newTaps = [...userTaps, tapTime];
    setUserTaps(newTaps);
    
    // Play tap sound
    audioService.playNote(NOTE_FREQUENCY, NOTE_DURATION);
    
    // Check if we have enough taps
    if (newTaps.length === gameState.currentRound.pattern.beats.length) {
      // Validate the rhythm
      const isCorrect = validateRhythmEcho(gameState.currentRound.pattern.beats, newTaps);
      
      setGameState(prev => ({
        ...prev,
        isRecording: false,
        score: isCorrect ? prev.score + 1 : prev.score,
        totalQuestions: prev.totalQuestions + 1,
        feedback: {
          show: true,
          isCorrect,
        },
      }));
      
      if (isCorrect) {
        audioService.playSuccessTone();
      } else {
        audioService.playErrorTone();
      }
      
      nextRoundTimeoutRef.current = setTimeout(() => {
        setIsLoadingNextRound(true);
        loadingTimeoutRef.current = setTimeout(() => {
          setIsLoadingNextRound(false);
          startNewRound();
          loadingTimeoutRef.current = null;
        }, 500);
        nextRoundTimeoutRef.current = null;
      }, 2000);
    }
  }, [gameState.isRecording, gameState.currentRound, recordingStartTime, userTaps, startNewRound]);

  const handleStartGame = async () => {
    await audioService.initialize();
    setGameStarted(true);
    startNewRound();
  };

  const handleReplay = () => {
    if (gameState.currentRound && !gameState.isPlaying && !gameState.isRecording) {
      playPattern(gameState.currentRound.pattern);
    }
  };

  const decorativeOrbs = generateDecorativeOrbs();

  if (!gameStarted) {
    return (
      <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
        <button
          onClick={() => setLocation("/")}
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
              Rhythm Echo Challenge
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Listen to the rhythm and tap it back!
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-purple-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎵</span>
                <span>Listen carefully to the rhythm pattern</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">👆</span>
                <span>Tap the screen to echo the rhythm</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">⏱️</span>
                <span>Try to match the timing as closely as possible!</span>
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

  return (
    <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col p-4 relative overflow-hidden`}>
      {decorativeOrbs.map((orb) => (
        <div key={orb.key} className={orb.className} />
      ))}

      <div className="flex-1 flex flex-col items-center justify-center z-10 max-w-4xl mx-auto w-full">
        <ScoreDisplay score={gameState.score} total={gameState.totalQuestions} />

        <div className="mt-8 mb-12 flex justify-center">
          <div className={`relative ${playfulAnimations.transitions.normal}`}>
            <Drum
              className={`w-32 h-32 ${
                gameState.isPlaying ? 'text-purple-600 animate-pulse' :
                gameState.feedback?.isCorrect === true ? 'text-green-600' :
                gameState.feedback?.isCorrect === false ? 'text-red-600' :
                'text-purple-500'
              }`}
            />
            {gameState.feedback?.isCorrect === true && (
              <Star className="absolute -top-4 -right-4 w-12 h-12 text-yellow-500 animate-bounce" />
            )}
          </div>
        </div>

        {gameState.currentRound && (
          <div className="space-y-6 w-full">
            <div className="flex justify-center gap-4 mb-8">
              {gameState.currentRound.pattern.beats.map((_, index) => (
                <div
                  key={index}
                  className={`w-16 h-16 rounded-full transition-all duration-200 border-4 border-purple-500 ${
                    showVisualBeats[index] ? 'scale-125 bg-purple-500' : 'scale-100 bg-white dark:bg-gray-800'
                  }`}
                />
              ))}
            </div>

            {gameState.isRecording && (
              <div className="text-center mb-6">
                <p className={`${playfulTypography.body.large} text-gray-800 dark:text-gray-200`}>
                  Tap {gameState.currentRound.pattern.beats.length - userTaps.length} more time{gameState.currentRound.pattern.beats.length - userTaps.length !== 1 ? 's' : ''}!
                </p>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <Button
                onClick={handleTap}
                disabled={!gameState.isRecording || isLoadingNextRound}
                size="lg"
                className={`${playfulComponents.button.primary} text-3xl px-16 py-12 disabled:opacity-50`}
              >
                {isLoadingNextRound ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <span>TAP!</span>
                )}
              </Button>

              <Button
                onClick={handleReplay}
                disabled={gameState.isPlaying || gameState.isRecording || isLoadingNextRound}
                size="lg"
                variant="outline"
                className={`px-8 py-12 ${playfulShapes.rounded.button}`}
              >
                <Play className="w-6 h-6" />
              </Button>
            </div>

            {gameState.feedback?.show && (
              <div className={`text-center p-6 ${playfulShapes.rounded.container} ${
                gameState.feedback.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
              }`}>
                <p className={`${playfulTypography.headings.h3}`}>
                  {gameState.feedback.isCorrect ? (
                    <>
                      <Star className="inline w-8 h-8 mr-2 text-yellow-500" />
                      Perfect rhythm!
                      <Sparkles className="inline w-8 h-8 ml-2 text-yellow-500" />
                    </>
                  ) : (
                    <>Try again! Listen carefully to the timing.</>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

