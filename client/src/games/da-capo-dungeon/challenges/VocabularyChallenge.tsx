import React, { useState, useMemo, useCallback } from 'react';
import type { Tier } from '../logic/dungeonTypes';
import { type VocabCategory, type VocabEntry } from '../logic/vocabData';
import { useDefaultVocab, getAllDefaultVocabEntriesSync } from '../logic/useDefaultVocab';
import { shuffle } from '../challengeHelpers';
import { getVocabNotationAsset } from '@/common/notation/notationAssets';
import NotationImage from '@/common/notation/NotationImage';
import CorrectiveFeedback, { CorrectBanner } from './CorrectiveFeedback';
import { VOCAB_EXPLANATIONS, SCENARIO_EXPLANATIONS } from '../logic/explanations';
import type { LearningState } from '../logic/learningState';
import { vocabConceptId, weightedPick, shouldGuide, recordCorrect, recordWrong, markGuidedSeen, getTopConfusion } from '../logic/learningState';

interface Props {
  category: VocabCategory;
  tier: Tier;
  onResult: (correct: boolean) => void;
  poolEntries?: VocabEntry[];
  useDefaults?: boolean;
  /** Learning state for Systems 2/4/5. Optional — falls back to pure assessment if omitted. */
  learningState?: LearningState;
  /** Callback to update learning state in the parent. */
  onLearningUpdate?: (state: LearningState) => void;
  /** Current floor number for mastery spacing. */
  floorNumber?: number;
}

const CATEGORY_THEME: Record<VocabCategory, { title: string; color: string; hoverColor: string; activeColor: string }> = {
  dynamics: { title: 'Dynamics Quiz!', color: 'bg-rose-700', hoverColor: 'hover:bg-rose-600', activeColor: 'text-rose-200' },
  tempo: { title: 'Tempo Quiz!', color: 'bg-teal-700', hoverColor: 'hover:bg-teal-600', activeColor: 'text-teal-200' },
  symbols: { title: 'Symbol Quiz!', color: 'bg-indigo-700', hoverColor: 'hover:bg-indigo-600', activeColor: 'text-indigo-200' },
  terms: { title: 'Music Terms!', color: 'bg-amber-700', hoverColor: 'hover:bg-amber-600', activeColor: 'text-amber-200' },
};

function pickDistractors(correct: VocabEntry, pool: VocabEntry[], count: number, topConfusionTerm?: string): VocabEntry[] {
  // Filter out entries with the same term or definition as the correct answer
  const others = pool.filter(
    (e) => e.term !== correct.term && e.definition !== correct.definition
  );

  // If we have a known confusion pair, ensure it's included as a distractor
  if (topConfusionTerm) {
    const confusionEntry = others.find(e => e.term === topConfusionTerm);
    if (confusionEntry) {
      const rest = others.filter(e => e.term !== topConfusionTerm);
      const shuffledRest = shuffle(rest).slice(0, count - 1);
      return shuffle([confusionEntry, ...shuffledRest]);
    }
  }

  return shuffle(others).slice(0, count);
}

// --- Standard 4-choice MC ---

interface StandardChallengeData {
  format: 'standard';
  target: VocabEntry;
  showTermAskDef: boolean;
  options: VocabEntry[];
  guided: boolean;
}

function buildStandardChallenge(
  entries: VocabEntry[],
  standardEntries: VocabEntry[],
  learningState?: LearningState,
  floorNumber?: number,
  category?: string
): StandardChallengeData {
  let target: VocabEntry;
  if (learningState && floorNumber !== undefined && category) {
    target = weightedPick(
      standardEntries,
      (e) => vocabConceptId(category, e.term),
      learningState,
      floorNumber,
    );
  } else {
    target = standardEntries[Math.floor(Math.random() * standardEntries.length)];
  }

  const conceptId = category ? vocabConceptId(category, target.term) : '';
  const guided = !!(learningState && conceptId && shouldGuide(learningState, conceptId));

  const showTermAskDef = Math.random() < 0.5;
  // Use top confusion pair for smarter distractors
  const topConfusion = learningState && category
    ? getTopConfusion(learningState, conceptId)
    : undefined;
  // Extract just the term from the concept ID for distractor matching
  const topConfusionTerm = topConfusion ? topConfusion.split(':').pop() : undefined;
  const distractorPool = entries.length >= 7 ? entries : getAllDefaultVocabEntriesSync();
  const distractors = pickDistractors(target, distractorPool, 3, topConfusionTerm);
  const options = shuffle([target, ...distractors]);
  return { format: 'standard', target, showTermAskDef, options, guided };
}

