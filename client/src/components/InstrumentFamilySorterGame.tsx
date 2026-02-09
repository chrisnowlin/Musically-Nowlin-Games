import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Music, Play, ArrowLeft, ArrowRight, ArrowDown, Timer, Trophy, RotateCcw, BookOpen } from "lucide-react";
import { playfulColors, playfulTypography, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import { useGameCleanup } from "@/hooks/useGameCleanup";
import { audioService } from "@/lib/audioService";
import { instrumentLibrary } from "@/lib/instrumentLibrary";
import { createWebAudioScheduler, WebAudioScheduler, ScheduledSound } from '@/lib/audio/webAudioScheduler';

// Instrument icon imports
import { 
  ViolinIcon, CelloIcon, FluteIcon, TrumpetIcon, FrenchHornIcon, 
  ClarinetIcon, OboeIcon, SaxophoneIcon, BassoonIcon, ViolaIcon,
  TromboneIcon, TubaIcon, DoubleBassIcon, SnareDrumIcon, BassDrumIcon,
  TriangleIcon, TambourineIcon, TimpaniIcon, XylophoneIcon, GlockenspielIcon,
  CowbellIcon, WoodblockIcon, CastanetsIcon, SleighBellsIcon, CymbalsIcon
} from '@/components/icons/InstrumentIcons';

// ============================================
// INSTRUMENT FAMILY DEFINITIONS
// ============================================

type InstrumentFamily = 'Strings' | 'Woodwinds' | 'Brass' | 'Percussion';

// Map each instrument ID to its family
const INSTRUMENT_FAMILIES: Record<string, InstrumentFamily> = {
  // Strings
  'violin': 'Strings',
  'viola': 'Strings',
  'cello': 'Strings',
  'double-bass': 'Strings',
  
  // Woodwinds
  'flute': 'Woodwinds',
  'clarinet': 'Woodwinds',
  'oboe': 'Woodwinds',
  'bassoon': 'Woodwinds',
  'saxophone': 'Woodwinds',
  
  // Brass
  'trumpet': 'Brass',
  'french-horn': 'Brass',
  'trombone': 'Brass',
  'tuba': 'Brass',
  
  // Percussion (pitched and unpitched)
  'timpani': 'Percussion',
  'xylophone': 'Percussion',
  'glockenspiel': 'Percussion',
  'snare-drum': 'Percussion',
  'bass-drum': 'Percussion',
  'triangle': 'Percussion',
  'tambourine': 'Percussion',
  'cowbell': 'Percussion',
  'woodblock': 'Percussion',
  'castanets': 'Percussion',
  'sleigh-bells': 'Percussion',
  'cymbals': 'Percussion',
};

// Family chute configuration
interface FamilyChute {
  family: InstrumentFamily;
  color: string;
  bgColor: string;
  borderColor: string;
  position: number; // percentage position
}

const FAMILY_CHUTES: FamilyChute[] = [
  { family: 'Brass', color: 'text-amber-200', bgColor: 'from-amber-500 to-amber-700', borderColor: 'border-amber-800', position: 15 },
  { family: 'Woodwinds', color: 'text-sky-200', bgColor: 'from-sky-500 to-sky-700', borderColor: 'border-sky-800', position: 38 },
  { family: 'Strings', color: 'text-emerald-200', bgColor: 'from-emerald-500 to-emerald-700', borderColor: 'border-emerald-800', position: 62 },
  { family: 'Percussion', color: 'text-rose-200', bgColor: 'from-rose-500 to-rose-700', borderColor: 'border-rose-800', position: 85 },
];

// Get family for an instrument
const getInstrumentFamily = (instrumentId: string): InstrumentFamily => {
  return INSTRUMENT_FAMILIES[instrumentId] || 'Percussion';
};

// ============================================
// INSTRUMENT DEFINITIONS
// ============================================

interface Instrument {
  id: string;
  name: string;
  Icon: React.FC<{ className?: string }>;
  audioPaths: string[];
  color: string;
  family: InstrumentFamily;
}

const BASE_URL = import.meta.env.BASE_URL || '/';

// Volume normalization multipliers per instrument
const INSTRUMENT_VOLUME_NORMALIZATION: Record<string, number> = {
  'violin': 9.0, 'viola': 9.9, 'cello': 8.7, 'double-bass': 11.4,
  'flute': 7.8, 'clarinet': 8.1, 'oboe': 7.2, 'bassoon': 9.9, 'saxophone': 6.9,
  'trumpet': 6.0, 'french-horn': 7.8, 'trombone': 6.3, 'tuba': 8.1,
  'timpani': 12.0, 'xylophone': 7.2, 'glockenspiel': 5.4,
  'snare-drum': 8.0, 'bass-drum': 10.0, 'triangle': 6.0, 'tambourine': 7.0,
  'cowbell': 7.5, 'woodblock': 7.0, 'castanets': 7.0, 'sleigh-bells': 8.0, 'cymbals': 6.5,
};

const getNormalizedVolume = (instrumentId: string): number => {
  const baseVolume = 0.5;
  const normalizer = INSTRUMENT_VOLUME_NORMALIZATION[instrumentId] || 1.0;
  return baseVolume * normalizer;
};

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  'violin': ViolinIcon, 'cello': CelloIcon, 'viola': ViolaIcon, 'double-bass': DoubleBassIcon,
  'flute': FluteIcon, 'clarinet': ClarinetIcon, 'oboe': OboeIcon, 'bassoon': BassoonIcon, 'saxophone': SaxophoneIcon,
  'trumpet': TrumpetIcon, 'french-horn': FrenchHornIcon, 'trombone': TromboneIcon, 'tuba': TubaIcon,
  'timpani': TimpaniIcon, 'xylophone': XylophoneIcon, 'glockenspiel': GlockenspielIcon,
  'snare-drum': SnareDrumIcon, 'bass-drum': BassDrumIcon, 'triangle': TriangleIcon, 'tambourine': TambourineIcon,
  'cowbell': CowbellIcon, 'woodblock': WoodblockIcon, 'castanets': CastanetsIcon, 'sleigh-bells': SleighBellsIcon, 'cymbals': CymbalsIcon,
};

