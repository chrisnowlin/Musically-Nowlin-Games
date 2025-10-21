import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";

interface GameState {
  currentMode: string;
  score: number;
  round: number;
}

export const Harmony001Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "all-intervals",
    score: 0,
    round: 1,
  });

  const modes = ["all-intervals", "qualities"];

  const handleModeChange = (mode: string) => {
    setGameState(prev => ({ ...prev, currentMode: mode, score: 0, round: 1 }));
  };

  const handleAnswer = (correct: boolean) => {
    setGameState(prev => ({
      ...prev,
      score: correct ? prev.score + 1 : prev.score,
      round: prev.round + 1,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 p-4 relative">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setLocation("/")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft size={24} />
          Main Menu
        </button>
        <h1 className="text-3xl font-bold text-purple-900">Interval Master</h1>
        <div className="text-xl font-bold text-purple-700">Score: {gameState.score}</div>
      </div>

      {modes.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2 justify-center">
          {modes.map(mode => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={gameState.currentMode === mode ? "px-4 py-2 rounded-lg font-semibold bg-purple-600 text-white shadow-lg" : "px-4 py-2 rounded-lg font-semibold bg-white text-purple-600 hover:bg-purple-100"}
            >
              {mode.replace(/-/g, " ").toUpperCase()}
            </button>
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">Round {gameState.round}</p>
            <p className="text-lg font-semibold text-purple-700">Mode: {gameState.currentMode.replace(/-/g, " ").toUpperCase()}</p>
          </div>
                    <div className="bg-purple-50 rounded-lg p-8 text-center mb-6">
            <p className="text-gray-600 mb-4">{gameState.currentMode} mode</p>
            <p className="text-sm text-gray-500">Practice and master this skill.</p>
            <div className="mt-4 flex gap-4 justify-center">
              <button onClick={() => handleAnswer(true)} className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600">Correct</button>
              <button onClick={() => handleAnswer(false)} className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600">Incorrect</button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-bold text-lg mb-4">Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-gray-600">Round</p><p className="text-2xl font-bold text-purple-600">{gameState.round}</p></div>
            <div><p className="text-gray-600">Score</p><p className="text-2xl font-bold text-purple-600">{gameState.score}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};
