import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { MusicChallenge, ChallengeAnswer } from '@shared/types/cadence-quest';
import {
  playNote,
  playClick,
  playTwoNotes,
  playChord,
  playScale,
  playListeningPhrase,
  resumeAudioContext,
  noteKeyToName,
} from '@/components/melody-dungeon/dungeonAudio';
import RhythmTapChallengePanel from './RhythmTapChallengePanel';

const NOTE_POSITIONS: Record<string, number> = {
  C4: -6, D4: -5, E4: -4, F4: -3, G4: -2,
  A4: -1, B4: 0, C5: 1, D5: 2, E5: 3,
  F5: 4, G5: 5, A5: 6,
};

const StaffSVG: React.FC<{ noteKey: string }> = ({ noteKey }) => {
  const position = NOTE_POSITIONS[noteKey] ?? 0;
  const CENTER = 60;
  const y = CENTER - (position * 6);
  return (
    <svg viewBox="0 0 200 120" className="w-full max-w-[200px] h-24 mx-auto">
      {[-4, -2, 0, 2, 4].map((pos, i) => (
        <line key={i} x1="20" x2="180" y1={CENTER - pos * 6} y2={CENTER - pos * 6} stroke="#94a3b8" strokeWidth="1.5" />
      ))}
      <text x="8" y="88" fontSize="60" fill="#e2e8f0">{'\uD834\uDD1E'}</text>
      <ellipse cx="100" cy={y} rx="9" ry="7" fill="#a78bfa" />
      <line x1={position < 0 ? 108 : 92} y1={y} x2={position < 0 ? 108 : 92} y2={position < 0 ? y - 28 : y + 28} stroke="#a78bfa" strokeWidth="2" />
    </svg>
  );
};

interface ChallengePanelProps {
  challenge: MusicChallenge;
  shownAt: number;
  onAnswer: (answer: ChallengeAnswer) => void;
  disabled?: boolean;
}

