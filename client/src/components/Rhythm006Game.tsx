import React, { useState, useEffect, useRef, useCallback } from "react";
import { flushSync } from "react-dom";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";
import { RHYTHM_006_MODES as modes } from "@/lib/gameLogic/rhythm-006Modes";

interface GameState {
  currentMode: string;
  score: number;
  round: number;
  bpm: number;
  isPlaying: boolean;
  taps: number[]; // ms timestamps
  startMs: number | null;
  subdiv: number; // for subdivision practice
  avgErrorMs: number | null; // recent average timing error
  ioiStdMs: number | null; // tempo stability (std dev of inter-onset intervals)
}

export const Rhythm006Game: React.FC = () => {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>({
    currentMode: "steady-beat",
    score: 0,
    round: 1,
    bpm: 80,
    isPlaying: false,
    taps: [],
    startMs: null,
    subdiv: 2,
    avgErrorMs: null,
    ioiStdMs: null,
  });

  // Optimized metronome using Web Audio API with reused nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalIdRef = useRef<number | null>(null);

  const click = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    // Reuse oscillator and gain nodes for better performance
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Optimize audio parameters
    osc.type = "sine"; // More efficient than square
    osc.frequency.setValueAtTime(800, ctx.currentTime); // Slightly lower frequency
    
    // More efficient gain envelope
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }, []);

  useEffect(() => {
    if (!gameState.isPlaying) {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      return;
    }
    
    // Initialize audio context on first use
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Resume context if suspended (browser autoplay policy)
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    }
    
    const ms = 60_000 / Math.max(40, Math.min(200, gameState.bpm));
    
    // Use more precise timing with requestAnimationFrame for better audio sync
    let lastClickTime = 0;
    const scheduleClick = () => {
      const now = performance.now();
      if (now - lastClickTime >= ms) {
        click();
        lastClickTime = now;
      }
      if (gameState.isPlaying) {
        requestAnimationFrame(scheduleClick);
      }
    };
    
    click(); // Initial click
    requestAnimationFrame(scheduleClick);
    
    return () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    };
  }, [gameState.isPlaying, gameState.bpm, click]);
  // Shared helpers - memoized for performance
  const nowMs = useCallback(() => (performance?.now ? performance.now() : Date.now()), []);
  const periodMs = useCallback((bpm: number) => 60000 / Math.max(40, Math.min(200, bpm)), []);

  const resetSession = useCallback(() => setGameState(p => ({ ...p, taps: [], avgErrorMs: null, ioiStdMs: null, startMs: null })), []);
  const startSession = useCallback(() => setGameState(p => ({ ...p, startMs: nowMs(), taps: [], avgErrorMs: null, ioiStdMs: null })), [nowMs]);

  const onTap = useCallback(() => {
    setGameState(p => {
      const t = nowMs();
      const start = p.startMs ?? t;
      const taps = [...p.taps, t];
      let avgErrorMs: number | null = p.avgErrorMs;
      let ioiStdMs: number | null = p.ioiStdMs;
      let scoreDelta = 0;

      if (p.currentMode === "beat-tapping" || p.currentMode === "internal-pulse") {
        const per = periodMs(p.bpm);
        const phase = (t - start) % per;
        const error = Math.min(phase, per - phase);
        const windowMs = p.currentMode === "internal-pulse" ? 120 : 100;
        const recent = taps.slice(-8);
        const avg = recent.reduce((a, b) => a + (Math.min((b - start) % per, per - ((b - start) % per))), 0) / recent.length;
        avgErrorMs = Math.round(avg);
        if (error <= windowMs) scoreDelta = 1;
      }
      if (p.currentMode === "subdivisions") {
        const per = periodMs(p.bpm) / Math.max(1, p.subdiv);
        const phase = (t - start) % per;
        const error = Math.min(phase, per - phase);
        const windowMs = 80;
        const recent = taps.slice(-8);
        const avg = recent.reduce((a, b) => a + (Math.min((b - start) % per, per - ((b - start) % per))), 0) / recent.length;
        avgErrorMs = Math.round(avg);
        if (error <= windowMs) scoreDelta = 1;
      }
      if (p.currentMode === "tempo-stability") {
        if (taps.length >= 4) {
          const iois = taps.slice(1).map((x, i) => x - taps[i]);
          const mean = iois.reduce((a, b) => a + b, 0) / iois.length;
          const variance = iois.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / iois.length;
          ioiStdMs = Math.round(Math.sqrt(variance));
          if (ioiStdMs <= 40) scoreDelta = 1;
        }
      }

      return { ...p, taps, avgErrorMs, ioiStdMs, score: p.score + scoreDelta, startMs: start };
    });
  }, [nowMs, periodMs]);


  const handleModeChange = useCallback((mode: string) => {
    setGameState(prev => ({ ...prev, currentMode: mode, score: 0, round: 1 }));
  }, []);

  const handleAnswer = useCallback((correct: boolean) => {
    setGameState(prev => ({
      ...prev,
      score: correct ? prev.score + 1 : prev.score,
      round: prev.round + 1,
    }));
  }, []);

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
        <h1 className="text-3xl font-bold text-purple-900">Beat & Pulse Trainer</h1>
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
            {gameState.currentMode === "steady-beat" && (
              <div className="space-y-4">
                <p className="text-gray-600">Keep a steady beat with the metronome.</p>
                <div className="flex items-center justify-center gap-3">
                  <label className="text-sm text-gray-600">BPM</label>
                  <input type="range" min={40} max={200} value={gameState.bpm}
                    onChange={(e) => {
                      flushSync(() => {
                        setGameState((p) => ({ ...p, bpm: Number(e.target.value) }));
                      });
                    }} />
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

            {gameState.currentMode === "beat-tapping" && (
              <div className="space-y-4">
                <p className="text-gray-600">Tap with the metronome as precisely as you can.</p>
                <div className="flex items-center justify-center gap-3">
                  <label className="text-sm text-gray-600">BPM</label>
                  <input type="range" min={40} max={200} value={gameState.bpm}
                    onChange={(e) => {
                      flushSync(() => {
                        setGameState((p) => ({ ...p, bpm: Number(e.target.value) }));
                      });
                    }} />
                  <span className="font-semibold text-purple-700">{gameState.bpm}</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  {gameState.isPlaying ? (
                    <button onClick={() => setGameState((p) => ({ ...p, isPlaying: false }))}
                      className="px-5 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600">Stop</button>
                  ) : (
                    <button onClick={() => { resetSession(); startSession(); setGameState((p) => ({ ...p, isPlaying: true })); }}
                      className="px-5 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600">Start</button>
                  )}
                  <button onClick={onTap} className="px-5 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700">Tap</button>
                </div>
                <p className="text-sm text-gray-600">Avg timing error: {gameState.avgErrorMs ?? 0} ms</p>
              </div>
            )}

            {gameState.currentMode === "internal-pulse" && (
              <div className="space-y-4">
                <p className="text-gray-600">Listen to two bars, then keep tapping after it goes silent.</p>
                <div className="flex items-center justify-center gap-3">
                  <label className="text-sm text-gray-600">BPM</label>
                  <input type="range" min={40} max={200} value={gameState.bpm}
                    onChange={(e) => {
                      flushSync(() => {
                        setGameState((p) => ({ ...p, bpm: Number(e.target.value) }));
                      });
                    }} />
                  <span className="font-semibold text-purple-700">{gameState.bpm}</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => {
                    resetSession(); startSession();
                    const ms = periodMs(gameState.bpm) * 8; // two bars of 4
                    setGameState((p) => ({ ...p, isPlaying: true }));
                    window.setTimeout(() => setGameState((p) => ({ ...p, isPlaying: false })), ms);
                  }} className="px-5 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600">Start Exercise</button>
                  <button onClick={onTap} className="px-5 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700">Tap</button>
                </div>
                <p className="text-sm text-gray-600">Avg timing error (silent): {gameState.avgErrorMs ?? 0} ms</p>
              </div>
            )}

            {gameState.currentMode === "subdivisions" && (
              <div className="space-y-4">
                <p className="text-gray-600">Choose a subdivision and tap evenly on each sub-beat.</p>
                <div className="flex items-center justify-center gap-3">
                  <label className="text-sm text-gray-600">BPM</label>
                  <input type="range" min={40} max={200} value={gameState.bpm}
                    onChange={(e) => {
                      flushSync(() => {
                        setGameState((p) => ({ ...p, bpm: Number(e.target.value) }));
                      });
                    }} />
                  <span className="font-semibold text-purple-700">{gameState.bpm}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  {[1,2,3,4].map(n => (
                    <button key={n} onClick={() => setGameState(p => ({ ...p, subdiv: n }))}
                      className={gameState.subdiv === n ? "px-3 py-1 bg-purple-600 text-white rounded" : "px-3 py-1 bg-white text-purple-600 rounded border"}>{n}x</button>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => { resetSession(); startSession(); }} className="px-5 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600">Reset</button>
                  <button onClick={onTap} className="px-5 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700">Tap</button>
                </div>
                <p className="text-sm text-gray-600">Avg timing error: {gameState.avgErrorMs ?? 0} ms</p>
              </div>
            )}

            {gameState.currentMode === "tempo-stability" && (
              <div className="space-y-4">
                <p className="text-gray-600">Tap steadily without a metronome.</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => { resetSession(); startSession(); }} className="px-5 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600">Start</button>
                  <button onClick={onTap} className="px-5 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700">Tap</button>
                </div>
                <p className="text-sm text-gray-600">IOI stability (std dev): {gameState.ioiStdMs ?? 0} ms (lower is better)</p>
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
