import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { Tier } from '../logic/dungeonTypes';
import { getTimbreChoices, type TimbreEntry } from '../logic/timbreData';
import { getTimbreParams } from '../logic/difficultyAdapter';
import { usePhilharmoniaInstruments } from '@/common/hooks/usePhilharmoniaInstruments';
import { instrumentLibrary, type InstrumentFamily } from '@/common/instruments/instrumentLibrary';
import { playNoteAtFrequency } from '../dungeonAudio';
import CorrectiveFeedback, { CorrectBanner } from './CorrectiveFeedback';
import { TIMBRE_EXPLANATIONS } from '../logic/explanations';
import type { LearningState } from '../logic/learningState';
import { timbreConceptId, shouldGuide, markGuidedSeen, recordCorrect, recordWrong } from '../logic/learningState';

interface Props {
  tier: Tier;
  onResult: (correct: boolean) => void;
  slowMode?: boolean;
  onListeningChange?: (isPlaying: boolean) => void;
  learningState?: LearningState;
  onLearningUpdate?: (state: LearningState) => void;
  floorNumber?: number;
}

/** Pick a random instrument name from the given family via instrumentLibrary. */
function pickRandomInstrumentForFamily(family: InstrumentFamily): string | undefined {
  const instruments = instrumentLibrary.getInstrumentsByFamily(family);
  if (instruments.length === 0) return undefined;
  return instruments[Math.floor(Math.random() * instruments.length)].name;
}

const NOTE_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

function noteToSortKey(note: string): number {
  const octave = parseInt(note[note.length - 1], 10);
  const letterIdx = NOTE_ORDER.indexOf(note[0]);
  return octave * 7 + letterIdx;
}

/** Pick 4-5 ascending scale notes for the instrument to form a melodic phrase. */
function pickMelodyNotes(instrumentName: string): string[] {
  const samples = instrumentLibrary.getSamples(instrumentName);
  if (samples.length === 0) return [];

  const sorted = [...samples].sort((a, b) => noteToSortKey(a.note) - noteToSortKey(b.note));
  const maxNotes = 5;
  const maxStart = Math.max(0, sorted.length - maxNotes);
  const start = Math.floor(Math.random() * (maxStart + 1));
  return sorted.slice(start, start + maxNotes).map(s => s.note);
}

