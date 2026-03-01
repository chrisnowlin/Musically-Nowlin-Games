import React, { useState, useMemo } from 'react';
import type { Tier } from '../logic/dungeonTypes';
import { type VocabCategory, type VocabEntry, getVocabEntries } from '../logic/vocabData';

interface Props {
  category: VocabCategory;
  tier: Tier;
  onResult: (correct: boolean) => void;
}

const CATEGORY_THEME: Record<VocabCategory, { title: string; color: string; hoverColor: string; activeColor: string }> = {
  dynamics: { title: 'Dynamics Quiz!', color: 'bg-rose-700', hoverColor: 'hover:bg-rose-600', activeColor: 'text-rose-200' },
  tempo: { title: 'Tempo Quiz!', color: 'bg-teal-700', hoverColor: 'hover:bg-teal-600', activeColor: 'text-teal-200' },
  symbols: { title: 'Symbol Quiz!', color: 'bg-indigo-700', hoverColor: 'hover:bg-indigo-600', activeColor: 'text-indigo-200' },
  terms: { title: 'Music Terms!', color: 'bg-amber-700', hoverColor: 'hover:bg-amber-600', activeColor: 'text-amber-200' },
};

function pickDistractors(correct: VocabEntry, pool: VocabEntry[], count: number): VocabEntry[] {
  const others = pool.filter((e) => e.term !== correct.term);
  const shuffled = [...others].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const VocabularyChallenge: React.FC<Props> = ({ category, tier, onResult }) => {
  const entries = useMemo(() => getVocabEntries(category, tier), [category, tier]);
  const theme = CATEGORY_THEME[category];

  const challenge = useMemo(() => {
    const target = entries[Math.floor(Math.random() * entries.length)];
    const showTermAskDef = Math.random() < 0.5;
    const distractors = pickDistractors(target, entries, 3);
    const options = [target, ...distractors].sort(() => Math.random() - 0.5);
    return { target, showTermAskDef, options };
  }, [entries]);

  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const handleAnswer = (entry: VocabEntry) => {
    if (feedback) return;
    const correct = entry.term === challenge.target.term;
    setFeedback(correct ? 'correct' : 'wrong');
    setTimeout(() => onResult(correct), 800);
  };

  const questionText = challenge.showTermAskDef
    ? (challenge.target.symbol
        ? `What does "${challenge.target.symbol}" (${challenge.target.term}) mean?`
        : `What does "${challenge.target.term}" mean?`)
    : `Which term means "${challenge.target.definition}"?`;

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className={`text-lg font-bold ${theme.activeColor}`}>{theme.title}</h3>
      <p className="text-gray-200 text-center text-sm px-2">{questionText}</p>

      <div className="grid grid-cols-1 gap-2 w-full max-w-[280px]">
        {challenge.options.map((opt) => {
          const isCorrect = opt.term === challenge.target.term;
          const label = challenge.showTermAskDef ? opt.definition : (opt.symbol ? `${opt.symbol} (${opt.term})` : opt.term);

          return (
            <button
              key={opt.term}
              onClick={() => handleAnswer(opt)}
              disabled={!!feedback}
              className={`
                px-4 py-2.5 rounded-lg font-medium text-sm text-left transition-all
                ${feedback && isCorrect
                  ? 'bg-green-600 text-white scale-[1.02]'
                  : feedback
                    ? 'bg-gray-700 text-gray-400'
                    : `${theme.color} ${theme.hoverColor} text-white active:scale-95`}
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
          {feedback === 'correct' ? 'Correct!' : `It was: ${challenge.target.term} — ${challenge.target.definition}`}
        </p>
      )}
    </div>
  );
};

export default VocabularyChallenge;