// --- Opposites (binary choice) ---

interface OppositesChallengeData {
  format: 'opposites';
  questionText: string;
  correctEntry: VocabEntry;
  wrongEntry: VocabEntry;
  options: VocabEntry[];
  guided: boolean;
}

function buildOppositesChallenge(oppEntries: VocabEntry[], learningState?: LearningState, category?: string): OppositesChallengeData {
  const shuffled = shuffle([...oppEntries]);
  const correctEntry = shuffled[0];
  const wrongEntry = shuffled.find((e) => e.term !== correctEntry.term) ?? shuffled[1];

  const conceptId = category ? vocabConceptId(category, correctEntry.term) : '';
  const guided = !!(learningState && conceptId && shouldGuide(learningState, conceptId));

  const questionText = `Which means "${correctEntry.definition}"?`;
  const options = shuffle([correctEntry, wrongEntry]);
  return { format: 'opposites', questionText, correctEntry, wrongEntry, options, guided };
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
  const colonIdx = entry.term.indexOf(':');
  const instruction = colonIdx !== -1 ? entry.term.slice(0, colonIdx).trim() : 'Put in order';
  const itemsPart = colonIdx !== -1 ? entry.term.slice(colonIdx + 1) : entry.term;
  const correctSequence = itemsPart.split(',').map((s) => s.trim());
  const shuffledItems = shuffle([...correctSequence]);
  return { format: 'ordering', instruction, correctSequence, shuffledItems };
}

// --- Scenario (situational 4-choice: "Which voice would you use to...?") ---

interface ScenarioChallengeData {
  format: 'scenario';
  questionText: string;
  correctAnswer: string;
  options: string[];
  guided: boolean;
}

function buildScenarioChallenge(scenEntries: VocabEntry[], learningState?: LearningState): ScenarioChallengeData {
  const entry = scenEntries[Math.floor(Math.random() * scenEntries.length)];
  const options = shuffle([...(entry.scenarioChoices ?? [])]);

  const conceptId = vocabConceptId('terms', entry.scenarioAnswer ?? entry.term);
  const guided = !!(learningState && shouldGuide(learningState, conceptId));

  return {
    format: 'scenario',
    questionText: entry.definition,
    correctAnswer: entry.scenarioAnswer ?? entry.term,
    options,
    guided,
  };
}

type ChallengeData = StandardChallengeData | OppositesChallengeData | OrderingChallengeData | ScenarioChallengeData;

// --- Component ---