const TimbreChallenge: React.FC<Props> = ({ tier, onResult, slowMode, onListeningChange, learningState, onLearningUpdate, floorNumber }) => {
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const playedRef = useRef(false);

  const params = useMemo(() => getTimbreParams(tier), [tier]);
  const playDuration = slowMode ? params.playDuration * 2 : params.playDuration;

  // Generate challenge data once on mount
  const challengeData = useMemo(() => {
    const { correct, options } = getTimbreChoices(tier);

    let instrumentToPlay: string | undefined;
    let notesToPlay: string[] = [];

    if (tier >= 2 && correct.instrumentName) {
      instrumentToPlay = correct.instrumentName;
      notesToPlay = pickMelodyNotes(correct.instrumentName);
    } else if (tier === 2 && correct.family) {
      instrumentToPlay = pickRandomInstrumentForFamily(correct.family);
      if (instrumentToPlay) {
        notesToPlay = pickMelodyNotes(instrumentToPlay);
      }
    }

    return { correct, options, instrumentToPlay, notesToPlay };
  }, [tier]);

  const conceptId = timbreConceptId(challengeData.correct.id);
  const isGuided = !!(learningState && shouldGuide(learningState, conceptId));

  // For T2+, preload the instrument to play
  const instrumentsToLoad = useMemo(() => {
    if (tier === 1 || !challengeData.instrumentToPlay) return [];
    return [challengeData.instrumentToPlay];
  }, [tier, challengeData.instrumentToPlay]);

  const { isLoading, playMelody: playInstrumentMelody } = usePhilharmoniaInstruments(instrumentsToLoad);

  // Play the T1 synthesized sound
  const playT1Sound = useCallback((entry: TimbreEntry, duration: number) => {
    onListeningChange?.(true);
    const totalDuration = duration * 1000 + 200;
    switch (entry.id) {
      case 't1-high':
        playNoteAtFrequency(880, duration, 0.5);
        break;
      case 't1-low':
        playNoteAtFrequency(131, duration, 0.5);
        break;
      case 't1-fast': {
        const count = 8;
        const gapMs = (duration * 1000) / count;
        for (let i = 0; i < count; i++) {
          setTimeout(() => playNoteAtFrequency(440, gapMs / 1000 * 0.6, 0.5), i * gapMs);
        }
        break;
      }
      case 't1-slow': {
        const count = 2;
        const gapMs = (duration * 1000) / count;
        for (let i = 0; i < count; i++) {
          setTimeout(() => playNoteAtFrequency(440, gapMs / 1000 * 0.8, 0.5), i * gapMs);
        }
        break;
      }
    }
    setTimeout(() => onListeningChange?.(false), totalDuration);
  }, [onListeningChange]);

  // Play the sound (T1 synth or T2+ Philharmonia melody)
  const playSound = useCallback(() => {
    if (tier === 1) {
      playT1Sound(challengeData.correct, playDuration);
    } else if (challengeData.instrumentToPlay && challengeData.notesToPlay.length > 0) {
      onListeningChange?.(true);
      const melodyDuration = challengeData.notesToPlay.length * 0.7 * 1000 + 500;
      playInstrumentMelody(challengeData.instrumentToPlay, challengeData.notesToPlay, 0.7, {
        volume: 4,
      });
      setTimeout(() => onListeningChange?.(false), melodyDuration);
    }
  }, [tier, challengeData, playDuration, playT1Sound, playInstrumentMelody, onListeningChange]);

  // Auto-play after a brief delay once loading is done
  useEffect(() => {
    if (tier === 1 || !isLoading) {
      if (!playedRef.current) {
        playedRef.current = true;
        const timer = setTimeout(() => {
          playSound();
          setHasPlayed(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [tier, isLoading, playSound]);

  const handleReplay = () => {
    playSound();
  };

  const handleAnswer = useCallback((entry: TimbreEntry) => {
    if (feedback) return;
    const correct = entry.id === challengeData.correct.id;
    setFeedback(correct ? 'correct' : 'wrong');

    if (learningState && onLearningUpdate && floorNumber !== undefined) {
      let updated = learningState;
      if (isGuided) updated = markGuidedSeen(updated, conceptId);
      if (correct) {
        updated = recordCorrect(updated, conceptId, floorNumber);
      } else {
        const wrongConceptId = timbreConceptId(entry.id);
        updated = recordWrong(updated, conceptId, floorNumber, wrongConceptId);
      }
      onLearningUpdate(updated);
    }

    if (correct) {
      setTimeout(() => onResult(true), 800);
    }
  }, [feedback, challengeData.correct.id, learningState, onLearningUpdate, floorNumber, isGuided, conceptId, onResult]);

  const handleDismiss = useCallback(() => {
    onResult(false);
  }, [onResult]);

  const title = tier === 1 ? 'Name That Sound!' : 'Name That Instrument!';

  // Explanation for wrong answers
  const timbreExpl = TIMBRE_EXPLANATIONS[challengeData.correct.id];
  const wrongExplanation = timbreExpl?.explanation ?? `That was ${challengeData.correct.displayName}.`;
  const wrongMnemonic = timbreExpl?.mnemonic;

  // Show loading state for T2+ while samples load
  if (tier >= 2 && isLoading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-lg font-bold text-purple-200">{title}</h3>
        <p className="text-gray-400 text-sm">Loading sounds...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-bold text-purple-200">{title}</h3>
      {isGuided && !feedback && (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-800/70 text-blue-200 border border-blue-600/50">
          LEARN
        </span>
      )}

      {!hasPlayed && tier === 1 && (
        <p className="text-gray-400 text-sm">Listen...</p>
      )}

      {/* System 2: Guided hint */}
      {isGuided && !feedback && hasPlayed && (
        <p className="text-blue-300/80 text-xs text-center italic px-4">
          This is {challengeData.correct.displayName}. Tap the correct answer!
        </p>
      )}

      {/* Replay button */}
      {params.allowReplay && hasPlayed && !feedback && (
        <button
          onClick={handleReplay}
          className="px-4 py-2 rounded-lg bg-purple-800 hover:bg-purple-700 text-white text-sm font-medium transition-all active:scale-95"
        >
          Replay
        </button>
      )}

      {/* Answer buttons */}
      <div className="grid grid-cols-1 gap-2 w-full max-w-[280px]">
        {challengeData.options.map((opt) => {
          const isCorrect = opt.id === challengeData.correct.id;
          const isGuidedHighlight = isGuided && isCorrect && !feedback;

          return (
            <button
              key={opt.id}
              onClick={() => handleAnswer(opt)}
              disabled={!!feedback}
              className={`
                px-4 py-2.5 rounded-lg font-medium text-sm text-left transition-all
                ${feedback && isCorrect
                  ? 'bg-green-600 text-white scale-[1.02]'
                  : feedback
                    ? 'bg-gray-700 text-gray-400'
                    : isGuidedHighlight
                      ? 'bg-purple-700 ring-2 ring-blue-400 ring-offset-1 ring-offset-transparent text-white animate-pulse'
                      : 'bg-purple-700 hover:bg-purple-600 text-white active:scale-95'}
                disabled:cursor-default
              `}
            >
              {opt.displayName}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
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

export default TimbreChallenge;
