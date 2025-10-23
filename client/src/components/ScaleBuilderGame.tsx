import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Clock, Volume2, HelpCircle, CheckCircle, XCircle } from 'lucide-react';
import { 
  THEORY_MODES, 
  getScaleById, 
  getScaleFrequencies,
  getNoteFrequency,
  type GameMode 
} from '@/lib/gameLogic/theory-002Modes';
import { Theory002Logic, type GameRound, type Theory002State } from '@/lib/gameLogic/theory-002Logic';
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations } from '@/theme/playful';

interface ScaleBuilderGameProps {
  onGameComplete?: (score: number, totalPossible: number) => void;
  onBack?: () => void;
}

const ScaleBuilderGame: React.FC<ScaleBuilderGameProps> = ({ onGameComplete, onBack }) => {
  const [gameState, setGameState] = useState<Theory002State | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [userAnswerArray, setUserAnswerArray] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(ctx);
    return () => {
      ctx.close();
    };
  }, []);

  // Start game with selected mode
  const startGame = useCallback((mode: GameMode) => {
    setSelectedMode(mode);
    const newState = Theory002Logic.initializeState(mode);
    setGameState(newState);
    generateNextRound(newState);
  }, []);

  // Generate next round
  const generateNextRound = useCallback((state: Theory002State) => {
    const round = Theory002Logic.generateRound(
      state.currentMode,
      state.difficulty,
      state.currentRound,
      state.totalRounds
    );
    setCurrentRound(round);
    setTimeRemaining(60); // Default time limit
    setUserAnswer('');
    setUserAnswerArray([]);
    setShowHint(false);
    setFeedback(null);
  }, []);

  // Play scale audio
  const playScale = useCallback(async (scaleId?: string) => {
    if (!audioContext) return;
    
    const scaleKey = scaleId || currentRound?.scale;
    if (!scaleKey) return;
    
    const scale = getScaleById(scaleKey);
    if (!scale) return;
    
    setIsPlaying(true);
    
    try {
      const frequencies = getScaleFrequencies(scaleKey);
      
      for (const freq of frequencies) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    } catch (error) {
      console.error('Error playing scale:', error);
    } finally {
      setIsPlaying(false);
    }
  }, [audioContext, currentRound]);

  // Play individual note
  const playNote = useCallback(async (note: string) => {
    if (!audioContext) return;
    
    const frequency = getNoteFrequency(note);
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }, [audioContext]);

  // Handle answer submission
  const submitAnswer = useCallback(() => {
    if (!currentRound || !gameState) return;
    
    let isCorrect = false;
    
    switch (currentRound.questionType) {
      case 'identify':
        isCorrect = Theory002Logic.validateAnswer(currentRound, userAnswer);
        break;
      case 'build':
        isCorrect = Theory002Logic.validateAnswer(currentRound, userAnswerArray);
        break;
      case 'complete':
        isCorrect = Theory002Logic.validateAnswer(currentRound, userAnswerArray);
        break;
    }
    
    const points = isCorrect ? currentRound.difficulty * 10 : 0;
    const newScore = gameState.score + points;
    const newLives = isCorrect ? gameState.lives : gameState.lives - 1;
    const newStreak = isCorrect ? gameState.consecutiveCorrect + 1 : 0;
    
    setFeedback({
      correct: isCorrect,
      message: isCorrect ? 'Correct! Well done!' : 'Incorrect. Try again!'
    });
    
    // Update game state
    const updatedState = {
      ...gameState,
      score: newScore,
      lives: newLives,
      consecutiveCorrect: newStreak,
      currentRound: gameState.currentRound + 1,
      answers: [...gameState.answers, {
        roundId: currentRound.id,
        userAnswer: currentRound.questionType === 'identify' ? userAnswer : userAnswerArray.join(','),
        correctAnswer: currentRound.answer,
        isCorrect,
        timeSpent: 60 - timeRemaining
      }]
    };
    
    setGameState(updatedState);
    
    // Check game end
    setTimeout(() => {
      const gameResult = Theory002Logic.checkGameEnd(updatedState);
      if (gameResult !== 'continue') {
        if (onGameComplete) {
          onGameComplete(newScore, updatedState.totalRounds * 30); // Max possible score
        }
      } else {
        generateNextRound(updatedState);
      }
    }, 2000);
  }, [currentRound, gameState, userAnswer, userAnswerArray, timeRemaining, onGameComplete, generateNextRound]);

  // Timer effect
  useEffect(() => {
    if (!currentRound || timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          submitAnswer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentRound, timeRemaining, submitAnswer]);

  // Mode selection screen
  if (!selectedMode) {
    return (
      <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-4xl">
        <div className="text-center space-y-4">
          <h2 className={`${playfulTypography.headings.h2} text-gray-800 dark:text-gray-200`}>
            Scale Builder
          </h2>
          <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
            Master scale identification and construction
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-3xl">
          {THEORY_MODES.map((mode, index) => (
            <div
              key={mode.id}
              className={`${playfulComponents.card.base} ${playfulComponents.card.available} ${playfulComponents.card.hover} cursor-pointer`}
              style={{ animationDelay: `${index * 150}ms` }}
              onClick={() => startGame(mode)}
            >
              <CardContent className="p-8 text-center space-y-6">
                <div className={`${playfulComponents.iconContainer.large} ${mode.color.replace('bg-', '').replace('-500', '/30')} mb-4`}>
                  <span className="text-5xl">{mode.icon}</span>
                </div>
                <h3 className={`${playfulTypography.headings.h4} text-gray-800 dark:text-gray-200`}>
                  {mode.name}
                </h3>
                <p className={`${playfulTypography.body.small} text-gray-600 dark:text-gray-400`}>
                  {mode.description}
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  <span className={playfulComponents.badge.purple}>
                    {mode.ageRange}
                  </span>
                  <span className={playfulComponents.badge.orange}>
                    {mode.difficulty}
                  </span>
                </div>
                <p className={`${playfulTypography.body.small} text-gray-500 dark:text-gray-500 italic`}>
                  {mode.instructions}
                </p>
                <Button 
                  onClick={() => startGame(mode)}
                  className={`${playfulComponents.button.success} w-full transform ${playfulAnimations.hover.scale}`}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start {mode.name}
                </Button>
              </CardContent>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Game screen
  if (!currentRound || !gameState) {
    return <div>Loading...</div>;
  }

  const scale = getScaleById(currentRound.scale || '');
  const progress = (gameState.currentRound / gameState.totalRounds) * 100;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl space-y-6">
      {/* Header */}
      <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} ${playfulShapes.shadows.card} p-6 w-full`}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className={`${playfulTypography.headings.h3} text-gray-800 dark:text-gray-200`}>
              {selectedMode.name}
            </h2>
            <p className={`${playfulTypography.body.small} text-gray-600 dark:text-gray-400`}>
              Round {gameState.currentRound + 1} of {gameState.totalRounds}
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className={`${playfulTypography.body.small} text-gray-500`}>Score</p>
              <p className={`${playfulTypography.headings.h4} ${playfulColors.status.success}`}>
                {gameState.score}
              </p>
            </div>
            <div className="text-center">
              <p className={`${playfulTypography.body.small} text-gray-500`}>Lives</p>
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full ${
                      i < gameState.lives ? 'bg-red-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-center">
              <p className={`${playfulTypography.body.small} text-gray-500`}>Time</p>
              <p className={`${playfulTypography.headings.h4} ${playfulColors.status.warning} flex items-center gap-1`}>
                <Clock className="w-4 h-4" />
                {timeRemaining}s
              </p>
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Question */}
      <Card className="mb-6 w-full">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{currentRound.question}</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => playScale()}
                  disabled={isPlaying}
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  {isPlaying ? 'Playing...' : 'Play Scale'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Hint
                </Button>
              </div>
            </div>

            {showHint && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">{Theory002Logic.getHint(currentRound)}</p>
              </div>
            )}

            {/* Question Type Specific UI */}
            {currentRound.questionType === 'identify' && currentRound.options && (
              <div className="grid grid-cols-2 gap-3">
                {currentRound.options.map(option => (
                  <Button
                    key={option}
                    variant={userAnswer === option ? "default" : "outline"}
                    onClick={() => setUserAnswer(option)}
                    className="p-4 h-auto text-left"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}

            {currentRound.questionType === 'build' && scale && (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Arrange the notes in the correct order:</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {scale.notes.sort(() => Math.random() - 0.5).map(note => (
                      <Button
                        key={note}
                        variant="outline"
                        size="sm"
                        onClick={() => playNote(note)}
                        className="p-2"
                      >
                        {note}
                      </Button>
                    ))}
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[60px]">
                    <p className="text-sm text-gray-500 mb-2">Your answer (click notes to add them in order):</p>
                    <div className="flex flex-wrap gap-2">
                      {userAnswerArray.map((note, index) => (
                        <Button
                          key={index}
                          variant="default"
                          size="sm"
                          onClick={() => {
                            const newArray = userAnswerArray.filter((_, i) => i !== index);
                            setUserAnswerArray(newArray);
                          }}
                        >
                          {note} ×
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {scale.notes.map(note => (
                    <Button
                      key={note}
                      variant="outline"
                      onClick={() => {
                        if (!userAnswerArray.includes(note)) {
                          setUserAnswerArray([...userAnswerArray, note]);
                        }
                      }}
                      disabled={userAnswerArray.includes(note)}
                    >
                      {note}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {currentRound.questionType === 'complete' && scale && currentRound.blanks && (
              <div>
                <p className="text-sm text-gray-600 mb-4">Fill in the missing notes:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {scale.notes.map((note, index) => (
                    <div key={index}>
                      {currentRound.blanks!.includes(index) ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            const newArray = [...userAnswerArray];
                            newArray[index] = note;
                            setUserAnswerArray(newArray);
                          }}
                          className="min-w-[60px]"
                        >
                          {userAnswerArray[index] || '?'}
                        </Button>
                      ) : (
                        <Button variant="secondary" disabled className="min-w-[60px]">
                          {note}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div className={`mt-4 p-3 rounded-lg ${
                feedback.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {feedback.correct ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={feedback.correct ? 'text-green-800' : 'text-red-800'}>
                    {feedback.message}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-6 flex justify-center">
              <Button
                onClick={submitAnswer}
                disabled={
                  (currentRound.questionType === 'identify' && !userAnswer) ||
                  (currentRound.questionType === 'build' && userAnswerArray.length === 0) ||
                  (currentRound.questionType === 'complete' && userAnswerArray.filter(n => n).length !== currentRound.blanks!.length)
                }
                size="lg"
              >
                Submit Answer
              </Button>
            </div>
          </CardContent>
        </Card>
    </div>
  );
};

export default ScaleBuilderGame;