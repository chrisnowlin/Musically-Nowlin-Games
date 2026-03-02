import React, { useState, useEffect, useMemo } from 'react';
import type { Tier } from '../logic/dungeonTypes';
import { getNoteReadingParams } from '../logic/difficultyAdapter';
import { playNote, noteKeyToName } from '../dungeonAudio';
import StaffNote from '@/common/notation/StaffNote';

interface Props {
  tier: Tier;
  onResult: (correct: boolean) => void;
}

// Notes valid for treble clef rendering
const TREBLE_CLEF_NOTES = new Set([
  'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5',
]);
// Notes valid for bass clef rendering
const BASS_CLEF_NOTES = new Set([
  'E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4',
]);

const NoteReadingChallenge: React.FC<Props> = ({ tier, onResult }) => {
  const params = useMemo(() => getNoteReadingParams(tier), [tier]);
  const [targetNote, setTargetNote] = useState('');
  const [activeClef, setActiveClef] = useState<'treble' | 'bass'>('treble');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    let clef: 'treble' | 'bass' = 'treble';
    let notePool = params.notes;

    if (params.mode === 'bass') {
      clef = 'bass';
    } else if (params.mode === 'mixed') {
      // Randomly choose clef per question
      clef = Math.random() < 0.5 ? 'treble' : 'bass';
      // Filter note pool to only notes valid for the chosen clef
      const validNotes = clef === 'bass' ? BASS_CLEF_NOTES : TREBLE_CLEF_NOTES;
      notePool = params.notes.filter(n => validNotes.has(n));
      if (notePool.length === 0) notePool = params.notes;
    }

    setActiveClef(clef);
    const note = notePool[Math.floor(Math.random() * notePool.length)];
    setTargetNote(note);
    const timer = setTimeout(() => playNote(note), 300);
    return () => clearTimeout(timer);
  }, [params.notes, params.mode]);

  const handleAnswer = (noteName: string) => {
    if (feedback) return;
    const correct = noteKeyToName(targetNote) === noteName;
    setFeedback(correct ? 'correct' : 'wrong');
    setTimeout(() => onResult(correct), 800);
  };

  const buttonLabels = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-bold text-purple-200">Name This Note!</h3>
      {targetNote && (
        <StaffNote
          noteKey={targetNote}
          clef={activeClef}
          className="w-full max-w-[240px] h-28 mx-auto"
        />
      )}
      <button
        className="text-xs text-purple-300 underline"
        onClick={() => targetNote && playNote(targetNote)}
      >
        Hear it again
      </button>
      <div className="flex flex-wrap justify-center gap-2">
        {buttonLabels.map((n) => (
          <button
            key={n}
            onClick={() => handleAnswer(n)}
            disabled={!!feedback}
            className={`
              w-11 h-11 rounded-lg font-bold text-lg transition-all
              ${feedback && noteKeyToName(targetNote) === n
                ? 'bg-green-600 text-white scale-110'
                : feedback && feedback === 'wrong'
                  ? 'bg-gray-700 text-gray-400'
                  : 'bg-purple-700 hover:bg-purple-600 text-white active:scale-95'}
              disabled:cursor-default
            `}
          >
            {n}
          </button>
        ))}
      </div>
      {feedback && (
        <p className={`font-bold text-lg ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
          {feedback === 'correct' ? 'Correct!' : `It was ${noteKeyToName(targetNote)}`}
        </p>
      )}
    </div>
  );
};

export default NoteReadingChallenge;
