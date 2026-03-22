import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Tier } from '../logic/dungeonTypes';
import { getIntervalParams } from '../logic/difficultyAdapter';
import { playTwoNotes, getFrequency, ALL_NOTE_KEYS } from '../dungeonAudio';
import { getIntervalSvgUrl } from '../logic/intervalAssets';
import NotationImage from '@/common/notation/NotationImage';
import CorrectiveFeedback, { CorrectBanner } from './CorrectiveFeedback';
import { getIntervalExplanation } from '../logic/explanations';
import type { LearningState } from '../logic/learningState';
import { intervalConceptId, shouldGuide, markGuidedSeen, recordCorrect, recordWrong } from '../logic/learningState';

interface Props {
  tier: Tier;
  onResult: (correct: boolean) => void;
  showHint?: boolean;
  onListeningChange?: (isPlaying: boolean) => void;
  learningState?: LearningState;
  onLearningUpdate?: (state: LearningState) => void;
  floorNumber?: number;
}

// ── Shared helpers ──────────────────────────────────────────

function pickBaseIndex(semitones: number): number {
  const absSemitones = Math.abs(semitones);
  const maxBase = Math.max(0, ALL_NOTE_KEYS.length - 1 - absSemitones);
  const minBase = semitones < 0 ? absSemitones : 0;
  const range = Math.max(1, maxBase - minBase + 1);
  return minBase + Math.floor(Math.random() * range);
}

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
    const direction = Math.random() < 0.5 ? 1 : -1;
    const actualSemitones = interval.semitones === 0 ? 0 : interval.semitones * direction;
    const baseIdx = pickBaseIndex(actualSemitones);
    const baseNote = ALL_NOTE_KEYS[baseIdx];
    const baseFreq = getFrequency(baseNote);
    const targetFreq = baseFreq * Math.pow(2, actualSemitones / 12);
    const topNote = actualSemitones === 0 ? baseNote : closestNoteKey(targetFreq);
    return { interval, baseNote, topNote, correctAnswer: interval.name };
  }, [params]);
}

// ── Sub-components per mode ─────────────────────────────────