const COLOR_MAP: Record<string, string> = {
  'violin': 'bg-amber-500', 'cello': 'bg-orange-800', 'viola': 'bg-violet-500', 'double-bass': 'bg-amber-800',
  'flute': 'bg-sky-400', 'clarinet': 'bg-gray-800', 'oboe': 'bg-stone-500', 'bassoon': 'bg-amber-900', 'saxophone': 'bg-yellow-400',
  'trumpet': 'bg-yellow-500', 'french-horn': 'bg-amber-600', 'trombone': 'bg-yellow-600', 'tuba': 'bg-zinc-600',
  'timpani': 'bg-rose-700', 'xylophone': 'bg-pink-400', 'glockenspiel': 'bg-cyan-300',
  'snare-drum': 'bg-red-500', 'bass-drum': 'bg-red-800', 'triangle': 'bg-slate-300', 'tambourine': 'bg-orange-400',
  'cowbell': 'bg-zinc-400', 'woodblock': 'bg-amber-700', 'castanets': 'bg-stone-700', 'sleigh-bells': 'bg-yellow-300', 'cymbals': 'bg-yellow-500',
};

function buildInstrumentsFromLibrary(): Instrument[] {
  const instruments: Instrument[] = [];
  const libraryInstruments = instrumentLibrary.getAllInstruments();
  
  for (const libInst of libraryInstruments) {
    const Icon = ICON_MAP[libInst.name];
    if (!Icon) continue;
    
    const audioPaths = instrumentLibrary.getSamplePaths(libInst.name);
    if (audioPaths.length === 0) continue;
    
    instruments.push({
      id: libInst.name,
      name: libInst.displayName,
      Icon,
      audioPaths,
      color: COLOR_MAP[libInst.name] || 'bg-gray-500',
      family: getInstrumentFamily(libInst.name),
    });
  }
  
  // Add unpitched percussion instruments
  const unpitchedPercussion: Instrument[] = [
    {
      id: 'snare-drum', name: 'Snare Drum', Icon: SnareDrumIcon, family: 'Percussion', color: 'bg-red-500',
      audioPaths: [
        `${BASE_URL}audio/philharmonia/percussion/snare drum/snare-drum__025_forte_with-snares.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/snare drum/snare-drum__long_forte_roll.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/snare drum/snare-drum__phrase_mezzo-forte_rhythm.mp3`,
      ],
    },
    {
      id: 'bass-drum', name: 'Bass Drum', Icon: BassDrumIcon, family: 'Percussion', color: 'bg-red-800',
      audioPaths: [
        `${BASE_URL}audio/philharmonia/percussion/bass drum/bass-drum__1_fortissimo_struck-singly.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/bass drum/bass-drum__025_forte_bass-drum-mallet.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/bass drum/bass-drum__phrase_mezzo-piano_rhythm.mp3`,
      ],
    },
    {
      id: 'triangle', name: 'Triangle', Icon: TriangleIcon, family: 'Percussion', color: 'bg-slate-300',
      audioPaths: [
        `${BASE_URL}audio/philharmonia/percussion/triangle/triangle__long_piano_struck-singly.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/triangle/triangle__very-long_mezzo-forte_roll.mp3`,
      ],
    },
    {
      id: 'tambourine', name: 'Tambourine', Icon: TambourineIcon, family: 'Percussion', color: 'bg-orange-400',
      audioPaths: [
        `${BASE_URL}audio/philharmonia/percussion/tambourine/tambourine__025_forte_hand.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/tambourine/tambourine__phrase_forte_hand.mp3`,
      ],
    },
    {
      id: 'cowbell', name: 'Cowbell', Icon: CowbellIcon, family: 'Percussion', color: 'bg-zinc-400',
      audioPaths: [
        `${BASE_URL}audio/philharmonia/percussion/cowbell/cowbell__1_forte_undamped.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/cowbell/cowbell__long_mezzo-forte_rhythm.mp3`,
      ],
    },
    {
      id: 'woodblock', name: 'Woodblock', Icon: WoodblockIcon, family: 'Percussion', color: 'bg-amber-700',
      audioPaths: [
        `${BASE_URL}audio/philharmonia/percussion/woodblock/woodblock__025_mezzo-forte_struck-singly.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/woodblock/woodblock__phrase_mezzo-piano_rhythm.mp3`,
      ],
    },
    {
      id: 'castanets', name: 'Castanets', Icon: CastanetsIcon, family: 'Percussion', color: 'bg-stone-700',
      audioPaths: [
        `${BASE_URL}audio/philharmonia/percussion/castanets/castanets__025_mezzo-forte_struck-singly.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/castanets/castanets__phrase_forte_rhythm.mp3`,
      ],
    },
    {
      id: 'sleigh-bells', name: 'Sleigh Bells', Icon: SleighBellsIcon, family: 'Percussion', color: 'bg-yellow-300',
      audioPaths: [
        `${BASE_URL}audio/philharmonia/percussion/sleigh bells/sleigh-bells__05_mezzo-forte_shaken.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/sleigh bells/sleigh-bells__long_forte_shaken.mp3`,
      ],
    },
    {
      id: 'cymbals', name: 'Crash Cymbals', Icon: CymbalsIcon, family: 'Percussion', color: 'bg-yellow-500',
      audioPaths: [
        `${BASE_URL}audio/philharmonia/percussion/clash cymbals/clash-cymbals__15_fortissimo_struck-together.mp3`,
        `${BASE_URL}audio/philharmonia/percussion/clash cymbals/clash-cymbals__1_forte_damped.mp3`,
      ],
    },
  ];
  
  for (const perc of unpitchedPercussion) {
    const existingIndex = instruments.findIndex(i => i.id === perc.id);
    if (existingIndex !== -1) {
      instruments[existingIndex] = perc;
    } else {
      instruments.push(perc);
    }
  }
  
  return instruments;
}

const INSTRUMENTS: Instrument[] = buildInstrumentsFromLibrary();

// ============================================
// FAMILY CHUTE SVG COMPONENT
// ============================================

interface FamilyChuteSVGProps {
  chute: FamilyChute;
  isHighlighted: boolean;
  isDropping: boolean;
}

