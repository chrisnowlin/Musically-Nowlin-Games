import { useState, useCallback, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Music, Play, ArrowLeft, ArrowRight, ArrowDown, RefreshCw, Sparkles, Star } from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import { useGameCleanup } from "@/hooks/useGameCleanup";
import { audioService } from "@/lib/audioService";
import { instrumentLibrary } from "@/lib/instrumentLibrary";

// Instrument icon imports
import { 
  ViolinIcon, CelloIcon, FluteIcon, TrumpetIcon, FrenchHornIcon, 
  ClarinetIcon, OboeIcon, SaxophoneIcon, BassoonIcon, ViolaIcon,
  TromboneIcon, TubaIcon, DoubleBassIcon, SnareDrumIcon, BassDrumIcon,
  TriangleIcon, TambourineIcon, TimpaniIcon, XylophoneIcon, GlockenspielIcon,
  CowbellIcon, WoodblockIcon, CastanetsIcon, SleighBellsIcon, CymbalsIcon, WindChimesIcon
} from '@/components/icons/InstrumentIcons';

interface Instrument {
  id: string;
  name: string;
  Icon: React.FC<{ className?: string }>;
  audioPaths: string[]; // Multiple melodic samples for richer sound
  color: string;
}

// Use import.meta.env.BASE_URL to get the correct base path for production (GitHub Pages)
// This ensures audio files are loaded from the correct URL in all environments
const BASE_URL = import.meta.env.BASE_URL || '/';

// Volume normalization multipliers per instrument (matching Instrument Detective)
// These values compensate for the natural loudness differences in the Philharmonia samples
// All values tuned for maximum audibility
const INSTRUMENT_VOLUME_NORMALIZATION: Record<string, number> = {
  // Strings - generally well balanced
  'violin': 9.0,
  'viola': 9.9,
  'cello': 8.7,
  'double-bass': 11.4,
  
  // Woodwinds - varied loudness
  'flute': 7.8,
  'clarinet': 8.1,
  'oboe': 7.2,
  'bassoon': 9.9,
  'saxophone': 6.9,
  
  // Brass - naturally loud instruments
  'trumpet': 6.0,
  'french-horn': 7.8,
  'trombone': 6.3,
  'tuba': 8.1,
  
  // Pitched Percussion
  'timpani': 12.0,
  'xylophone': 7.2,
  'glockenspiel': 5.4,
  
  // Unpitched Percussion - boosted for audibility
  'snare-drum': 8.0,
  'bass-drum': 10.0,
  'triangle': 6.0,
  'tambourine': 7.0,
  'cowbell': 7.5,
  'woodblock': 7.0,
  'castanets': 7.0,
  'sleigh-bells': 8.0,
  'cymbals': 6.5,
  'wind-chimes': 8.0,
};

// Get normalized volume for an instrument
// Web Audio API allows gain > 1.0 for amplification
const getNormalizedVolume = (instrumentId: string): number => {
  const baseVolume = 0.5; // 50% base volume
  const normalizer = INSTRUMENT_VOLUME_NORMALIZATION[instrumentId] || 1.0;
  return baseVolume * normalizer;
};

// Map instrument IDs to their icon components
const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  'violin': ViolinIcon,
  'cello': CelloIcon,
  'viola': ViolaIcon,
  'double-bass': DoubleBassIcon,
  'flute': FluteIcon,
  'clarinet': ClarinetIcon,
  'oboe': OboeIcon,
  'bassoon': BassoonIcon,
  'saxophone': SaxophoneIcon,
  'trumpet': TrumpetIcon,
  'french-horn': FrenchHornIcon,
  'trombone': TromboneIcon,
  'tuba': TubaIcon,
  'timpani': TimpaniIcon,
  'xylophone': XylophoneIcon,
  'glockenspiel': GlockenspielIcon,
  'snare-drum': SnareDrumIcon,
  'bass-drum': BassDrumIcon,
  'triangle': TriangleIcon,
  'tambourine': TambourineIcon,
  'cowbell': CowbellIcon,
  'woodblock': WoodblockIcon,
  'castanets': CastanetsIcon,
  'sleigh-bells': SleighBellsIcon,
  'cymbals': CymbalsIcon,
  'wind-chimes': WindChimesIcon,
};

// Color map for instruments
const COLOR_MAP: Record<string, string> = {
  'violin': 'bg-amber-500',
  'cello': 'bg-orange-800',
  'viola': 'bg-violet-500',
  'double-bass': 'bg-amber-800',
  'flute': 'bg-sky-400',
  'clarinet': 'bg-gray-800',
  'oboe': 'bg-stone-500',
  'bassoon': 'bg-amber-900',
  'saxophone': 'bg-yellow-400',
  'trumpet': 'bg-yellow-500',
  'french-horn': 'bg-amber-600',
  'trombone': 'bg-yellow-600',
  'tuba': 'bg-zinc-600',
  'timpani': 'bg-rose-700',
  'xylophone': 'bg-pink-400',
  'glockenspiel': 'bg-cyan-300',
  'snare-drum': 'bg-red-500',
  'bass-drum': 'bg-red-800',
  'triangle': 'bg-slate-300',
  'tambourine': 'bg-orange-400',
  'cowbell': 'bg-zinc-400',
  'woodblock': 'bg-amber-700',
  'castanets': 'bg-stone-700',
  'sleigh-bells': 'bg-yellow-300',
  'cymbals': 'bg-yellow-500',
  'wind-chimes': 'bg-teal-400',
};

