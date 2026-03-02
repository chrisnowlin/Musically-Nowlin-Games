import React, { useState, useMemo } from 'react';
import type { Tier } from '../logic/dungeonTypes';
import { type VocabCategory, type VocabEntry, getVocabEntries, getAllVocabEntries } from '../logic/vocabData';
import { shuffle } from '../challengeHelpers';
import { getVocabNotationAsset } from '@/common/notation/notationAssets';
import NotationImage from '@/common/notation/NotationImage';

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
  // Filter out entries with the same term or definition as the correct answer
  const others = pool.filter(
    (e) => e.term !== correct.term && e.definition !== correct.definition
  );
  return shuffle(others).slice(0, count);
}

// --- Standard 4-choice MC ---

interface StandardChallengeData {
  format: 'standard';
  target: VocabEntry;
  showTermAskDef: boolean;
  options: VocabEntry[];
}

function buildStandardChallenge(entries: VocabEntry[], standardEntries: VocabEntry[]): StandardChallengeData {
  const target = standardEntries[Math.floor(Math.random() * standardEntries.length)];
  const showTermAskDef = Math.random() < 0.5;
  // Use full vocab pool for distractors if category pool is small
  const distractorPool = entries.length >= 7 ? entries : getAllVocabEntries();
  const distractors = pickDistractors(target, distractorPool, 3);
  const options = shuffle([target, ...distractors]);
  return { format: 'standard', target, showTermAskDef, options };
}

// --- Opposites (binary choice) ---

interface OppositesChallengeData {
  format: 'opposites';
  questionText: string;
  correctEntry: VocabEntry;
  wrongEntry: VocabEntry;
  options: VocabEntry[];
}

function buildOppositesChallenge(oppEntries: VocabEntry[]): OppositesChallengeData {
  // Pick two different opposites entries
  const shuffled = shuffle([...oppEntries]);
  const correctEntry = shuffled[0];
  const wrongEntry = shuffled.find((e) => e.term !== correctEntry.term) ?? shuffled[1];

  const questionText = `Which means "${correctEntry.definition}"?`;
  const options = shuffle([correctEntry, wrongEntry]);
  return { format: 'opposites', questionText, correctEntry, wrongEntry, options };
}

// --- Ordering (rank sequence) ---

interface OrderingChallengeData {
  format: 'ordering';
  instruction: string;
  correctSequence: string[];
  shuffledItems: string[];
}

function buildOrderingChallenge(ordEntries: VocabEntry[]): OrderingChallengeData {
  const entry = ordEntries[Math.floor(Math.random() * ordEntries.length)];
  // Parse "Softest to loudest: pp, p, mp, mf, f, ff"
  const colonIdx = entry.term.indexOf(':');
  const instruction = colonIdx !== -1 ? entry.term.slice(0, colonIdx).trim() : 'Put in order';
  const itemsPart = colonIdx !== -1 ? entry.term.slice(colonIdx + 1) : entry.term;
  const correctSequence = itemsPart.split(',').map((s) => s.trim());
  const shuffledItems = shuffle([...correctSequence]);
  return { format: 'ordering', instruction, correctSequence, shuffledItems };
}

type ChallengeData = StandardChallengeData | OppositesChallengeData | OrderingChallengeData;

// --- Component ---

const VocabularyChallenge: React.FC<Props> = ({ category, tier, onResult }) => {
  const entries = useMemo(() => getVocabEntries(category, tier), [category, tier]);
  const theme = CATEGORY_THEME[category];

  const challenge: ChallengeData = useMemo(() => {
    const oppEntries = entries.filter((e) => e.format === 'opposites');
    const ordEntries = entries.filter((e) => e.format === 'ordering');
    const stdEntries = entries.filter((e) => !e.format || e.format === 'standard');

    // Uniform random selection among available formats
    const formats: Array<'standard' | 'opposites' | 'ordering'> = [];
    if (stdEntries.length > 0) formats.push('standard');
    if (oppEntries.length >= 2) formats.push('opposites');
    if (ordEntries.length > 0) formats.push('ordering');

    const chosen = formats[Math.floor(Math.random() * formats.length)];

    if (chosen === 'opposites') return buildOppositesChallenge(oppEntries);
    if (chosen === 'ordering') return buildOrderingChallenge(ordEntries);
    return buildStandardChallenge(entries, stdEntries.length > 0 ? stdEntries : entries);
  }, [entries]);

  if (challenge.format === 'opposites') {
    return <OppositesView challenge={challenge} theme={theme} onResult={onResult} />;
  }
  if (challenge.format === 'ordering') {
    return <OrderingView challenge={challenge} theme={theme} onResult={onResult} />;
  }
  return <StandardView challenge={challenge} theme={theme} onResult={onResult} />;
};

// --- Standard View (unchanged behavior) ---

interface ViewProps<T> {
  challenge: T;
  theme: { title: string; color: string; hoverColor: string; activeColor: string };
  onResult: (correct: boolean) => void;
}

/** Displays LilyPond-engraved notation if an asset exists for this term. */
function VocabNotation({ term }: { term: string }) {
  const src = getVocabNotationAsset(term);
  if (!src) return null;
  return <NotationImage src={src} alt={`${term} notation`} size="lg" className="mb-2" />;
}

/** Notation image sized for answer buttons. */
function ButtonNotation({ term }: { term: string }) {
  const src = getVocabNotationAsset(term);
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      className="w-full h-auto invert"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );
}

