import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Tier } from '../logic/dungeonTypes';
import { getIntervalParams } from '../logic/difficultyAdapter';
import { playTwoNotes, getFrequency, ALL_NOTE_KEYS } from '../dungeonAudio';
import { getIntervalSvgUrl } from '../logic/intervalAssets';
import NotationImage from '@/common/notation/NotationImage';

interface Props {
  tier: Tier;
  onResult: (correct: boolean) => void;
  showHint?: boolean;
}

// ── Shared helpers ──────────────────────────────────────────

/** Pick a random base note index, leaving room for the interval offset. */
function pickBaseIndex(semitones: number): number {
  const absSemitones = Math.abs(semitones);
  const maxBase = Math.max(0, ALL_NOTE_KEYS.length - 1 - absSemitones);
  const minBase = semitones < 0 ? absSemitones : 0;
  const range = Math.max(1, maxBase - minBase + 1);
  return minBase + Math.floor(Math.random() * range);
}

/** Find the closest note key to a target frequency. */
function closestNoteKey(targetFreq: number): string {
  let closestKey = ALL_NOTE_KEYS[0];
  let closestDiff = Infinity;
  for (const key of ALL_NOTE_KEYS) {
    const diff = Math.abs(getFrequency(key) - targetFreq);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestKey = key;
    }
  }
  return closestKey;
}

// ── Standard mode (T3-T5) ───────────────────────────────────

function useStandardChallenge(params: ReturnType<typeof getIntervalParams>) {
  return useMemo(() => {
    const interval = params.intervals[Math.floor(Math.random() * params.intervals.length)];
    const baseIdx = Math.floor(Math.random() * Math.max(1, ALL_NOTE_KEYS.length - 7));
    const baseNote = ALL_NOTE_KEYS[baseIdx];

    const baseFreq = getFrequency(baseNote);
    const targetFreq = baseFreq * Math.pow(2, interval.semitones / 12);
    const topNote = closestNoteKey(targetFreq);

    return { interval, baseNote, topNote };
  }, [params]);
}

// ── HighLow mode (T1) ──────────────────────────────────────

function useHighLowChallenge(params: ReturnType<typeof getIntervalParams>) {
  return useMemo(() => {
    const interval = params.intervals[Math.floor(Math.random() * params.intervals.length)];
    const baseIdx = pickBaseIndex(interval.semitones);
    const baseNote = ALL_NOTE_KEYS[baseIdx];

    const baseFreq = getFrequency(baseNote);
    const targetFreq = baseFreq * Math.pow(2, interval.semitones / 12);
    const topNote = interval.semitones === 0 ? baseNote : closestNoteKey(targetFreq);

    // Determine correct answer based on direction
    let correctAnswer: string;
    if (interval.semitones > 0) correctAnswer = 'Higher';
    else if (interval.semitones < 0) correctAnswer = 'Lower';
    else correctAnswer = 'Same';

    return { interval, baseNote, topNote, correctAnswer };
  }, [params]);
}

// ── StepSkip mode (T2) ─────────────────────────────────────

function useStepSkipChallenge(params: ReturnType<typeof getIntervalParams>) {
  return useMemo(() => {
    const interval = params.intervals[Math.floor(Math.random() * params.intervals.length)];
    // For step/skip, randomly go up or down
    const direction = Math.random() < 0.5 ? 1 : -1;
    const actualSemitones = interval.semitones === 0 ? 0 : interval.semitones * direction;
    const baseIdx = pickBaseIndex(actualSemitones);
    const baseNote = ALL_NOTE_KEYS[baseIdx];

    const baseFreq = getFrequency(baseNote);
    const targetFreq = baseFreq * Math.pow(2, actualSemitones / 12);
    const topNote = actualSemitones === 0 ? baseNote : closestNoteKey(targetFreq);

    // The correct answer is the interval name (Same, Step, or Skip)
    return { interval, baseNote, topNote, correctAnswer: interval.name };
  }, [params]);
}

// ── Sub-components per mode ─────────────────────────────────