const VocabularyChallenge: React.FC<Props> = ({ category, tier, onResult, poolEntries, useDefaults, learningState, onLearningUpdate, floorNumber }) => {
  const apiDefaults = useDefaultVocab();
  
  const entries = useMemo(() => {
    const builtIn = (useDefaults !== false)
      ? apiDefaults.filter((e: VocabEntry) => e.category === category && e.tier <= tier)
      : [];
    const poolFiltered = (poolEntries ?? []).filter((e: VocabEntry) => e.category === category && e.tier <= tier);
    const combined = [...builtIn, ...poolFiltered];
    if (combined.length > 0) return combined;
    return getAllDefaultVocabEntriesSync().filter((e: VocabEntry) => e.category === category && e.tier <= tier);
  }, [category, tier, poolEntries, useDefaults, apiDefaults]);
  const theme = CATEGORY_THEME[category];

  const challenge: ChallengeData = useMemo(() => {
    const oppEntries = entries.filter((e: VocabEntry) => e.format === 'opposites');
    const ordEntries = entries.filter((e: VocabEntry) => e.format === 'ordering');
    const scenEntries = entries.filter((e: VocabEntry) => e.format === 'scenario');
    const stdEntries = entries.filter((e: VocabEntry) => !e.format || e.format === 'standard');

    const formats: Array<'standard' | 'opposites' | 'ordering' | 'scenario'> = [];
    if (stdEntries.length > 0) formats.push('standard');
    if (oppEntries.length >= 2) formats.push('opposites');
    if (ordEntries.length > 0) formats.push('ordering');
    if (scenEntries.length > 0) formats.push('scenario');

    const chosen = formats[Math.floor(Math.random() * formats.length)];

    if (chosen === 'opposites') return buildOppositesChallenge(oppEntries, learningState, category);
    if (chosen === 'ordering') return buildOrderingChallenge(ordEntries);
    if (chosen === 'scenario') return buildScenarioChallenge(scenEntries, learningState);
    return buildStandardChallenge(entries, stdEntries.length > 0 ? stdEntries : entries, learningState, floorNumber, category);
  }, [entries, learningState, floorNumber, category]);

  if (challenge.format === 'opposites') {
    return <OppositesView challenge={challenge} theme={theme} onResult={onResult} category={category} learningState={learningState} onLearningUpdate={onLearningUpdate} floorNumber={floorNumber} />;
  }
  if (challenge.format === 'ordering') {
    return <OrderingView challenge={challenge} theme={theme} onResult={onResult} />;
  }
  if (challenge.format === 'scenario') {
    return <ScenarioView challenge={challenge} theme={theme} onResult={onResult} learningState={learningState} onLearningUpdate={onLearningUpdate} floorNumber={floorNumber} />;
  }
  return <StandardView challenge={challenge} theme={theme} onResult={onResult} category={category} learningState={learningState} onLearningUpdate={onLearningUpdate} floorNumber={floorNumber} />;
};

// --- Standard View ---

