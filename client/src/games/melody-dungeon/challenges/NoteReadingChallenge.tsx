import React, { useState, useEffect, useMemo } from 'react';
import { getNoteReadingParamsForFloor } from '../logic/difficultyAdapter';
import { playNote, noteKeyToName } from '../dungeonAudio';

interface Props {
  floorNumber: number;
  onResult: (correct: boolean) => void;
}

const NOTE_POSITIONS: Record<string, number> = {
  C4: -6, D4: -5, E4: -4, F4: -3, G4: -2,
  A4: -1, B4: 0, C5: 1, D5: 2, E5: 3,
  F5: 4, G5: 5, A5: 6,
};

const StaffSVG: React.FC<{ noteKey: string }> = ({ noteKey }) => {
  const position = NOTE_POSITIONS[noteKey] ?? 0;
  const LINE_SPACING = 12;
  const CENTER = 60;
  const y = CENTER - (position * LINE_SPACING) / 2;
  const linePositions = [-4, -2, 0, 2, 4];

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
      {linePositions.map((pos, i) => (
        <line
          key={i}
          x1="20" x2="180"
          y1={CENTER - (pos * LINE_SPACING) / 2}
          y2={CENTER - (pos * LINE_SPACING) / 2}
          stroke="#94a3b8" strokeWidth="1.5"
        />
      ))}
      <text x="8" y="88" fontSize="80" fill="#e2e8f0"
        style={{ fontFamily: 'Arial, sans-serif', pointerEvents: 'none' }}>
        {'\uD834\uDD1E'}
      </text>
      {ledgerLines.map((ly, i) => (
        <line key={`l${i}`} x1="86" x2="114" y1={ly} y2={ly} stroke="#94a3b8" strokeWidth="1.5" />
      ))}
      <ellipse cx="100" cy={y} rx="9" ry="7" fill="#a78bfa" />
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

const NoteReadingChallenge: React.FC<Props> = ({ floorNumber, onResult }) => {
  const params = useMemo(() => getNoteReadingParamsForFloor(floorNumber), [floorNumber]);
  const [targetNote, setTargetNote] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    const note = params.notes[Math.floor(Math.random() * params.notes.length)];
    setTargetNote(note);
    setTimeout(() => playNote(note), 300);
  }, [params.notes]);

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
      {targetNote && <StaffSVG noteKey={targetNote} />}
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