// Build instruments from the instrumentLibrary for correct paths
// Note: Harp, Guitar, Banjo have been removed due to sample issues (see INSTRUMENT_LIBRARY_GUIDE.md)
function buildInstrumentsFromLibrary(): Instrument[] {
  const instruments: Instrument[] = [];
  
  // Get all available instruments from the library
  const libraryInstruments = instrumentLibrary.getAllInstruments();
  
  for (const libInst of libraryInstruments) {
    const Icon = ICON_MAP[libInst.name];
    if (!Icon) continue; // Skip instruments without icons
    
    // Get all sample paths for melodic variety
    const audioPaths = instrumentLibrary.getSamplePaths(libInst.name);
    if (audioPaths.length === 0) continue; // Skip if no samples
    
    instruments.push({
      id: libInst.name,
      name: libInst.displayName,
      Icon,
      audioPaths,
      color: COLOR_MAP[libInst.name] || 'bg-gray-500',
    });
  }
  
  // Add percussion instruments that aren't pitched (manually configured)
  // These use the Philharmonia percussion samples with correct paths
  // Each instrument includes a rich variety of articulations, dynamics, and rhythm patterns
  const unpitchedPercussion: Instrument[] = [
    {
      id: 'snare-drum',
      name: 'Snare Drum',
      Icon: SnareDrumIcon,
      audioPaths: [
        // Single hits at different dynamics
        `${BASE_URL}audio/philharmonia/percussion/snare drum/snare-drum__025_forte_with-snares.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/snare drum/snare-drum__025_fortissimo_with-snares.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/snare drum/snare-drum__025_mezzo-forte_with-snares.mp3`,
        // Rolls
        `${BASE_URL}audio/philharmonia/percussion/snare drum/snare-drum__long_forte_roll.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/snare drum/snare-drum__long_mezzo-forte_roll.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/snare drum/snare-drum__very-long_cresc-decresc_roll.mp3`,
        // Rhythm patterns
        `${BASE_URL}audio/philharmonia/percussion/snare drum/snare-drum__long_mezzo-forte_rhythm.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/snare drum/snare-drum__phrase_mezzo-forte_rhythm.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/snare drum/snare-drum__phrase_cresc-decresc_rhythm.mp3`,
        // Special techniques
        `${BASE_URL}audio/philharmonia/percussion/snare drum/snare-drum__phrase_crescendo_flam.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/snare drum/snare-drum__phrase_decrescendo_roll.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/snare drum/snare-drum__phrase_mezzo-forte_without-snares.mp3`,
      ],
      color: 'bg-red-500',
    },
    {
      id: 'bass-drum',
      name: 'Bass Drum',
      Icon: BassDrumIcon,
      audioPaths: [
        // Single hits - various dynamics
        `${BASE_URL}audio/philharmonia/percussion/bass drum/bass-drum__1_fortissimo_struck-singly.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/bass drum/bass-drum__1_mezzo-piano_struck-singly.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/bass drum/bass-drum__1_pianissimo_struck-singly.mp3`,
        // Mallet hits
        `${BASE_URL}audio/philharmonia/percussion/bass drum/bass-drum__025_forte_bass-drum-mallet.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/bass drum/bass-drum__025_mezzo-forte_bass-drum-mallet.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/bass drum/bass-drum__1_mezzo-forte_bass-drum-mallet.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/bass drum/bass-drum__long_crescendo_bass-drum-mallet.mp3`,
        // Flams (double strokes)
        `${BASE_URL}audio/philharmonia/percussion/bass drum/bass-drum__1_mezzo-forte_flam.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/bass drum/bass-drum__1_mezzo-piano_flam.mp3`,
        // Rute (brush) technique
        `${BASE_URL}audio/philharmonia/percussion/bass drum/bass-drum__025_mezzo-forte_rute.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/bass drum/bass-drum__05_mezzo-forte_rute.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/bass drum/bass-drum__phrase_forte_rute.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/bass drum/bass-drum__phrase_mezzo-forte_rute.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/bass drum/bass-drum__phrase_mezzo-piano_rute.mp3`,
        // Rhythm patterns
        `${BASE_URL}audio/philharmonia/percussion/bass drum/bass-drum__15_mezzo-piano_rhythm.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/bass drum/bass-drum__15_pianissimo_rhythm.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/bass drum/bass-drum__phrase_mezzo-piano_rhythm.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/bass drum/bass-drum__phrase_mezzo-forte_sticks.mp3`,
      ],
      color: 'bg-red-800',
    },
    {
      id: 'triangle',
      name: 'Triangle',
      Icon: TriangleIcon,
      audioPaths: [
        // Single strikes
        `${BASE_URL}audio/philharmonia/percussion/triangle/triangle__long_piano_struck-singly.mp3`,
        // Rolls
        `${BASE_URL}audio/philharmonia/percussion/triangle/triangle__very-long_mezzo-forte_roll.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/triangle/triangle__long_decrescendo_roll.mp3`,
        // Rhythm patterns
        `${BASE_URL}audio/philharmonia/percussion/triangle/triangle__phrase_mezzo-piano_rhythm.mp3`,
        // Special techniques
        `${BASE_URL}audio/philharmonia/percussion/triangle/triangle__phrase_mezzo-piano_damped.mp3`,
      ],
      color: 'bg-slate-300',
    },
    {
      id: 'tambourine',
      name: 'Tambourine',
      Icon: TambourineIcon,
      audioPaths: [
        // Hand hits at different dynamics
        `${BASE_URL}audio/philharmonia/percussion/tambourine/tambourine__025_forte_hand.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/tambourine/tambourine__025_fortissimo_hand.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/tambourine/tambourine__05_forte_hand.mp3`,
        // Hand rhythm patterns
        `${BASE_URL}audio/philharmonia/percussion/tambourine/tambourine__phrase_forte_hand.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/tambourine/tambourine__phrase_mezzo-forte_hand.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/tambourine/tambourine__phrase_crescendo_hand.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/tambourine/tambourine__phrase_decrescendo_hand.mp3`,
        // Shaken technique
        `${BASE_URL}audio/philharmonia/percussion/tambourine/tambourine__1_mezzo-piano_shaken.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/tambourine/tambourine__phrase_mezzo-piano_shaken.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/tambourine/tambourine__long_cresc-decresc_shaken.mp3`,
        // Body hits
        `${BASE_URL}audio/philharmonia/percussion/tambourine/tambourine__phrase_mezzo-forte_body.mp3`,
      ],
      color: 'bg-orange-400',
    },
    {
      id: 'cowbell',
      name: 'Cowbell',
      Icon: CowbellIcon,
      audioPaths: [
        // Single hits
        `${BASE_URL}audio/philharmonia/percussion/cowbell/cowbell__1_forte_undamped.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/cowbell/cowbell__1_mezzo-forte_undamped.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/cowbell/cowbell__025_mezzo-forte_damped.mp3`,
        // Rhythm pattern
        `${BASE_URL}audio/philharmonia/percussion/cowbell/cowbell__long_mezzo-forte_rhythm.mp3`,
      ],
      color: 'bg-zinc-400',
    },
    {
      id: 'woodblock',
      name: 'Woodblock',
      Icon: WoodblockIcon,
      audioPaths: [
        // Single hit
        `${BASE_URL}audio/philharmonia/percussion/woodblock/woodblock__025_mezzo-forte_struck-singly.mp3`,
        // Rhythm pattern
        `${BASE_URL}audio/philharmonia/percussion/woodblock/woodblock__phrase_mezzo-piano_rhythm.mp3`,
      ],
      color: 'bg-amber-700',
    },
    {
      id: 'castanets',
      name: 'Castanets',
      Icon: CastanetsIcon,
      audioPaths: [
        // Single click
        `${BASE_URL}audio/philharmonia/percussion/castanets/castanets__025_mezzo-forte_struck-singly.mp3`,
        // Rolls
        `${BASE_URL}audio/philharmonia/percussion/castanets/castanets__long_mezzo-forte_roll.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/castanets/castanets__phrase_mezzo-forte_roll.mp3`,
        // Rhythm pattern
        `${BASE_URL}audio/philharmonia/percussion/castanets/castanets__phrase_forte_rhythm.mp3`,
      ],
      color: 'bg-stone-700',
    },
    {
      id: 'sleigh-bells',
      name: 'Sleigh Bells',
      Icon: SleighBellsIcon,
      audioPaths: [
        // Different shake durations and dynamics
        `${BASE_URL}audio/philharmonia/percussion/sleigh bells/sleigh-bells__05_mezzo-forte_shaken.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/sleigh bells/sleigh-bells__long_forte_shaken.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/sleigh bells/sleigh-bells__long_mezzo-forte_shaken.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/sleigh bells/sleigh-bells__very-long_mezzo-forte_shaken.mp3`,
      ],
      color: 'bg-yellow-300',
    },
    {
      id: 'cymbals',
      name: 'Crash Cymbals',
      Icon: CymbalsIcon,
      audioPaths: [
        // Single crashes - various dynamics
        `${BASE_URL}audio/philharmonia/percussion/clash cymbals/clash-cymbals__15_fortissimo_struck-together.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/clash cymbals/clash-cymbals__1_piano_struck-together.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/clash cymbals/clash-cymbals__025_mezzo-forte_undamped.mp3`,
        // Damped vs undamped
        `${BASE_URL}audio/philharmonia/percussion/clash cymbals/clash-cymbals__1_forte_damped.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/clash cymbals/clash-cymbals__05_forte_damped.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/clash cymbals/clash-cymbals__long_forte_undamped.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/clash cymbals/clash-cymbals__long_fortissimo_struck-together.mp3`,
      ],
      color: 'bg-yellow-500',
    },
    {
      id: 'wind-chimes',
      name: 'Wind Chimes',
      Icon: WindChimesIcon,
      audioPaths: [
        `${BASE_URL}audio/philharmonia/percussion/wind chimes/wind-chimes__long_mezzo-piano_hand.mp3`,
      ],
      color: 'bg-teal-400',
    },
  ];
  
  // Add unpitched percussion - REPLACE any existing library versions with our richer manual configs
  // This ensures bass-drum and snare-drum use our full sample sets instead of library's single samples
  for (const perc of unpitchedPercussion) {
    const existingIndex = instruments.findIndex(i => i.id === perc.id);
    if (existingIndex !== -1) {
      // Replace the library version with our richer manual version
      instruments[existingIndex] = perc;
    } else {
      instruments.push(perc);
    }
  }
  
  return instruments;
}