const HighLowMode: React.FC<{
  params: ReturnType<typeof getIntervalParams>;
  onResult: (correct: boolean) => void;
  showHint?: boolean;
}> = ({ params, onResult, showHint }) => {
  const challenge = useHighLowChallenge(params);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hintShown, setHintShown] = useState(false);

  useEffect(() => {
    if (!showHint) return;
    setHintShown(true);
    const timer = setTimeout(() => setHintShown(false), 1500);
    return () => clearTimeout(timer);
  }, [showHint]);

  const playInterval = useCallback(() => {
    playTwoNotes(challenge.baseNote, challenge.topNote, 0.5);
  }, [challenge]);

  useEffect(() => {
    const timer = setTimeout(playInterval, 400);
    return () => clearTimeout(timer);
  }, [playInterval]);

  const handleAnswer = (answer: string) => {
    if (feedback) return;
    const correct = answer === challenge.correctAnswer;
    setFeedback(correct ? 'correct' : 'wrong');
    setTimeout(() => onResult(correct), 800);
  };

  const buttons = ['Higher', 'Lower', 'Same'];

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-bold text-cyan-200">Higher or Lower?</h3>
      <p className="text-gray-400 text-sm">Is the second note higher or lower?</p>

      <button
        onClick={playInterval}
        className="px-4 py-2 bg-cyan-800 hover:bg-cyan-700 text-white rounded-lg text-sm transition-colors"
      >
        Hear Again
      </button>

      <div className="flex flex-wrap justify-center gap-3">
        {buttons.map((label) => {
          const isHinted = hintShown && challenge.correctAnswer === label;
          return (
            <button
              key={label}
              onClick={() => handleAnswer(label)}
              disabled={!!feedback}
              className={`
                px-6 py-4 rounded-xl font-bold text-lg transition-all min-w-[100px]
                ${feedback && challenge.correctAnswer === label
                  ? 'bg-green-600 text-white scale-110'
                  : feedback
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-cyan-700 hover:bg-cyan-600 text-white active:scale-95'}
                ${isHinted ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-transparent' : ''}
                disabled:cursor-default
              `}
            >
              {label === 'Higher' ? '\u2B06 Higher' : label === 'Lower' ? '\u2B07 Lower' : '\u2194 Same'}
            </button>
          );
        })}
      </div>

      {feedback && (
        <p className={`font-bold text-lg ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
          {feedback === 'correct' ? 'Correct!' : `It was ${challenge.correctAnswer}!`}
        </p>
      )}
    </div>
  );
};

const StepSkipMode: React.FC<{
  params: ReturnType<typeof getIntervalParams>;
  onResult: (correct: boolean) => void;
  showHint?: boolean;
}> = ({ params, onResult, showHint }) => {
  const challenge = useStepSkipChallenge(params);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hintShown, setHintShown] = useState(false);

  useEffect(() => {
    if (!showHint) return;
    setHintShown(true);
    const timer = setTimeout(() => setHintShown(false), 1500);
    return () => clearTimeout(timer);
  }, [showHint]);

  const playInterval = useCallback(() => {
    playTwoNotes(challenge.baseNote, challenge.topNote, 0.5);
  }, [challenge]);

  useEffect(() => {
    const timer = setTimeout(playInterval, 400);
    return () => clearTimeout(timer);
  }, [playInterval]);

  const handleAnswer = (answer: string) => {
    if (feedback) return;
    const correct = answer === challenge.correctAnswer;
    setFeedback(correct ? 'correct' : 'wrong');
    setTimeout(() => onResult(correct), 800);
  };

  const buttons = ['Step', 'Skip', 'Same'];

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-bold text-cyan-200">Step, Skip, or Same?</h3>
      <p className="text-gray-400 text-sm">Did the melody move by step, skip, or stay the same?</p>

      <button
        onClick={playInterval}
        className="px-4 py-2 bg-cyan-800 hover:bg-cyan-700 text-white rounded-lg text-sm transition-colors"
      >
        Hear Again
      </button>

      <div className="flex flex-wrap justify-center gap-3">
        {buttons.map((label) => {
          const isHinted = hintShown && challenge.correctAnswer === label;
          return (
            <button
              key={label}
              onClick={() => handleAnswer(label)}
              disabled={!!feedback}
              className={`
                px-6 py-4 rounded-xl font-bold text-lg transition-all min-w-[100px]
                ${feedback && challenge.correctAnswer === label
                  ? 'bg-green-600 text-white scale-110'
                  : feedback
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-cyan-700 hover:bg-cyan-600 text-white active:scale-95'}
                ${isHinted ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-transparent' : ''}
                disabled:cursor-default
              `}
            >
              {label}
            </button>
          );
        })}
      </div>

      {feedback && (
        <p className={`font-bold text-lg ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
          {feedback === 'correct' ? 'Correct!' : `It was ${challenge.correctAnswer}!`}
        </p>
      )}
    </div>
  );
};

const StandardMode: React.FC<{
  params: ReturnType<typeof getIntervalParams>;
  onResult: (correct: boolean) => void;
  showHint?: boolean;
}> = ({ params, onResult, showHint }) => {
  const challenge = useStandardChallenge(params);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hintShown, setHintShown] = useState(false);

  useEffect(() => {
    if (!showHint) return;
    setHintShown(true);
    const timer = setTimeout(() => setHintShown(false), 1500);
    return () => clearTimeout(timer);
  }, [showHint]);

  const playInterval = useCallback(() => {
    playTwoNotes(challenge.baseNote, challenge.topNote, 0.5);
  }, [challenge]);

  useEffect(() => {
    const timer = setTimeout(playInterval, 400);
    return () => clearTimeout(timer);
  }, [playInterval]);

  const handleAnswer = (name: string) => {
    if (feedback) return;
    const correct = name === challenge.interval.name;
    setFeedback(correct ? 'correct' : 'wrong');
    setTimeout(() => onResult(correct), 800);
  };

  const intervalUrl = getIntervalSvgUrl(challenge.interval.name);

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-bold text-cyan-200">Name the Interval!</h3>
      {/* Interval reference notation */}
      {intervalUrl && (
        <NotationImage
          src={intervalUrl}
          alt={`${challenge.interval.name} interval notation`}
          className="mb-1"
        />
      )}
      <p className="text-gray-400 text-sm">Listen to the two notes and identify the interval.</p>

      <button
        onClick={playInterval}
        className="px-4 py-2 bg-cyan-800 hover:bg-cyan-700 text-white rounded-lg text-sm transition-colors"
      >
        Hear Again
      </button>

      <div className="flex flex-wrap justify-center gap-2">
        {params.intervals.map((iv) => {
          const isHinted = hintShown && challenge.interval.name === iv.name;
          return (
            <button
              key={iv.name}
              onClick={() => handleAnswer(iv.name)}
              disabled={!!feedback}
              className={`
                px-4 py-2 rounded-lg font-semibold text-sm transition-all
                ${feedback && challenge.interval.name === iv.name
                  ? 'bg-green-600 text-white scale-110'
                  : feedback
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-cyan-700 hover:bg-cyan-600 text-white active:scale-95'}
                ${isHinted ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-transparent' : ''}
                disabled:cursor-default
              `}
            >
              {iv.name}
            </button>
          );
        })}
      </div>

      {feedback && (
        <p className={`font-bold text-lg ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
          {feedback === 'correct' ? 'Correct!' : `It was a ${challenge.interval.name}`}
        </p>
      )}
    </div>
  );
};

// ── Main component ──────────────────────────────────────────

const IntervalChallenge: React.FC<Props> = ({ tier, onResult, showHint }) => {
  const params = useMemo(() => getIntervalParams(tier), [tier]);

  switch (params.mode) {
    case 'highLow':
      return <HighLowMode params={params} onResult={onResult} showHint={showHint} />;
    case 'stepSkip':
      return <StepSkipMode params={params} onResult={onResult} showHint={showHint} />;
    case 'standard':
      return <StandardMode params={params} onResult={onResult} showHint={showHint} />;
  }
};

export default IntervalChallenge;
