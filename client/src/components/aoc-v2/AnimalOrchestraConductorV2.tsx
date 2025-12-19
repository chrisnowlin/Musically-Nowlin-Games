/**
 * AnimalOrchestraConductorV2 - Fresh start implementation
 *
 * A game where animals play musical patterns, controlled by a conductor.
 */

import React, { useState, useEffect, useRef } from 'react';
import { InstrumentStation } from './InstrumentStation';
import { ConductorPanel } from './ConductorPanel';
import { VIOLIN_PATTERNS, getAllPatternNotes, type Pattern } from '@/lib/aoc-v2/ViolinPatterns';
import { violinAudioService } from '@/lib/aoc-v2/ViolinAudioService';

// Instrument configuration
const INSTRUMENTS = [
  { id: 'violin1', image: '/images/violinist-fox.png', alt: 'Fox violinist', patterns: VIOLIN_PATTERNS },
  { id: 'violin2', image: '/images/violinist-2.png', alt: 'Second violinist', patterns: VIOLIN_PATTERNS },
];

interface InstrumentState {
  pattern: Pattern | null;
  enabled: boolean;
}

export function AnimalOrchestraConductorV2() {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [tempo, setTempo] = useState(90);
  const [dynamics, setDynamics] = useState(0.8); // 0-1 volume

  // Centralized instrument state
  const [instrumentStates, setInstrumentStates] = useState<Record<string, InstrumentState>>(
    () => Object.fromEntries(INSTRUMENTS.map(i => [i.id, { pattern: null, enabled: true }]))
  );

  // Preload all samples on mount
  useEffect(() => {
    const preloadSamples = async () => {
      try {
        await violinAudioService.initialize();
        const allNotes = getAllPatternNotes();
        await violinAudioService.preloadNotes(allNotes);
        console.log('[AOCv2] Samples preloaded');
      } catch (error) {
        console.error('[AOCv2] Failed to preload samples:', error);
      } finally {
        setIsLoading(false);
      }
    };

    preloadSamples();
  }, []);

  const handleSelectPattern = (instrumentId: string, pattern: Pattern) => {
    setInstrumentStates(prev => ({
      ...prev,
      [instrumentId]: { ...prev[instrumentId], pattern },
    }));
  };

  const handleToggleEnabled = (instrumentId: string) => {
    setInstrumentStates(prev => ({
      ...prev,
      [instrumentId]: { ...prev[instrumentId], enabled: !prev[instrumentId].enabled },
    }));
  };

  // Refs to track playback state
  const abortControllerRef = useRef<AbortController | null>(null);
  const isLoopingRef = useRef(isLooping);

  // Keep ref in sync with state
  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  const handlePlay = async () => {
    const enabledInstruments = INSTRUMENTS.filter(
      i => instrumentStates[i.id].enabled && instrumentStates[i.id].pattern
    );

    if (enabledInstruments.length === 0) return;

    setIsPlaying(true);

    // Set volume based on dynamics
    violinAudioService.setVolume(dynamics);

    // Create abort controller for this playback session
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Convert BPM to ms per beat
    const tempoMs = Math.round(60000 / tempo / 2);

    try {
      do {
        // Play all enabled instruments simultaneously
        await Promise.all(
          enabledInstruments.map(i => {
            const pattern = instrumentStates[i.id].pattern!;
            return violinAudioService.playSequence(pattern.notes, tempoMs, signal);
          })
        );
      } while (isLoopingRef.current && !signal.aborted);
    } finally {
      if (!signal.aborted) {
        setIsPlaying(false);
      }
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    // Abort the current playback
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    violinAudioService.stop();
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Stage background */}
      <img
        src="/images/aoc-stage-background.jpeg"
        alt="Theater stage with curtains"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center py-6">
          <h1 className="text-4xl font-bold text-amber-100 mb-2 drop-shadow-lg">
            🎻 Animal Orchestra Conductor
          </h1>
          <p className="text-amber-200/80">
            Select patterns, click animals to enable/disable, then conduct!
          </p>
        </header>

        {/* Loading state */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin text-6xl mb-4">🎵</div>
              <p className="text-amber-200">Loading violin samples...</p>
            </div>
          </div>
        )}

        {/* Main content */}
        {!isLoading && (
          <>
            <div className="flex-1 flex items-end justify-center gap-8 pb-8">
              {INSTRUMENTS.map(instrument => (
                <InstrumentStation
                  key={instrument.id}
                  patterns={instrument.patterns}
                  image={instrument.image}
                  alt={instrument.alt}
                  selectedPattern={instrumentStates[instrument.id].pattern}
                  enabled={instrumentStates[instrument.id].enabled}
                  isPlaying={isPlaying}
                  onSelectPattern={(pattern) => handleSelectPattern(instrument.id, pattern)}
                  onToggleEnabled={() => handleToggleEnabled(instrument.id)}
                />
              ))}
            </div>

            {/* Conductor Panel */}
            <ConductorPanel
              isPlaying={isPlaying}
              isLooping={isLooping}
              tempo={tempo}
              onPlay={handlePlay}
              onStop={handleStop}
              onTempoChange={setTempo}
              onLoopToggle={() => setIsLooping(!isLooping)}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default AnimalOrchestraConductorV2;

