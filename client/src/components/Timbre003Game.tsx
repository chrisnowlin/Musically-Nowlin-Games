import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, Volume2 } from "lucide-react";
import { useLocation } from "wouter";
import { generateRound, validateAnswer, calculateScore, GameRound, AudioParams } from "@/lib/gameLogic/timbre-003Logic";

interface GameState {
  currentMode: string;
  score: number;
  round: number;
  difficulty: number;
  feedback: string | null;
  currentRound: GameRound | null;
  totalAttempts: number;
  correctAnswers: number;
}

export const Timbre003Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "string-techniques",
    score: 0,
    round: 1,
    difficulty: 1,
    feedback: null,
    currentRound: null,
    totalAttempts: 0,
    correctAnswers: 0,
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const modes = ["string-techniques", "articulation"];

  useEffect(() => {
    startNewRound();
  }, [gameState.currentMode, gameState.difficulty]);

  const startNewRound = () => {
    const newRound = generateRound(gameState.currentMode, gameState.difficulty);
    setGameState(prev => ({
      ...prev,
      currentRound: newRound,
      feedback: null,
    }));
  };

  const playSound = (params: AudioParams) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = params.type;
    osc.frequency.setValueAtTime(params.frequency, now);

    const gainNode = ctx.createGain();
    const duration = 1.5;

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.3, now + params.attack);
    gainNode.gain.exponentialRampToValueAtTime(0.3 * params.sustain, now + params.attack + params.decay);
    gainNode.gain.setValueAtTime(0.3 * params.sustain, now + duration - params.release);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Add tremolo effect if specified
    if (params.tremolo && params.modulation) {
      const tremoloLFO = ctx.createOscillator();
      const tremoloGain = ctx.createGain();
      tremoloLFO.frequency.setValueAtTime(params.modulation, now);
      tremoloGain.gain.setValueAtTime(0.3, now);
      tremoloLFO.connect(tremoloGain);
      tremoloGain.connect(gainNode.gain);
      tremoloLFO.start(now);
      tremoloLFO.stop(now + duration);
    }

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  };

  const handleModeChange = (mode: string) => {
    setGameState(prev => ({
      ...prev,
      currentMode: mode,
      score: 0,
      round: 1,
      difficulty: 1,
      totalAttempts: 0,
      correctAnswers: 0,
      feedback: null,
    }));
  };

  const handleAnswer = (answer: string) => {
    if (!gameState.currentRound) return;

    const isCorrect = validateAnswer(answer, gameState.currentRound?.correctAnswer);
    const points = calculateScore(isCorrect, 0, gameState.difficulty);

    setGameState(prev => {
      const newTotalAttempts = prev.totalAttempts + 1;
      const newCorrectAnswers = prev.correctAnswers + (isCorrect ? 1 : 0);
      const accuracy = newCorrectAnswers / newTotalAttempts;

      let newDifficulty = prev.difficulty;
      if (newTotalAttempts % 5 === 0) {
        if (accuracy > 0.8 && newDifficulty < 6) {
          newDifficulty++;
        } else if (accuracy < 0.5 && newDifficulty > 1) {
          newDifficulty--;
        }
      }

      return {
        ...prev,
        score: prev.score + points,
        round: prev.round + 1,
        difficulty: newDifficulty,
        feedback: isCorrect
          ? `Correct! It was "${gameState.currentRound?.correctAnswer}". +${points} points!`
          : `Not quite. The correct answer was "${gameState.currentRound?.correctAnswer}".`,
        totalAttempts: newTotalAttempts,
        correctAnswers: newCorrectAnswers,
      };
    });

    setTimeout(() => {
      startNewRound();
    }, 1500);
  };

  const handlePlaySound = () => {
    if (gameState.currentRound) {
      playSound(gameState.currentRound.audioParams);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 to-yellow-100 p-4 relative">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setLocation("/games")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-orange-700 hover:text-orange-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft size={24} />
          Main Menu
        </button>
        <h1 className="text-3xl font-bold text-orange-900 mx-auto">Technique Master</h1>
        <div className="text-xl font-bold text-orange-700">Score: {gameState.score}</div>
      </div>

      {modes.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2 justify-center">
          {modes.map(mode => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={gameState.currentMode === mode ? "px-4 py-2 rounded-lg font-semibold bg-orange-600 text-white shadow-lg" : "px-4 py-2 rounded-lg font-semibold bg-white text-orange-600 hover:bg-orange-100"}
            >
              {mode.replace(/-/g, " ").toUpperCase()}
            </button>
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">Round {gameState.round} | Difficulty {gameState.difficulty}</p>
            <p className="text-lg font-semibold text-orange-700">Mode: {gameState.currentMode.replace(/-/g, " ").toUpperCase()}</p>
          </div>

          {gameState.currentRound && (
            <div className="bg-orange-50 rounded-lg p-8 text-center mb-6">
              <p className="text-lg font-semibold text-gray-800 mb-6">{gameState.currentRound.question}</p>

              <button
                onClick={handlePlaySound}
                className="mb-6 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 flex items-center gap-2 mx-auto"
              >
                <Volume2 size={20} />
                Play Sound
              </button>

              {gameState.feedback ? (
                <div className={`p-4 rounded-lg ${gameState.feedback.includes("Correct") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  <p className="font-semibold">{gameState.feedback}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {gameState.currentRound.options.map(option => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className="px-6 py-3 bg-white text-orange-700 rounded-lg font-semibold hover:bg-orange-100 border-2 border-orange-300 capitalize"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-bold text-lg mb-4">Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div><p className="text-gray-600">Round</p><p className="text-2xl font-bold text-orange-600">{gameState.round}</p></div>
            <div><p className="text-gray-600">Score</p><p className="text-2xl font-bold text-orange-600">{gameState.score}</p></div>
            <div><p className="text-gray-600">Accuracy</p><p className="text-2xl font-bold text-orange-600">{gameState.totalAttempts > 0 ? Math.round((gameState.correctAnswers / gameState.totalAttempts) * 100) : 0}%</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};
