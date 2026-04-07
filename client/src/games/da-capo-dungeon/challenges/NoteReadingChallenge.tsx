import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Tier } from '../logic/dungeonTypes';
import { getNoteReadingParams } from '../logic/difficultyAdapter';
import { playNote, noteKeyToName } from '../dungeonAudio';
import StaffNote from '@/common/notation/LazyStaffNote';
import CorrectiveFeedback, { CorrectBanner } from './CorrectiveFeedback';
import { getNoteExplanation } from '../logic/explanations';
import type { LearningState } from '../logic/learningState';
import { noteReadingConceptId, shouldGuide, markGuidedSeen, recordCorrect, recordWrong, weightedPick } from '../logic/learningState';

interface Props {
  tier: Tier;
  onResult: (correct: boolean) => void;
  learningState?: LearningState;
  onLearningUpdate?: (state: LearningState) => void;
  floorNumber?: number;
}

// Notes valid for treble clef rendering
const TREBLE_CLEF_NOTES = new Set([
  'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5',
]);
// Notes valid for bass clef rendering
const BASS_CLEF_NOTES = new Set([
  'E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4',
]);

const NoteReadingChallenge: React.FC<Props> = ({ tier, onResult, learningState, onLearningUpdate, floorNumber }) => {
  const params = useMemo(() => getNoteReadingParams(tier), [tier]);
  const [targetNote, setTargetNote] = useState('');
  const [activeClef, setActiveClef] = useState<'treble' | 'bass'>('treble');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isGuided, setIsGuided] = useState(false);

  // Snapshot learning state at mount — prevents note re-pick when state updates mid-challenge
  const initialLearningStateRef = useRef(learningState);

  useEffect(() => {
    let clef: 'treble' | 'bass' = 'treble';
    let notePool = params.notes;

    if (params.mode === 'bass') {
      clef = 'bass';
    } else if (params.mode === 'mixed') {
      clef = Math.random() < 0.5 ? 'treble' : 'bass';
      const validNotes = clef === 'bass' ? BASS_CLEF_NOTES : TREBLE_CLEF_NOTES;
      notePool = params.notes.filter(n => validNotes.has(n));
      if (notePool.length === 0) notePool = params.notes;
    }

    setActiveClef(clef);

    // System 5: weighted selection (use initial snapshot to avoid rebuild)
    const ls = initialLearningStateRef.current;
    let note: string;
    if (ls && floorNumber !== undefined) {
      note = weightedPick(
        notePool,
        (n) => noteReadingConceptId(clef, n),
        ls,
        floorNumber,
      );
    } else {
      note = notePool[Math.floor(Math.random() * notePool.length)];
    }

    setTargetNote(note);

    // System 2: guided check
    if (ls) {
      const conceptId = noteReadingConceptId(clef, note);
      setIsGuided(shouldGuide(ls, conceptId));
    }

    const timer = setTimeout(() => playNote(note), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.notes, params.mode, floorNumber]);

  const conceptId = noteReadingConceptId(activeClef, targetNote);
  const noteName = noteKeyToName(targetNote);

  const handleAnswer = useCallback((answerName: string) => {
    if (feedback) return;
    const correct = noteName === answerName;
    setFeedback(correct ? 'correct' : 'wrong');

    if (learningState && onLearningUpdate && floorNumber !== undefined) {
      let updated = learningState;
      if (isGuided) updated = markGuidedSeen(updated, conceptId);
      if (correct) {
        updated = recordCorrect(updated, conceptId, floorNumber);
      } else {
        const wrongConceptId = noteReadingConceptId(activeClef, answerName);
        updated = recordWrong(updated, conceptId, floorNumber, wrongConceptId);
      }
      onLearningUpdate(updated);
    }

    if (correct) {
      setTimeout(() => onResult(true), 800);
    }
  }, [feedback, noteName, learningState, onLearningUpdate, floorNumber, isGuided, conceptId, activeClef, onResult]);

  const handleDismiss = useCallback(() => {
    onResult(false);
  }, [onResult]);

  const buttonLabels = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  // Explanation for wrong answers
  const { explanation: wrongExplanation, mnemonic: wrongMnemonic } = targetNote
    ? getNoteExplanation(targetNote, noteName, activeClef)
    : { explanation: '', mnemonic: '' };

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-bold text-purple-200">Name This Note!</h3>
      {isGuided && !feedback && (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-800/70 text-blue-200 border border-blue-600/50">
          LEARN
        </span>
      )}
      {targetNote && (
        <StaffNote
          noteKey={targetNote}
          clef={activeClef}
          className="w-full max-w-[240px] h-28 mx-auto"
        />
      )}
      {/* System 2: Guided hint */}
      {isGuided && !feedback && targetNote && (
        <p className="text-blue-300/80 text-xs text-center italic px-4">
          This note is {noteName}. Find it below!
        </p>
      )}
      <button
        className="text-xs text-purple-300 underline"
        onClick={() => targetNote && playNote(targetNote)}
      >
        Hear it again
      </button>
      <div className="flex flex-wrap justify-center gap-2">
        {buttonLabels.map((n) => {
          const isCorrectBtn = noteName === n;
          const isGuidedHighlight = isGuided && isCorrectBtn && !feedback;

          return (
            <button
              key={n}
              onClick={() => handleAnswer(n)}
              disabled={!!feedback}
              className={`
                w-11 h-11 rounded-lg font-bold text-lg transition-all
                ${feedback && isCorrectBtn
                  ? 'bg-green-600 text-white scale-110'
                  : feedback
                    ? 'bg-gray-700 text-gray-400'
                    : isGuidedHighlight
                      ? 'bg-purple-700 ring-2 ring-blue-400 ring-offset-1 ring-offset-transparent text-white animate-pulse'
                      : 'bg-purple-700 hover:bg-purple-600 text-white active:scale-95'}
                disabled:cursor-default
              `}
            >
              {n}
            </button>
          );
        })}
      </div>
      {feedback === 'correct' && <CorrectBanner />}
      {feedback === 'wrong' && (
        <CorrectiveFeedback
          explanation={`The note was ${noteName}. ${wrongExplanation}`}
          mnemonic={wrongMnemonic}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
};

export default NoteReadingChallenge;
