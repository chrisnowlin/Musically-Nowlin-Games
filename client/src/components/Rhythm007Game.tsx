import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";

interface GameState {
  currentMode: string;
  score: number;
  round: number;
  bpm: number;
  isPlaying: boolean;
  conductTaps: number[];
}

export const Rhythm007Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "tempo-setting",
    score: 0,
    round: 1,
    bpm: 90,
    isPlaying: false,
    conductTaps: [],
  });

  const modes = ["tempo-setting", "conducting", "transitions", "expressive-timing", "ensemble-coordination"];

  // Simple metronome
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

  const onConductTap = () => {
    const t = performance.now();
    setGameState(p => {
      const taps = [...p.conductTaps, t].slice(-6);
      if (taps.length >= 3) {
        const iois = taps.slice(1).map((x, i) => x - taps[i]);
        const mean = iois.reduce((a, b) => a + b, 0) / iois.length;
        const bpm = Math.round(60000 / mean);
        return { ...p, conductTaps: taps, bpm, isPlaying: true };
      }
      return { ...p, conductTaps: taps };
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
          onClick={() => setLocation("/games")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft size={24} />
          Main Menu
        </button>
        <h1 className="text-3xl font-bold text-purple-900">Tempo Conducting Studio</h1>
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
            {gameState.currentMode === "tempo-setting" && (
              <div className="space-y-4">
                <p className="text-gray-600">Set a target tempo and start the metronome.</p>
                <div className="flex items-center justify-center gap-3">
                  <label className="text-sm text-gray-600">BPM</label>
                  <input type="range" min={40} max={200} value={gameState.bpm}
                    onChange={(e) => setGameState((p) => ({ ...p, bpm: Number(e.target.value) }))} />
                  <span className="font-semibold text-purple-700">{gameState.bpm}</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  {gameState.isPlaying ? (
                    <button onClick={() => setGameState((p) => ({ ...p, isPlaying: false }))}
                      className="px-5 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600">Stop</button>
                  ) : (
                    <button onClick={() => setGameState((p) => ({ ...p, isPlaying: true }))}
                      className="px-5 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600">Start</button>
                  )}
                </div>
              </div>
            )}

            {gameState.currentMode === "conducting" && (
              <div className="space-y-4">
                <p className="text-gray-600">Tap the baton button on each downbeat to set the tempo.</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={onConductTap} className="px-5 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700">Baton (Tap)</button>
                  <span className="text-sm text-gray-600">BPM: <span className="font-semibold text-purple-700">{gameState.bpm}</span></span>
                  {gameState.isPlaying ? (
                    <button onClick={() => setGameState((p) => ({ ...p, isPlaying: false }))}
                      className="px-5 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600">Stop</button>
                  ) : (
                    <button onClick={() => setGameState((p) => ({ ...p, isPlaying: true }))}
                      className="px-5 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600">Start</button>
                  )}
                </div>
                <p className="text-xs text-gray-500">Tip: Tap at least 3 times to lock in a tempo.</p>
              </div>
            )}

            {gameState.currentMode === "transitions" && (
              <div className="space-y-4">
                <p className="text-gray-600">Transition smoothly between tempos.</p>
                <div className="flex items-center justify-center gap-3">
                  <label className="text-sm text-gray-600">BPM</label>
                  <input type="range" min={40} max={200} value={gameState.bpm}
                    onChange={(e) => setGameState((p) => ({ ...p, bpm: Number(e.target.value) }))} />
                  <span className="font-semibold text-purple-700">{gameState.bpm}</span>
                </div>
                <button onClick={() => {
                  const target = Math.min(200, Math.max(40, gameState.bpm + 20));
                  const steps = 20; const start = gameState.bpm; let i = 0;
                  const id = window.setInterval(() => {
                    i += 1; const next = Math.round(start + (target - start) * (i / steps));
                    setGameState(p => ({ ...p, bpm: next }));
                    if (i >= steps) clearInterval(id);
                  }, 150);
                  setGameState(p => ({ ...p, isPlaying: true }));
                }} className="px-5 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600">Transition +20 BPM</button>
              </div>
            )}

            {gameState.currentMode === "expressive-timing" && (
              <div className="space-y-4">
                <p className="text-gray-600">Shape the tempo expressively.</p>
                <div className="flex items-center justify-center gap-3">
                  <label className="text-sm text-gray-600">Express</label>
                  <input type="range" min={-20} max={20} defaultValue={0}
                    onChange={(e) => {
                      const delta = Number(e.target.value);
                      setGameState(p => ({ ...p, bpm: Math.max(40, Math.min(200, p.bpm + delta)) }));
                    }} />
                  <span className="font-semibold text-purple-700">{gameState.bpm} BPM</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  {gameState.isPlaying ? (
                    <button onClick={() => setGameState((p) => ({ ...p, isPlaying: false }))}
                      className="px-5 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600">Stop</button>
                  ) : (
                    <button onClick={() => setGameState((p) => ({ ...p, isPlaying: true }))}
                      className="px-5 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600">Start</button>
                  )}
                </div>
              </div>
            )}

            {gameState.currentMode === "ensemble-coordination" && (
              <div className="space-y-4">
                <p className="text-gray-600">Coordinate parts. Use Sync to align downbeats.</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => setGameState(p => ({ ...p, isPlaying: true }))} className="px-5 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600">Start</button>
                  <button onClick={() => setGameState(p => ({ ...p, isPlaying: false }))} className="px-5 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600">Stop</button>
                  <button onClick={() => setGameState(p => ({ ...p, bpm: Math.round(p.bpm / 5) * 5 }))} className="px-5 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700">Sync</button>
                </div>
                <p className="text-sm text-gray-600">Current BPM: {gameState.bpm} (rounded to nearest 5 on Sync)</p>
              </div>
            )}
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={() => handleAnswer(true)} className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600">Correct</button>
            <button onClick={() => handleAnswer(false)} className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600">Incorrect</button>
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
