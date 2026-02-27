import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { DifficultyLevel } from '@/lib/gameLogic/dungeonTypes';
import { getIntervalParams } from '@/lib/gameLogic/difficultyAdapter';
import { playTwoNotes, getFrequency, ALL_NOTE_KEYS } from '../dungeonAudio';

interface Props {
  difficulty: DifficultyLevel;
  onResult: (correct: boolean) => void;
}

const IntervalChallenge: React.FC<Props> = ({ difficulty, onResult }) => {
  const params = useMemo(() => getIntervalParams(difficulty), [difficulty]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const challenge = useMemo(() => {
    const interval = params.intervals[Math.floor(Math.random() * params.intervals.length)];
    const baseIdx = Math.floor(Math.random() * Math.max(1, ALL_NOTE_KEYS.length - 7));
    const baseNote = ALL_NOTE_KEYS[baseIdx];

    // Find the note that is `semitones` above the base
    const baseFreq = getFrequency(baseNote);
    const targetFreq = baseFreq * Math.pow(2, interval.semitones / 12);

    // Find closest note key to target frequency
    let closestKey = ALL_NOTE_KEYS[Math.min(baseIdx + interval.semitones, ALL_NOTE_KEYS.length - 1)];
    let closestDiff = Infinity;
    for (const key of ALL_NOTE_KEYS) {
      const diff = Math.abs(getFrequency(key) - targetFreq);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestKey = key;
      }
    }

    return { interval, baseNote, topNote: closestKey };
  }, [params]);

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

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-bold text-cyan-200">Name the Interval!</h3>
      <p className="text-gray-400 text-sm">Listen to the two notes and identify the interval.</p>

      <button
        onClick={playInterval}
        className="px-4 py-2 bg-cyan-800 hover:bg-cyan-700 text-white rounded-lg text-sm transition-colors"
      >
        Hear Again
      </button>

      <div className="flex flex-wrap justify-center gap-2">
        {params.intervals.map((iv) => (
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
              disabled:cursor-default
            `}
          >
            {iv.name}
          </button>
        ))}
      </div>

      {feedback && (
        <p className={`font-bold text-lg ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
          {feedback === 'correct' ? 'Correct!' : `It was a ${challenge.interval.name}`}
        </p>
      )}
    </div>
  );
};

export default IntervalChallenge;