interface ViewProps<T> {
  challenge: T;
  theme: { title: string; color: string; hoverColor: string; activeColor: string };
  onResult: (correct: boolean) => void;
  category?: VocabCategory;
  learningState?: LearningState;
  onLearningUpdate?: (state: LearningState) => void;
  floorNumber?: number;
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

const StandardView: React.FC<ViewProps<StandardChallengeData>> = ({ challenge, theme, onResult, category, learningState, onLearningUpdate, floorNumber }) => {
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  const conceptId = category ? vocabConceptId(category, challenge.target.term) : '';

  // System 2: Guided mode — mark as seen, highlight correct answer
  const isGuided = challenge.guided;

  const handleAnswer = useCallback((entry: VocabEntry) => {
    if (feedback) return;
    const correct = entry.term === challenge.target.term;
    setFeedback(correct ? 'correct' : 'wrong');
    setSelectedTerm(entry.term);

    if (learningState && onLearningUpdate && floorNumber !== undefined) {
      let updated = learningState;
      if (isGuided) {
        updated = markGuidedSeen(updated, conceptId);
      }
      if (correct) {
        updated = recordCorrect(updated, conceptId, floorNumber);
      } else {
        const wrongConceptId = category ? vocabConceptId(category, entry.term) : undefined;
        updated = recordWrong(updated, conceptId, floorNumber, wrongConceptId);
      }
      onLearningUpdate(updated);
    }

    if (correct) {
      setTimeout(() => onResult(true), 800);
    }
    // Wrong: wait for "Got it" tap (no auto-dismiss)
  }, [feedback, challenge.target.term, learningState, onLearningUpdate, floorNumber, isGuided, conceptId, category, onResult]);

  const handleDismiss = useCallback(() => {
    onResult(false);
  }, [onResult]);

  const { target } = challenge;
  const defLooksLikeBeats = /beat/i.test(target.definition);
  const questionText = challenge.showTermAskDef
    ? (defLooksLikeBeats
        ? `How many beats does a ${target.term} get?`
        : `What does "${target.term}" mean?`)
    : `Which term means "${target.definition}"?`;

  // Explanation for wrong answers
  const explanation = VOCAB_EXPLANATIONS[target.term];
  const wrongExplanation = explanation?.explanation ?? `${target.term} means "${target.definition}".`;
  const wrongMnemonic = explanation?.mnemonic;

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className={`text-lg font-bold ${theme.activeColor}`}>{theme.title}</h3>
      {/* System 2: Guided mode badge */}
      {isGuided && !feedback && (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-800/70 text-blue-200 border border-blue-600/50">
          LEARN
        </span>
      )}
      {challenge.showTermAskDef && <VocabNotation term={challenge.target.term} />}
      <p className="text-gray-200 text-center text-sm px-2">{questionText}</p>
      {/* System 2: Guided hint */}
      {isGuided && !feedback && (
        <p className="text-blue-300/80 text-xs text-center italic px-4">
          New concept! {target.term} means "{target.definition}". Tap the correct answer below.
        </p>
      )}

      <div className={`grid gap-2 w-full ${challenge.showTermAskDef ? 'grid-cols-1 max-w-[280px]' : 'grid-cols-2 max-w-[340px]'}`}>
        {challenge.options.map((opt) => {
          const isCorrect = opt.term === challenge.target.term;
          const isGuidedHighlight = isGuided && isCorrect && !feedback;

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
                    : isGuidedHighlight
                      ? `${theme.color} ring-2 ring-blue-400 ring-offset-1 ring-offset-transparent text-white animate-pulse`
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

      {feedback === 'correct' && <CorrectBanner />}
      {feedback === 'wrong' && (
        <CorrectiveFeedback
          explanation={wrongExplanation}
          mnemonic={wrongMnemonic}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
};

// --- Opposites View (binary choice, kid-friendly) ---

const OppositesView: React.FC<ViewProps<OppositesChallengeData>> = ({ challenge, theme, onResult, category, learningState, onLearningUpdate, floorNumber }) => {
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const conceptId = category ? vocabConceptId(category, challenge.correctEntry.term) : '';
  const isGuided = challenge.guided;

  const handleAnswer = useCallback((entry: VocabEntry) => {
    if (feedback) return;
    const correct = entry.term === challenge.correctEntry.term;
    setFeedback(correct ? 'correct' : 'wrong');

    if (learningState && onLearningUpdate && floorNumber !== undefined) {
      let updated = learningState;
      if (isGuided) updated = markGuidedSeen(updated, conceptId);
      if (correct) {
        updated = recordCorrect(updated, conceptId, floorNumber);
      } else {
        const wrongConceptId = category ? vocabConceptId(category, entry.term) : undefined;
        updated = recordWrong(updated, conceptId, floorNumber, wrongConceptId);
      }
      onLearningUpdate(updated);
    }

    if (correct) {
      setTimeout(() => onResult(true), 800);
    }
  }, [feedback, challenge.correctEntry.term, learningState, onLearningUpdate, floorNumber, isGuided, conceptId, category, onResult]);

  const handleDismiss = useCallback(() => {
    onResult(false);
  }, [onResult]);

  const explanation = VOCAB_EXPLANATIONS[challenge.correctEntry.term];
  const wrongExplanation = explanation?.explanation ?? `${challenge.correctEntry.term} means "${challenge.correctEntry.definition}".`;
  const wrongMnemonic = explanation?.mnemonic;

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className={`text-lg font-bold ${theme.activeColor}`}>{theme.title}</h3>
      {isGuided && !feedback && (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-800/70 text-blue-200 border border-blue-600/50">
          LEARN
        </span>
      )}
      <p className="text-gray-200 text-center text-base px-2 font-semibold">
        {challenge.questionText}
      </p>
      {isGuided && !feedback && (
        <p className="text-blue-300/80 text-xs text-center italic px-4">
          {challenge.correctEntry.term} means "{challenge.correctEntry.definition}". Tap the correct answer!
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 w-full max-w-[320px]">
        {challenge.options.map((opt) => {
          const isCorrect = opt.term === challenge.correctEntry.term;
          const isGuidedHighlight = isGuided && isCorrect && !feedback;

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
                    : isGuidedHighlight
                      ? `${theme.color} ring-2 ring-blue-400 ring-offset-1 ring-offset-transparent text-white animate-pulse`
                      : `${theme.color} ${theme.hoverColor} text-white active:scale-95`}
                disabled:cursor-default
              `}
            >
              {opt.term}
            </button>
          );
        })}
      </div>

      {feedback === 'correct' && <CorrectBanner />}
      {feedback === 'wrong' && (
        <CorrectiveFeedback
          explanation={wrongExplanation}
          mnemonic={wrongMnemonic}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
};

// --- Scenario View (situational "Which voice?" questions) ---

const ScenarioView: React.FC<ViewProps<ScenarioChallengeData>> = ({ challenge, theme, onResult, learningState, onLearningUpdate, floorNumber }) => {
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const conceptId = vocabConceptId('terms', challenge.correctAnswer);
  const isGuided = challenge.guided;

  const handleAnswer = useCallback((choice: string) => {
    if (feedback) return;
    const correct = choice === challenge.correctAnswer;
    setFeedback(correct ? 'correct' : 'wrong');

    if (learningState && onLearningUpdate && floorNumber !== undefined) {
      let updated = learningState;
      if (isGuided) updated = markGuidedSeen(updated, conceptId);
      if (correct) {
        updated = recordCorrect(updated, conceptId, floorNumber);
      } else {
        const wrongConceptId = vocabConceptId('terms', choice);
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

  const scenarioExplanation = SCENARIO_EXPLANATIONS[challenge.correctAnswer] ?? `The correct answer is ${challenge.correctAnswer}.`;

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className={`text-lg font-bold ${theme.activeColor}`}>{theme.title}</h3>
      {isGuided && !feedback && (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-800/70 text-blue-200 border border-blue-600/50">
          LEARN
        </span>
      )}
      <p className="text-gray-200 text-center text-base px-2 font-semibold">
        {challenge.questionText}
      </p>
      {isGuided && !feedback && (
        <p className="text-blue-300/80 text-xs text-center italic px-4">
          The answer is {challenge.correctAnswer}. Tap it below!
        </p>
      )}

      <div className="grid grid-cols-1 gap-2 w-full max-w-[280px]">
        {challenge.options.map((choice) => {
          const isCorrect = choice === challenge.correctAnswer;
          const isGuidedHighlight = isGuided && isCorrect && !feedback;

          return (
            <button
              key={choice}
              onClick={() => handleAnswer(choice)}
              disabled={!!feedback}
              data-testid="scenario-btn"
              className={`
                px-4 py-3 rounded-lg font-bold text-base text-center transition-all
                ${feedback && isCorrect
                  ? 'bg-green-600 text-white scale-[1.02]'
                  : feedback
                    ? 'bg-gray-700 text-gray-400'
                    : isGuidedHighlight
                      ? `${theme.color} ring-2 ring-blue-400 ring-offset-1 ring-offset-transparent text-white animate-pulse`
                      : `${theme.color} ${theme.hoverColor} text-white active:scale-95`}
                disabled:cursor-default
              `}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {feedback === 'correct' && <CorrectBanner />}
      {feedback === 'wrong' && (
        <CorrectiveFeedback
          explanation={scenarioExplanation}
          onDismiss={handleDismiss}
        />
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

    if (next.length === challenge.correctSequence.length) {
      const isCorrect = next.every((val, idx) => val === challenge.correctSequence[idx]);
      setFeedback(isCorrect ? 'correct' : 'wrong');
      if (isCorrect) {
        setTimeout(() => onResult(true), 800);
      }
      // Wrong: wait for "Got it"
    }
  };

  const handleDismiss = useCallback(() => {
    onResult(false);
  }, [onResult]);

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

      {feedback === 'correct' && <CorrectBanner />}
      {feedback === 'wrong' && (
        <CorrectiveFeedback
          explanation={`The correct order is: ${challenge.correctSequence.join(', ')}`}
          mnemonic="Try to remember the sequence from softest/slowest to loudest/fastest."
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
};

export default VocabularyChallenge;
