import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { RhythmTapChallenge, ChallengeAnswer } from '@shared/types/cadence-quest';
import { playClick } from '@/components/melody-dungeon/dungeonAudio';

interface Props {
  challenge: RhythmTapChallenge;
  shownAt: number;
  onAnswer: (answer: ChallengeAnswer) => void;
  disabled?: boolean;
}

const RhythmTapChallengePanel: React.FC<Props> = ({ challenge, shownAt, onAnswer, disabled }) => {
  const [phase, setPhase] = useState<'listen' | 'tap'>('listen');
  const [taps, setTaps] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const tapStartRef = useRef<number>(0);

  const playPattern = useCallback(() => {
    challenge.pattern.forEach((beat) => {
      setTimeout(() => playClick(), beat.time);
    });
    const total =
      challenge.pattern[challenge.pattern.length - 1].time +
      challenge.pattern[challenge.pattern.length - 1].duration;
    setTimeout(() => setPhase('tap'), total + 300);
  }, [challenge.id]);

  useEffect(() => {
    if (disabled) return;
    const t = setTimeout(playPattern, 500);
    return () => clearTimeout(t);
  }, [playPattern, disabled]);

  const handleTap = () => {
    if (phase !== 'tap' || disabled || feedback !== null) return;
    playClick();
    const now = performance.now();
    if (taps.length === 0) tapStartRef.current = now;
    const newTaps = [...taps, taps.length === 0 ? 0 : now - tapStartRef.current];
    setTaps(newTaps);
    if (newTaps.length >= challenge.pattern.length) {
      const patternIntervals = challenge.pattern
        .slice(1)
        .map((b, i) => b.time - challenge.pattern[i].time);
      const tapIntervals = newTaps.slice(1).map((t, i) => t - newTaps[i]);
      let matchCount = 0;
      for (let i = 0; i < patternIntervals.length; i++) {
        if (
          tapIntervals[i] !== undefined &&
          Math.abs(tapIntervals[i] - patternIntervals[i]) <= challenge.toleranceMs
        )
          matchCount++;
      }
      const correct =
        patternIntervals.length > 0 && matchCount / patternIntervals.length >= 0.5;
      setFeedback(correct);
      onAnswer({
        challengeId: challenge.id,
        value: newTaps,
        responseTimeMs: Date.now() - shownAt,
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <h3 className="text-lg font-bold text-orange-100">
        Tap the rhythm! ({taps.length}/{challenge.pattern.length})
      </h3>
      {phase === 'listen' && (
        <p className="text-gray-200 text-sm animate-pulse">Listen...</p>
      )}
      {phase === 'tap' && (
        <button
          onPointerDown={handleTap}
          disabled={disabled || feedback !== null}
          className="w-20 h-20 rounded-full bg-orange-600 hover:bg-orange-500 active:scale-95 font-bold text-white disabled:opacity-50"
        >
          TAP
        </button>
      )}
    </div>
  );
};

export default RhythmTapChallengePanel;
