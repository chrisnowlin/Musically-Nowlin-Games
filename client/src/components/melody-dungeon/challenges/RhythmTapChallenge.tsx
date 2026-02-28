import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { DifficultyLevel } from '@/lib/gameLogic/dungeonTypes';
import { getRhythmParams } from '@/lib/gameLogic/difficultyAdapter';
import { playClick } from '../dungeonAudio';

interface Props {
  difficulty: DifficultyLevel;
  onResult: (correct: boolean) => void;
  slowMode?: boolean;
}

type Beat = { time: number; duration: number };

function generatePattern(params: ReturnType<typeof getRhythmParams>): Beat[] {
  const beatDuration = 60000 / params.bpm;
  const durationMap: Record<string, number> = {
    quarter: 1,
    half: 2,
    eighth: 0.5,
    sixteenth: 0.25,
  };

  const beats: Beat[] = [];
  let currentTime = 0;
  for (let i = 0; i < params.patternLength; i++) {
    const sub = params.subdivisions[Math.floor(Math.random() * params.subdivisions.length)];
    const dur = durationMap[sub] * beatDuration;
    beats.push({ time: currentTime, duration: dur });
    currentTime += dur;
  }
  return beats;
}

const RhythmTapChallenge: React.FC<Props> = ({ difficulty, onResult, slowMode }) => {
  const params = useMemo(() => {
    const p = getRhythmParams(difficulty);
    return slowMode ? { ...p, bpm: Math.round(p.bpm / 2) } : p;
  }, [difficulty, slowMode]);
  const [phase, setPhase] = useState<'listen' | 'tap' | 'done'>('listen');
  const [pattern] = useState<Beat[]>(() => generatePattern(params));
  const [taps, setTaps] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [playbackIndex, setPlaybackIndex] = useState(-1);
  const tapStartRef = useRef<number>(0);
  const tapCountTarget = pattern.length;

  const playPattern = useCallback(() => {
    setPlaybackIndex(0);
    pattern.forEach((beat, i) => {
      setTimeout(() => {
        playClick();
        setPlaybackIndex(i);
      }, beat.time);
    });
    const totalDuration = pattern[pattern.length - 1].time + pattern[pattern.length - 1].duration;
    setTimeout(() => {
      setPlaybackIndex(-1);
      setPhase('tap');
      tapStartRef.current = 0;
    }, totalDuration + 300);
  }, [pattern]);

  useEffect(() => {
    const timer = setTimeout(playPattern, 500);
    return () => clearTimeout(timer);
  }, [playPattern]);

  const handleTap = () => {
    if (phase !== 'tap' || feedback) return;
    playClick();

    const now = performance.now();
    if (taps.length === 0) {
      tapStartRef.current = now;
      setTaps([0]);
    } else {
      const elapsed = now - tapStartRef.current;
      setTaps((prev) => [...prev, elapsed]);
    }
  };

  useEffect(() => {
    if (phase !== 'tap' || taps.length < tapCountTarget) return;

    // Compare tap intervals with pattern intervals
    const patternIntervals = pattern.slice(1).map((b, i) => b.time - pattern[i].time);
    const tapIntervals = taps.slice(1).map((t, i) => t - taps[i]);

    let matchCount = 0;
    for (let i = 0; i < patternIntervals.length; i++) {
      if (tapIntervals[i] !== undefined) {
        const diff = Math.abs(tapIntervals[i] - patternIntervals[i]);
        if (diff <= params.toleranceMs) matchCount++;
      }
    }

    const accuracy = patternIntervals.length > 0 ? matchCount / patternIntervals.length : 1;
    const correct = accuracy >= 0.5;
    setFeedback(correct ? 'correct' : 'wrong');
    setPhase('done');
    setTimeout(() => onResult(correct), 1000);
  }, [taps, tapCountTarget, pattern, params.toleranceMs, phase, onResult]);

  const beatVisuals = pattern.map((_, i) => {
    const tapped = i < taps.length;
    const playing = i === playbackIndex;
    return (
      <div
        key={i}
        className={`
          w-8 h-8 rounded-full border-2 transition-all duration-100
          ${playing ? 'bg-amber-400 border-amber-300 scale-125' :
            tapped ? 'bg-purple-500 border-purple-400' :
            'bg-gray-700 border-gray-600'}
        `}
      />
    );
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-bold text-amber-200">Tap the Rhythm!</h3>

      <div className="flex gap-2 justify-center">{beatVisuals}</div>

      {phase === 'listen' && (
        <p className="text-gray-400 text-sm animate-pulse">Listen carefully...</p>
      )}

      {phase === 'tap' && (
        <>
          <p className="text-gray-300 text-sm">
            Tap {tapCountTarget} beats ({taps.length}/{tapCountTarget})
          </p>
          <button
            onPointerDown={handleTap}
            className="w-24 h-24 rounded-full bg-amber-700 hover:bg-amber-600 active:bg-amber-500 active:scale-95 border-4 border-amber-500 text-white font-bold text-xl transition-all touch-manipulation select-none"
          >
            TAP
          </button>
        </>
      )}

      {phase === 'listen' && (
        <button
          onClick={playPattern}
          className="text-xs text-amber-300 underline"
        >
          Replay
        </button>
      )}

      {feedback && (
        <p className={`font-bold text-lg ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
          {feedback === 'correct' ? 'Great rhythm!' : 'Not quite right'}
        </p>
      )}
    </div>
  );
};

export default RhythmTapChallenge;