const StandardView: React.FC<ViewProps<StandardChallengeData>> = ({ challenge, theme, onResult }) => {
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const handleAnswer = (entry: VocabEntry) => {
    if (feedback) return;
    const correct = entry.term === challenge.target.term;
    setFeedback(correct ? 'correct' : 'wrong');
    setTimeout(() => onResult(correct), 800);
  };

  const { target } = challenge;
  const defLooksLikeBeats = /beat/i.test(target.definition);
  const questionText = challenge.showTermAskDef
    ? (defLooksLikeBeats
        ? `How many beats does a ${target.term} get?`
        : `What does "${target.term}" mean?`)
    : `Which term means "${target.definition}"?`;

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className={`text-lg font-bold ${theme.activeColor}`}>{theme.title}</h3>
      {challenge.showTermAskDef && <VocabNotation term={challenge.target.term} />}
      <p className="text-gray-200 text-center text-sm px-2">{questionText}</p>

      <div className={`grid gap-2 w-full ${challenge.showTermAskDef ? 'grid-cols-1 max-w-[280px]' : 'grid-cols-2 max-w-[340px]'}`}>
        {challenge.options.map((opt) => {
          const isCorrect = opt.term === challenge.target.term;

          return (
            <button
              key={opt.term}
              onClick={() => handleAnswer(opt)}
              disabled={!!feedback}
              className={`
                px-4 py-2.5 rounded-lg font-medium text-sm transition-all
                flex flex-col items-center justify-center gap-1 text-center
                ${feedback && isCorrect
                  ? 'bg-green-600 text-white scale-[1.02]'
                  : feedback
                    ? 'bg-gray-700 text-gray-400'
                    : `${theme.color} ${theme.hoverColor} text-white active:scale-95`}
                disabled:cursor-default
              `}
            >
              {challenge.showTermAskDef
                ? opt.definition
                : <><ButtonNotation term={opt.term} />{opt.term}</>}
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

// --- Opposites View (binary choice, kid-friendly) ---

const OppositesView: React.FC<ViewProps<OppositesChallengeData>> = ({ challenge, theme, onResult }) => {
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const handleAnswer = (entry: VocabEntry) => {
    if (feedback) return;
    const correct = entry.term === challenge.correctEntry.term;
    setFeedback(correct ? 'correct' : 'wrong');
    setTimeout(() => onResult(correct), 800);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className={`text-lg font-bold ${theme.activeColor}`}>{theme.title}</h3>
      <p className="text-gray-200 text-center text-base px-2 font-semibold">
        {challenge.questionText}
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-[320px]">
        {challenge.options.map((opt) => {
          const isCorrect = opt.term === challenge.correctEntry.term;
          const label = opt.term;

          return (
            <button
              key={opt.term}
              onClick={() => handleAnswer(opt)}
              disabled={!!feedback}
              data-testid="opposites-btn"
              className={`
                px-4 py-5 rounded-xl font-bold text-lg text-center transition-all
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
          {feedback === 'correct' ? 'Correct!' : `It was: ${challenge.correctEntry.term} — ${challenge.correctEntry.definition}`}
        </p>
      )}
    </div>
  );
};

// --- Ordering View (tap items in sequence) ---

const OrderingView: React.FC<ViewProps<OrderingChallengeData>> = ({ challenge, theme, onResult }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const handleTap = (item: string) => {
    if (feedback) return;
    if (selected.includes(item)) return;

    const next = [...selected, item];
    setSelected(next);

    // Check when all items have been selected
    if (next.length === challenge.correctSequence.length) {
      const isCorrect = next.every((val, idx) => val === challenge.correctSequence[idx]);
      setFeedback(isCorrect ? 'correct' : 'wrong');
      setTimeout(() => onResult(isCorrect), 800);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className={`text-lg font-bold ${theme.activeColor}`}>{theme.title}</h3>
      <p className="text-gray-200 text-center text-base px-2 font-semibold">
        {challenge.instruction}
      </p>

      {/* Show selected sequence so far */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center" data-testid="ordering-selected">
          {selected.map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="bg-green-700 text-white px-2 py-1 rounded text-sm font-bold"
            >
              {idx + 1}. {item}
            </span>
          ))}
        </div>
      )}

      {/* Shuffled tappable items */}
      <div className="flex flex-wrap gap-2 justify-center w-full max-w-[340px]">
        {challenge.shuffledItems.map((item) => {
          const selectedIdx = selected.indexOf(item);
          const isSelected = selectedIdx !== -1;

          return (
            <button
              key={item}
              onClick={() => handleTap(item)}
              disabled={isSelected || !!feedback}
              data-testid="ordering-btn"
              className={`
                px-3 py-2.5 rounded-lg font-bold text-sm transition-all
                ${isSelected
                  ? 'bg-gray-600 text-gray-400'
                  : feedback
                    ? 'bg-gray-700 text-gray-400'
                    : `${theme.color} ${theme.hoverColor} text-white active:scale-95`}
                disabled:cursor-default
              `}
            >
              {isSelected ? `${selectedIdx + 1}. ${item}` : item}
            </button>
          );
        })}
      </div>

      {feedback && (
        <p className={`font-bold text-lg ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
          {feedback === 'correct' ? 'Correct!' : `Correct order: ${challenge.correctSequence.join(', ')}`}
        </p>
      )}
    </div>
  );
};

export default VocabularyChallenge;