// Generate instruments once at module load
const INSTRUMENTS: Instrument[] = buildInstrumentsFromLibrary();

// Debug: Log instruments and check for duplicates
console.log('[InstrumentCrane] INSTRUMENTS loaded:', INSTRUMENTS.map(i => ({ id: i.id, name: i.name })));
const idCounts = INSTRUMENTS.reduce((acc, i) => {
  acc[i.id] = (acc[i.id] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
const duplicates = Object.entries(idCounts).filter(([, count]) => count > 1);
if (duplicates.length > 0) {
  console.error('[InstrumentCrane] DUPLICATE INSTRUMENTS FOUND:', duplicates);
}

interface Target {
  id: string;
  instrument: Instrument;
  xPos: number; // 0-100 percentage
}

export default function InstrumentCraneGame() {
  const [, setLocation] = useLocation();
  const { setTimeout: setGameTimeout } = useGameCleanup();
  
  // Game State
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [currentInstrument, setCurrentInstrument] = useState<Instrument | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);
  const [craneIndex, setCraneIndex] = useState(1); // 0-3 positions
  const [craneState, setCraneState] = useState<'idle' | 'moving' | 'dropping' | 'grabbing' | 'rising' | 'returning'>('idle');
  const [caughtTargetId, setCaughtTargetId] = useState<string | null>(null); // ID of target caught by crane
  const [feedback, setFeedback] = useState<{ 
    show: boolean; 
    isCorrect: boolean; 
    message: string;
    clickedName?: string;
    correctName?: string;
  } | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [hasPlayedSound, setHasPlayedSound] = useState(false); // Track if user has played sound this round

  const decorativeOrbs = generateDecorativeOrbs();

  // Preload all instrument sounds on mount
  useEffect(() => {
    // Flatten all audio paths from all instruments
    const allAudioPaths = INSTRUMENTS.flatMap(i => i.audioPaths);
    // Load in chunks to avoid overwhelming network
    const preloadChunk = async () => {
       // Preload first 10 paths (likely to be used)
       await audioService.preloadSamples(allAudioPaths.slice(0, 10));
       // Preload rest in background
       setTimeout(() => {
         audioService.preloadSamples(allAudioPaths.slice(10));
       }, 2000);
    };
    preloadChunk();
  }, []);

  // Fixed positions for 4 items
  const POSITIONS = [20, 40, 60, 80];

  // Play instrument sound - plays a characteristic phrase using available samples
  // This makes the instrument more recognizable and educational
  const playInstrumentSound = useCallback(async (instrumentId: string, audioPaths: string[]) => {
    // Stop any currently playing audio
    audioService.stopSample();

    // Mark that sound has been played this round
    setHasPlayedSound(true);
    setIsPlayingAudio(true);

    try {
      // CRITICAL for iOS Safari: Ensure audio is initialized on every play attempt
      // This handles the case where the user presses the Listen button directly
      if (!audioService.isAudioUnlocked()) {
        await audioService.initialize();
      }

      // Set normalized volume for this instrument (matching Instrument Detective)
      const normalizedVolume = getNormalizedVolume(instrumentId);
      audioService.setVolume(normalizedVolume);

      // Determine if this is likely an unpitched percussion instrument
      // by checking if paths contain rhythm patterns or special articulations
      const isPercussion = audioPaths.some(p => 
        p.includes('rhythm') || p.includes('roll') || p.includes('shaken') || 
        p.includes('struck') || p.includes('hand') || p.includes('flam')
      );

      if (isPercussion && audioPaths.length >= 3) {
        // For percussion: Play a varied selection showcasing different techniques
        // Pick 2-3 contrasting samples to demonstrate the instrument's character
        const singleHit = audioPaths.find(p => p.includes('025') || p.includes('struck-singly') || p.includes('_1_')) || audioPaths[0];
        const rhythmOrRoll = audioPaths.find(p => p.includes('rhythm') || p.includes('roll') || p.includes('shaken') || p.includes('phrase')) || audioPaths[1];
        
        // Play: single hit, then rhythm/roll pattern
        await audioService.playSample(singleHit, 1);
        await new Promise(resolve => setTimeout(resolve, 300));
        await audioService.playSample(rhythmOrRoll, 1);
      } else if (audioPaths.length >= 3) {
        // For melodic instruments: Play a short melodic phrase
        // root, up, root pattern for recognition
        const phrase = [audioPaths[0], audioPaths[Math.min(1, audioPaths.length - 1)], audioPaths[0]];
        for (const path of phrase) {
          await audioService.playSample(path, 1);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } else if (audioPaths.length === 2) {
        // Two samples: play both
        await audioService.playSample(audioPaths[0], 1);
        await new Promise(resolve => setTimeout(resolve, 250));
        await audioService.playSample(audioPaths[1], 1);
      } else {
        // Single sample: play it twice
        await audioService.playSample(audioPaths[0], 2);
      }
    } catch (e) {
      console.error(`Audio play failed:`, e);
    } finally {
      setIsPlayingAudio(false);
    }
  }, []);

  // Initialize Round
  const startRound = useCallback((autoPlay: boolean = false) => {
    // Pick random target instrument
    const targetInst = INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)];
    setCurrentInstrument(targetInst);

    // Generate targets on the fixed positions (ensure target is included + 3 random distractors)
    const distractors = INSTRUMENTS.filter(i => i.id !== targetInst.id)
                                   .sort(() => Math.random() - 0.5)
                                   .slice(0, 3);
    
    const roundInstruments = [targetInst, ...distractors].sort(() => Math.random() - 0.5);

    const newTargets = roundInstruments.map((inst, i) => ({
      id: `target-${i}-${inst.id}`,
      instrument: inst,
      xPos: POSITIONS[i]
    }));
    
    setTargets(newTargets);
    setCraneIndex(1); // Reset to roughly center-left
    setCraneState('idle');
    setCaughtTargetId(null);
    setFeedback(null);
    setHasPlayedSound(false); // Reset sound played state for new round
    
    // Preload the target instrument audio
    audioService.preloadSamples(targetInst.audioPaths);

    // Only auto-play on first round (triggered by user's Start button)
    // Subsequent rounds should not auto-play to avoid iOS audio restrictions
    if (autoPlay) {
      setHasPlayedSound(true);
      setGameTimeout(() => {
        playInstrumentSound(targetInst.id, targetInst.audioPaths);
      }, 500);
    }
  }, [setGameTimeout, playInstrumentSound]);

  const handleStartGame = async () => {
    // CRITICAL for iOS Safari: Initialize audio context in direct response to user gesture
    // This must happen BEFORE any audio operations
    try {
      await audioService.initialize();
    } catch (e) {
      console.warn('Audio initialization warning:', e);
    }

    // Now audio should be unlocked, preload all instrument sounds
    const allAudioPaths = INSTRUMENTS.flatMap(i => i.audioPaths);
    audioService.preloadSamples(allAudioPaths);

    audioService.playClickSound();
    setGameStarted(true);
    // Pass true to auto-play on first round - user just clicked Start button
    startRound(true);
  };

  // Crane Controls
  const moveCrane = (direction: 'left' | 'right') => {
    if (craneState !== 'idle') return;
    audioService.playCraneMoveSound();
    setCraneIndex(prev => {
      const newIndex = direction === 'left' ? prev - 1 : prev + 1;
      return Math.max(0, Math.min(3, newIndex));
    });
  };

  const handleTargetClick = (index: number) => {
    if (craneState !== 'idle' || !currentInstrument) return;
    
    audioService.playCraneMoveSound();
    setCraneIndex(index);
    // Wait for movement to likely finish (CSS transition is 300ms)
    setCraneState('moving');
    setGameTimeout(() => {
      setCraneState('idle');
      dropCrane(index); // Pass index directly to avoid stale closure
    }, 400);
  };

  const dropCrane = (overrideIndex?: number) => {
    if (craneState !== 'idle' && craneState !== 'moving') return; // Allow if triggered from click move
    if (!currentInstrument) return;
    
    audioService.playCraneDropSound();

    // Use override index if provided (from click), otherwise use current craneIndex (from button drop)
    const effectiveIndex = overrideIndex !== undefined ? overrideIndex : craneIndex;

    setCraneState('dropping');

    // Simulate drop animation time
    setGameTimeout(() => {
      setCraneState('grabbing');
      audioService.playCraneGrabSound();
      
      // Check collision using the effective index
      const hitTarget = targets[effectiveIndex];
      
      if (hitTarget) {
        setCaughtTargetId(hitTarget.id);
      }

      setGameTimeout(() => {
        setCraneState('rising');
        
        setGameTimeout(() => {
          // Debug logging to catch comparison issues
          console.log('[InstrumentCrane] Comparison check:', {
            hitTargetId: hitTarget?.instrument.id,
            hitTargetName: hitTarget?.instrument.name,
            currentInstrumentId: currentInstrument?.id,
            currentInstrumentName: currentInstrument?.name,
            areEqual: hitTarget?.instrument.id === currentInstrument?.id
          });
          
          // Check win condition after rising
          if (hitTarget && hitTarget.instrument.id === currentInstrument.id) {
            // Correct!
            setScore(s => s + 1);
            setFeedback({ 
              show: true, 
              isCorrect: true, 
              message: `Great job! That's the`,
              correctName: hitTarget.instrument.name
            });
            audioService.playSuccessTone();
          } else {
            // Wrong or Missed
            if (hitTarget) {
               setFeedback({ 
                 show: true, 
                 isCorrect: false, 
                 message: `Oops! You picked`,
                 clickedName: hitTarget.instrument.name,
                 correctName: currentInstrument.name
               });
            } else {
               setFeedback({ show: true, isCorrect: false, message: "Missed! Try aiming closer." });
            }
            audioService.playErrorTone();
          }
          
          setTotalRounds(r => r + 1);
          setCraneState('returning'); 

          setGameTimeout(() => {
             startRound();
          }, 4500); // Extended feedback display time for better readability

        }, 1000); // Rising time
      }, 500); // Grabbing time
    }, 600); // Dropping time
  };

  // Derive crane position from index
  const cranePos = POSITIONS[craneIndex];

  if (!gameStarted) {
    return (
      <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
        {/* Background & Header similar to other games */}
        <button
          onClick={() => setLocation("/games")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft size={24} />
          Main Menu
        </button>
        
        {decorativeOrbs.map((orb) => (
          <div key={orb.key} className={orb.className} />
        ))}

        <div className="text-center space-y-8 z-10 max-w-2xl animate-in fade-in zoom-in duration-500">
          <div className="space-y-4">
            <h1 className={`${playfulTypography.headings.hero} ${playfulColors.gradients.title} drop-shadow-lg`}>
              🏗️ Instrument Crane
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Listen to the sound and catch the matching instrument!
            </p>
          </div>

          <Button
            onClick={handleStartGame}
            size="lg"
            className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale} px-12 py-8 text-2xl shadow-xl`}
          >
            <Play className="w-10 h-10 mr-3 fill-current" />
            Start Game
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col p-4 relative overflow-hidden`}>
      {decorativeOrbs.map((orb) => (
        <div key={orb.key} className={orb.className} />
      ))}

      {/* Header */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between mb-6 relative z-10">
        <button onClick={() => setLocation("/games")} className="flex items-center gap-2 text-purple-700 bg-white/80 px-4 py-2 rounded-full shadow-sm">
          <ChevronLeft size={20} /> Exit
        </button>
        <div className="flex items-center gap-4 bg-white/80 px-6 py-2 rounded-full shadow-sm">
           <span className="text-xl font-bold text-purple-600">Score: {score}/{totalRounds}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start z-10 max-w-4xl mx-auto w-full space-y-6">
        
        {/* Arcade Cabinet Container */}
        <div className="relative bg-gray-900 p-4 rounded-[3rem] shadow-2xl border-b-8 border-r-8 border-gray-800 mx-auto max-w-2xl w-full">
          
          {/* Cabinet Header */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 h-16 rounded-t-2xl mb-4 flex items-center justify-center border-b-4 border-purple-800 shadow-inner relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] opacity-30"></div>
             <div className="text-white font-black text-2xl tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] uppercase">
               Instrument Crane
             </div>
             {/* Flashing lights */}
             <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-yellow-300 animate-pulse shadow-[0_0_10px_yellow]"></div>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-yellow-300 animate-pulse shadow-[0_0_10px_yellow]"></div>
          </div>

          {/* Glass Box Area */}
          <div className={`bg-gradient-to-b from-blue-900/80 to-indigo-900/80 backdrop-blur-sm rounded-xl w-full h-[500px] relative overflow-hidden border-4 border-gray-700 shadow-inner`}>
            
            {/* Glass Reflection/Glare */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none z-20 rounded-xl"></div>
            <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-white/5 to-transparent skew-x-12 pointer-events-none z-20"></div>

            {/* Back Wall Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgNDAgTDQwIDAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-30 pointer-events-none"></div>

            {/* Crane Rail */}
            <div className="absolute top-16 left-0 w-full h-6 bg-gray-400 rounded-full mx-4 shadow-lg border-b-4 border-gray-500 z-10" style={{ width: 'calc(100% - 2rem)' }}>
               <div className="absolute top-1 left-0 w-full h-2 bg-stripes-gray opacity-30"></div>
            </div>

            {/* Crane Mechanism */}
            <div 
              className="absolute top-16 w-32 h-full pointer-events-none transition-all duration-300 ease-in-out z-10"
              style={{ 
                left: `${cranePos}%`, 
                transform: 'translateX(-50%)',
              }}
            >
               {/* Crane Box (Motor) */}
               <div className="w-24 h-16 bg-gradient-to-b from-gray-300 to-gray-400 rounded-lg mx-auto relative z-20 shadow-2xl border-b-4 border-gray-500 flex flex-col items-center justify-center overflow-hidden">
                  {/* Warning Stripes */}
                  <div className="absolute top-0 left-0 w-full h-4 bg-[repeating-linear-gradient(45deg,#fbbf24,#fbbf24_10px,#000_10px,#000_20px)] opacity-80 border-b border-black/20"></div>
                  
                  {/* Motor Detail */}
                  <div className="w-16 h-8 bg-gray-800 rounded-md mt-2 flex items-center justify-center border border-gray-600 inset-shadow">
                     <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red] border border-red-700"></div>
                     <div className="flex gap-1 ml-2">
                        <div className="w-1 h-4 bg-gray-600 rounded-full"></div>
                        <div className="w-1 h-4 bg-gray-600 rounded-full"></div>
                        <div className="w-1 h-4 bg-gray-600 rounded-full"></div>
                     </div>
                  </div>
                  <div className="absolute -top-2 w-20 h-2 bg-gray-600 rounded-full shadow-sm"></div>
               </div>

               {/* Vertical Cable */}
               <div 
                 className="w-2 bg-gray-800 mx-auto transition-all duration-1000 ease-in-out relative shadow-lg"
                 style={{ 
                   height: craneState === 'dropping' || craneState === 'grabbing' ? '42%' : craneState === 'rising' ? '8%' : '8%' 
                 }}
               >
                 {/* Cable Pattern - Braided steel look */}
                 <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDggTDggMCIgc3Ryb2tlPSIjNjY2IiBzdHJva2Utd2lkdGg9IjEiLz48cGF0aCBkPSJNMCAwIEw4IDgiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjUiLz48L3N2Zz4=')] opacity-80"></div>
               </div>
               
               {/* Claw SVG */}
               <div 
                 className="relative mx-auto w-32 h-32 transition-all duration-1000 ease-in-out"
                 style={{ 
                    marginTop: '-8px', 
                 }}
               >
                  <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-2xl filter">
                     <defs>
                        <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                           <stop offset="0%" stopColor="#9CA3AF" />
                           <stop offset="50%" stopColor="#E5E7EB" />
                           <stop offset="100%" stopColor="#9CA3AF" />
                        </linearGradient>
                        <linearGradient id="pistonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                           <stop offset="0%" stopColor="#4B5563" />
                           <stop offset="50%" stopColor="#9CA3AF" />
                           <stop offset="100%" stopColor="#4B5563" />
                        </linearGradient>
                     </defs>

                     {/* Connector Cap */}
                     <rect x="52" y="0" width="16" height="10" rx="2" fill="#374151" stroke="#1F2937" />

                     {/* Main Cylinder Body */}
                     <rect x="45" y="8" width="30" height="25" rx="4" fill="url(#pistonGradient)" stroke="#374151" strokeWidth="1" />
                     <line x1="45" y1="15" x2="75" y2="15" stroke="#374151" strokeWidth="1" opacity="0.5" />
                     <line x1="45" y1="25" x2="75" y2="25" stroke="#374151" strokeWidth="1" opacity="0.5" />

                     {/* Central Piston Shaft */}
                     <rect x="56" y="33" width="8" height="15" fill="#D1D5DB" stroke="#9CA3AF" />

                     {/* Claw Hinge Hub */}
                     <circle cx="60" cy="50" r="8" fill="#4B5563" stroke="#1F2937" strokeWidth="2" />
                     <circle cx="60" cy="50" r="3" fill="#E5E7EB" />

                     {/* Left Claw Arm */}
                     <g 
                       className="transition-all duration-500 ease-in-out" 
                       style={{ 
                         transformOrigin: "60px 50px", 
                         transform: (craneState === 'dropping' || craneState === 'grabbing' || craneState === 'rising') ? "rotate(25deg)" : "rotate(0deg)" 
                       }}
                     >
                        {/* Upper Arm */}
                        <path d="M55 55 L 30 70" stroke="url(#metalGradient)" strokeWidth="6" strokeLinecap="round" />
                        {/* Joint */}
                        <circle cx="30" cy="70" r="4" fill="#374151" />
                        {/* Lower Finger */}
                        <path d="M30 70 Q 20 95 45 105" fill="none" stroke="url(#metalGradient)" strokeWidth="5" strokeLinecap="round" />
                        {/* Tip */}
                        <path d="M45 105 L 48 102" stroke="#374151" strokeWidth="2" />
                     </g>

                     {/* Right Claw Arm */}
                     <g 
                       className="transition-all duration-500 ease-in-out" 
                       style={{ 
                         transformOrigin: "60px 50px", 
                         transform: (craneState === 'dropping' || craneState === 'grabbing' || craneState === 'rising') ? "rotate(-25deg)" : "rotate(0deg)" 
                       }}
                     >
                        {/* Upper Arm */}
                        <path d="M65 55 L 90 70" stroke="url(#metalGradient)" strokeWidth="6" strokeLinecap="round" />
                        {/* Joint */}
                        <circle cx="90" cy="70" r="4" fill="#374151" />
                        {/* Lower Finger */}
                        <path d="M90 70 Q 100 95 75 105" fill="none" stroke="url(#metalGradient)" strokeWidth="5" strokeLinecap="round" />
                        {/* Tip */}
                        <path d="M75 105 L 72 102" stroke="#374151" strokeWidth="2" />
                     </g>
                  </svg>

                  {/* Caught Item */}
                  {caughtTargetId && (() => {
                    const caughtInst = targets.find(t => t.id === caughtTargetId)?.instrument;
                    const CaughtIcon = caughtInst?.Icon;
                    return (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-8 animate-in zoom-in duration-300 z-30">
                        <div className={`
                          w-16 h-16 rounded-full border-4 border-white/50 shadow-xl
                          flex items-center justify-center
                          ${caughtInst?.color.replace('bg-', 'bg-').replace('500', '400')}
                        `}>
                          {CaughtIcon && <CaughtIcon className="w-10 h-10 drop-shadow-md text-white" />}
                        </div>
                      </div>
                    );
                  })()}
               </div>
            </div>

            {/* Prize Shelf / Bottom Area */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-900 to-transparent flex items-end px-8 z-10">
               {/* Decorative Pile of Prizes (Background) */}
               <div className="absolute bottom-0 left-0 w-full h-16 flex justify-center gap-2 opacity-30 blur-[1px]">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`w-12 h-12 rounded-full ${['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'][i % 4]} translate-y-4`}></div>
                  ))}
               </div>
            </div>

            {/* Active Targets */}
            <div className="absolute bottom-12 left-0 w-full h-40 flex items-end px-8 z-20">
               {targets.map((target, index) => (
                 !caughtTargetId || caughtTargetId !== target.id ? (
                   <div 
                     key={target.id}
                     className="absolute bottom-0 transition-all duration-500 cursor-pointer"
                     style={{ left: `${target.xPos}%`, transform: 'translateX(-50%)' }}
                     onClick={() => handleTargetClick(index)}
                   >
                      {/* Capsule / Bubble Appearance */}
                      <div className={`
                        w-24 h-24 rounded-full ${target.instrument.color} 
                        flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.4)]
                        border-4 border-white/30 relative overflow-hidden
                        group transition-transform duration-300 hover:scale-110 hover:-translate-y-3
                        ${craneState === 'idle' ? 'hover:ring-4 hover:ring-yellow-400 hover:ring-offset-4 hover:ring-offset-transparent' : ''}
                      `}>
                         {/* Shine effect */}
                         <div className="absolute top-3 right-4 w-8 h-5 bg-white/50 rounded-full transform rotate-[30deg] blur-[2px]"></div>
                         <div className="absolute bottom-0 left-0 w-full h-1/3 bg-black/20 rounded-b-full"></div>
                         
                        <div className={`drop-shadow-lg relative z-10 group-hover:scale-110 transition-transform ${target.instrument.id === 'double-bass' ? 'w-12 h-12' : 'w-16 h-16'}`}>
                          <target.instrument.Icon 
                            className="text-white/90" 
                          />
                        </div>
                      </div>
                      <div className="text-center mt-2">
                         <span className="font-black text-xs bg-black/50 text-white px-2 py-1 rounded-full backdrop-blur-md">
                           {target.instrument.name}
                         </span>
                      </div>
                   </div>
                 ) : null
               ))}
            </div>
            
            {/* Feedback Overlay */}
            {feedback && feedback.show && (
               <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
                  <div className={`
                    p-8 rounded-3xl text-center shadow-2xl border-8 max-w-md transform scale-110
                    ${feedback.isCorrect ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}
                  `}>
                     <div className="text-7xl mb-4 animate-bounce">{feedback.isCorrect ? '🌟' : '🤔'}</div>
                     <h3 className={`text-3xl font-black mb-2 ${feedback.isCorrect ? 'text-green-700' : 'text-red-700'}`}>{feedback.isCorrect ? 'Excellent!' : 'Try Again'}</h3>
                     <div className="text-xl font-bold text-gray-700">
                       {feedback.isCorrect ? (
                         <>
                           {feedback.message} <span className="text-green-600 bg-green-200 px-2 py-1 rounded-lg">{feedback.correctName}</span>!
                         </>
                       ) : feedback.clickedName ? (
                         <>
                           {feedback.message} <span className="text-red-600 bg-red-200 px-2 py-1 rounded-lg">{feedback.clickedName}</span>
                           <br />
                           <span className="text-gray-500">The correct answer was</span>{' '}
                           <span className="text-green-600 bg-green-200 px-2 py-1 rounded-lg">{feedback.correctName}</span>
                         </>
                       ) : (
                         feedback.message
                       )}
                     </div>
                  </div>
               </div>
            )}

          </div>

          {/* Control Panel */}
          <div className="bg-gray-200 mt-[-20px] pt-8 pb-6 px-8 rounded-b-2xl border-t-4 border-gray-300 shadow-inner flex items-center justify-center gap-8 relative z-20">
             
             {/* Play Sound Button (Square Arcade Style) */}
             <div className="relative">
               {/* Pulsing ring when user hasn't played sound yet */}
               {!hasPlayedSound && !isPlayingAudio && (
                 <div className="absolute inset-0 rounded-lg bg-blue-400 animate-ping opacity-75" />
               )}
               <Button 
                  onClick={() => currentInstrument && playInstrumentSound(currentInstrument.id, currentInstrument.audioPaths)}
                  disabled={isPlayingAudio}
                  className={`
                    w-20 h-20 rounded-lg border-b-8 relative
                    text-white shadow-lg active:border-b-0 active:translate-y-2 transition-all
                    flex flex-col items-center justify-center gap-1
                    ${!hasPlayedSound && !isPlayingAudio 
                      ? 'bg-yellow-500 hover:bg-yellow-400 border-yellow-700 ring-4 ring-yellow-300' 
                      : 'bg-blue-500 hover:bg-blue-400 border-blue-700'}
                  `}
               >
                 {isPlayingAudio ? <Music className="w-8 h-8 animate-spin" /> : <Play className="w-8 h-8" />}
                 <span className="text-xs font-bold uppercase">{!hasPlayedSound ? 'Listen!' : 'Listen'}</span>
               </Button>
             </div>

             {/* Joystick Area */}
             <div className="bg-gray-300 p-4 rounded-full shadow-inner border border-gray-400 flex items-center justify-center gap-2">
                <Button 
                  onClick={() => moveCrane('left')} 
                  disabled={craneState !== 'idle'}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 border-b-4 border-red-800 text-white shadow-lg active:border-b-0 active:translate-y-1"
                >
                  <ArrowLeft size={28} strokeWidth={3} />
                </Button>
                
                {/* Fake Joystick Stem */}
                <div className="w-4 h-16 bg-gray-400 rounded-full mx-2"></div>

                <Button 
                  onClick={() => moveCrane('right')} 
                  disabled={craneState !== 'idle'}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 border-b-4 border-red-800 text-white shadow-lg active:border-b-0 active:translate-y-1"
                >
                  <ArrowRight size={28} strokeWidth={3} />
                </Button>
             </div>

             {/* Big Drop Button */}
             <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md animate-pulse opacity-50"></div>
                <Button 
                  onClick={() => dropCrane()} 
                  disabled={craneState !== 'idle'}
                  className="w-28 h-28 rounded-full bg-gradient-to-br from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 border-b-8 border-green-800 text-white shadow-2xl active:border-b-0 active:translate-y-2 transition-all relative z-10"
                >
                  <div className="flex flex-col items-center drop-shadow-md">
                    <ArrowDown size={40} strokeWidth={4} />
                    <span className="font-black text-lg tracking-wider">DROP</span>
                  </div>
                </Button>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
