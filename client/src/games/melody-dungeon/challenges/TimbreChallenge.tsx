import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { Tier } from '../logic/dungeonTypes';
import { getTimbreChoices, type TimbreEntry } from '../logic/timbreData';
import { getTimbreParams } from '../logic/difficultyAdapter';
import { usePhilharmoniaInstruments } from '@/common/hooks/usePhilharmoniaInstruments';
import { instrumentLibrary, type InstrumentFamily } from '@/common/instruments/instrumentLibrary';
import { playNoteAtFrequency } from '../dungeonAudio';

interface Props {
  tier: Tier;
  onResult: (correct: boolean) => void;
  slowMode?: boolean;
  onListeningChange?: (isPlaying: boolean) => void;
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

/** Pick 4–5 ascending scale notes for the instrument to form a melodic phrase. */
function pickMelodyNotes(instrumentName: string): string[] {
  const samples = instrumentLibrary.getSamples(instrumentName);
  if (samples.length === 0) return [];

  const sorted = [...samples].sort((a, b) => noteToSortKey(a.note) - noteToSortKey(b.note));
  const maxNotes = 5;
  const maxStart = Math.max(0, sorted.length - maxNotes);
  const start = Math.floor(Math.random() * (maxStart + 1));
  return sorted.slice(start, start + maxNotes).map(s => s.note);
}

const TimbreChallenge: React.FC<Props> = ({ tier, onResult, slowMode, onListeningChange }) => {
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const playedRef = useRef(false);

  const params = useMemo(() => getTimbreParams(tier), [tier]);
  const playDuration = slowMode ? params.playDuration * 2 : params.playDuration;

  // Generate challenge data once on mount
  const challengeData = useMemo(() => {
    const { correct, options } = getTimbreChoices(tier);

    // For T2, resolve which actual instrument to play from the correct family
    let instrumentToPlay: string | undefined;
    let notesToPlay: string[] = [];

    if (tier >= 2 && correct.instrumentName) {
      // T3-T5: play the specific instrument
      instrumentToPlay = correct.instrumentName;
      notesToPlay = pickMelodyNotes(correct.instrumentName);
    } else if (tier === 2 && correct.family) {
      // T2: play a random instrument from the correct family
      instrumentToPlay = pickRandomInstrumentForFamily(correct.family);
      if (instrumentToPlay) {
        notesToPlay = pickMelodyNotes(instrumentToPlay);
      }
    }

    return { correct, options, instrumentToPlay, notesToPlay };
  }, [tier]);

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
        // 8 rapid notes at 440Hz
        const count = 8;
        const gapMs = (duration * 1000) / count;
        for (let i = 0; i < count; i++) {
          setTimeout(() => playNoteAtFrequency(440, gapMs / 1000 * 0.6, 0.5), i * gapMs);
        }
        break;
      }
      case 't1-slow': {
        // 2 slow notes at 440Hz
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

  const handleAnswer = (entry: TimbreEntry) => {
    if (feedback) return;
    const correct = entry.id === challengeData.correct.id;
    setFeedback(correct ? 'correct' : 'wrong');
    setTimeout(() => onResult(correct), 800);
  };

  const title = tier === 1 ? 'Name That Sound!' : 'Name That Instrument!';

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

      {!hasPlayed && tier === 1 && (
        <p className="text-gray-400 text-sm">Listen...</p>
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
      {feedback && (
        <p className={`font-bold text-lg ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
          {feedback === 'correct' ? 'Correct!' : `It was: ${challengeData.correct.displayName}`}
        </p>
      )}
    </div>
  );
};

export default TimbreChallenge;
