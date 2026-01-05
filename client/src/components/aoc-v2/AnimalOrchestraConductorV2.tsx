/**
 * AnimalOrchestraConductorV2 - Full orchestra with depth staging
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
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
import { Button } from '@/components/ui/button';
import { Play, HelpCircle, Music2, ChevronLeft, Sparkles, Headphones } from 'lucide-react';
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from '@/theme/playful';

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
  const [, setLocation] = useLocation();
  const [gameStarted, setGameStarted] = useState(false);
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

        // Stop any existing playback before starting new loop iteration
        orchestraAudioService.stop();

        // Play all enabled instruments simultaneously with their current patterns
        // Use stopExisting: false so concurrent instruments don't stop each other
        await Promise.all(
          currentEnabledInstruments.map(i => {
            const pattern = instrumentStatesRef.current[i.id].pattern!;
            return orchestraAudioService.playSequence(i.instrument, pattern.events, tempoMs, signal, { stopExisting: false });
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

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const decorativeOrbs = generateDecorativeOrbs();

  // Landing screen
  if (!gameStarted) {
    return (
      <div className="h-screen relative overflow-hidden">
        {/* Stage background */}
        <img
          src="/images/aoc-stage-background.jpeg"
          alt="Theater stage with curtains"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Content overlay */}
        <div className="relative z-10 h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
          <button
            onClick={() => setLocation("/games")}
            className="absolute top-4 left-4 z-50 flex items-center gap-2 text-amber-100 hover:text-amber-50 font-semibold bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all hover:bg-black/60"
          >
            <ChevronLeft size={24} />
            Main Menu
          </button>

          <div className="text-center space-y-4 z-10 max-w-4xl w-full px-4 overflow-y-auto max-h-full py-8">
            <div className="space-y-2 animate-fade-in-down">
              <div className="relative inline-block mb-2">
                <div className="absolute inset-0 bg-amber-200/30 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <Music2 className="w-16 h-16 md:w-20 md:h-20 mx-auto text-amber-100 relative z-10 drop-shadow-lg" />
                <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-yellow-300 absolute -top-1 -right-1 animate-spin z-20 drop-shadow-lg" />
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-amber-200 absolute -bottom-1 -left-1 animate-pulse z-20 delay-300 drop-shadow-lg" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-amber-100 mb-1 drop-shadow-lg">
                🎻 Animal Orchestra Conductor
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-amber-200/90 max-w-2xl mx-auto drop-shadow-md">
                Conduct your own animal orchestra! Select musical patterns for each musician and create beautiful harmonies.
              </p>
              <div className="flex items-center justify-center gap-2 mt-3 bg-amber-900/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-amber-500/30 inline-flex">
                <Headphones className="w-4 h-4 md:w-5 md:h-5 text-amber-200" />
                <span className="text-sm md:text-base text-amber-100 font-medium">Best played with headphones</span>
              </div>
            </div>

            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-2xl space-y-3 border border-amber-500/20">
              <div className="flex items-center justify-center gap-2 text-base md:text-lg mb-2">
                <HelpCircle className="w-5 h-5 md:w-6 md:h-6 text-amber-200" />
                <span className="text-amber-100 font-bold text-lg md:text-xl">How to Play</span>
              </div>
              <ul className="text-left space-y-2 text-sm md:text-base">
                <li className="flex items-start gap-2 bg-amber-900/30 p-2 md:p-3 rounded-lg border border-amber-500/20">
                  <div className="bg-amber-800/50 p-1.5 md:p-2 rounded-full flex-shrink-0"><Music2 className="w-4 h-4 md:w-5 md:h-5 text-amber-200" /></div>
                  <span className="text-amber-100">Select a musical pattern for each animal musician using the pattern selector</span>
                </li>
                <li className="flex items-start gap-2 bg-amber-900/30 p-2 md:p-3 rounded-lg border border-amber-500/20">
                  <div className="bg-amber-800/50 p-1.5 md:p-2 rounded-full flex-shrink-0"><Play className="w-4 h-4 md:w-5 md:h-5 text-amber-200" /></div>
                  <span className="text-amber-100">Click on animals to enable or disable them - only enabled musicians will play</span>
                </li>
                <li className="flex items-start gap-2 bg-amber-900/30 p-2 md:p-3 rounded-lg border border-amber-500/20">
                  <div className="bg-amber-800/50 p-1.5 md:p-2 rounded-full flex-shrink-0"><Sparkles className="w-4 h-4 md:w-5 md:h-5 text-amber-200" /></div>
                  <span className="text-amber-100">Use the conductor panel to adjust tempo, dynamics, and control playback</span>
                </li>
                <li className="flex items-start gap-2 bg-amber-900/30 p-2 md:p-3 rounded-lg border border-amber-500/20">
                  <div className="bg-amber-800/50 p-1.5 md:p-2 rounded-full flex-shrink-0"><Music2 className="w-4 h-4 md:w-5 md:h-5 text-amber-200" /></div>
                  <span className="text-amber-100">Experiment with different combinations to create your own musical masterpiece!</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleStartGame}
                size="lg"
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-8 md:px-12 py-4 md:py-6 text-lg md:text-xl lg:text-2xl shadow-xl transform hover:scale-105 transition-all border-2 border-amber-400"
              >
                <Play className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 mr-2 md:mr-3 fill-current" />
                Start Conducting!
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Main Menu Button */}
        <button
          onClick={() => setLocation("/games")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-amber-100 hover:text-amber-50 font-semibold bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all hover:bg-black/60"
        >
          <ChevronLeft size={24} />
          Main Menu
        </button>

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

