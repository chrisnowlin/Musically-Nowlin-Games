import React, { useState, useEffect, useMemo } from 'react';
import type { Tier } from '../logic/dungeonTypes';
import { getNoteReadingParams } from '../logic/difficultyAdapter';
import { playNote, noteKeyToName } from '../dungeonAudio';

interface Props {
  tier: Tier;
  onResult: (correct: boolean) => void;
}

// Treble clef note positions: relative to B4 line (middle line = 0)
// Lines bottom to top: E4(-4), G4(-2), B4(0), D5(2), F5(4)
// Spaces bottom to top: F4(-3), A4(-1), C5(1), E5(3)
const TREBLE_NOTE_POSITIONS: Record<string, number> = {
  C4: -6, D4: -5, E4: -4, F4: -3, G4: -2,
  A4: -1, B4: 0, C5: 1, D5: 2, E5: 3,
  F5: 4, G5: 5, A5: 6,
};

// Bass clef note positions: relative to D3 line (middle line = 0)
// Lines bottom to top: G2(-4), B2(-2), D3(0), F3(2), A3(4)
// Spaces bottom to top: A2(-3), C3(-1), E3(1), G3(3)
const BASS_NOTE_POSITIONS: Record<string, number> = {
  E2: -6, F2: -5, G2: -4, A2: -3, B2: -2,
  C3: -1, D3: 0, E3: 1, F3: 2, G3: 3,
  A3: 4, B3: 5, C4: 6,
};

// Notes valid for treble clef rendering
const TREBLE_CLEF_NOTES = new Set(Object.keys(TREBLE_NOTE_POSITIONS));
// Notes valid for bass clef rendering
const BASS_CLEF_NOTES = new Set(Object.keys(BASS_NOTE_POSITIONS));

// Unicode musical symbols
const TREBLE_CLEF = '\uD834\uDD1E'; // U+1D11E
const BASS_CLEF = '\uD834\uDD22';   // U+1D122

interface StaffProps {
  noteKey: string;
  useBassClef: boolean;
}

const StaffSVG: React.FC<StaffProps> = ({ noteKey, useBassClef }) => {
  const positions = useBassClef ? BASS_NOTE_POSITIONS : TREBLE_NOTE_POSITIONS;
  const position = positions[noteKey] ?? 0;
  const LINE_SPACING = 12;
  const CENTER = 60;
  const y = CENTER - (position * LINE_SPACING) / 2;
  const linePositions = [-4, -2, 0, 2, 4];

  // Compute ledger lines for notes beyond the staff
  const ledgerLines: number[] = [];
  if (position <= -5) {
    for (let i = -6; i >= position; i -= 2) {
      if (i % 2 === 0) ledgerLines.push(CENTER - (i * LINE_SPACING) / 2);
    }
  }
  if (position >= 5) {
    for (let i = 6; i <= position; i += 2) {
      if (i % 2 === 0) ledgerLines.push(CENTER - (i * LINE_SPACING) / 2);
    }
  }

  return (
    <svg viewBox="0 0 200 120" className="w-full max-w-[240px] h-28 mx-auto">
      {/* Staff lines */}
      {linePositions.map((pos, i) => (
        <line
          key={i}
          x1="20" x2="180"
          y1={CENTER - (pos * LINE_SPACING) / 2}
          y2={CENTER - (pos * LINE_SPACING) / 2}
          stroke="#94a3b8" strokeWidth="1.5"
        />
      ))}
      {/* Clef symbol */}
      {useBassClef ? (
        <text x="8" y="62" fontSize="55" fill="#e2e8f0"
          style={{ fontFamily: 'Arial, sans-serif', pointerEvents: 'none' }}>
          {BASS_CLEF}
        </text>
      ) : (
        <text x="8" y="88" fontSize="80" fill="#e2e8f0"
          style={{ fontFamily: 'Arial, sans-serif', pointerEvents: 'none' }}>
          {TREBLE_CLEF}
        </text>
      )}
      {/* Ledger lines */}
      {ledgerLines.map((ly, i) => (
        <line key={`l${i}`} x1="86" x2="114" y1={ly} y2={ly} stroke="#94a3b8" strokeWidth="1.5" />
      ))}
      {/* Note head */}
      <ellipse cx="100" cy={y} rx="9" ry="7" fill="#a78bfa" />
      {/* Stem */}
      <line
        x1={position < 0 ? 108 : 92}
        y1={y}
        x2={position < 0 ? 108 : 92}
        y2={position < 0 ? y - 30 : y + 30}
        stroke="#a78bfa" strokeWidth="2"
      />
    </svg>
  );
};

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
    }

    setActiveClef(clef);
    const note = notePool[Math.floor(Math.random() * notePool.length)];
    setTargetNote(note);
    setTimeout(() => playNote(note), 300);
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
      {targetNote && <StaffSVG noteKey={targetNote} useBassClef={activeClef === 'bass'} />}
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