const ChallengePanel: React.FC<ChallengePanelProps> = ({ challenge, shownAt, onAnswer, disabled }) => {
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const hasPlayedRef = useRef(false);

  const submitAnswer = useCallback(
    (value: string | number[], responseTimeMs: number) => {
      if (feedback) return;
      setFeedback('correct');
      onAnswer({
        challengeId: challenge.id,
        value,
        responseTimeMs,
      });
    },
    [challenge.id, feedback, onAnswer]
  );

  const submitWrong = useCallback(
    (value: string | number[], responseTimeMs: number) => {
      if (feedback) return;
      setFeedback('wrong');
      onAnswer({
        challengeId: challenge.id,
        value,
        responseTimeMs,
      });
    },
    [challenge.id, feedback, onAnswer]
  );

  const getResponseTime = () => Date.now() - shownAt;

  const playChallengeAudio = useCallback(() => {
    resumeAudioContext();
    if (challenge.type === 'noteReading') {
      playNote(challenge.targetNote, 0.4);
    } else if (challenge.type === 'interval') {
      playTwoNotes(challenge.note1, challenge.note2);
    } else if (challenge.type === 'tempoIdentify') {
      const interval = 60000 / challenge.bpm;
      for (let i = 0; i < 4; i++) {
        setTimeout(() => playClick(0.3), i * interval);
      }
    } else if (challenge.type === 'chordIdentify') {
      playChord(challenge.chordNotes, 0.8);
    } else if (challenge.type === 'scaleIdentify') {
      playScale(challenge.scaleNotes, 0.35);
    } else if (challenge.type === 'listening') {
      playListeningPhrase(challenge.correctAnswer);
    }
  }, [challenge]);

  useEffect(() => {
    if (disabled || hasPlayedRef.current) return;
    hasPlayedRef.current = true;
    const t = setTimeout(() => {
      playChallengeAudio();
    }, 450);
    return () => clearTimeout(t);
  }, [challenge.id, disabled, playChallengeAudio]);

  useEffect(() => {
    hasPlayedRef.current = false;
  }, [challenge.id]);

  if (challenge.type === 'noteReading') {
    return (
      <div className="flex flex-col items-center gap-3">
        <h3 className="text-lg font-bold text-purple-100">Name This Note!</h3>
        <StaffSVG noteKey={challenge.targetNote} />
        <button className="text-xs text-purple-300 underline hover:text-purple-200" onClick={() => playNote(challenge.targetNote)}>
          Hear again
        </button>
        <div className="flex flex-wrap justify-center gap-2">
          {challenge.options.map((n) => (
            <button
              key={n}
              onClick={() => {
                if (disabled) return;
                const correct = noteKeyToName(challenge.targetNote) === n;
                (correct ? submitAnswer : submitWrong)(n, getResponseTime());
              }}
              disabled={disabled || !!feedback}
              className="w-11 h-11 rounded-lg font-bold bg-purple-700 hover:bg-purple-600 text-white disabled:opacity-50"
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (challenge.type === 'interval') {
    return (
      <div className="flex flex-col items-center gap-3">
        <h3 className="text-lg font-bold text-purple-100">What interval?</h3>
        <button className="text-xs text-purple-300 underline hover:text-purple-200" onClick={() => playTwoNotes(challenge.note1, challenge.note2)}>
          Hear again
        </button>
        <div className="flex flex-wrap justify-center gap-2">
          {challenge.options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                if (disabled) return;
                const correct = opt === challenge.intervalName;
                (correct ? submitAnswer : submitWrong)(opt, getResponseTime());
              }}
              disabled={disabled || !!feedback}
              className="px-4 py-2 rounded-lg font-medium bg-purple-700 hover:bg-purple-600 text-white disabled:opacity-50"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (challenge.type === 'chordIdentify' || challenge.type === 'scaleIdentify') {
    const correctName = challenge.type === 'chordIdentify' ? challenge.chordName : challenge.scaleName;
    const playAgain = () => {
      if (challenge.type === 'chordIdentify') playChord(challenge.chordNotes, 0.8);
      else playScale(challenge.scaleNotes, 0.35);
    };
    return (
      <div className="flex flex-col items-center gap-3">
        <h3 className="text-lg font-bold text-teal-100">
          {challenge.type === 'chordIdentify' ? 'Identify the chord' : 'Identify the scale'}
        </h3>
        <button
          type="button"
          className="text-xs text-teal-300 underline hover:text-teal-200"
          onClick={() => { resumeAudioContext(); playAgain(); }}
        >
          Hear again
        </button>
        <div className="flex flex-wrap justify-center gap-2">
          {challenge.options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                if (disabled) return;
                const correct = opt === correctName;
                (correct ? submitAnswer : submitWrong)(opt, getResponseTime());
              }}
              disabled={disabled || !!feedback}
              className="px-4 py-2 rounded-lg font-medium bg-teal-700 hover:bg-teal-600 text-white disabled:opacity-50"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (challenge.type === 'tempoIdentify') {
    const playTempo = () => {
      const interval = 60000 / challenge.bpm;
      for (let i = 0; i < 4; i++) {
        setTimeout(() => playClick(), i * interval);
      }
    };
    return (
      <div className="flex flex-col items-center gap-3">
        <h3 className="text-lg font-bold text-orange-100">What tempo?</h3>
        <button className="text-xs text-orange-300 underline hover:text-orange-200" onClick={playTempo}>
          Hear again
        </button>
        <div className="flex flex-wrap justify-center gap-2">
          {challenge.options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                if (disabled) return;
                const correct = opt.bpm === challenge.bpm;
                (correct ? submitAnswer : submitWrong)(opt.label, getResponseTime());
              }}
              disabled={disabled || !!feedback}
              className="px-4 py-2 rounded-lg font-medium bg-orange-700 hover:bg-orange-600 text-white disabled:opacity-50"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (challenge.type === 'listening') {
    return (
      <div className="flex flex-col items-center gap-3">
        <h3 className="text-lg font-bold text-gray-100">{challenge.prompt}</h3>
        <button
          type="button"
          className="text-xs text-gray-300 underline hover:text-gray-200"
          onClick={() => { resumeAudioContext(); playListeningPhrase(challenge.correctAnswer); }}
        >
          Hear again
        </button>
        <div className="flex flex-wrap justify-center gap-2">
          {challenge.options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                if (disabled) return;
                const correct = opt === challenge.correctAnswer;
                (correct ? submitAnswer : submitWrong)(opt, getResponseTime());
              }}
              disabled={disabled || !!feedback}
              className="px-4 py-2 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (challenge.type === 'rhythmTap') {
    return (
      <RhythmTapChallengePanel
        challenge={challenge}
        shownAt={shownAt}
        onAnswer={onAnswer}
        disabled={disabled}
      />
    );
  }

  return (
    <div className="text-gray-200">Unknown challenge type</div>
  );
};

export default ChallengePanel;
