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

// Instrument positioning: xPct/yPct are percentage positions on the stage (0-100)
// scale controls size, zIndex controls layering (higher = in front)
interface InstrumentPosition {
  xPct: number;    // horizontal position (0 = left, 100 = right)
  yPct: number;    // vertical position (0 = top, 100 = bottom)
  scale: number;   // size multiplier (0.5 = half, 1 = normal, 1.5 = 150%)
  zIndex: number;  // layering order (higher = in front)
}

interface InstrumentConfig {
  id: string;
  image: string;
  alt: string;
  patterns: Pattern[];
  instrument: InstrumentType;
  position: InstrumentPosition;
}

const INSTRUMENTS: InstrumentConfig[] = [
  // Back row - percussion, brass & woodwinds (smaller, higher on stage)
  { id: 'bass-drum', image: '/aoc/characters/aoc_character_bass_drum.png', alt: 'Gorilla drummer', patterns: BASS_DRUM_PATTERNS, instrument: 'bass-drum', position: { xPct: 35, yPct: 50, scale: 0.8, zIndex: 10 } },
  { id: 'trumpet', image: '/aoc/characters/aoc_character_trumpet.png', alt: 'Badger trumpeter', patterns: TRUMPET_PATTERNS, instrument: 'trumpet', position: { xPct: 64, yPct: 53, scale: 0.8, zIndex: 10 } },
  { id: 'tuba', image: '/aoc/characters/aoc_character_tuba.png', alt: 'Hippo tubist', patterns: TUBA_PATTERNS, instrument: 'tuba', position: { xPct: 80, yPct: 53, scale: 0.8, zIndex: 10 } },


  // Middle row - woodwinds (smaller, middle on stage)
  { id: 'clarinet', image: '/aoc/characters/aoc_character_clarinet.png', alt: 'Squirrel clarinetist', patterns: CLARINET_PATTERNS, instrument: 'clarinet', position: { xPct: 50, yPct: 65, scale: 0.9, zIndex: 10 } },
  { id: 'flute', image: '/aoc/characters/aoc_character_flute.png', alt: 'Bird flutist', patterns: FLUTE_PATTERNS, instrument: 'flute', position: { xPct: 20, yPct: 65, scale: 0.9, zIndex: 10 } },

  // Front row - strings (larger, lower on stage)
  { id: 'violin1', image: '/images/violinist-fox.png', alt: 'Fox violinist', patterns: VIOLIN_PATTERNS, instrument: 'violin', position: { xPct: 35, yPct: 79, scale: 1.0, zIndex: 20 } },
  { id: 'violin2', image: '/images/violinist-2.png', alt: 'Cat violinist', patterns: VIOLIN_PATTERNS, instrument: 'violin', position: { xPct: 65, yPct: 78, scale: 0.9, zIndex: 20 } },
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

  const handleSelectPattern = (instrumentId: string, pattern: Pattern | null) => {
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

        {/* Main content - Stage with fixed aspect ratio */}
        {!isLoading && (
          <>
            {/* Stage area - flex-1 pushes conductor panel to bottom */}
            <div className="flex-1 flex items-center justify-center">
              {/* Fixed 16:9 aspect ratio stage container */}
              <div className="w-full max-w-5xl mx-auto" style={{ aspectRatio: '16 / 9' }}>
                <div className="relative w-full h-full">
                  {INSTRUMENTS.map(instrument => (
                    <div
                      key={instrument.id}
                      className="absolute"
                      style={{
                        left: `${instrument.position.xPct}%`,
                        top: `${instrument.position.yPct}%`,
                        transform: `translate(-50%, -50%) scale(${instrument.position.scale})`,
                        zIndex: instrument.position.zIndex,
                      }}
                    >
                      <InstrumentStation
                        patterns={instrument.patterns}
                        image={instrument.image}
                        alt={instrument.alt}
                        selectedPattern={instrumentStates[instrument.id].pattern}
                        enabled={instrumentStates[instrument.id].enabled}
                        isPlaying={isPlaying}
                        onSelectPattern={(pattern) => handleSelectPattern(instrument.id, pattern)}
                        onToggleEnabled={() => handleToggleEnabled(instrument.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Conductor Panel - stays at bottom */}
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

