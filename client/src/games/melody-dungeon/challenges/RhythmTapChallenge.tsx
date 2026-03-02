import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { Tier } from '../logic/dungeonTypes';
import type { RhythmSubdivision } from '../logic/difficultyAdapter';
import { getRhythmParams } from '../logic/difficultyAdapter';
import { playClick } from '../dungeonAudio';

interface Props {
  tier: Tier;
  onResult: (correct: boolean) => void;
  slowMode?: boolean;
}

/** A single event in the rhythm pattern. */
interface PatternEvent {
  /** Absolute time offset from the start of the pattern (ms). */
  time: number;
  /** Duration this event occupies (ms). */
  duration: number;
  /** Number of taps the player should produce for this event (0 = rest). */
  taps: number;
  /** The subdivision type that generated this event. */
  subdivision: RhythmSubdivision;
}

/** Maps a subdivision to its beat-duration and expected tap count. */
const SUBDIVISION_INFO: Record<RhythmSubdivision, { beats: number; taps: number }> = {
  quarter:         { beats: 1,    taps: 1 },
  half:            { beats: 2,    taps: 1 },
  eighth:          { beats: 0.5,  taps: 1 },
  sixteenth:       { beats: 0.25, taps: 1 },
  'quarter-rest':  { beats: 1,    taps: 0 },
  'dotted-quarter':{ beats: 1.5,  taps: 1 },
  triplet:         { beats: 1,    taps: 3 },
};

/**
 * Generates a rhythm pattern from the given params.
 * Returns an array of PatternEvents (one per subdivision chosen).
 */
function generatePattern(params: ReturnType<typeof getRhythmParams>): PatternEvent[] {
  const beatDuration = 60000 / params.bpm;
  const events: PatternEvent[] = [];
  let currentTime = 0;

  for (let i = 0; i < params.patternLength; i++) {
    const sub = params.subdivisions[Math.floor(Math.random() * params.subdivisions.length)];
    const info = SUBDIVISION_INFO[sub];
    const dur = info.beats * beatDuration;
    events.push({ time: currentTime, duration: dur, taps: info.taps, subdivision: sub });
    currentTime += dur;
  }
  return events;
}

/**
 * Expands a pattern into the expected tap timestamps the player must reproduce.
 * Rests produce no timestamps; triplets produce 3 evenly spaced within the beat.
 */
function getExpectedTapTimes(pattern: PatternEvent[]): number[] {
  const times: number[] = [];
  for (const ev of pattern) {
    if (ev.taps === 0) continue; // rest — no tap
    if (ev.taps === 1) {
      times.push(ev.time);
    } else {
      // triplet: 3 evenly-spaced taps within the event duration
      for (let t = 0; t < ev.taps; t++) {
        times.push(ev.time + (t * ev.duration) / ev.taps);
      }
    }
  }
  return times;
}

/**
 * Determines whether a tap timestamp falls inside any rest window.
 * Used to penalize tapping during rests.
 */
function isInsideRest(tapTime: number, pattern: PatternEvent[], toleranceMs: number): boolean {
  for (const ev of pattern) {
    if (ev.taps !== 0) continue;
    const restStart = ev.time - toleranceMs;
    const restEnd = ev.time + ev.duration + toleranceMs;
    if (tapTime >= restStart && tapTime <= restEnd) return true;
  }
  return false;
}

