import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { Tier } from '../logic/dungeonTypes';
import { getTimbreChoices, type TimbreEntry } from '../logic/timbreData';
import { getTimbreParams } from '../logic/difficultyAdapter';
import { usePhilharmoniaInstruments } from '@/common/hooks/usePhilharmoniaInstruments';
import { instrumentLibrary, type InstrumentFamily } from '@/common/instruments/instrumentLibrary';
import { playNoteAtFrequency, playClick } from '../dungeonAudio';

interface Props {
  tier: Tier;
  onResult: (correct: boolean) => void;
  slowMode?: boolean;
}

/** Pick a random instrument name from the given family via instrumentLibrary. */
function pickRandomInstrumentForFamily(family: InstrumentFamily): string | undefined {
  const instruments = instrumentLibrary.getInstrumentsByFamily(family);
  if (instruments.length === 0) return undefined;
  return instruments[Math.floor(Math.random() * instruments.length)].name;
}

/** Pick a random available note for an instrument from the library. */
function pickRandomNote(instrumentName: string): string | undefined {
  const samples = instrumentLibrary.getSamples(instrumentName);
  if (samples.length === 0) return undefined;
  return samples[Math.floor(Math.random() * samples.length)].note;
}

const TimbreChallenge: React.FC<Props> = ({ tier, onResult, slowMode }) => {
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
    let noteToPlay: string | undefined;

    if (tier >= 2 && correct.instrumentName) {
      // T3-T5: play the specific instrument
      instrumentToPlay = correct.instrumentName;
      noteToPlay = pickRandomNote(correct.instrumentName);
    } else if (tier === 2 && correct.family) {
      // T2: play a random instrument from the correct family
      instrumentToPlay = pickRandomInstrumentForFamily(correct.family);
      if (instrumentToPlay) {
        noteToPlay = pickRandomNote(instrumentToPlay);
      }
    }

    return { correct, options, instrumentToPlay, noteToPlay };
  }, [tier]);

  // For T2+, preload the instrument to play
  const instrumentsToLoad = useMemo(() => {
    if (tier === 1 || !challengeData.instrumentToPlay) return [];
    return [challengeData.instrumentToPlay];
  }, [tier, challengeData.instrumentToPlay]);

  const { isLoading, playNote: playInstrumentNote } = usePhilharmoniaInstruments(instrumentsToLoad);

  // Play the T1 synthesized sound
  const playT1Sound = useCallback((entry: TimbreEntry, duration: number) => {
    switch (entry.id) {
      case 't1-high':
        playNoteAtFrequency(880, duration, 0.3);
        break;
      case 't1-low':
        playNoteAtFrequency(131, duration, 0.3);
        break;
      case 't1-singing': {
        // 3-note ascending sequence (C4=262, E4=330, G4=392) with small gaps
        const gap = duration / 3;
        const gapMs = gap * 1000;
        playNoteAtFrequency(262, gap * 0.8, 0.3);
        setTimeout(() => playNoteAtFrequency(330, gap * 0.8, 0.3), gapMs);
        setTimeout(() => playNoteAtFrequency(392, gap * 0.8, 0.3), gapMs * 2);
        break;
      }
      case 't1-speaking': {
        // 3 short staccato clicks
        playClick(0.3);
        setTimeout(() => playClick(0.3), 200);
        setTimeout(() => playClick(0.3), 400);
        break;
      }
    }
  }, []);

  // Play the sound (T1 synth or T2+ Philharmonia)
  const playSound = useCallback(() => {
    if (tier === 1) {
      playT1Sound(challengeData.correct, playDuration);
    } else if (challengeData.instrumentToPlay && challengeData.noteToPlay) {
      playInstrumentNote(challengeData.instrumentToPlay, challengeData.noteToPlay, {
        duration: playDuration,
      });
    }
  }, [tier, challengeData, playDuration, playT1Sound, playInstrumentNote]);

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
