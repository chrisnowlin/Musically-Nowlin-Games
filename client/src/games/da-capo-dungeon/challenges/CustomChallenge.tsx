import React, { useState, useMemo, useEffect } from 'react';
import { shuffle } from '../challengeHelpers';

export interface CustomQuestion {
  id: number;
  question: string;
  correctAnswer: string;
  wrongAnswer1: string;
  wrongAnswer2: string;
  wrongAnswer3: string;
  tier: number;
}

interface Props {
  questions: CustomQuestion[];
  tier: number;
  onResult: (correct: boolean) => void;
}

const CustomChallenge: React.FC<Props> = ({ questions, tier, onResult }) => {
  // Filter questions by tier (include all up to current tier)
  const eligible = useMemo(() => questions.filter((q) => q.tier <= tier), [questions, tier]);
  const selected = useMemo(() => {
    if (eligible.length === 0) return null;
    return eligible[Math.floor(Math.random() * eligible.length)];
  }, [eligible]);

  const options = useMemo(() => {
    if (!selected) return [];
    return shuffle([
      selected.correctAnswer,
      selected.wrongAnswer1,
      selected.wrongAnswer2,
      selected.wrongAnswer3,
    ]);
  }, [selected]);

  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // No questions available — auto-pass
  useEffect(() => {
    if (!selected) onResult(true);
  }, [selected, onResult]);

  if (!selected) return null;

  const handleSelect = (answer: string) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(answer);
    const correct = answer === selected.correctAnswer;
    setTimeout(() => onResult(correct), 1200);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-purple-300 text-sm font-bold uppercase tracking-wider">
        Wizard&apos;s Riddle
      </div>
      <div className="text-white text-xl font-bold text-center max-w-md">
        {selected.question}
      </div>
      <div className="grid grid-cols-1 gap-2 w-full max-w-md mt-4">
        {options.map((option, i) => {
          let btnClass = 'bg-slate-700 hover:bg-slate-600 text-white';
          if (answered) {
            if (option === selected.correctAnswer) {
              btnClass = 'bg-green-700 text-white';
            } else if (option === selectedAnswer) {
              btnClass = 'bg-red-700 text-white';
            } else {
              btnClass = 'bg-slate-800 text-slate-500';
            }
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(option)}
              disabled={answered}
              className={`px-4 py-3 rounded-lg font-semibold text-left transition-colors ${btnClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CustomChallenge;