const HighLowMode: React.FC<{
  params: ReturnType<typeof getIntervalParams>;
  onResult: (correct: boolean) => void;
  showHint?: boolean;
  onListeningChange?: (isPlaying: boolean) => void;
  learningState?: LearningState;
  onLearningUpdate?: (state: LearningState) => void;
  floorNumber?: number;
}> = ({ params, onResult, showHint, onListeningChange, learningState, onLearningUpdate, floorNumber }) => {
  const challenge = useHighLowChallenge(params);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const audioTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => () => { audioTimersRef.current.forEach(clearTimeout); audioTimersRef.current.clear(); }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => { audioTimersRef.current.delete(id); fn(); }, ms);
    audioTimersRef.current.add(id);
  }, []);

  const conceptId = intervalConceptId('highLow', challenge.correctAnswer);
  const isGuided = !!(learningState && shouldGuide(learningState, conceptId));

  useEffect(() => {
    if (!showHint) return;
    setHintShown(true);
    const timer = setTimeout(() => setHintShown(false), 1500);
    return () => clearTimeout(timer);
  }, [showHint]);

  const playInterval = useCallback(() => {
    onListeningChange?.(true);
    playTwoNotes(challenge.baseNote, challenge.topNote, 0.5, 0.5, 0.5);
    schedule(() => onListeningChange?.(false), 1200);
  }, [challenge, onListeningChange, schedule]);

  useEffect(() => {
    const timer = setTimeout(playInterval, 400);
    return () => clearTimeout(timer);
  }, [playInterval]);

  const handleAnswer = useCallback((answer: string) => {
    if (feedback) return;
    const correct = answer === challenge.correctAnswer;
    setFeedback(correct ? 'correct' : 'wrong');

    if (learningState && onLearningUpdate && floorNumber !== undefined) {
      let updated = learningState;
      if (isGuided) updated = markGuidedSeen(updated, conceptId);
      if (correct) {
        updated = recordCorrect(updated, conceptId, floorNumber);
      } else {
        const wrongConceptId = intervalConceptId('highLow', answer);
        updated = recordWrong(updated, conceptId, floorNumber, wrongConceptId);
      }
      onLearningUpdate(updated);
    }

    if (correct) {
      setTimeout(() => onResult(true), 800);
    }
  }, [feedback, challenge.correctAnswer, learningState, onLearningUpdate, floorNumber, isGuided, conceptId, onResult]);

  const handleDismiss = useCallback(() => {
    onResult(false);
  }, [onResult]);

  const buttons = ['Higher', 'Lower', 'Same'];
  const { explanation, mnemonic } = getIntervalExplanation(challenge.correctAnswer, 'highLow');

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-bold text-cyan-200">Higher or Lower?</h3>
      {isGuided && !feedback && (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-800/70 text-blue-200 border border-blue-600/50">
          LEARN
        </span>
      )}
      <p className="text-gray-400 text-sm">Is the second note higher or lower?</p>
      {isGuided && !feedback && (
        <p className="text-blue-300/80 text-xs text-center italic px-4">
          Listen carefully — the second note is {challenge.correctAnswer.toLowerCase()}. Tap {challenge.correctAnswer}!
        </p>
      )}

      <button
        onClick={playInterval}
        className="px-4 py-2 bg-cyan-800 hover:bg-cyan-700 text-white rounded-lg text-sm transition-colors"
      >
        Hear Again
      </button>

      <div className="flex flex-wrap justify-center gap-3">
        {buttons.map((label) => {
          const isHinted = hintShown && challenge.correctAnswer === label;
          const isGuidedHighlight = isGuided && challenge.correctAnswer === label && !feedback;
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
                    : isGuidedHighlight
                      ? 'bg-cyan-700 ring-2 ring-blue-400 ring-offset-1 ring-offset-transparent text-white animate-pulse'
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

      {feedback === 'correct' && <CorrectBanner />}
      {feedback === 'wrong' && (
        <CorrectiveFeedback
          explanation={`It was ${challenge.correctAnswer}. ${explanation}`}
          mnemonic={mnemonic}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
};

const StepSkipMode: React.FC<{
  params: ReturnType<typeof getIntervalParams>;
  onResult: (correct: boolean) => void;
  showHint?: boolean;
  onListeningChange?: (isPlaying: boolean) => void;
  learningState?: LearningState;
  onLearningUpdate?: (state: LearningState) => void;
  floorNumber?: number;
}> = ({ params, onResult, showHint, onListeningChange, learningState, onLearningUpdate, floorNumber }) => {
  const challenge = useStepSkipChallenge(params);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const audioTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => () => { audioTimersRef.current.forEach(clearTimeout); audioTimersRef.current.clear(); }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => { audioTimersRef.current.delete(id); fn(); }, ms);
    audioTimersRef.current.add(id);
  }, []);

  const conceptId = intervalConceptId('stepSkip', challenge.correctAnswer);
  const isGuided = !!(learningState && shouldGuide(learningState, conceptId));

  useEffect(() => {
    if (!showHint) return;
    setHintShown(true);
    const timer = setTimeout(() => setHintShown(false), 1500);
    return () => clearTimeout(timer);
  }, [showHint]);

  const playInterval = useCallback(() => {
    onListeningChange?.(true);
    playTwoNotes(challenge.baseNote, challenge.topNote, 0.5, 0.5, 0.5);
    schedule(() => onListeningChange?.(false), 1200);
  }, [challenge, onListeningChange, schedule]);

  useEffect(() => {
    const timer = setTimeout(playInterval, 400);
    return () => clearTimeout(timer);
  }, [playInterval]);

  const handleAnswer = useCallback((answer: string) => {
    if (feedback) return;
    const correct = answer === challenge.correctAnswer;
    setFeedback(correct ? 'correct' : 'wrong');

    if (learningState && onLearningUpdate && floorNumber !== undefined) {
      let updated = learningState;
      if (isGuided) updated = markGuidedSeen(updated, conceptId);
      if (correct) {
        updated = recordCorrect(updated, conceptId, floorNumber);
      } else {
        const wrongConceptId = intervalConceptId('stepSkip', answer);
        updated = recordWrong(updated, conceptId, floorNumber, wrongConceptId);
      }
      onLearningUpdate(updated);
    }

    if (correct) {
      setTimeout(() => onResult(true), 800);
    }
  }, [feedback, challenge.correctAnswer, learningState, onLearningUpdate, floorNumber, isGuided, conceptId, onResult]);

  const handleDismiss = useCallback(() => {
    onResult(false);
  }, [onResult]);

  const buttons = ['Step', 'Skip', 'Same'];
  const { explanation, mnemonic } = getIntervalExplanation(challenge.correctAnswer, 'stepSkip');

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-bold text-cyan-200">Step, Skip, or Same?</h3>
      {isGuided && !feedback && (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-800/70 text-blue-200 border border-blue-600/50">
          LEARN
        </span>
      )}
      <p className="text-gray-400 text-sm">Did the melody move by step, skip, or stay the same?</p>
      {isGuided && !feedback && (
        <p className="text-blue-300/80 text-xs text-center italic px-4">
          This is a {challenge.correctAnswer.toLowerCase()}. Tap {challenge.correctAnswer}!
        </p>
      )}

      <button
        onClick={playInterval}
        className="px-4 py-2 bg-cyan-800 hover:bg-cyan-700 text-white rounded-lg text-sm transition-colors"
      >
        Hear Again
      </button>

      <div className="flex flex-wrap justify-center gap-3">
        {buttons.map((label) => {
          const isHinted = hintShown && challenge.correctAnswer === label;
          const isGuidedHighlight = isGuided && challenge.correctAnswer === label && !feedback;
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
                    : isGuidedHighlight
                      ? 'bg-cyan-700 ring-2 ring-blue-400 ring-offset-1 ring-offset-transparent text-white animate-pulse'
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

      {feedback === 'correct' && <CorrectBanner />}
      {feedback === 'wrong' && (
        <CorrectiveFeedback
          explanation={`It was ${challenge.correctAnswer}. ${explanation}`}
          mnemonic={mnemonic}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
};

const StandardMode: React.FC<{
  params: ReturnType<typeof getIntervalParams>;
  onResult: (correct: boolean) => void;
  showHint?: boolean;
  onListeningChange?: (isPlaying: boolean) => void;
  learningState?: LearningState;
  onLearningUpdate?: (state: LearningState) => void;
  floorNumber?: number;
}> = ({ params, onResult, showHint, onListeningChange, learningState, onLearningUpdate, floorNumber }) => {
  const challenge = useStandardChallenge(params);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const audioTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => () => { audioTimersRef.current.forEach(clearTimeout); audioTimersRef.current.clear(); }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => { audioTimersRef.current.delete(id); fn(); }, ms);
    audioTimersRef.current.add(id);
  }, []);

  const conceptId = intervalConceptId('standard', challenge.interval.name);
  const isGuided = !!(learningState && shouldGuide(learningState, conceptId));

  useEffect(() => {
    if (!showHint) return;
    setHintShown(true);
    const timer = setTimeout(() => setHintShown(false), 1500);
    return () => clearTimeout(timer);
  }, [showHint]);

  const playInterval = useCallback(() => {
    onListeningChange?.(true);
    playTwoNotes(challenge.baseNote, challenge.topNote, 0.5, 0.5, 0.5);
    schedule(() => onListeningChange?.(false), 1200);
  }, [challenge, onListeningChange, schedule]);

  useEffect(() => {
    const timer = setTimeout(playInterval, 400);
    return () => clearTimeout(timer);
  }, [playInterval]);

  const handleAnswer = useCallback((name: string) => {
    if (feedback) return;
    const correct = name === challenge.interval.name;
    setFeedback(correct ? 'correct' : 'wrong');

    if (learningState && onLearningUpdate && floorNumber !== undefined) {
      let updated = learningState;
      if (isGuided) updated = markGuidedSeen(updated, conceptId);
      if (correct) {
        updated = recordCorrect(updated, conceptId, floorNumber);
      } else {
        const wrongConceptId = intervalConceptId('standard', name);
        updated = recordWrong(updated, conceptId, floorNumber, wrongConceptId);
      }
      onLearningUpdate(updated);
    }

    if (correct) {
      setTimeout(() => onResult(true), 800);
    }
  }, [feedback, challenge.interval.name, learningState, onLearningUpdate, floorNumber, isGuided, conceptId, onResult]);

  const handleDismiss = useCallback(() => {
    onResult(false);
  }, [onResult]);

  const intervalUrl = getIntervalSvgUrl(challenge.interval.name);
  const { explanation, mnemonic } = getIntervalExplanation(challenge.interval.name, 'standard');

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-bold text-cyan-200">Name the Interval!</h3>
      {isGuided && !feedback && (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-800/70 text-blue-200 border border-blue-600/50">
          LEARN
        </span>
      )}
      {intervalUrl && (
        <NotationImage
          src={intervalUrl}
          alt={`${challenge.interval.name} interval notation`}
          className="mb-1"
        />
      )}
      <p className="text-gray-400 text-sm">Listen to the two notes and identify the interval.</p>
      {isGuided && !feedback && (
        <p className="text-blue-300/80 text-xs text-center italic px-4">
          This interval is a {challenge.interval.name}. Tap it below!
        </p>
      )}

      <button
        onClick={playInterval}
        className="px-4 py-2 bg-cyan-800 hover:bg-cyan-700 text-white rounded-lg text-sm transition-colors"
      >
        Hear Again
      </button>

      <div className="flex flex-wrap justify-center gap-2">
        {params.intervals.map((iv) => {
          const isHinted = hintShown && challenge.interval.name === iv.name;
          const isGuidedHighlight = isGuided && challenge.interval.name === iv.name && !feedback;
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
                    : isGuidedHighlight
                      ? 'bg-cyan-700 ring-2 ring-blue-400 ring-offset-1 ring-offset-transparent text-white animate-pulse'
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

      {feedback === 'correct' && <CorrectBanner />}
      {feedback === 'wrong' && (
        <CorrectiveFeedback
          explanation={`It was a ${challenge.interval.name}. ${explanation}`}
          mnemonic={mnemonic}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
};

// ── Main component ──────────────────────────────────────────

const IntervalChallenge: React.FC<Props> = ({ tier, onResult, showHint, onListeningChange, learningState, onLearningUpdate, floorNumber }) => {
  const params = useMemo(() => getIntervalParams(tier), [tier]);

  switch (params.mode) {
    case 'highLow':
      return <HighLowMode params={params} onResult={onResult} showHint={showHint} onListeningChange={onListeningChange} learningState={learningState} onLearningUpdate={onLearningUpdate} floorNumber={floorNumber} />;
    case 'stepSkip':
      return <StepSkipMode params={params} onResult={onResult} showHint={showHint} onListeningChange={onListeningChange} learningState={learningState} onLearningUpdate={onLearningUpdate} floorNumber={floorNumber} />;
    case 'standard':
      return <StandardMode params={params} onResult={onResult} showHint={showHint} onListeningChange={onListeningChange} learningState={learningState} onLearningUpdate={onLearningUpdate} floorNumber={floorNumber} />;
  }
};

export default IntervalChallenge;
