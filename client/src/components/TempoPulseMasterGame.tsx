import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Play, Pause, RotateCcw, Clock, Volume2, HelpCircle, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, Heart, Star, Zap
} from 'lucide-react';
import {
  RHYTHM_MODES,
  SUBDIVISION_PATTERNS,
  TEMPO_MARKINGS,
  type GameMode
} from '@/lib/gameLogic/rhythm-002Modes';
import { Rhythm002Logic, type GameRound, type Rhythm002State } from '@/lib/gameLogic/rhythm-002Logic';
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations } from '@/theme/playful';
import { useAudioService } from '@/hooks/useAudioService';
import { useGameCleanup } from '@/hooks/useGameCleanup';
import AudioErrorFallback from '@/components/AudioErrorFallback';

interface TempoPulseMasterGameProps {
  onGameComplete?: (score: number, totalPossible: number) => void;
  onBack?: () => void;
}

const TempoPulseMasterGame: React.FC<TempoPulseMasterGameProps> = ({ onGameComplete, onBack }) => {
  const [gameState, setGameState] = useState<Rhythm002State | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [roundStartTime, setRoundStartTime] = useState<number>(Date.now());
  const metronomeIntervalRef = useRef<number | null>(null);

  // Use audio service and cleanup hooks
  const { audio, isReady, error, initialize } = useAudioService();
  const { setTimeout: setGameTimeout, setInterval: setGameInterval } = useGameCleanup();

  // Handle audio errors
  if (error) {
    return <AudioErrorFallback error={error} onRetry={initialize} />;
  }

  // Initialize audio context
  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(ctx);
    return () => {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
      }
      ctx.close();
    };
  }, []);

  // Start game with selected mode
  const startGame = useCallback((mode: GameMode) => {
    setSelectedMode(mode);
    const newState = Rhythm002Logic.initializeGameState(mode, mode.maxRounds);
    setGameState(newState);
    const firstRound = Rhythm002Logic.getNextRound(newState);
    setCurrentRound(firstRound);
    setRoundStartTime(Date.now());
    setTimeRemaining(30);
  }, []);

  // Play metronome click
  const playClick = useCallback((frequency: number = 1000, duration: number = 0.05) => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.001);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration + 0.01);
  }, [audioContext]);

  // Play tempo pattern
  const playTempoPattern = useCallback(async (tempo: number, duration: number = 4) => {
    if (!audioContext) return;
    setIsPlaying(true);

    const beatDuration = 60000 / tempo;
    const totalBeats = Math.floor((duration * 1000) / beatDuration);

    for (let i = 0; i < totalBeats; i++) {
      playClick();
      await new Promise(resolve => setGameTimeout(resolve, beatDuration));
    }

    setIsPlaying(false);
  }, [audioContext, playClick, setGameTimeout]);

  // Play tempo change pattern
  const playTempoChangePattern = useCallback(async (startTempo: number, endTempo: number) => {
    if (!audioContext || !currentRound?.audioData?.tempoSequence) return;
    setIsPlaying(true);

    const { tempoSequence } = currentRound.audioData;

    for (const tempo of tempoSequence) {
      playClick();
      const beatDuration = 60000 / tempo;
      await new Promise(resolve => setGameTimeout(resolve, beatDuration));
    }

    setIsPlaying(false);
  }, [audioContext, currentRound, playClick, setGameTimeout]);

  // Play subdivision pattern
  const playSubdivisionPattern = useCallback(async (subdivisionType: string, tempo: number = 120) => {
    if (!audioContext) return;
    setIsPlaying(true);

    const pattern = SUBDIVISION_PATTERNS[subdivisionType as keyof typeof SUBDIVISION_PATTERNS];
    if (!pattern) {
      setIsPlaying(false);
      return;
    }

    const beatDuration = 60000 / tempo;
    const noteDuration = beatDuration / pattern.divisionsPerBeat;
    const totalNotes = 4 * pattern.divisionsPerBeat; // 4 beats

    for (let i = 0; i < totalNotes; i++) {
      const isDownbeat = i % pattern.divisionsPerBeat === 0;
      playClick(isDownbeat ? 1200 : 800, 0.03);
      await new Promise(resolve => setGameTimeout(resolve, noteDuration));
    }

    setIsPlaying(false);
  }, [audioContext, playClick, setGameTimeout]);

  // Play audio for current round
  const playRoundAudio = useCallback(() => {
    if (!currentRound) return;

    switch (currentRound.mode) {
      case 'tempo-changes':
        if (currentRound.questionType === 'identify-tempo' && currentRound.startTempo) {
          playTempoPattern(currentRound.startTempo);
        } else if (currentRound.questionType === 'identify-change' && currentRound.startTempo && currentRound.endTempo) {
          playTempoChangePattern(currentRound.startTempo, currentRound.endTempo);
        } else if (currentRound.questionType === 'compare-tempos' && currentRound.audioData) {
          const { tempo1, tempo2 } = currentRound.audioData;
          playTempoPattern(tempo1, 2).then(() => {
            setGameTimeout(() => playTempoPattern(tempo2, 2), 500);
          });
        }
        break;

      case 'pulse-subdivisions':
        if (currentRound.subdivisionType) {
          playSubdivisionPattern(currentRound.subdivisionType);
        }
        break;

      case 'analysis':
        // Play rhythm pattern for analysis
        if (currentRound.patternData) {
          playTempoPattern(120, 4);
        }
        break;
    }
  }, [currentRound, playTempoPattern, playTempoChangePattern, playSubdivisionPattern]);

  // Handle answer submission
  const submitAnswer = useCallback(() => {
    if (!currentRound || !gameState || !selectedAnswer) return;

    const timeSpent = Date.now() - roundStartTime;
    const updatedState = Rhythm002Logic.processAnswer(
      { ...gameState, currentRoundData: currentRound },
      selectedAnswer,
      timeSpent
    );

    const isCorrect = Rhythm002Logic.validateAnswer(
      selectedAnswer,
      currentRound.answer,
      currentRound
    );

    const message = Rhythm002Logic.provideFeedback(isCorrect, currentRound, timeSpent);

    setFeedback({
      correct: isCorrect,
      message
    });

    setGameState(updatedState);

    // Check game end
    setGameTimeout(() => {
      if (updatedState.gameStatus === 'completed') {
        if (onGameComplete) {
          onGameComplete(updatedState.score, updatedState.totalRounds * 100);
        }
      } else if (updatedState.gameStatus === 'failed') {
        if (onGameComplete) {
          onGameComplete(updatedState.score, updatedState.totalRounds * 100);
        }
      } else {
        // Next round
        const nextRound = Rhythm002Logic.getNextRound(updatedState);
        setCurrentRound(nextRound);
        setSelectedAnswer('');
        setFeedback(null);
        setShowHint(false);
        setTimeRemaining(30);
        setRoundStartTime(Date.now());
      }
    }, 2000);
  }, [currentRound, gameState, selectedAnswer, roundStartTime, onGameComplete, setGameTimeout]);

  // Timer effect
  useEffect(() => {
    if (!currentRound || feedback || timeRemaining <= 0) return;

    const timer = setGameInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRound, feedback, timeRemaining, setGameInterval]);

  // Auto-submit on timeout
  useEffect(() => {
    if (timeRemaining === 0 && currentRound && !feedback) {
      submitAnswer();
    }
  }, [timeRemaining, currentRound, feedback, submitAnswer]);

  // Mode selection screen
  if (!selectedMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 p-8">
        <div className="max-w-6xl mx-auto">
          {onBack && (
            <button
              onClick={onBack}
              className={`${playfulComponents.button.secondary} mb-8 flex items-center gap-2 px-4 py-2 rounded-full`}
            >
              <ChevronLeft size={20} />
              Back
            </button>
          )}

          <div className="text-center mb-12">
            <h1 className={`${playfulTypography.headings.h1} mb-4 ${playfulColors.gradients.title}`}>
              Tempo & Pulse Master
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-600`}>
              Master tempo recognition and rhythmic subdivisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RHYTHM_MODES.map((mode) => (
              <div
                key={mode.id}
                onClick={() => startGame(mode)}
                className={`
                  ${playfulComponents.card.base}
                  cursor-pointer p-6
                  transform transition-all duration-300 hover:scale-105 hover:shadow-2xl
                  bg-white border-4 border-transparent hover:border-orange-400
                `}
              >
                <div className="text-6xl mb-4">{mode.icon}</div>
                <h3 className={`${playfulTypography.headings.h3} mb-3`}>
                  {mode.name}
                </h3>
                <p className={`${playfulTypography.body.medium} text-gray-600 mb-4`}>
                  {mode.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={`${mode.color} text-white`}>{mode.difficulty}</Badge>
                  <Badge variant="outline">{mode.ageRange}</Badge>
                  <Badge variant="outline">{mode.maxRounds} rounds</Badge>
                </div>
                <p className={`${playfulTypography.body.small} text-gray-500`}>
                  {mode.instructions}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  if (!currentRound || !gameState) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              setSelectedMode(null);
              setGameState(null);
              setCurrentRound(null);
            }}
            className={`${playfulComponents.button.secondary} flex items-center gap-2 px-4 py-2 rounded-full`}
          >
            <ChevronLeft size={20} />
            Change Mode
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {Array.from({ length: gameState.lives }, (_, i) => (
                <Heart key={i} className="w-6 h-6 fill-red-500 text-red-500" />
              ))}
            </div>
            <div className={`${playfulComponents.badge.base} ${playfulComponents.badge.purple} text-xl px-6 py-2`}>
              <Star className="w-5 h-5 inline mr-2" />
              {gameState.score}
            </div>
          </div>
        </div>

        {/* Progress */}
        <Card className={playfulComponents.card.base}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className={`${playfulTypography.body.medium} font-semibold`}>
                Round {gameState.currentRound + 1} / {gameState.totalRounds}
              </span>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className={`${playfulTypography.body.medium} font-bold text-orange-600`}>
                  {timeRemaining}s
                </span>
              </div>
            </div>
            <Progress
              value={(gameState.currentRound / gameState.totalRounds) * 100}
              className="h-3 bg-gray-200"
            />
            {gameState.streak > 0 && (
              <div className="mt-2 flex items-center gap-2 text-orange-600">
                <Zap className="w-4 h-4" />
                <span className={playfulTypography.body.small}>
                  {gameState.streak} streak!
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className={`${playfulComponents.card.base} mt-6`}>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <Badge className={`${selectedMode.color} text-white mb-4 text-lg px-6 py-2`}>
                {selectedMode.name}
              </Badge>
              <h2 className={`${playfulTypography.headings.h3} mb-4`}>
                {currentRound.question}
              </h2>

              <div className="flex justify-center gap-4 mb-6">
                <Button
                  onClick={playRoundAudio}
                  disabled={isPlaying}
                  className={`${playfulComponents.button.primary} flex items-center gap-2`}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  {isPlaying ? 'Playing...' : 'Play Audio'}
                </Button>

                <Button
                  onClick={() => setShowHint(!showHint)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <HelpCircle size={20} />
                  Hint
                </Button>
              </div>

              {showHint && currentRound.hint && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
                  <p className={`${playfulTypography.body.medium} text-yellow-900`}>
                    💡 {currentRound.hint}
                  </p>
                </div>
              )}
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-4">
              {currentRound.options?.map((option) => (
                <button
                  key={option}
                  onClick={() => setSelectedAnswer(option)}
                  disabled={!!feedback}
                  className={`
                    p-6 text-lg font-semibold rounded-xl border-4 transition-all
                    ${selectedAnswer === option
                      ? 'bg-blue-500 text-white border-blue-600 shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:shadow-md'
                    }
                    ${feedback && option === currentRound.answer
                      ? 'bg-green-500 text-white border-green-600'
                      : ''
                    }
                    ${feedback && selectedAnswer === option && option !== currentRound.answer
                      ? 'bg-red-500 text-white border-red-600'
                      : ''
                    }
                  `}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`
                mt-6 p-6 rounded-xl border-4
                ${feedback.correct
                  ? 'bg-green-50 border-green-400'
                  : 'bg-red-50 border-red-400'
                }
              `}>
                <div className="flex items-center justify-center gap-3">
                  {feedback.correct ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600" />
                  )}
                  <p className={`${playfulTypography.body.large} font-semibold ${
                    feedback.correct ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {feedback.message}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {!feedback && (
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={submitAnswer}
                  disabled={!selectedAnswer}
                  className={`${playfulComponents.button.primary} text-xl px-12 py-6`}
                >
                  Submit Answer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Game Info */}
        <Card className={`${playfulComponents.card.base} mt-6`}>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className={`${playfulTypography.body.small} text-gray-600 mb-1`}>Difficulty</p>
                <p className={`${playfulTypography.body.large} font-bold text-purple-600`}>
                  Level {gameState.difficulty}
                </p>
              </div>
              <div>
                <p className={`${playfulTypography.body.small} text-gray-600 mb-1`}>Accuracy</p>
                <p className={`${playfulTypography.body.large} font-bold text-blue-600`}>
                  {gameState.currentRound > 0
                    ? Math.round((gameState.answers.filter(a => a.isCorrect).length / gameState.currentRound) * 100)
                    : 0}%
                </p>
              </div>
              <div>
                <p className={`${playfulTypography.body.small} text-gray-600 mb-1`}>Best Streak</p>
                <p className={`${playfulTypography.body.large} font-bold text-orange-600`}>
                  {Math.max(gameState.streak, ...gameState.answers.map((_, i) => {
                    let streak = 0;
                    for (let j = i; j >= 0 && gameState.answers[j].isCorrect; j--) streak++;
                    return streak;
                  }))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TempoPulseMasterGame;