const RhythmTapChallenge: React.FC<Props> = ({ tier, onResult, slowMode }) => {
  const params = useMemo(() => {
    const p = getRhythmParams(tier);
    return slowMode ? { ...p, bpm: Math.round(p.bpm / 2) } : p;
  }, [tier, slowMode]);
  const [phase, setPhase] = useState<'listen' | 'tap' | 'done'>('listen');
  const [pattern] = useState<PatternEvent[]>(() => generatePattern(params));
  const [taps, setTaps] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [playbackIndex, setPlaybackIndex] = useState(-1);
  const tapStartRef = useRef<number>(0);

  const expectedTaps = useMemo(() => getExpectedTapTimes(pattern), [pattern]);
  const tapCountTarget = expectedTaps.length;

  // ── Playback ──────────────────────────────────────────────
  const playPattern = useCallback(() => {
    setPlaybackIndex(0);
    // Schedule clicks for tap events (not rests)
    const tapTimes = getExpectedTapTimes(pattern);
    tapTimes.forEach((t) => {
      setTimeout(() => playClick(), t);
    });
    // Highlight each pattern event during playback
    pattern.forEach((ev, i) => {
      setTimeout(() => setPlaybackIndex(i), ev.time);
    });
    const last = pattern[pattern.length - 1];
    const totalDuration = last.time + last.duration;
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

  // ── Handle tap ────────────────────────────────────────────
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

  // ── Evaluate ──────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'tap' || taps.length < tapCountTarget) return;

    // Build expected intervals between consecutive taps
    const expectedIntervals = expectedTaps.slice(1).map((t, i) => t - expectedTaps[i]);
    const tapIntervals = taps.slice(1).map((t, i) => t - taps[i]);

    let matchCount = 0;
    for (let i = 0; i < expectedIntervals.length; i++) {
      if (tapIntervals[i] !== undefined) {
        const diff = Math.abs(tapIntervals[i] - expectedIntervals[i]);
        if (diff <= params.toleranceMs) matchCount++;
      }
    }

    // Check for rest violations: did the player tap during a rest?
    const hasRests = pattern.some((ev) => ev.taps === 0);
    let restPenalty = 0;
    if (hasRests && expectedTaps.length > 0) {
      // Re-anchor taps to pattern time before checking rest violations
      const offset = expectedTaps[0];
      for (const tapTime of taps) {
        if (isInsideRest(tapTime + offset, pattern, params.toleranceMs)) {
          restPenalty++;
        }
      }
    }

    const totalIntervals = expectedIntervals.length;
    const accuracy = totalIntervals > 0 ? Math.max(0, matchCount - restPenalty) / totalIntervals : 1;
    const correct = accuracy >= 0.5;
    setFeedback(correct ? 'correct' : 'wrong');
    setPhase('done');
    setTimeout(() => onResult(correct), 1000);
  }, [taps, tapCountTarget, pattern, expectedTaps, params.toleranceMs, phase, onResult]);

  // ── Visual beat indicators ────────────────────────────────
  const beatVisuals = pattern.map((ev, i) => {
    const isRest = ev.taps === 0;
    const isTriplet = ev.subdivision === 'triplet';
    const isDotted = ev.subdivision === 'dotted-quarter';
    const playing = i === playbackIndex;

    // Count how many taps have been registered for events up to and including this one
    const tapsBeforeThis = pattern.slice(0, i).reduce((sum, e) => sum + e.taps, 0);
    const tapsForThis = ev.taps;
    const tappedCount = Math.max(0, Math.min(tapsForThis, taps.length - tapsBeforeThis));
    const fullyTapped = tappedCount >= tapsForThis && tapsForThis > 0;

    if (isRest) {
      return (
        <div
          key={i}
          className={`
            w-8 h-8 rounded flex items-center justify-center border-2 transition-all duration-100
            ${playing ? 'bg-gray-500 border-gray-400 scale-110' : 'bg-gray-800 border-gray-600'}
          `}
          title="Rest"
        >
          <span className="text-gray-400 text-xs font-mono">𝄽</span>
        </div>
      );
    }

    if (isTriplet) {
      return (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <span className="text-amber-300 text-[10px] font-bold">3</span>
          <div className="flex gap-0.5">
            {[0, 1, 2].map((t) => {
              const thisTapped = tappedCount > t;
              return (
                <div
                  key={t}
                  className={`
                    w-2.5 h-2.5 rounded-full border transition-all duration-100
                    ${playing ? 'bg-amber-400 border-amber-300 scale-125' :
                      thisTapped ? 'bg-purple-500 border-purple-400' :
                      'bg-gray-700 border-gray-600'}
                  `}
                />
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div
        key={i}
        className={`
          w-8 h-8 rounded-full border-2 transition-all duration-100 flex items-center justify-center
          ${playing ? 'bg-amber-400 border-amber-300 scale-125' :
            fullyTapped ? 'bg-purple-500 border-purple-400' :
            'bg-gray-700 border-gray-600'}
        `}
      >
        {isDotted && <span className="text-white text-[8px] font-bold">.</span>}
      </div>
    );
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-bold text-amber-200">Tap the Rhythm!</h3>

      <div className="flex gap-2 justify-center items-end">{beatVisuals}</div>

      {phase === 'listen' && (
        <p className="text-gray-400 text-sm animate-pulse">Listen carefully...</p>
      )}

      {phase === 'tap' && (
        <>
          <p className="text-gray-300 text-sm">
            Tap {tapCountTarget} beat{tapCountTarget !== 1 ? 's' : ''} ({taps.length}/{tapCountTarget})
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
