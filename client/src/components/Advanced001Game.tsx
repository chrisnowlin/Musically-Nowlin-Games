import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, Play, Volume2, HelpCircle } from "lucide-react";
import { useLocation } from "wouter";
import { generateRound, validateAnswer, calculateScore, GameRound } from "@/lib/gameLogic/advanced-001Logic";
import { sampleAudioService } from "@/lib/sampleAudioService";
import { Button } from "@/components/ui/button";
import { getAdvanced001Mode } from "@/lib/gameLogic/advanced-001Modes";

const LS_KEYS = {
  lastMode: "advanced-001:lastMode",
  highScores: "advanced-001:highScores",
  roundsPlayed: "advanced-001:roundsPlayed",
  achievements: "advanced-001:achievements",
} as const;


interface GameState {
  currentMode: string;
  score: number;
  round: number;
  totalRounds: number;
  currentRound: GameRound | null;
  showResult: boolean;
  lastAnswerCorrect: boolean;
  timeStarted: number;
  gameStarted: boolean;
  // Progress & difficulty
  level: number;
  correctStreak: number;
  highScores: Record<string, number>;
  roundsPlayed: Record<string, number>;
  achievements: Record<string, string[]>;
}

export const Advanced001Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "advanced-harmony",
    score: 0,
    round: 0,
    totalRounds: 10,
    currentRound: null,
    showResult: false,
    lastAnswerCorrect: false,
    timeStarted: 0,
    gameStarted: false,
    level: 1,
    correctStreak: 0,
    highScores: {},
    roundsPlayed: {},
    achievements: {},
  });

  // Load persisted progress on mount
  useEffect(() => {
    try {
      const lastMode = localStorage.getItem(LS_KEYS.lastMode);
      const highScoresRaw = localStorage.getItem(LS_KEYS.highScores);
      const roundsPlayedRaw = localStorage.getItem(LS_KEYS.roundsPlayed);
      const achievementsRaw = localStorage.getItem(LS_KEYS.achievements);
      setGameState((prev) => ({
        ...prev,
        currentMode: lastMode || prev.currentMode,
        highScores: highScoresRaw ? JSON.parse(highScoresRaw) : {},
        roundsPlayed: roundsPlayedRaw ? JSON.parse(roundsPlayedRaw) : {},
        achievements: achievementsRaw ? JSON.parse(achievementsRaw) : {},
      }));
    } catch {}
  }, []);

  const getDifficultyForLevel = useCallback((modeId: string, level: number) => {
    const curve = getAdvanced001Mode(modeId)?.difficultyCurve ?? ((l: number) => ({ difficulty: Math.min(5, Math.max(1, l)) }));
    return curve(level).difficulty;
  }, []);

  const modes = [
    { id: "advanced-harmony", label: "Advanced Harmony", emoji: "🎹" },
    { id: "advanced-rhythm", label: "Advanced Rhythm", emoji: "🥁" },
    { id: "advanced-form", label: "Advanced Form", emoji: "📊" },
  ];

  const initializeAudio = useCallback(async () => {
    await sampleAudioService.initialize();
    setAudioInitialized(true);
  }, []);

  const startGame = useCallback(() => {
    const startLevel = 1;
    const difficulty = getDifficultyForLevel(gameState.currentMode, startLevel);
    const newRound = generateRound(gameState.currentMode, difficulty);
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      round: 1,
      score: 0,
      currentRound: newRound,
      showResult: false,
      timeStarted: Date.now(),
      level: startLevel,
      correctStreak: 0,
    }));
  }, [gameState.currentMode, getDifficultyForLevel]);

  const playExample = useCallback(async () => {
    if (!gameState.currentRound || !audioInitialized) return;

    const { notes, pattern, mode } = gameState.currentRound;

    if (mode === "advanced-rhythm" && pattern && notes) {
      // Play rhythm pattern
      for (let i = 0; i < pattern.length; i++) {
        const frequency = notes[i % notes.length];
        await sampleAudioService.playNote(frequency, pattern[i] / 1000);
        await new Promise(resolve => setTimeout(resolve, pattern[i]));
      }
    } else if (mode === "advanced-harmony" && notes) {
      // Play chord (all notes together)
      const promises = notes.map(freq =>
        sampleAudioService.playNote(freq, 1.5)
      );
      await Promise.all(promises);
    } else if (mode === "advanced-form" && notes) {
      // Play melodic sequence
      for (const freq of notes) {
        await sampleAudioService.playNote(freq, 0.4);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }, [gameState.currentRound, audioInitialized]);

  const handleAnswer = useCallback((selectedOption: string) => {
    if (!gameState.currentRound || gameState.showResult) return;

    const correct = validateAnswer(selectedOption, gameState.currentRound.answer);
    const timeSpent = Date.now() - gameState.timeStarted;
    const difficulty = getDifficultyForLevel(gameState.currentMode, gameState.level);
    const points = calculateScore(correct, timeSpent, difficulty);

    // Update progress maps
    const mode = gameState.currentMode;
    const updatedRounds = { ...gameState.roundsPlayed, [mode]: (gameState.roundsPlayed[mode] ?? 0) + 1 };
    const newScore = gameState.score + points;
    const updatedHighScores = { ...gameState.highScores, [mode]: Math.max(newScore, gameState.highScores[mode] ?? 0) };

    const prevAchievements = gameState.achievements[mode] ?? [];
    const willUnlock: string[] = [];
    if (correct && !prevAchievements.includes("first_correct")) willUnlock.push("first_correct");
    const newStreak = correct ? gameState.correctStreak + 1 : 0;
    if (newStreak >= 3 && !prevAchievements.includes("three_in_a_row")) willUnlock.push("three_in_a_row");
    const updatedAchievements = willUnlock.length
      ? { ...gameState.achievements, [mode]: [...prevAchievements, ...willUnlock] }
      : gameState.achievements;

    // Persist
    try {
      localStorage.setItem(LS_KEYS.roundsPlayed, JSON.stringify(updatedRounds));
      localStorage.setItem(LS_KEYS.highScores, JSON.stringify(updatedHighScores));
      localStorage.setItem(LS_KEYS.achievements, JSON.stringify(updatedAchievements));
    } catch {}

    setGameState(prev => ({
      ...prev,
      score: newScore,
      showResult: true,
      lastAnswerCorrect: correct,
      roundsPlayed: updatedRounds,
      highScores: updatedHighScores,
      achievements: updatedAchievements,
      correctStreak: newStreak,
    }));
  }, [gameState.currentRound, gameState.showResult, gameState.timeStarted, gameState.currentMode, gameState.level, gameState.roundsPlayed, gameState.highScores, gameState.achievements, gameState.correctStreak, getDifficultyForLevel]);

  const nextRound = useCallback(() => {
    if (gameState.round >= gameState.totalRounds) {
      // Game over
      setGameState(prev => ({ ...prev, gameStarted: false }));
      return;
    }

    const nextLevel = Math.min(5, Math.max(1, gameState.level + (gameState.lastAnswerCorrect ? 1 : -1)));
    const difficulty = getDifficultyForLevel(gameState.currentMode, nextLevel);
    const newRound = generateRound(gameState.currentMode, difficulty);

    setGameState(prev => ({
      ...prev,
      round: prev.round + 1,
      currentRound: newRound,
      showResult: false,
      timeStarted: Date.now(),
      level: nextLevel,
    }));
  }, [gameState.round, gameState.totalRounds, gameState.currentMode, gameState.level, gameState.lastAnswerCorrect, getDifficultyForLevel]);

  const handleModeChange = (mode: string) => {
    try { localStorage.setItem(LS_KEYS.lastMode, mode); } catch {}
    setGameState(prev => ({
      ...prev,
      currentMode: mode,
      score: 0,
      round: 0,
      gameStarted: false,
      currentRound: null,
      showResult: false,
      level: 1,
      correctStreak: 0,
    }));
  };

  const handleBackClick = useCallback(() => {
    // If game is actively being played (not showing result), ask for confirmation
    if (gameState.gameStarted && gameState.round > 0 && !gameState.showResult) {
      const confirmed = window.confirm("Are you sure you want to quit? Your progress will be lost.");
      if (confirmed) {
        setGameState(prev => ({ ...prev, gameStarted: false }));
      }
    } else {
      // Safe to exit: game not started or already showing result
      setGameState(prev => ({ ...prev, gameStarted: false }));
    }
  }, [gameState.gameStarted, gameState.round, gameState.showResult]);

  // Auto-play example when round starts
  useEffect(() => {
    if (gameState.currentRound && !gameState.showResult && audioInitialized) {
      playExample();
    }
  }, [gameState.currentRound, gameState.showResult, audioInitialized, playExample]);

  const selectedMode = modes.find(m => m.id === gameState.currentMode);

  if (!gameState.gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 p-4">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setLocation("/games")} className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold">
            <ChevronLeft size={24} />
            Main Menu
          </button>
          <h1 className="text-3xl font-bold text-purple-900">Advanced Music Analyzer</h1>
          <div className="w-20"></div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Mode Selection */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-purple-900 mb-4 text-center">Select Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {modes.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => handleModeChange(mode.id)}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    gameState.currentMode === mode.id
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-300 hover:border-purple-400"
                  }`}
                >
                  <div className="text-4xl mb-2">{mode.emoji}</div>
                  <div className="font-semibold text-gray-800">{mode.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-800">How to Play</h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-xl">{selectedMode?.emoji}</span>
                <span>Listen carefully to the musical example</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xl">🎧</span>
                <span>Analyze the {selectedMode?.label.toLowerCase()} elements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xl">🎯</span>
                <span>Select the correct answer from the options</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xl">⚡</span>
                <span>Faster answers earn bonus points!</span>
              </li>
            </ul>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <Button
              onClick={async () => {
                if (!audioInitialized) await initializeAudio();
                startGame();
              }}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-12 py-6 text-xl font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 shadow-lg"
            >
              <Play className="w-6 h-6 mr-2" />
              Start {selectedMode?.label}
            </Button>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-bold text-lg mb-4">Statistics ({selectedMode?.label})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-600">High Score</p>
                <p className="text-2xl font-bold text-purple-600">{gameState.highScores[gameState.currentMode] ?? 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Rounds Played</p>
                <p className="text-2xl font-bold text-purple-600">{gameState.roundsPlayed[gameState.currentMode] ?? 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Level</p>
                <p className="text-2xl font-bold text-purple-600">{gameState.level}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-gray-700 font-semibold mb-2">Achievements</p>
              <div className="flex flex-wrap gap-2">
                {(gameState.achievements[gameState.currentMode] ?? []).length > 0 ? (
                  (gameState.achievements[gameState.currentMode] ?? []).map(a => (
                    <span key={a} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">{a.replaceAll('_',' ')}</span>
                  ))
                ) : (
                  <span className="text-gray-500">None yet</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!gameState.currentRound) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 p-4 relative">
      <button onClick={handleBackClick} className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all">
        <ChevronLeft size={24} />
        Main Menu
      </button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-purple-900">{selectedMode?.emoji} {selectedMode?.label}</h1>
        <div className="text-xl font-bold text-purple-700">Score: {gameState.score}</div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Round Info */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600">Round</p>
              <p className="text-2xl font-bold text-purple-600">
                {gameState.round} / {gameState.totalRounds}
              </p>
            </div>
            <Button
              onClick={playExample}
              disabled={!audioInitialized}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Volume2 className="w-5 h-5" />
              Replay
            </Button>
          </div>

          <div className="bg-purple-50 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">{gameState.currentRound.description}</p>
            <p className="text-lg font-semibold text-gray-800">{gameState.currentRound.question}</p>
          </div>
        </div>

        {/* Options */}
        {!gameState.showResult ? (
          <div className="grid grid-cols-1 gap-4">
            {gameState.currentRound.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className="bg-white hover:bg-purple-50 border-2 border-gray-300 hover:border-purple-500 rounded-lg p-6 text-left font-semibold text-gray-800 transition-all transform hover:scale-102 shadow-md hover:shadow-lg"
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <div className={`rounded-lg p-8 text-center ${
            gameState.lastAnswerCorrect ? "bg-green-100 border-4 border-green-500" : "bg-red-100 border-4 border-red-500"
          }`}>
            <div className="text-6xl mb-4">
              {gameState.lastAnswerCorrect ? "✅" : "❌"}
            </div>
            <p className="text-2xl font-bold mb-4">
              {gameState.lastAnswerCorrect ? "Correct!" : "Incorrect"}
            </p>
            <p className="text-lg text-gray-700 mb-2">
              The correct answer is: <strong>{gameState.currentRound.answer}</strong>
            </p>
            {gameState.lastAnswerCorrect && (
              <p className="text-gray-600">
                +{calculateScore(true, Date.now() - gameState.timeStarted, 1)} points
              </p>
            )}
            <Button
              onClick={nextRound}
              size="lg"
              className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4"
            >
              {gameState.round >= gameState.totalRounds ? "Finish" : "Next Round"}
            </Button>
          </div>
        )}

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600">Progress</span>
            <span className="text-sm text-gray-600">
              {Math.round((gameState.round / gameState.totalRounds) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(gameState.round / gameState.totalRounds) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