function FamilyChuteSVG({ chute, isHighlighted, isDropping }: FamilyChuteSVGProps) {
  // Get text color for the label (lighter shade)
  const textColor = chute.family === 'Brass' ? '#fef3c7' : 
                    chute.family === 'Woodwinds' ? '#e0f2fe' : 
                    chute.family === 'Strings' ? '#d1fae5' : '#ffe4e6';
  const textStroke = chute.family === 'Brass' ? '#78350f' : 
                     chute.family === 'Woodwinds' ? '#0c4a6e' : 
                     chute.family === 'Strings' ? '#064e3b' : '#881337';
  
  return (
    <div className="flex flex-col items-center">
      {/* Funnel Body with extended pipe */}
      <svg viewBox="0 0 120 140" className="w-36 h-40 drop-shadow-lg">
        <defs>
          <linearGradient id={`funnel-${chute.family}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: chute.family === 'Brass' ? '#f59e0b' : chute.family === 'Woodwinds' ? '#0ea5e9' : chute.family === 'Strings' ? '#10b981' : '#f43f5e' }} />
            <stop offset="100%" style={{ stopColor: chute.family === 'Brass' ? '#b45309' : chute.family === 'Woodwinds' ? '#0369a1' : chute.family === 'Strings' ? '#047857' : '#be123c' }} />
          </linearGradient>
          <linearGradient id={`pipe-${chute.family}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: chute.family === 'Brass' ? '#92400e' : chute.family === 'Woodwinds' ? '#075985' : chute.family === 'Strings' ? '#065f46' : '#9f1239' }} />
            <stop offset="50%" style={{ stopColor: chute.family === 'Brass' ? '#b45309' : chute.family === 'Woodwinds' ? '#0369a1' : chute.family === 'Strings' ? '#047857' : '#be123c' }} />
            <stop offset="100%" style={{ stopColor: chute.family === 'Brass' ? '#92400e' : chute.family === 'Woodwinds' ? '#075985' : chute.family === 'Strings' ? '#065f46' : '#9f1239' }} />
          </linearGradient>
        </defs>
        
        {/* Extended pipe that goes down behind the label */}
        <rect 
          x="38" y="55" width="44" height="85" 
          fill={`url(#pipe-${chute.family})`}
          stroke={chute.family === 'Brass' ? '#78350f' : chute.family === 'Woodwinds' ? '#0c4a6e' : chute.family === 'Strings' ? '#064e3b' : '#881337'}
          strokeWidth="2"
        />
        
        {/* Pipe inner shadow for depth */}
        <rect x="42" y="55" width="36" height="85" fill="rgba(0,0,0,0.15)" />
        
        {/* Wide funnel shape - top portion */}
        <path 
          d="M5 0 L115 0 L115 12 Q115 20 100 28 L85 35 L85 55 L35 55 L35 35 L20 28 Q5 20 5 12 Z" 
          fill={`url(#funnel-${chute.family})`}
          stroke={chute.family === 'Brass' ? '#92400e' : chute.family === 'Woodwinds' ? '#075985' : chute.family === 'Strings' ? '#065f46' : '#9f1239'}
          strokeWidth="3"
        />
        
        {/* Family Label on funnel body - below the rim */}
        <text 
          x="60" 
          y="32" 
          textAnchor="middle" 
          dominantBaseline="middle"
          fontSize="12"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-0.5"
          fill={textColor}
          stroke={textStroke}
          strokeWidth="0.5"
        >
          {chute.family.toUpperCase()}
        </text>
        
        {/* Highlight glow when selected */}
        {isHighlighted && (
          <ellipse cx="60" cy="8" rx="52" ry="8" fill="rgba(255,255,255,0.3)" className="animate-pulse" />
        )}
        
        {/* Pipe rivets on funnel */}
        <circle cx="45" cy="45" r="3" fill="rgba(0,0,0,0.2)" />
        <circle cx="75" cy="45" r="3" fill="rgba(0,0,0,0.2)" />
        
        {/* Pipe rivets lower */}
        <circle cx="45" cy="90" r="2.5" fill="rgba(0,0,0,0.15)" />
        <circle cx="75" cy="90" r="2.5" fill="rgba(0,0,0,0.15)" />
        <circle cx="45" cy="115" r="2.5" fill="rgba(0,0,0,0.15)" />
        <circle cx="75" cy="115" r="2.5" fill="rgba(0,0,0,0.15)" />
      </svg>
    </div>
  );
}

// ============================================
// MAIN GAME COMPONENT
// ============================================

