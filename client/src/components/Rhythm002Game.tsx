import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";

interface GameState {
  currentMode: string;
  score: number;
  round: number;
  bpm: number;
  isPlaying: boolean;
  targetCategory: string | null;
  feedback: string | null;
}

export const Rhythm002Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "tempo-recognition",
    score: 0,
    round: 1,
    bpm: 100,
    isPlaying: false,
    targetCategory: null,
    feedback: null,
  });

  const modes = ["tempo-recognition", "tempo-changes", "pulse-subdivisions", "analysis"];

  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalIdRef = useRef<number | null>(null);
  const click = () => {
    const ctx = audioCtxRef.current; if (!ctx) return;
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = "square"; osc.frequency.setValueAtTime(1000, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
    osc.stop(ctx.currentTime + 0.06);
  };
  useEffect(() => {
    if (!gameState.isPlaying) { if (intervalIdRef.current) { clearInterval(intervalIdRef.current); intervalIdRef.current = null; } return; }
    if (!audioCtxRef.current) { audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)(); }
    const per = 60000 / Math.max(40, Math.min(200, gameState.bpm));
    click(); intervalIdRef.current = window.setInterval(click, per) as unknown as number;
    return () => { if (intervalIdRef.current) clearInterval(intervalIdRef.current); intervalIdRef.current = null; };
  }, [gameState.isPlaying, gameState.bpm]);

  const categories = [
    { name: "Largo", min: 40, max: 59 },
    { name: "Andante", min: 76, max: 98 },
    { name: "Moderato", min: 99, max: 120 },
    { name: "Allegro", min: 121, max: 168 },
    { name: "Presto", min: 169, max: 200 },
  ];
  const pickCategoryForBpm = (bpm: number) => categories.find(c => bpm >= c.min && bpm <= c.max)?.name ?? "Unknown";
  const randomBpmForCategory = (cat: {min:number;max:number}) => Math.floor(cat.min + Math.random() * (cat.max - cat.min + 1));
  const startRound = () => {
    // pick random category (excluding Unknown)
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const bpm = randomBpmForCategory(cat);
    setGameState(p => ({ ...p, bpm, isPlaying: true, targetCategory: cat.name, feedback: null }));
  };
  const answerCategory = (name: string) => {
    setGameState(p => {
      const correct = name === p.targetCategory;
      return { ...p, score: correct ? p.score + 1 : p.score, round: p.round + 1, feedback: correct ? "Correct!" : `Oops, it was ${p.targetCategory}` };
    });
  };

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
        <h1 className="text-3xl font-bold text-purple-900">Tempo & Pulse Master</h1>
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
            {gameState.currentMode === "tempo-recognition" && (
              <div className="space-y-4">
                <p className="text-gray-600">Listen and select the tempo category.</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={startRound} className="px-5 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600">Play</button>
                  <span className="text-sm text-gray-600">BPM: <span className="font-semibold text-purple-700">{gameState.bpm}</span></span>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {categories.map(c => (
                    <button key={c.name} onClick={() => answerCategory(c.name)}
                      className="px-4 py-2 rounded-lg bg-white text-purple-600 border hover:bg-purple-50 font-semibold">
                      {c.name}
                    </button>
                  ))}
                </div>
                {gameState.feedback && <p className="text-sm font-semibold text-purple-700">{gameState.feedback}</p>}
              </div>
            )}

            {gameState.currentMode === "tempo-changes" && (
              <div className="space-y-4">
                <p className="text-gray-600">Listen for tempo changes (accelerando/ritardando).</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => {
                    setGameState(p => ({ ...p, bpm: 80, isPlaying: true }));
                    let b = 80; const id = window.setInterval(() => {
                      b += 2; setGameState(p => ({ ...p, bpm: b }));
                      if (b >= 140) clearInterval(id);
                    }, 200);
                  }} className="px-5 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600">Accelerando</button>
                  <button onClick={() => {
                    setGameState(p => ({ ...p, bpm: 140, isPlaying: true }));
                    let b = 140; const id = window.setInterval(() => {
                      b -= 2; setGameState(p => ({ ...p, bpm: b }));
                      if (b <= 80) clearInterval(id);
                    }, 200);
                  }} className="px-5 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600">Ritardando</button>
                  <button onClick={() => setGameState(p => ({ ...p, isPlaying: false }))} className="px-5 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600">Stop</button>
                </div>
                <p className="text-sm text-gray-600">Current BPM: {gameState.bpm}</p>
              </div>
            )}

            {gameState.currentMode === "pulse-subdivisions" && (
              <div className="space-y-4">
                <p className="text-gray-600">Hear subdivisions and identify the pattern.</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => setGameState(p => ({ ...p, isPlaying: true }))} className="px-5 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600">Start</button>
                  <button onClick={() => setGameState(p => ({ ...p, isPlaying: false }))} className="px-5 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600">Stop</button>
                </div>
                <p className="text-sm text-gray-600">BPM: {gameState.bpm}</p>
              </div>
            )}

            {gameState.currentMode === "analysis" && (
              <div className="space-y-4">
                <p className="text-gray-600">Analyze tempo stability and consistency.</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => setGameState(p => ({ ...p, isPlaying: true }))} className="px-5 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600">Start</button>
                  <button onClick={() => setGameState(p => ({ ...p, isPlaying: false }))} className="px-5 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600">Stop</button>
                </div>
                <p className="text-sm text-gray-600">BPM: {gameState.bpm} (stable metronome for reference)</p>
              </div>
            )}
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
