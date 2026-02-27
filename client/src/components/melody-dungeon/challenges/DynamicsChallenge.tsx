import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { DifficultyLevel } from '@/lib/gameLogic/dungeonTypes';
import { getDynamicsParams } from '@/lib/gameLogic/difficultyAdapter';
import { playPassageAtDynamic } from '../dungeonAudio';

interface Props {
  difficulty: DifficultyLevel;
  onResult: (correct: boolean) => void;
}

const DYNAMIC_LABELS: Record<string, string> = {
  pianissimo: 'pp',
  piano: 'p',
  'mezzo-piano': 'mp',
  'mezzo-forte': 'mf',
  forte: 'f',
  fortissimo: 'ff',
};

const DYNAMIC_DESCRIPTIONS: Record<string, string> = {
  pianissimo: 'Very Soft',
  piano: 'Soft',
  'mezzo-piano': 'Medium Soft',
  'mezzo-forte': 'Medium Loud',
  forte: 'Loud',
  fortissimo: 'Very Loud',
};

const DynamicsChallenge: React.FC<Props> = ({ difficulty, onResult }) => {
  const params = useMemo(() => getDynamicsParams(difficulty), [difficulty]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const targetDynamic = useMemo(
    () => params.levels[Math.floor(Math.random() * params.levels.length)],
    [params]
  );

  const playPassage = useCallback(() => {
    setIsPlaying(true);
    playPassageAtDynamic(targetDynamic, 1.5);
    setTimeout(() => setIsPlaying(false), 1800);
  }, [targetDynamic]);

  useEffect(() => {
    const timer = setTimeout(playPassage, 400);
    return () => clearTimeout(timer);
  }, [playPassage]);

  const handleAnswer = (level: string) => {
    if (feedback) return;
    const correct = level === targetDynamic;
    setFeedback(correct ? 'correct' : 'wrong');
    setTimeout(() => onResult(correct), 800);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-bold text-rose-200">How Loud?</h3>
      <p className="text-gray-400 text-sm">Listen and identify the dynamic level.</p>

      <button
        onClick={playPassage}
        disabled={isPlaying}
        className="px-4 py-2 bg-rose-800 hover:bg-rose-700 disabled:bg-gray-700 text-white rounded-lg text-sm transition-colors"
      >
        {isPlaying ? 'Playing...' : 'Hear Again'}
      </button>

      <div className="flex flex-wrap justify-center gap-2">
        {params.levels.map((level) => (
          <button
            key={level}
            onClick={() => handleAnswer(level)}
            disabled={!!feedback}
            className={`
              flex flex-col items-center px-3 py-2 rounded-lg font-semibold transition-all min-w-[60px]
              ${feedback && targetDynamic === level
                ? 'bg-green-600 text-white scale-110'
                : feedback
                  ? 'bg-gray-700 text-gray-400'
                  : 'bg-rose-700 hover:bg-rose-600 text-white active:scale-95'}
              disabled:cursor-default
            `}
          >
            <span className="text-lg italic">{DYNAMIC_LABELS[level]}</span>
            <span className="text-[10px] opacity-70">{DYNAMIC_DESCRIPTIONS[level]}</span>
          </button>
        ))}
      </div>

      {feedback && (
        <p className={`font-bold text-lg ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
          {feedback === 'correct'
            ? 'Correct!'
            : `It was ${DYNAMIC_LABELS[targetDynamic]} (${DYNAMIC_DESCRIPTIONS[targetDynamic]})`}
        </p>
      )}
    </div>
  );
};

export default DynamicsChallenge;