export default function InstrumentFamilySorterGame() {
  const [, setLocation] = useLocation();
  const { setTimeout: setGameTimeout } = useGameCleanup();
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const schedulerRef = useRef<WebAudioScheduler | null>(null);

  const getScheduler = useCallback((): WebAudioScheduler | null => {
    if (schedulerRef.current) return schedulerRef.current;

    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      audioContextRef.current = new AudioCtx();
    }

    if (!masterGainRef.current && audioContextRef.current) {
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = 0.7;
      masterGainRef.current.connect(audioContextRef.current.destination);
    }

    if (audioContextRef.current && masterGainRef.current) {
      schedulerRef.current = createWebAudioScheduler(audioContextRef.current, masterGainRef.current);
      return schedulerRef.current;
    }

    return null;
  }, []);
  
  // Game Mode & State
  type GameMode = 'practice' | 'timer';
  const [gameMode, setGameMode] = useState<GameMode | null>(null); // null = mode select screen
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [currentInstrument, setCurrentInstrument] = useState<Instrument | null>(null);
  const [selectedChuteIndex, setSelectedChuteIndex] = useState(1); // 0-3, starts at second chute
  const [craneState, setCraneState] = useState<'idle' | 'pickup_moving' | 'pickup_dropping' | 'pickup_grabbing' | 'pickup_rising' | 'ready_to_sort' | 'dropping_to_chute' | 'returning'>('idle');
  const [hasInstrument, setHasInstrument] = useState(false); // Whether crane is holding an instrument
  const [fallingBall, setFallingBall] = useState<{ 
    active: boolean; 
    position: number; 
    instrumentData: Instrument | null;
    bounceOut: boolean;
  }>({ active: false, position: 0, instrumentData: null, bounceOut: false });
  const [feedback, setFeedback] = useState<{ 
    show: boolean; 
    isCorrect: boolean; 
    message: string;
    instrumentName?: string;
    selectedFamily?: string;
    correctFamily?: string;
  } | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);

  const decorativeOrbs = generateDecorativeOrbs();
  
  // Generate random background instrument balls for ball pit effect (overlapping for depth)
  const backgroundBalls = useState(() => {
    const balls = [];
    const usedInstruments = INSTRUMENTS.slice(); // Use all instruments
    const ballSize = 56; // Same as crane ball (w-14 h-14)
    const rows = 3; // Number of rows
    const ballsPerRow = 14; // More balls per row to extend to edges
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < ballsPerRow; col++) {
        const instrument = usedInstruments[Math.floor(Math.random() * usedInstruments.length)];
        // Create depth effect: back rows less opaque, front rows more opaque
        const depthOpacity = 0.6 + (row * 0.15) + Math.random() * 0.1;
        balls.push({
          id: `${row}-${col}`,
          instrument,
          x: -2 + (col * 7.5) + (Math.random() * 3), // Overlap and extend to edges
          y: 72 + (row * 7) + (Math.random() * 3), // Overlapping rows
          size: ballSize,
          opacity: depthOpacity,
          rotation: Math.random() * 360,
          zIndex: row, // Front rows appear on top
        });
      }
    }
    return balls;
  })[0];

  // Positions
  const PICKUP_POSITION = 50; // Center
  const CHUTE_POSITIONS = FAMILY_CHUTES.map(c => c.position);

  // Preload sounds
  useEffect(() => {
    const allAudioPaths = INSTRUMENTS.flatMap(i => i.audioPaths);
    const preloadChunk = async () => {
      await audioService.preloadSamples(allAudioPaths.slice(0, 10));
      setTimeout(() => audioService.preloadSamples(allAudioPaths.slice(10)), 2000);
    };
    preloadChunk();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timerActive && gameMode === 'timer' && timeRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up!
            setTimerActive(false);
            setGameOver(true);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            schedulerRef.current?.stop();
            audioService.stopSample();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerActive, gameMode, timeRemaining]);

  // Cleanup
  useEffect(() => {
    return () => {
      schedulerRef.current?.stop();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play instrument sound
  const playInstrumentSound = useCallback(async (instrumentId: string, audioPaths: string[]) => {
    const scheduler = getScheduler();
    if (!scheduler) return;

    scheduler.stop();
    audioService.stopSample();
    setHasPlayedSound(true);
    setIsPlayingAudio(true);

    try {
      if (!audioService.isAudioUnlocked()) await audioService.initialize();
      if (!audioContextRef.current) audioContextRef.current = new AudioContext();
      if (audioContextRef.current?.state === 'suspended') await audioContextRef.current.resume();

      const normalizedVolume = getNormalizedVolume(instrumentId);
      audioService.setVolume(normalizedVolume);
      if (masterGainRef.current && audioContextRef.current) {
        masterGainRef.current.gain.linearRampToValueAtTime(normalizedVolume, audioContextRef.current.currentTime + 0.05);
      }

      const isPercussion = audioPaths.some(p => 
        p.includes('rhythm') || p.includes('roll') || p.includes('shaken') || 
        p.includes('struck') || p.includes('hand') || p.includes('flam')
      );

      const events: ScheduledSound[] = [];
      let currentTime = 0;

      if (isPercussion && audioPaths.length >= 2) {
        const singleHit = audioPaths.find(p => p.includes('025') || p.includes('struck-singly') || p.includes('_1_')) || audioPaths[0];
        const rhythmOrRoll = audioPaths.find(p => p.includes('rhythm') || p.includes('roll') || p.includes('shaken') || p.includes('phrase')) || audioPaths[1];
        
        events.push({ time: currentTime, sampleUrl: singleHit, duration: 1.0, volume: 1.0 });
        currentTime += 1.3;
        events.push({ time: currentTime, sampleUrl: rhythmOrRoll, duration: 1.0, volume: 1.0 });
      } else if (audioPaths.length >= 2) {
        events.push({ time: currentTime, sampleUrl: audioPaths[0], duration: 1.0, volume: 1.0 });
        currentTime += 1.2;
        events.push({ time: currentTime, sampleUrl: audioPaths[Math.min(1, audioPaths.length - 1)], duration: 1.0, volume: 1.0 });
      } else {
        events.push({ time: currentTime, sampleUrl: audioPaths[0], duration: 1.0, volume: 1.0 });
      }

      await scheduler.scheduleSequence(events, { onComplete: () => setIsPlayingAudio(false) });
    } catch (e) {
      console.error('Audio play failed:', e);
      setIsPlayingAudio(false);
    }
  }, [getScheduler]);

  // Start a new round
  const startRound = useCallback((autoPlay: boolean = true) => {
    const targetInst = INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)];
    setCurrentInstrument(targetInst);
    setSelectedChuteIndex(1); // Reset to second chute
    setCraneState('idle');
    setHasInstrument(false);
    setFeedback(null);
    setHasPlayedSound(false);
    setFallingBall({ active: false, position: 0, instrumentData: null, bounceOut: false });
    
    audioService.preloadSamples(targetInst.audioPaths);

    // Start the pickup sequence after a brief delay
    setGameTimeout(() => {
      setCraneState('pickup_moving');
      
      // Move to center, then drop to pick up
      setGameTimeout(() => {
        setCraneState('pickup_dropping');
        audioService.playCraneDropSound();
        
        setGameTimeout(() => {
          setCraneState('pickup_grabbing');
          audioService.playCraneGrabSound();
          setHasInstrument(true);
          
          setGameTimeout(() => {
            setCraneState('pickup_rising');
            
            setGameTimeout(() => {
              setCraneState('ready_to_sort');
              
              // Auto-play sound every round
              if (autoPlay) {
                setHasPlayedSound(true);
                playInstrumentSound(targetInst.id, targetInst.audioPaths);
              }
            }, 800); // Rising time
          }, 400); // Grabbing time
        }, 500); // Dropping time
      }, 500); // Time to reach center
    }, 300);
  }, [setGameTimeout, playInstrumentSound]);

  // Handle game start
  const handleStartGame = async (mode: GameMode) => {
    try {
      await audioService.initialize();
    } catch (e) {
      console.warn('Audio initialization warning:', e);
    }

    const allAudioPaths = INSTRUMENTS.flatMap(i => i.audioPaths);
    audioService.preloadSamples(allAudioPaths);

    audioService.playClickSound();
    setGameMode(mode);
    setGameStarted(true);
    setScore(0);
    setTotalRounds(0);
    setGameOver(false);
    
    if (mode === 'timer') {
      setTimeRemaining(60);
      setTimerActive(true);
    }
    
    startRound(true);
  };

  // Handle play again from game-over screen
  const handlePlayAgain = () => {
    setGameOver(false);
    setScore(0);
    setTotalRounds(0);
    setTimeRemaining(60);
    setTimerActive(true);
    setCraneState('idle');
    setHasInstrument(false);
    setFeedback(null);
    setFallingBall({ active: false, position: 0, instrumentData: null, bounceOut: false });
    startRound(true);
  };

  // Handle back to mode select
  const handleBackToModeSelect = () => {
    setGameStarted(false);
    setGameMode(null);
    setGameOver(false);
    setScore(0);
    setTotalRounds(0);
    setTimerActive(false);
    setCraneState('idle');
    setHasInstrument(false);
    setFeedback(null);
    setFallingBall({ active: false, position: 0, instrumentData: null, bounceOut: false });
    schedulerRef.current?.stop();
    audioService.stopSample();
  };

  // Move crane between chutes
  const moveCrane = (direction: 'left' | 'right') => {
    if (craneState !== 'ready_to_sort') return;
    audioService.playCraneMoveSound();
    setSelectedChuteIndex(prev => {
      const newIndex = direction === 'left' ? prev - 1 : prev + 1;
      return Math.max(0, Math.min(3, newIndex));
    });
  };

  // Drop into chute
  const dropIntoChute = () => {
    if (craneState !== 'ready_to_sort' || !currentInstrument || gameOver) return;
    
    audioService.playCraneDropSound();
    setCraneState('dropping_to_chute');

    const selectedFamily = FAMILY_CHUTES[selectedChuteIndex].family;
    const correctFamily = currentInstrument.family;
    const isCorrect = selectedFamily === correctFamily;
    const isTimerMode = gameMode === 'timer';

    // Release the ball from crane
    setHasInstrument(false);
    setFallingBall({
      active: true,
      position: cranePos,
      instrumentData: currentInstrument,
      bounceOut: !isCorrect,
    });

    // Timer mode: faster transitions, shorter feedback
    const fallTime = isTimerMode ? (isCorrect ? 500 : 700) : (isCorrect ? 800 : 1200);
    const bounceDelay = isTimerMode ? (isCorrect ? 300 : 600) : (isCorrect ? 500 : 1500);
    const nextRoundDelay = isTimerMode ? 200 : 500;

    // Wait for ball to fall and either bounce out or enter chute
    setGameTimeout(() => {
      if (isCorrect) {
        setScore(s => s + 1);
        setFeedback({
          show: true,
          isCorrect: true,
          message: `Correct! The ${currentInstrument.name} is a`,
          instrumentName: currentInstrument.name,
          correctFamily: correctFamily,
        });
        audioService.playSuccessTone();
      } else {
        setFeedback({
          show: true,
          isCorrect: false,
          message: `Not quite! The ${currentInstrument.name} is a`,
          instrumentName: currentInstrument.name,
          selectedFamily: selectedFamily,
          correctFamily: correctFamily,
        });
        audioService.playErrorTone();
      }
      
      setTotalRounds(r => r + 1);
      setCraneState('returning');

      // Clear falling ball after bounce/fall animation
      setGameTimeout(() => {
        setFallingBall({ active: false, position: 0, instrumentData: null, bounceOut: false });
        
        if (!gameOver) {
          setGameTimeout(() => {
            startRound();
          }, nextRoundDelay);
        }
      }, bounceDelay);
    }, fallTime);
  };

  // Calculate crane position based on state
  const getCranePosition = () => {
    if (craneState === 'idle' || craneState === 'pickup_moving' || craneState === 'pickup_dropping' || craneState === 'pickup_grabbing' || craneState === 'pickup_rising') {
      return PICKUP_POSITION;
    }
    return CHUTE_POSITIONS[selectedChuteIndex];
  };

  const cranePos = getCranePosition();

  // ============================================
  // RENDER: START / MODE SELECT SCREEN
  // ============================================
  
  if (!gameStarted) {
    return (
      <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
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
              🎻 Instrument Family Sorter
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Listen to the instrument and sort it into the correct family!
            </p>
            <div className="flex justify-center gap-4 flex-wrap mt-4">
              {FAMILY_CHUTES.map(chute => (
                <span key={chute.family} className={`px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${chute.bgColor} ${chute.color}`}>
                  {chute.family}
                </span>
              ))}
            </div>
          </div>

          <div className="text-lg font-bold text-purple-700 uppercase tracking-wider">Choose Your Mode</div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {/* Practice Mode */}
            <button
              onClick={() => handleStartGame('practice')}
              className="group w-64 bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border-4 border-emerald-400 hover:border-emerald-500 hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg group-hover:shadow-emerald-300/50">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-emerald-700">Practice</h3>
                <p className="text-sm text-gray-600 leading-snug">
                  Take your time. No pressure!<br />Learn the instrument families at your own pace.
                </p>
              </div>
            </button>

            {/* Timer Mode */}
            <button
              onClick={() => handleStartGame('timer')}
              className="group w-64 bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border-4 border-orange-400 hover:border-orange-500 hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg group-hover:shadow-orange-300/50">
                  <Timer className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-orange-600">1-Minute Blitz</h3>
                <p className="text-sm text-gray-600 leading-snug">
                  Race the clock! Sort as many instruments as you can in 60 seconds.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: TIMER GAME OVER SCREEN
  // ============================================

  if (gameOver && gameMode === 'timer') {
    const accuracy = totalRounds > 0 ? Math.round((score / totalRounds) * 100) : 0;
    return (
      <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
        {decorativeOrbs.map((orb) => (
          <div key={orb.key} className={orb.className} />
        ))}
        
        <div className="text-center space-y-8 z-10 max-w-lg animate-in fade-in zoom-in duration-500">
          <div className="text-7xl mb-2 animate-bounce">🏆</div>
          <h1 className={`${playfulTypography.headings.hero} ${playfulColors.gradients.title} drop-shadow-lg`}>
            Time's Up!
          </h1>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-4 border-purple-300 space-y-4">
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="text-5xl font-black text-purple-600">{score}</div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Correct</div>
              </div>
              <div className="w-px bg-gray-300"></div>
              <div className="text-center">
                <div className="text-5xl font-black text-gray-600">{totalRounds}</div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Attempted</div>
              </div>
              <div className="w-px bg-gray-300"></div>
              <div className="text-center">
                <div className="text-5xl font-black text-emerald-600">{accuracy}%</div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Accuracy</div>
              </div>
            </div>
            
            {score >= 10 && <p className="text-lg font-bold text-amber-600">🌟 Amazing! You're a sorting superstar!</p>}
            {score >= 5 && score < 10 && <p className="text-lg font-bold text-blue-600">🎵 Great job! Keep practicing!</p>}
            {score < 5 && <p className="text-lg font-bold text-purple-600">🎶 Good try! You'll get faster!</p>}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handlePlayAgain}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white px-8 py-6 text-xl font-black rounded-2xl shadow-xl hover:scale-105 transition-all"
            >
              <RotateCcw className="w-6 h-6 mr-2" />
              Play Again
            </Button>
            <Button
              onClick={handleBackToModeSelect}
              size="lg"
              variant="outline"
              className="px-8 py-6 text-xl font-bold rounded-2xl shadow-lg hover:scale-105 transition-all"
            >
              <ChevronLeft className="w-6 h-6 mr-2" />
              Mode Select
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: GAME SCREEN
  // ============================================

  return (
    <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col p-4 relative overflow-hidden`}>
      {decorativeOrbs.map((orb) => (
        <div key={orb.key} className={orb.className} />
      ))}

      {/* Header */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between mb-6 relative z-10">
        <button onClick={handleBackToModeSelect} className="flex items-center gap-2 text-purple-700 bg-white/80 px-4 py-2 rounded-full shadow-sm">
          <ChevronLeft size={20} /> Exit
        </button>
        
        <div className="flex items-center gap-3">
          {/* Timer display for timer mode */}
          {gameMode === 'timer' && (
            <div className={`
              flex items-center gap-2 px-4 py-2 rounded-full shadow-sm font-bold text-xl
              ${timeRemaining <= 10 
                ? 'bg-red-100 text-red-600 animate-pulse' 
                : timeRemaining <= 30 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'bg-white/80 text-gray-700'}
            `}>
              <Timer size={20} />
              <span className="tabular-nums">{timeRemaining}s</span>
            </div>
          )}
          
          {/* Mode badge */}
          <div className={`
            px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
            ${gameMode === 'timer' ? 'bg-orange-200 text-orange-700' : 'bg-emerald-200 text-emerald-700'}
          `}>
            {gameMode === 'timer' ? 'Blitz' : 'Practice'}
          </div>
          
          <div className="flex items-center gap-4 bg-white/80 px-6 py-2 rounded-full shadow-sm">
            <span className="text-xl font-bold text-purple-600">Score: {score}/{totalRounds}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start z-10 max-w-4xl mx-auto w-full space-y-6">
        
        {/* Arcade Cabinet Container */}
        <div className="relative bg-gray-900 p-4 rounded-[3rem] shadow-2xl border-b-8 border-r-8 border-gray-800 mx-auto max-w-2xl w-full">
          
          {/* Cabinet Header */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 h-16 rounded-t-2xl mb-4 flex items-center justify-center border-b-4 border-purple-800 shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] opacity-30"></div>
            <div className="text-white font-black text-2xl tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] uppercase">
              Instrument Family Sorter
            </div>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-yellow-300 animate-pulse shadow-[0_0_10px_yellow]"></div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-yellow-300 animate-pulse shadow-[0_0_10px_yellow]"></div>
          </div>

          {/* Glass Box Area */}
          <div className="bg-gradient-to-b from-blue-900/80 to-indigo-900/80 backdrop-blur-sm rounded-xl w-full h-[500px] relative overflow-hidden border-4 border-gray-700 shadow-inner">
            
            {/* Background Decorative Instrument Balls */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
              {backgroundBalls.map((ball) => (
                <div
                  key={ball.id}
                  className="absolute"
                  style={{
                    left: `${ball.x}%`,
                    top: `${ball.y}%`,
                    width: `${ball.size}px`,
                    height: `${ball.size}px`,
                    opacity: ball.opacity,
                    transform: `rotate(${ball.rotation}deg)`,
                    zIndex: ball.zIndex,
                  }}
                >
                  <div className={`
                    w-full h-full rounded-full border-4 border-white/30 shadow-lg
                    flex items-center justify-center ${ball.instrument.color}
                  `}>
                    <ball.instrument.Icon className="w-8 h-8 text-white/60" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Glass effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none rounded-xl" style={{ zIndex: 50 }}></div>
            <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-white/5 to-transparent skew-x-12 pointer-events-none" style={{ zIndex: 50 }}></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgNDAgTDQwIDAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-30 pointer-events-none" style={{ zIndex: 50 }}></div>

            {/* Crane Rail */}
            <div className="absolute top-4 left-0 w-full h-6 bg-gray-400 rounded-full mx-4 shadow-lg border-b-4 border-gray-500" style={{ width: 'calc(100% - 2rem)', zIndex: 15 }}>
              <div className="absolute top-1 left-0 w-full h-2 bg-stripes-gray opacity-30"></div>
            </div>

            {/* Crane Mechanism */}
            <div 
              className="absolute top-4 w-32 h-full pointer-events-none transition-all duration-500 ease-in-out"
              style={{
                zIndex: 15, 
                left: `${cranePos}%`, 
                transform: 'translateX(-50%)',
              }}
            >
              {/* Crane Box (Motor) */}
              <div className="w-24 h-16 bg-gradient-to-b from-gray-300 to-gray-400 rounded-lg mx-auto relative z-20 shadow-2xl border-b-4 border-gray-500 flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-4 bg-[repeating-linear-gradient(45deg,#fbbf24,#fbbf24_10px,#000_10px,#000_20px)] opacity-80 border-b border-black/20"></div>
                <div className="w-16 h-8 bg-gray-800 rounded-md mt-2 flex items-center justify-center border border-gray-600">
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
                className="w-2 bg-gray-800 mx-auto transition-all duration-700 ease-in-out relative shadow-lg"
                style={{ 
                  height: (craneState === 'pickup_dropping' || craneState === 'pickup_grabbing') ? '55%' : '8%' 
                }}
              >
                <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDggTDggMCIgc3Ryb2tlPSIjNjY2IiBzdHJva2Utd2lkdGg9IjEiLz48cGF0aCBkPSJNMCAwIEw4IDgiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjUiLz48L3N2Zz4=')] opacity-80"></div>
              </div>
              
              {/* Claw SVG */}
              <div className="relative mx-auto w-32 h-32 transition-all duration-700 ease-in-out" style={{ marginTop: '-8px' }}>
                <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-2xl filter">
                  <defs>
                    <linearGradient id="metalGradientSort" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#9CA3AF" />
                      <stop offset="50%" stopColor="#E5E7EB" />
                      <stop offset="100%" stopColor="#9CA3AF" />
                    </linearGradient>
                    <linearGradient id="pistonGradientSort" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4B5563" />
                      <stop offset="50%" stopColor="#9CA3AF" />
                      <stop offset="100%" stopColor="#4B5563" />
                    </linearGradient>
                  </defs>

                  <rect x="52" y="0" width="16" height="10" rx="2" fill="#374151" stroke="#1F2937" />
                  <rect x="45" y="8" width="30" height="25" rx="4" fill="url(#pistonGradientSort)" stroke="#374151" strokeWidth="1" />
                  <line x1="45" y1="15" x2="75" y2="15" stroke="#374151" strokeWidth="1" opacity="0.5" />
                  <line x1="45" y1="25" x2="75" y2="25" stroke="#374151" strokeWidth="1" opacity="0.5" />
                  <rect x="56" y="33" width="8" height="15" fill="#D1D5DB" stroke="#9CA3AF" />
                  <circle cx="60" cy="50" r="8" fill="#4B5563" stroke="#1F2937" strokeWidth="2" />
                  <circle cx="60" cy="50" r="3" fill="#E5E7EB" />

                  {/* Left Claw Arm */}
                  <g 
                    className="transition-all duration-500 ease-in-out" 
                    style={{ 
                      transformOrigin: "60px 50px", 
                      transform: hasInstrument ? "rotate(15deg)" : "rotate(25deg)" 
                    }}
                  >
                    <path d="M55 55 L 30 70" stroke="url(#metalGradientSort)" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="30" cy="70" r="4" fill="#374151" />
                    <path d="M30 70 Q 20 95 45 105" fill="none" stroke="url(#metalGradientSort)" strokeWidth="5" strokeLinecap="round" />
                    <path d="M45 105 L 48 102" stroke="#374151" strokeWidth="2" />
                  </g>

                  {/* Right Claw Arm */}
                  <g 
                    className="transition-all duration-500 ease-in-out" 
                    style={{ 
                      transformOrigin: "60px 50px", 
                      transform: hasInstrument ? "rotate(-15deg)" : "rotate(-25deg)" 
                    }}
                  >
                    <path d="M65 55 L 90 70" stroke="url(#metalGradientSort)" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="90" cy="70" r="4" fill="#374151" />
                    <path d="M90 70 Q 100 95 75 105" fill="none" stroke="url(#metalGradientSort)" strokeWidth="5" strokeLinecap="round" />
                    <path d="M75 105 L 72 102" stroke="#374151" strokeWidth="2" />
                  </g>
                </svg>

                {/* Held Instrument - 2x larger */}
                {hasInstrument && currentInstrument && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-4 animate-in zoom-in duration-300 z-30">
                    <div className={`
                      w-28 h-28 rounded-full border-[6px] border-white/50 shadow-xl
                      flex items-center justify-center ${currentInstrument.color}
                    `}>
                      <currentInstrument.Icon className="w-16 h-16 drop-shadow-md text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Falling Ball Animation - 2x larger */}
            {fallingBall.active && fallingBall.instrumentData && (
              <div 
                className="absolute pointer-events-none transition-all"
                style={{
                  zIndex: 20, 
                  left: `${fallingBall.position}%`, 
                  transform: 'translateX(-50%)',
                  top: '190px', // Start from where crane holds the ball
                  animation: fallingBall.bounceOut 
                    ? 'fallAndBounce 1.2s cubic-bezier(0.4, 0, 0.6, 1) forwards' 
                    : 'fallIntoChute 0.8s cubic-bezier(0.5, 0, 0.5, 1) forwards',
                }}
              >
                <style>
                  {`
                    @keyframes fallIntoChute {
                      0% { transform: translateY(0) translateX(-50%) scale(1); opacity: 1; }
                      70% { transform: translateY(200px) translateX(-50%) scale(0.8); opacity: 1; }
                      100% { transform: translateY(230px) translateX(-50%) scale(0.7); opacity: 0; }
                    }
                    @keyframes fallAndBounce {
                      0% { transform: translateY(0) translateX(-50%) scale(1); }
                      25% { transform: translateY(185px) translateX(-50%) scale(0.95); }
                      40% { transform: translateY(105px) translateX(-12%) scale(1.12) rotate(19deg); }
                      55% { transform: translateY(200px) translateX(25%) scale(0.92) rotate(-23deg); }
                      70% { transform: translateY(135px) translateX(50%) scale(1.08) rotate(34deg); }
                      85% { transform: translateY(240px) translateX(85%) scale(0.85) rotate(-45deg); }
                      100% { transform: translateY(320px) translateX(112%) scale(0.55) rotate(68deg); opacity: 0; }
                    }
                  `}
                </style>
                <div className={`
                  w-28 h-28 rounded-full border-[6px] border-white/50 shadow-2xl
                  flex items-center justify-center ${fallingBall.instrumentData.color}
                `}>
                  <fallingBall.instrumentData.Icon className="w-16 h-16 drop-shadow-md text-white" />
                </div>
              </div>
            )}

            {/* Family Chutes at Bottom - Bodies Layer */}
            <div className="absolute -bottom-8 left-0 w-full flex items-end justify-around px-4" style={{ zIndex: 10 }}>
              {FAMILY_CHUTES.map((chute, index) => {
                const isHighlighted = craneState === 'ready_to_sort' && selectedChuteIndex === index;
                const baseTransform = 'translateX(-50%)';
                const highlightTransform = isHighlighted ? 'translateX(-50%) translateY(-0.5rem) scale(1.1)' : baseTransform;
                
                return (
                  <div 
                    key={chute.family}
                    className="transition-all duration-300"
                    style={{ 
                      position: 'absolute', 
                      left: `${chute.position}%`, 
                      transform: highlightTransform
                    }}
                  >
                    <FamilyChuteSVG 
                      chute={chute} 
                      isHighlighted={isHighlighted}
                      isDropping={craneState === 'dropping_to_chute' && selectedChuteIndex === index}
                    />
                  </div>
                );
              })}
            </div>

            {/* Family Chute Rims - Top Layer to mask falling balls */}
            <div className="absolute -bottom-8 left-0 w-full flex items-end justify-around px-4 pointer-events-none" style={{ zIndex: 40 }}>
              {FAMILY_CHUTES.map((chute, index) => {
                const isHighlighted = craneState === 'ready_to_sort' && selectedChuteIndex === index;
                const baseTransform = 'translateX(-50%)';
                const highlightTransform = isHighlighted ? 'translateX(-50%) translateY(-0.5rem) scale(1.1)' : baseTransform;
                
                return (
                  <div 
                    key={`rim-${chute.family}`}
                    className="flex flex-col items-center transition-all duration-300"
                    style={{ 
                      position: 'absolute', 
                      left: `${chute.position}%`, 
                      transform: highlightTransform
                    }}
                  >
                    <svg viewBox="0 0 120 140" className="w-36 h-40 pointer-events-none">
                      {/* Inner shadow/depth - wider ellipse */}
                      <ellipse cx="60" cy="8" rx="50" ry="6" fill="rgba(0,0,0,0.3)" />
                      
                      {/* Highlight on rim */}
                      <path d="M12 4 Q60 -4 108 4" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" />
                      
                      {/* Glow effect when highlighted */}
                      {isHighlighted && (
                        <ellipse cx="60" cy="8" rx="52" ry="8" fill="rgba(255,255,255,0.3)" className="animate-pulse" />
                      )}
                    </svg>
                  </div>
                );
              })}
            </div>
            
            {/* Feedback Overlay */}
            {feedback && feedback.show && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
                <div className={`
                  p-8 rounded-3xl text-center shadow-2xl border-8 max-w-md transform scale-110
                  ${feedback.isCorrect ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}
                `}>
                  <div className="text-7xl mb-4 animate-bounce">{feedback.isCorrect ? '🌟' : '🤔'}</div>
                  <h3 className={`text-3xl font-black mb-2 ${feedback.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {feedback.isCorrect ? 'Correct!' : 'Not Quite!'}
                  </h3>
                  <div className="text-xl font-bold text-gray-700">
                    {feedback.message}{' '}
                    <span className={`${feedback.isCorrect ? 'text-green-600 bg-green-200' : 'text-blue-600 bg-blue-200'} px-2 py-1 rounded-lg`}>
                      {feedback.correctFamily}
                    </span>{' '}
                    instrument!
                    {!feedback.isCorrect && feedback.selectedFamily && (
                      <div className="mt-2 text-base text-gray-500">
                        (You chose {feedback.selectedFamily})
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Control Panel */}
          <div className="bg-gray-200 mt-[-20px] pt-8 pb-6 px-8 rounded-b-2xl border-t-4 border-gray-300 shadow-inner flex items-center justify-center gap-8 relative z-20">
            
            {/* Play Sound Button */}
            <div className="relative">
              {!hasPlayedSound && !isPlayingAudio && craneState === 'ready_to_sort' && (
                <div className="absolute inset-0 rounded-lg bg-blue-400 animate-ping opacity-75" />
              )}
              <Button 
                onClick={() => currentInstrument && playInstrumentSound(currentInstrument.id, currentInstrument.audioPaths)}
                disabled={isPlayingAudio || craneState !== 'ready_to_sort'}
                className={`
                  w-20 h-20 rounded-lg border-b-8 relative
                  text-white shadow-lg active:border-b-0 active:translate-y-2 transition-all
                  flex flex-col items-center justify-center gap-1
                  ${!hasPlayedSound && !isPlayingAudio && craneState === 'ready_to_sort'
                    ? 'bg-yellow-500 hover:bg-yellow-400 border-yellow-700 ring-4 ring-yellow-300' 
                    : 'bg-blue-500 hover:bg-blue-400 border-blue-700'}
                  ${craneState !== 'ready_to_sort' ? 'opacity-50' : ''}
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
                disabled={craneState !== 'ready_to_sort'}
                className={`w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 border-b-4 border-red-800 text-white shadow-lg active:border-b-0 active:translate-y-1 ${craneState !== 'ready_to_sort' ? 'opacity-50' : ''}`}
              >
                <ArrowLeft size={28} strokeWidth={3} />
              </Button>
              
              <div className="w-4 h-16 bg-gray-400 rounded-full mx-2"></div>

              <Button 
                onClick={() => moveCrane('right')} 
                disabled={craneState !== 'ready_to_sort'}
                className={`w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 border-b-4 border-red-800 text-white shadow-lg active:border-b-0 active:translate-y-1 ${craneState !== 'ready_to_sort' ? 'opacity-50' : ''}`}
              >
                <ArrowRight size={28} strokeWidth={3} />
              </Button>
            </div>

            {/* Big Drop Button */}
            <div className="relative">
              {craneState === 'ready_to_sort' && (
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md animate-pulse opacity-50"></div>
              )}
              <Button 
                onClick={dropIntoChute} 
                disabled={craneState !== 'ready_to_sort'}
                className={`w-28 h-28 rounded-full bg-gradient-to-br from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 border-b-8 border-green-800 text-white shadow-2xl active:border-b-0 active:translate-y-2 transition-all relative z-10 ${craneState !== 'ready_to_sort' ? 'opacity-50' : ''}`}
              >
                <div className="flex flex-col items-center drop-shadow-md">
                  <ArrowDown size={40} strokeWidth={4} />
                  <span className="font-black text-lg tracking-wider">SORT!</span>
                </div>
              </Button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
