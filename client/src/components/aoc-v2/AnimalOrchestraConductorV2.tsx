/**
 * AnimalOrchestraConductorV2 - Full orchestra with depth staging
 */

import React, { useState, useEffect, useRef } from 'react';
import { InstrumentStation } from './InstrumentStation';
import { ConductorPanel } from './ConductorPanel';
import { orchestraAudioService, type InstrumentType } from '@/lib/aoc-v2/OrchestraAudioService';
import {
  VIOLIN_PATTERNS,
  FLUTE_PATTERNS,
  CLARINET_PATTERNS,
  TRUMPET_PATTERNS,
  TUBA_PATTERNS,
  BASS_DRUM_PATTERNS,
  type Pattern,
} from '@/lib/aoc-v2/InstrumentPatterns';

// Stage rows for depth effect (back to front)
// Back row: smaller, higher on stage
// Front row: larger, lower on stage
const INSTRUMENTS = [
  // Back row - percussion & brass (smaller)
  { id: 'bass-drum', image: '/images/bass-drum.png', alt: 'Bear drummer', patterns: BASS_DRUM_PATTERNS, instrument: 'bass-drum' as InstrumentType, row: 'back' },
  { id: 'tuba', image: '/images/tuba.png', alt: 'Elephant tubist', patterns: TUBA_PATTERNS, instrument: 'tuba' as InstrumentType, row: 'back' },
  { id: 'trumpet', image: '/images/trumpet.png', alt: 'Lion trumpeter', patterns: TRUMPET_PATTERNS, instrument: 'trumpet' as InstrumentType, row: 'back' },

  // Middle row - woodwinds (medium)
  { id: 'clarinet', image: '/images/clarinet.png', alt: 'Raccoon clarinetist', patterns: CLARINET_PATTERNS, instrument: 'clarinet' as InstrumentType, row: 'middle' },
  { id: 'flute', image: '/images/flute.png', alt: 'Bird flutist', patterns: FLUTE_PATTERNS, instrument: 'flute' as InstrumentType, row: 'middle' },

  // Front row - strings (larger)
  { id: 'violin1', image: '/images/violinist-fox.png', alt: 'Fox violinist', patterns: VIOLIN_PATTERNS, instrument: 'violin' as InstrumentType, row: 'front' },
  { id: 'violin2', image: '/images/violinist-2.png', alt: 'Second violinist', patterns: VIOLIN_PATTERNS, instrument: 'violin' as InstrumentType, row: 'front' },
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
        await orchestraAudioService.initialize();
        // Preload samples for each instrument's patterns
        for (const inst of INSTRUMENTS) {
          const allEvents = inst.patterns.flatMap(p => p.events);
          await orchestraAudioService.preloadInstrument(inst.instrument, allEvents);
        }
        console.log('[AOCv2] All samples preloaded');
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

  // Refs to track playback state (so loop reads current values)
  const abortControllerRef = useRef<AbortController | null>(null);
  const isLoopingRef = useRef(isLooping);
  const instrumentStatesRef = useRef(instrumentStates);
  const tempoRef = useRef(tempo);

  // Keep refs in sync with state
  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  useEffect(() => {
    instrumentStatesRef.current = instrumentStates;
  }, [instrumentStates]);

  useEffect(() => {
    tempoRef.current = tempo;
  }, [tempo]);

  // Update volume in real-time when dynamics changes
  useEffect(() => {
    orchestraAudioService.setVolume(dynamics);
  }, [dynamics]);

  const handlePlay = async () => {
    // Check initial state - need at least one enabled instrument with a pattern
    const hasPlayableInstrument = INSTRUMENTS.some(
      i => instrumentStatesRef.current[i.id].enabled && instrumentStatesRef.current[i.id].pattern
    );

    if (!hasPlayableInstrument) return;

    setIsPlaying(true);

    // Set volume based on dynamics
    orchestraAudioService.setVolume(dynamics);

    // Create abort controller for this playback session
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      do {
        // Get current enabled instruments on each loop iteration (allows live toggling)
        const currentEnabledInstruments = INSTRUMENTS.filter(
          i => instrumentStatesRef.current[i.id].enabled && instrumentStatesRef.current[i.id].pattern
        );

        if (currentEnabledInstruments.length === 0) {
          // All instruments disabled, wait a bit and check again
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }

        // Get current tempo (allows live adjustment)
        const tempoMs = Math.round(60000 / tempoRef.current / 2);

        // Play all enabled instruments simultaneously with their current patterns
        await Promise.all(
          currentEnabledInstruments.map(i => {
            const pattern = instrumentStatesRef.current[i.id].pattern!;
            return orchestraAudioService.playSequence(i.instrument, pattern.events, tempoMs, signal);
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
    orchestraAudioService.stop();
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
              <p className="text-amber-200">Loading orchestra samples...</p>
            </div>
          </div>
        )}

        {/* Main content - Stage with depth rows */}
        {!isLoading && (
          <>
            <div className="flex-1 flex flex-col justify-end pb-4 relative">
              {/* Back row - percussion & brass (smaller, further back on stage) */}
              <div className="flex justify-center gap-4 -mb-32 relative z-10">
                {INSTRUMENTS.filter(i => i.row === 'back').map(instrument => (
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
                    size="small"
                  />
                ))}
              </div>

              {/* Middle row - woodwinds (medium) */}
              <div className="flex justify-center gap-6 -mb-28 relative z-20">
                {INSTRUMENTS.filter(i => i.row === 'middle').map(instrument => (
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
                    size="medium"
                  />
                ))}
              </div>

              {/* Front row - strings (larger) */}
              <div className="flex justify-center gap-8 relative z-30 mb-16">
                {INSTRUMENTS.filter(i => i.row === 'front').map(instrument => (
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
                    size="large"
                  />
                ))}
              </div>
            </div>

            {/* Conductor Panel */}
            <ConductorPanel
              isPlaying={isPlaying}
              isLooping={isLooping}
              tempo={tempo}
              dynamics={dynamics}
              onPlay={handlePlay}
              onStop={handleStop}
              onTempoChange={setTempo}
              onDynamicsChange={setDynamics}
              onLoopToggle={() => setIsLooping(!isLooping)}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default AnimalOrchestraConductorV2;

