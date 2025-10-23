import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Trophy, Target, Zap } from 'lucide-react';
import { 
  Pitch001Game, 
  Pitch001Round, 
  Pitch001GameState, 
  createPitch001Game,
  getPitch001ModeConfig 
} from '@/lib/gameLogic/pitch-001Logic';
import { pitch001Modes } from '@/lib/gameLogic/pitch-001Modes';

interface PitchIntervalMasterGameProps {
  modeId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  onGameComplete: (score: number, totalRounds: number) => void;
  onBackToMenu: () => void;
}

export const PitchIntervalMasterGame: React.FC<PitchIntervalMasterGameProps> = ({
  modeId,
  difficulty,
  onGameComplete,
  onBackToMenu
}) => {
  const [game, setGame] = useState<Pitch001Game | null>(null);
  const [gameState, setGameState] = useState<Pitch001GameState>({
    currentRound: null,
    score: 0,
    roundNumber: 0,
    totalRounds: 10,
    isPlaying: false,
    selectedAnswer: null,
    showResult: false,
    isCorrect: false,
    streak: 0,
    bestStreak: 0
  });
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const modeConfig = getPitch001ModeConfig(modeId);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
      return () => {
        ctx.close();
      };
    }
  }, []);

  useEffect(() => {
    if (modeId && difficulty) {
      const newGame = createPitch001Game(modeId, difficulty);
      setGame(newGame);
    }
  }, [modeId, difficulty]);

  const playAudio = useCallback(async (audioData: any) => {
    if (!audioContext || isMuted) return;

    try {
      setIsPlaying(true);
      
      switch (audioData.type) {
        case 'two-notes':
        case 'interval':
        case 'reference-and-target':
          await playTwoNotes(audioData.frequencies, audioData.duration);
          break;
        case 'pitch-bend':
          await playPitchBend(audioData.frequencies[0], audioData.parameters);
          break;
        case 'vibrato':
          await playVibrato(audioData.frequencies[0], audioData.parameters);
          break;
        case 'glissando':
          await playGlissando(audioData.frequencies, audioData.parameters);
          break;
        case 'portamento':
          await playPortamento(audioData.frequencies, audioData.parameters);
          break;
        case 'envelope':
          await playEnvelope(audioData.frequencies[0], audioData.parameters);
          break;
        case 'harmonics':
          await playHarmonics(audioData.frequencies, audioData.parameters);
          break;
        case 'relative-pitch':
        case 'absolute-pitch':
          await playTwoNotes(audioData.frequencies, audioData.duration);
          break;
        default:
          await playSimpleTone(audioData.frequencies[0], audioData.duration);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    } finally {
      setIsPlaying(false);
    }
  }, [audioContext, isMuted]);

  const playSimpleTone = async (frequency: number, duration: number): Promise<void> => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.value = volume * 0.3;
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
    
    return new Promise(resolve => {
      oscillator.onended = () => resolve();
    });
  };

  const playTwoNotes = async (frequencies: number[], duration: number): Promise<void> => {
    if (!audioContext) return;

    for (const frequency of frequencies) {
      await playSimpleTone(frequency, duration);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  const playPitchBend = async (frequency: number, params: any): Promise<void> => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.value = volume * 0.3;
    
    const now = audioContext.currentTime;
    const bendAmount = params.bendAmount;
    const bendDirection = params.bendDirection;
    
    if (bendDirection === 'up') {
      oscillator.frequency.exponentialRampToValueAtTime(
        frequency * Math.pow(2, bendAmount / 12),
        now + 1.0
      );
    } else {
      oscillator.frequency.exponentialRampToValueAtTime(
        frequency / Math.pow(2, bendAmount / 12),
        now + 1.0
      );
    }
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    
    oscillator.start(now);
    oscillator.stop(now + 1.0);
    
    return new Promise(resolve => {
      oscillator.onended = () => resolve();
    });
  };

  const playVibrato = async (frequency: number, params: any): Promise<void> => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    lfo.frequency.value = params.rate;
    lfoGain.gain.value = params.hasVibrato ? frequency * params.depth : 0;
    
    gainNode.gain.value = volume * 0.3;
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2.0);
    
    oscillator.start();
    lfo.start();
    oscillator.stop(audioContext.currentTime + 2.0);
    lfo.stop(audioContext.currentTime + 2.0);
    
    return new Promise(resolve => {
      oscillator.onended = () => resolve();
    });
  };

  const playGlissando = async (frequencies: number[], params: any): Promise<void> => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequencies[0];
    oscillator.type = 'sine';
    
    gainNode.gain.value = volume * 0.3;
    
    const now = audioContext.currentTime;
    const duration = params.speed === 'slow' ? 2.0 : params.speed === 'medium' ? 1.0 : 0.5;
    
    oscillator.frequency.linearRampToValueAtTime(frequencies[1], now + duration);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
    
    return new Promise(resolve => {
      oscillator.onended = () => resolve();
    });
  };

  const playPortamento = async (frequencies: number[], params: any): Promise<void> => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequencies[0];
    oscillator.type = 'sine';
    
    gainNode.gain.value = volume * 0.3;
    
    const now = audioContext.currentTime;
    
    if (params.hasPortamento) {
      oscillator.frequency.linearRampToValueAtTime(
        frequencies[1],
        now + params.portamentoTime
      );
    } else {
      oscillator.frequency.setValueAtTime(frequencies[1], now + 0.1);
    }
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    
    oscillator.start(now);
    oscillator.stop(now + 1.0);
    
    return new Promise(resolve => {
      oscillator.onended = () => resolve();
    });
  };

  const playEnvelope = async (frequency: number, params: any): Promise<void> => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = params.envelopeType === 'sawtooth' ? 'sawtooth' : 'sine';
    
    const now = audioContext.currentTime;
    const { attackTime, decayTime, sustainLevel, releaseTime } = params;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, now + attackTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3 * sustainLevel, now + attackTime + decayTime);
    gainNode.gain.setValueAtTime(volume * 0.3 * sustainLevel, now + 1.5);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5 + releaseTime);
    
    oscillator.start(now);
    oscillator.stop(now + 1.5 + releaseTime);
    
    return new Promise(resolve => {
      oscillator.onended = () => resolve();
    });
  };

  const playHarmonics = async (frequencies: number[], params: any): Promise<void> => {
    if (!audioContext) return;

    const oscillators: OscillatorNode[] = [];
    const gainNode = audioContext.createGain();
    
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = volume * 0.2;
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const oscGain = audioContext.createGain();
      
      oscillator.connect(oscGain);
      oscGain.connect(gainNode);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      oscGain.gain.value = 1 / (index + 1); // Decrease amplitude for higher harmonics
      
      oscillators.push(oscillator);
      oscillator.start();
    });
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5);
    
    return new Promise(resolve => {
      setTimeout(() => {
        oscillators.forEach(osc => osc.stop());
        resolve();
      }, 1500);
    });
  };

  const startGame = () => {
    setGameStarted(true);
    nextRound();
  };

  const nextRound = () => {
    if (!game) return;

    const newRound = game.generateRound();
    setGameState(prev => ({
      ...prev,
      currentRound: newRound,
      roundNumber: prev.roundNumber + 1,
      selectedAnswer: null,
      showResult: false,
      isCorrect: false,
      isPlaying: true
    }));

    // Auto-play audio for new round
    setTimeout(() => {
      if (newRound.audioData) {
        playAudio(newRound.audioData);
      }
    }, 500);
  };

  const handleAnswerSelect = (answer: string) => {
    if (!gameState.currentRound || gameState.showResult) return;

    const isCorrect = game!.validateAnswer(answer, gameState.currentRound.answer);
    const points = isCorrect ? gameState.currentRound.points : 0;
    
    setGameState(prev => ({
      ...prev,
      selectedAnswer: answer,
      showResult: true,
      isCorrect,
      score: prev.score + points,
      streak: isCorrect ? prev.streak + 1 : 0,
      bestStreak: Math.max(prev.bestStreak, isCorrect ? prev.streak + 1 : prev.bestStreak)
    }));
  };

  const handleNextRound = () => {
    if (gameState.roundNumber >= gameState.totalRounds) {
      endGame();
    } else {
      nextRound();
    }
  };

  const endGame = () => {
    onGameComplete(gameState.score, gameState.totalRounds);
  };

  const resetGame = () => {
    setGameState({
      currentRound: null,
      score: 0,
      roundNumber: 0,
      totalRounds: 10,
      isPlaying: false,
      selectedAnswer: null,
      showResult: false,
      isCorrect: false,
      streak: 0,
      bestStreak: 0
    });
    setGameStarted(false);
  };

  if (!modeConfig) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-lg text-muted-foreground">Mode not found</p>
          <Button onClick={onBackToMenu} className="mt-4">
            Back to Menu
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!gameStarted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <span className="text-3xl">{modeConfig.icon}</span>
            {modeConfig.name}
          </CardTitle>
          <Badge variant="secondary" className="w-fit mx-auto">
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg mb-4">{modeConfig.description}</p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium mb-2">How to Play:</p>
              <p className="text-sm">{modeConfig.instructions[difficulty]}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-sm">10 Rounds</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-sm">Points: {difficulty === 'easy' ? '10' : difficulty === 'medium' ? '20' : '30'} per correct answer</span>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={startGame} className="flex-1" size="lg">
              <Play className="h-5 w-5 mr-2" />
              Start Game
            </Button>
            <Button onClick={onBackToMenu} variant="outline">
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{modeConfig.icon}</span>
            {modeConfig.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Round {gameState.roundNumber}/{gameState.totalRounds}
            </Badge>
            <Badge variant="secondary">
              Score: {gameState.score}
            </Badge>
            {gameState.streak > 0 && (
              <Badge variant="default" className="bg-orange-500">
                <Zap className="h-3 w-3 mr-1" />
                {gameState.streak} Streak
              </Badge>
            )}
          </div>
        </div>
        <Progress 
          value={(gameState.roundNumber / gameState.totalRounds) * 100} 
          className="w-full"
        />
      </CardHeader>

      <CardContent className="space-y-6">
        {gameState.currentRound && (
          <>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">
                {gameState.currentRound.question}
              </h3>
              
              {/* Audio Controls */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button
                  onClick={() => playAudio(gameState.currentRound!.audioData)}
                  disabled={isPlaying}
                  variant="outline"
                  size="lg"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 mr-2" />
                  ) : (
                    <Play className="h-5 w-5 mr-2" />
                  )}
                  {isPlaying ? 'Playing...' : 'Play Sound'}
                </Button>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setIsMuted(!isMuted)}
                    variant="ghost"
                    size="sm"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                {gameState.currentRound.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={gameState.showResult}
                    variant={
                      gameState.showResult
                        ? option === gameState.currentRound!.answer
                          ? 'default'
                          : option === gameState.selectedAnswer
                          ? 'destructive'
                          : 'outline'
                        : 'outline'
                    }
                    className="h-16 text-lg"
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {/* Result Display */}
              {gameState.showResult && (
                <div className="mt-6 space-y-4">
                  <div className={`text-lg font-semibold ${
                    gameState.isCorrect ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {gameState.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm">{gameState.currentRound.explanation}</p>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <Button onClick={handleNextRound}>
                      {gameState.roundNumber >= gameState.totalRounds ? 'Finish Game' : 'Next Round'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button onClick={resetGame} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Game
          </Button>
          <Button onClick={onBackToMenu} variant="outline">
            Back to Menu
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};