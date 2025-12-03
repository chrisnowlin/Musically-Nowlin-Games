import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { sampleAudioService } from "@/lib/sampleAudioService";
import { instrumentLibrary } from "@/lib/instrumentLibrary";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, HelpCircle, Volume2, VolumeX, Music, Download, ChevronLeft, Gauge, Sparkles, Save, RotateCcw, ListMusic, Star, Lightbulb, Shuffle } from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import { BellaBird, LeoLion, MiloMonkey } from "@/components/characters";

// Part variation interface
interface PartVariation {
  id: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  name: string;
  description: string;
  notes: string[];
  pattern: number[];
  difficulty: 'easy' | 'medium' | 'hard';
}

// Pre-made arrangements for kids to explore
// Now featuring chord progressions and minor key options!
const PRESET_ARRANGEMENTS = [
  {
    id: "simple",
    name: "Simple Start",
    emoji: "🎵",
    description: "Easy C major - perfect for beginners!",
    layers: {
      percussion: true,
      melody: true,
      harmony: true,
      bass: true,
      sparkle: false,
    },
    parts: {
      percussion: 'A' as const, // Foundation beat
      melody: 'A' as const,     // Simple C major
      harmony: 'A' as const,    // C major warmth
      bass: 'A' as const,       // Root foundation
      sparkle: 'A' as const,
    },
    tempo: 90,
  },
  {
    id: "march",
    name: "Marching Band",
    emoji: "🎺",
    description: "A steady march with energy!",
    layers: {
      percussion: true,
      melody: true,
      harmony: false,
      bass: true,
      sparkle: false,
    },
    parts: {
      percussion: 'C' as const, // March beat
      melody: 'C' as const,     // Dancing melody
      harmony: 'A' as const,
      bass: 'B' as const,       // Walking bass
      sparkle: 'A' as const,
    },
    tempo: 100,
  },
  {
    id: "lullaby",
    name: "Sleepy Lullaby",
    emoji: "🌙",
    description: "A gentle melody to relax to.",
    layers: {
      percussion: false,
      melody: true,
      harmony: true,
      bass: false,
      sparkle: true,
    },
    parts: {
      percussion: 'A' as const,
      melody: 'B' as const,     // Scale journey - gentle
      harmony: 'B' as const,    // Gentle wave
      bass: 'A' as const,
      sparkle: 'A' as const,    // Gentle chimes
    },
    tempo: 65,
  },
  {
    id: "minor",
    name: "Sad Song",
    emoji: "😢",
    description: "Emotional A minor feeling",
    layers: {
      percussion: true,
      melody: true,
      harmony: true,
      bass: true,
      sparkle: true,
    },
    parts: {
      percussion: 'D' as const, // Heartbeat pulse
      melody: 'D' as const,     // A minor melody
      harmony: 'D' as const,    // A minor color
      bass: 'D' as const,       // A minor depth
      sparkle: 'D' as const,    // Minor shimmer
    },
    tempo: 80,
  },
  {
    id: "progression",
    name: "Pop Song",
    emoji: "🎤",
    description: "Classic C-Am-F-G chord progression!",
    layers: {
      percussion: true,
      melody: true,
      harmony: true,
      bass: true,
      sparkle: false,
    },
    parts: {
      percussion: 'E' as const, // Chord roots
      melody: 'E' as const,     // Chord progression melody
      harmony: 'E' as const,    // Chord progression harmony
      bass: 'E' as const,       // Chord roots bass
      sparkle: 'A' as const,
    },
    tempo: 100,
  },
  {
    id: "celebration",
    name: "Party Time!",
    emoji: "🎉",
    description: "All instruments playing together!",
    layers: {
      percussion: true,
      melody: true,
      harmony: true,
      bass: true,
      sparkle: true,
    },
    parts: {
      percussion: 'B' as const, // C major arpeggio
      melody: 'C' as const,     // Dancing melody
      harmony: 'B' as const,    // Gentle wave
      bass: 'B' as const,       // Walking bass
      sparkle: 'B' as const,    // Twinkling stars
    },
    tempo: 120,
  },
  {
    id: "thunderstorm",
    name: "Thunder Storm",
    emoji: "⛈️",
    description: "Powerful and dramatic!",
    layers: {
      percussion: true,
      melody: true,
      harmony: true,
      bass: true,
      sparkle: true,
    },
    parts: {
      percussion: 'F' as const, // Thunder roll
      melody: 'F' as const,     // Virtuoso flight
      harmony: 'F' as const,    // Sweeping arpeggios
      bass: 'F' as const,       // Rumbling thunder
      sparkle: 'F' as const,    // Fairy dust
    },
    tempo: 130,
  },
  {
    id: "scales",
    name: "Scale Explorer",
    emoji: "📈",
    description: "Hear the full C major scale!",
    layers: {
      percussion: false,
      melody: true,
      harmony: true,
      bass: true,
      sparkle: false,
    },
    parts: {
      percussion: 'A' as const,
      melody: 'B' as const,     // Scale journey
      harmony: 'C' as const,    // Walking bass line
      bass: 'C' as const,       // Scale walk
      sparkle: 'A' as const,
    },
    tempo: 85,
  },
];

// Learning tips about each instrument section
const INSTRUMENT_TIPS = {
  percussion: {
    title: "🥁 Percussion Section",
    facts: [
      "Timpani drums can be tuned to play different notes!",
      "Percussion keeps the beat steady for everyone.",
      "In an orchestra, percussion is at the back!",
      "Try different patterns to change the energy!",
    ],
  },
  melody: {
    title: "🎶 Melody Section",
    facts: [
      "The melody is the tune you can hum!",
      "Flutes are one of the oldest instruments.",
      "The melody tells the musical story.",
      "Countermelodies add depth and interest!",
    ],
  },
  harmony: {
    title: "🎻 Harmony Section",
    facts: [
      "Harmony adds 'color' to the melody.",
      "Cellos have 4 strings like violins, but bigger!",
      "Harmony makes music sound fuller and richer.",
      "Sustained chords create atmosphere!",
    ],
  },
  bass: {
    title: "🎺 Bass Section",
    facts: [
      "Low sounds make you feel the music in your chest!",
      "The double bass is taller than most people!",
      "Bass notes are the foundation of music.",
      "Octave jumps add rhythmic excitement!",
    ],
  },
  sparkle: {
    title: "✨ Sparkle Section",
    facts: [
      "Bells and glockenspiels add magical sparkle!",
      "These instruments are hit with mallets.",
      "They make music sound bright and shiny!",
      "Cascading runs create magical effects!",
    ],
  },
};

// Part variation definitions for each instrument
// EXPANDED HARMONIC PALETTE using music theory principles:
// 
// CHORDS AVAILABLE:
// - C major (C-E-G) - tonic, home base
// - A minor (A-C-E) - relative minor, shares C and E
// - G major (G-B-D) - dominant, creates tension
// - F major (F-A-C) - subdominant, warm and supportive
// - D minor (D-F-A) - ii chord, common pre-dominant
// - E minor (E-G-B) - iii chord, bridges tonic and dominant
//
// SCALES: Full C major diatonic (C-D-E-F-G-A-B-C)
// 
// All parts maintain unified 2400ms cycle for perfect synchronization
//
// VARIATIONS DESIGN:
// A = C major focus (foundation)
// B = Flowing diatonic (scales and arpeggios)
// C = Rhythmic energy (active patterns)
// D = A minor flavor (emotional depth)
// E = Chord progressions (harmonic journey)
// F = Virtuosic (fast, exciting, full range)

const PART_VARIATIONS: Record<string, PartVariation[]> = {
  // PERCUSSION - Rhythmic foundation (timpani)
  // Available notes: C2, E2, G2
  percussion: [
    {
      id: 'A',
      name: 'Foundation Beat',
      description: 'Steady pulse on C - the home base',
      notes: ['C2', 'C2', 'C2', 'C2'],
      pattern: [600, 600, 600, 600], // 2400ms total
      difficulty: 'easy',
    },
    {
      id: 'B',
      name: 'C Major Arpeggio',
      description: 'Outlines the C major chord',
      notes: ['C2', 'E2', 'G2', 'C2'],
      pattern: [600, 600, 600, 600], // 2400ms total
      difficulty: 'easy',
    },
    {
      id: 'C',
      name: 'March Beat',
      description: 'Adds energy with alternating tones',
      notes: ['C2', 'G2', 'E2', 'G2', 'C2', 'G2', 'E2', 'G2'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300], // 2400ms total
      difficulty: 'medium',
    },
    {
      id: 'D',
      name: 'Heartbeat Pulse',
      description: 'Deep C with E accents - minor feel',
      // E is shared between C major and A minor
      notes: ['C2', 'C2', 'E2', 'C2', 'E2', 'E2'],
      pattern: [400, 400, 400, 400, 400, 400], // 2400ms
      difficulty: 'medium',
    },
    {
      id: 'E',
      name: 'Chord Roots',
      description: 'C to G progression feel',
      // Alternates between C (tonic) and G (dominant) roots
      notes: ['C2', 'C2', 'G2', 'G2', 'C2', 'C2', 'G2', 'G2'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300], // 2400ms
      difficulty: 'easy',
    },
    {
      id: 'F',
      name: 'Thunder Roll',
      description: 'Fast dramatic pattern through all tones',
      notes: ['C2', 'E2', 'G2', 'E2', 'C2', 'G2', 'E2', 'C2', 'G2', 'E2', 'C2', 'G2'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200], // 2400ms
      difficulty: 'hard',
    },
  ],

  // MELODY - Singable tune on top (flute)
  // Available notes: C5, D5, E5, F5, G5, A5, B5, C6 (full octave!)
  melody: [
    {
      id: 'A',
      name: 'Simple C Major',
      description: 'Easy melody using C major chord tones',
      notes: ['C5', 'D5', 'E5', 'G5', 'E5', 'D5', 'C5', 'C5'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300], // 2400ms total
      difficulty: 'easy',
    },
    {
      id: 'B',
      name: 'Scale Journey',
      description: 'Ascending scale then back home',
      // Full C major scale run
      notes: ['C5', 'D5', 'E5', 'F5', 'G5', 'F5', 'E5', 'C5'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300], // 2400ms total
      difficulty: 'easy',
    },
    {
      id: 'C',
      name: 'Dancing Melody',
      description: 'Playful skips and steps',
      notes: ['G5', 'E5', 'C5', 'D5', 'E5', 'G5', 'E5', 'C5'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300], // 2400ms total
      difficulty: 'medium',
    },
    {
      id: 'D',
      name: 'A Minor Melody',
      description: 'Emotional minor key feel',
      // A minor chord tones (A-C-E) with passing tones
      notes: ['A5', 'G5', 'E5', 'C5', 'E5', 'G5', 'A5', 'A5'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300], // 2400ms
      difficulty: 'medium',
    },
    {
      id: 'E',
      name: 'Chord Progression',
      description: 'Outlines C-F-G-C progression',
      // Arpeggios through the main chords
      notes: ['C5', 'E5', 'G5', 'F5', 'A5', 'G5', 'B5', 'C6'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300], // 2400ms
      difficulty: 'medium',
    },
    {
      id: 'F',
      name: 'Virtuoso Flight',
      description: 'Fast runs through full range',
      notes: ['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6', 'B5', 'A5', 'G5', 'E5'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200], // 2400ms
      difficulty: 'hard',
    },
  ],

  // HARMONY - Warm middle layer (cello)
  // Available notes: A2, B2, C3, D3, E3, F3, G3, A3, C4 (extended range!)
  harmony: [
    {
      id: 'A',
      name: 'C Major Warmth',
      description: 'Sustained C major chord tones',
      notes: ['C3', 'E3', 'G3', 'E3'],
      pattern: [600, 600, 600, 600], // 2400ms total
      difficulty: 'easy',
    },
    {
      id: 'B',
      name: 'Gentle Wave',
      description: 'Flowing arpeggio pattern',
      notes: ['C3', 'G3', 'E3', 'G3', 'C3', 'E3', 'G3', 'E3'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300], // 2400ms total
      difficulty: 'easy',
    },
    {
      id: 'C',
      name: 'Walking Bass Line',
      description: 'Stepwise motion through scale',
      // Scalewise movement adds forward motion
      notes: ['C3', 'D3', 'E3', 'F3', 'G3', 'F3', 'E3', 'C3'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300], // 2400ms total
      difficulty: 'medium',
    },
    {
      id: 'D',
      name: 'A Minor Color',
      description: 'Emotional A minor arpeggio',
      // A minor chord tones (A-C-E) in cello range
      notes: ['A2', 'C3', 'E3', 'A3', 'E3', 'C3', 'A2', 'A2'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300], // 2400ms
      difficulty: 'medium',
    },
    {
      id: 'E',
      name: 'Chord Progression',
      description: 'Roots of C-Am-F-G progression',
      // Classic pop/folk progression bass line
      notes: ['C3', 'C3', 'A2', 'A2', 'F3', 'F3', 'G3', 'G3'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300], // 2400ms
      difficulty: 'easy',
    },
    {
      id: 'F',
      name: 'Sweeping Arpeggios',
      description: 'Fast flowing through full range',
      notes: ['C3', 'E3', 'G3', 'C4', 'G3', 'E3', 'A2', 'C3', 'E3', 'G3', 'A3', 'G3'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200], // 2400ms
      difficulty: 'hard',
    },
  ],

  // BASS - Deep foundation (double bass)
  // Available notes: A1, B1, C2, D2, E2, F2, G2, A2 (full octave!)
  bass: [
    {
      id: 'A',
      name: 'Root Foundation',
      description: 'Solid C and G bass notes',
      notes: ['C2', 'C2', 'G2', 'G2'],
      pattern: [600, 600, 600, 600], // 2400ms total
      difficulty: 'easy',
    },
    {
      id: 'B',
      name: 'Walking Bass',
      description: 'Moving bass line with energy',
      notes: ['C2', 'E2', 'G2', 'E2', 'C2', 'E2', 'G2', 'E2'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300], // 2400ms total
      difficulty: 'easy',
    },
    {
      id: 'C',
      name: 'Scale Walk',
      description: 'Stepwise bass motion',
      // Walking up and down the scale
      notes: ['C2', 'D2', 'E2', 'F2', 'G2', 'F2', 'E2', 'C2'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300], // 2400ms total
      difficulty: 'medium',
    },
    {
      id: 'D',
      name: 'A Minor Depth',
      description: 'Deep A minor feeling',
      // Uses A (the root of A minor) for emotional depth
      notes: ['A1', 'C2', 'E2', 'A1', 'C2', 'E2', 'A1', 'A1'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300], // 2400ms
      difficulty: 'medium',
    },
    {
      id: 'E',
      name: 'Chord Roots',
      description: 'C-Am-F-G progression roots',
      // Classic chord progression in bass
      notes: ['C2', 'C2', 'A1', 'A1', 'F2', 'F2', 'G2', 'G2'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300], // 2400ms
      difficulty: 'easy',
    },
    {
      id: 'F',
      name: 'Rumbling Thunder',
      description: 'Fast powerful bass runs',
      notes: ['C2', 'D2', 'E2', 'G2', 'A2', 'G2', 'F2', 'E2', 'D2', 'C2', 'A1', 'C2'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200], // 2400ms
      difficulty: 'hard',
    },
  ],

  // SPARKLE - Bright top layer (glockenspiel)
  // Available notes: C6, E6, G6
  sparkle: [
    {
      id: 'A',
      name: 'Gentle Chimes',
      description: 'Soft bell tones on C major',
      notes: ['C6', 'E6', 'G6', 'E6'],
      pattern: [600, 600, 600, 600], // 2400ms total
      difficulty: 'easy',
    },
    {
      id: 'B',
      name: 'Twinkling Stars',
      description: 'Quick shimmering pattern',
      notes: ['C6', 'G6', 'E6', 'G6', 'C6', 'E6', 'G6', 'E6'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300], // 2400ms total
      difficulty: 'easy',
    },
    {
      id: 'C',
      name: 'Cascading Magic',
      description: 'Descending sparkle pattern',
      notes: ['G6', 'E6', 'C6', 'E6', 'G6', 'E6', 'C6', 'E6'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300], // 2400ms total
      difficulty: 'medium',
    },
    {
      id: 'D',
      name: 'Minor Shimmer',
      description: 'E-focused for A minor feel',
      // E is the 5th of A minor, creates that minor shimmer
      notes: ['E6', 'C6', 'E6', 'G6', 'E6', 'C6', 'E6', 'E6'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300], // 2400ms
      difficulty: 'medium',
    },
    {
      id: 'E',
      name: 'Echo Bells',
      description: 'Repeating pattern like an echo',
      notes: ['G6', 'G6', 'E6', 'E6', 'C6', 'C6', 'E6', 'E6'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300], // 2400ms
      difficulty: 'easy',
    },
    {
      id: 'F',
      name: 'Fairy Dust',
      description: 'Rapid magical shimmer',
      notes: ['C6', 'E6', 'G6', 'E6', 'C6', 'G6', 'E6', 'C6', 'G6', 'E6', 'C6', 'G6'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200], // 2400ms
      difficulty: 'hard',
    },
  ],
};

interface OrchestraLayer {
  id: string;
  name: string;
  instrumentName: string;
  animal: string;
  emoji: string;
  color: string;
  bgColor: string;
  isPlaying: boolean;
  volume: number;
  currentNoteIndex: number;
  character?: 'bird' | 'lion' | 'monkey' | null;
  description: string;
  selectedPart: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  variations: PartVariation[];
}

export default function AnimalOrchestraConductorGameWithSamples() {
  const [, setLocation] = useLocation();
  const [gameStarted, setGameStarted] = useState(false);
  const [samplesLoaded, setSamplesLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [usingSamples, setUsingSamples] = useState(false);
  const [masterVolume, setMasterVolume] = useState(70);
  const [tempo, setTempo] = useState(100);
  const [showPresets, setShowPresets] = useState(false);
  const [showTip, setShowTip] = useState<string | null>(null);
  const [conductorMode, setConductorMode] = useState(false);
  const [beatCount, setBeatCount] = useState(0);
  const [streak, setStreak] = useState(0);

  const [layers, setLayers] = useState<OrchestraLayer[]>([
    {
      id: 'percussion',
      name: 'Percussion',
      instrumentName: 'timpani',
      animal: 'Elephant',
      emoji: '🐘',
      color: 'from-purple-500 to-purple-700',
      bgColor: 'bg-purple-500',
      isPlaying: false,
      volume: 80,
      currentNoteIndex: 0,
      character: 'monkey',
      description: 'Keeps the beat steady!',
      selectedPart: 'A',
      variations: PART_VARIATIONS.percussion,
    },
    {
      id: 'melody',
      name: 'Melody',
      instrumentName: 'flute',
      animal: 'Bird',
      emoji: '🐦',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500',
      isPlaying: false,
      volume: 70,
      currentNoteIndex: 0,
      character: 'bird',
      description: 'Sings the main tune!',
      selectedPart: 'A',
      variations: PART_VARIATIONS.melody,
    },
    {
      id: 'harmony',
      name: 'Harmony',
      instrumentName: 'cello',
      animal: 'Bear',
      emoji: '🐻',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500',
      isPlaying: false,
      volume: 60,
      currentNoteIndex: 0,
      character: 'lion',
      description: 'Adds warm support!',
      selectedPart: 'A',
      variations: PART_VARIATIONS.harmony,
    },
    {
      id: 'bass',
      name: 'Bass',
      instrumentName: 'double-bass',
      animal: 'Whale',
      emoji: '🐋',
      color: 'from-amber-600 to-orange-700',
      bgColor: 'bg-amber-600',
      isPlaying: false,
      volume: 65,
      currentNoteIndex: 0,
      character: null,
      description: 'Deep rumbling foundation!',
      selectedPart: 'A',
      variations: PART_VARIATIONS.bass,
    },
    {
      id: 'sparkle',
      name: 'Sparkle',
      instrumentName: 'glockenspiel',
      animal: 'Fairy',
      emoji: '🧚',
      color: 'from-pink-400 to-rose-500',
      bgColor: 'bg-pink-400',
      isPlaying: false,
      volume: 50,
      currentNoteIndex: 0,
      character: null,
      description: 'Magical tinkling sounds!',
      selectedPart: 'A',
      variations: PART_VARIATIONS.sparkle,
    },
  ]);

  const activeSourcesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());
  const intervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const animationFrameRef = useRef<Map<string, number>>(new Map());
  const isPlayingRef = useRef<Map<string, boolean>>(new Map());
  const beatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const decorativeOrbs = generateDecorativeOrbs();

  // Beat counter for visual sync
  useEffect(() => {
    if (layers.some(l => l.isPlaying)) {
      const interval = setInterval(() => {
        setBeatCount(prev => prev + 1);
      }, 400 * (100 / tempo));
      beatIntervalRef.current = interval;
      return () => clearInterval(interval);
    } else {
      setBeatCount(0);
    }
  }, [layers, tempo]);

  const loadSamples = useCallback(async () => {
    setLoadingProgress(10);

    try {
      const instrumentNames = [...new Set(layers.map(l => l.instrumentName))];
      let totalSamples = 0;
      let loadedSamples = 0;

      instrumentNames.forEach(name => {
        const samples = instrumentLibrary.getSamples(name);
        totalSamples += samples.length;
      });

      setLoadingProgress(20);

      for (const instrumentName of instrumentNames) {
        const samples = instrumentLibrary.getSamples(instrumentName);

        for (const sample of samples) {
          const path = `/audio/${sample.path}`;
          const sampleName = instrumentLibrary.getSampleName(sample.instrument, sample.note);

          try {
            await sampleAudioService.loadSample(path, sampleName);
            loadedSamples++;
            setLoadingProgress(20 + (loadedSamples / totalSamples) * 70);
          } catch {
            // Silently fall back to synthesized audio
          }
        }
      }

      const totalLoaded = sampleAudioService.getLoadedSampleCount();
      setLoadingProgress(100);

      if (totalLoaded > 0) {
        setUsingSamples(true);
      } else {
        setUsingSamples(false);
      }

      setSamplesLoaded(true);
    } catch {
      setUsingSamples(false);
      setSamplesLoaded(true);
    }
  }, [layers]);

  const stopLayerPattern = useCallback((layerId: string) => {
    isPlayingRef.current.set(layerId, false);

    const interval = intervalsRef.current.get(layerId);
    if (interval) {
      clearInterval(interval);
      intervalsRef.current.delete(layerId);
    }

    const sourcesToStop: AudioBufferSourceNode[] = [];
    activeSourcesRef.current.forEach((source, key) => {
      if (key.startsWith(layerId)) {
        sourcesToStop.push(source);
        activeSourcesRef.current.delete(key);
      }
    });

    sourcesToStop.forEach(source => {
      try {
        source.stop();
      } catch {
        // Already stopped
      }
    });

    setLayers(prev => prev.map(l => 
      l.id === layerId 
        ? { ...l, currentNoteIndex: 0 }
        : l
    ));
  }, []);

  const playLayerPattern = useCallback(async (layer: OrchestraLayer) => {
    stopLayerPattern(layer.id);
    isPlayingRef.current.set(layer.id, true);

    const currentVariation = layer.variations.find(v => v.id === layer.selectedPart);
    if (!currentVariation) return;

    let noteIndex = 0;
    // Higher tempo = faster = shorter intervals
    // tempo 100 = 1.0x (base), tempo 200 = 0.5x (faster), tempo 50 = 2.0x (slower)
    const tempoMultiplier = 100 / tempo;

    const playNextNote = async () => {
      if (!isPlayingRef.current.get(layer.id)) {
        return;
      }

      if (noteIndex < currentVariation.notes.length) {
        const note = currentVariation.notes[noteIndex];
        const baseDuration = currentVariation.pattern[noteIndex];
        const duration = (baseDuration * tempoMultiplier) / 1000;

        setLayers(prev => prev.map(l => 
          l.id === layer.id 
            ? { ...l, currentNoteIndex: noteIndex }
            : l
        ));

        const volumeScale = (masterVolume / 100) * (layer.volume / 100);
        const sampleName = instrumentLibrary.getSampleName(layer.instrumentName, note);
        const isSampleAvailable = sampleAudioService.isSampleLoaded(sampleName);

        if (!isPlayingRef.current.get(layer.id)) {
          return;
        }

        if (isSampleAvailable && usingSamples) {
          const source = await sampleAudioService.playSample(sampleName, {
            volume: volumeScale,
            duration: duration
          });
          if (source) {
            if (!isPlayingRef.current.get(layer.id)) {
              try {
                source.stop();
              } catch {
                // Already stopped
              }
              return;
            }
            activeSourcesRef.current.set(`${layer.id}-${Date.now()}-${noteIndex}`, source);
          }
        } else {
          const sample = instrumentLibrary.getSample(layer.instrumentName, note);
          if (sample && isPlayingRef.current.get(layer.id)) {
            await sampleAudioService.playNote(sample.frequency, duration);
          }
        }

        if (!isPlayingRef.current.get(layer.id)) {
          return;
        }

        noteIndex++;
        if (noteIndex >= currentVariation.notes.length) {
          noteIndex = 0;
        }
      }
    };

    await playNextNote();

    if (!isPlayingRef.current.get(layer.id)) {
      return;
    }

    const avgDuration = currentVariation.pattern.reduce((a, b) => a + b, 0) / currentVariation.pattern.length;
    const interval = setInterval(() => {
      if (!isPlayingRef.current.get(layer.id)) {
        clearInterval(interval);
        intervalsRef.current.delete(layer.id);
        return;
      }
      playNextNote();
    }, avgDuration * tempoMultiplier);
    intervalsRef.current.set(layer.id, interval);
  }, [usingSamples, tempo, masterVolume, stopLayerPattern]);

  const updateLayerVolume = useCallback((layerId: string, newVolume: number) => {
    setLayers(prev => {
      const updated = prev.map(layer => {
        if (layer.id === layerId) {
          const wasPlaying = layer.isPlaying;
          const updatedLayer = { ...layer, volume: newVolume };
          
          if (wasPlaying) {
            setTimeout(() => {
              playLayerPattern(updatedLayer);
            }, 0);
          }
          
          return updatedLayer;
        }
        return layer;
      });
      return updated;
    });
  }, [playLayerPattern]);

  const updateLayerPart = useCallback((layerId: string, partId: 'A' | 'B' | 'C') => {
    setLayers(prev => {
      const updated = prev.map(layer => {
        if (layer.id === layerId) {
          const wasPlaying = layer.isPlaying;
          const updatedLayer = { ...layer, selectedPart: partId };
          
          if (wasPlaying) {
            setTimeout(() => {
              playLayerPattern(updatedLayer);
            }, 0);
          }
          
          return updatedLayer;
        }
        return layer;
      });
      return updated;
    });
  }, [playLayerPattern]);

  const randomizeAllParts = useCallback(() => {
    setLayers(prev => {
      const updated = prev.map(layer => {
        const randomPart = ['A', 'B', 'C'][Math.floor(Math.random() * 3)] as 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
        const wasPlaying = layer.isPlaying;
        const updatedLayer = { ...layer, selectedPart: randomPart };
        
        if (wasPlaying) {
          setTimeout(() => {
            playLayerPattern(updatedLayer);
          }, 0);
        }
        
        return updatedLayer;
      });
      return updated;
    });
  }, [playLayerPattern]);

  useEffect(() => {
    if (!gameStarted || !samplesLoaded) return;
    
    const playingLayers = layers.filter(l => l.isPlaying);
    if (playingLayers.length === 0) return;
    
    playingLayers.forEach(layer => {
      playLayerPattern(layer);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempo, gameStarted, samplesLoaded, playLayerPattern]);

  useEffect(() => {
    if (!gameStarted || !samplesLoaded) return;
    
    const playingLayers = layers.filter(l => l.isPlaying);
    if (playingLayers.length === 0) return;
    
    playingLayers.forEach(layer => {
      playLayerPattern(layer);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterVolume, gameStarted, samplesLoaded, playLayerPattern]);

  useEffect(() => {
    return () => {
      isPlayingRef.current.clear();
      intervalsRef.current.forEach(interval => clearInterval(interval));
      intervalsRef.current.clear();
      activeSourcesRef.current.forEach(source => {
        try {
          source.stop();
        } catch {
          // Already stopped
        }
      });
      activeSourcesRef.current.clear();
      animationFrameRef.current.forEach(frame => cancelAnimationFrame(frame));
      animationFrameRef.current.clear();
      if (beatIntervalRef.current) {
        clearInterval(beatIntervalRef.current);
      }
    };
  }, []);

  const toggleLayer = useCallback(async (layerId: string) => {
    setLayers(prev => {
      const updated = prev.map(layer => {
        if (layer.id === layerId) {
          const newIsPlaying = !layer.isPlaying;

          if (newIsPlaying) {
            playLayerPattern(layer);
            setStreak(s => s + 1);
          } else {
            stopLayerPattern(layerId);
          }

          return { ...layer, isPlaying: newIsPlaying };
        }
        return layer;
      });
      return updated;
    });
  }, [playLayerPattern, stopLayerPattern]);

  const stopAllLayers = useCallback(() => {
    layers.forEach(layer => {
      if (layer.isPlaying) {
        stopLayerPattern(layer.id);
      }
    });
    setLayers(prev => prev.map(layer => ({ ...layer, isPlaying: false })));
  }, [layers, stopLayerPattern]);

  const playAllLayers = useCallback(() => {
    layers.forEach(layer => {
      if (!layer.isPlaying) {
        playLayerPattern(layer);
      }
    });
    setLayers(prev => prev.map(layer => ({ ...layer, isPlaying: true })));
  }, [layers, playLayerPattern]);

  const applyPreset = useCallback((preset: typeof PRESET_ARRANGEMENTS[0]) => {
    stopAllLayers();
    setTempo(preset.tempo);
    
    setTimeout(() => {
      setLayers(prev => prev.map(layer => {
        const shouldPlay = preset.layers[layer.id as keyof typeof preset.layers];
        const selectedPart = preset.parts[layer.id as keyof typeof preset.parts] || 'A';
        
        const updatedLayer = { 
          ...layer, 
          isPlaying: shouldPlay,
          selectedPart: selectedPart as 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
        };
        
        if (shouldPlay) {
          playLayerPattern(updatedLayer);
        }
        
        return updatedLayer;
      }));
    }, 100);
    
    setShowPresets(false);
  }, [playLayerPattern, stopAllLayers]);

  useEffect(() => {
    return () => {
      intervalsRef.current.forEach(interval => clearInterval(interval));
      intervalsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!gameStarted || !samplesLoaded) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '5') {
        const layerIndex = parseInt(e.key) - 1;
        if (layerIndex < layers.length) {
          toggleLayer(layers[layerIndex].id);
        }
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        const currentActiveLayers = layers.filter(l => l.isPlaying).length;
        if (currentActiveLayers === 0) {
          playAllLayers();
        } else {
          stopAllLayers();
        }
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setTempo(prev => Math.max(40, prev - 5));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setTempo(prev => Math.min(180, prev + 5));
      }

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setMasterVolume(prev => Math.min(100, prev + 5));
      } else if (e.key === '-') {
        e.preventDefault();
        setMasterVolume(prev => Math.max(0, prev - 5));
      }

      // Part selection shortcuts
      if (e.shiftKey && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const layerIndex = parseInt(e.key) - 1;
        if (layerIndex < layers.length) {
          const layer = layers[layerIndex];
          const currentPartIndex = ['A', 'B', 'C', 'D', 'E', 'F'].indexOf(layer.selectedPart);
          const nextPartIndex = (currentPartIndex + 1) % 6;
          const nextPart = ['A', 'B', 'C'][nextPartIndex] as 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
          updateLayerPart(layer.id, nextPart);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, samplesLoaded, layers, toggleLayer, playAllLayers, stopAllLayers, updateLayerPart]);

  const handleStartGame = async () => {
    await sampleAudioService.initialize();
    setGameStarted(true);
    loadSamples();
  };

  // Render animal character
  const renderCharacter = (layer: OrchestraLayer, size: string = "w-20 h-20") => {
    const commonProps = {
      className: size,
      isPlaying: layer.isPlaying,
    };

    switch (layer.character) {
      case 'bird':
        return <BellaBird {...commonProps} />;
      case 'lion':
        return <LeoLion {...commonProps} />;
      case 'monkey':
        return <MiloMonkey {...commonProps} />;
      default:
        return (
          <span className={`${size.includes('20') ? 'text-6xl' : 'text-4xl'} ${layer.isPlaying ? 'animate-bounce' : ''}`}>
            {layer.emoji}
          </span>
        );
    }
  };

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

        <div className="text-center space-y-8 z-10 max-w-2xl">
          <div className="space-y-4">
            <h1 className={`${playfulTypography.headings.hero} ${playfulColors.gradients.title}`}>
              Animal Orchestra Conductor
            </h1>
            <p className={`${playfulTypography.body.large} text-gray-700 dark:text-gray-300`}>
              Become the conductor of your very own orchestra! 🎭
            </p>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-8 ${playfulShapes.shadows.card} space-y-6`}>
            <div className="flex items-center gap-3 text-lg">
              <HelpCircle className="w-6 h-6 text-orange-600" />
              <span className={playfulTypography.body.medium}>How to Play:</span>
            </div>
            <ul className="text-left space-y-3 text-base">
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎭</span>
                <span>Tap each animal to start or stop their part</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎵</span>
                <span>Layer <strong>5 different instruments</strong> together!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎛️</span>
                <span><strong>NEW:</strong> Choose from 6 musical parts per animal!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">📚</span>
                <span>Try the preset arrangements to learn music styles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🎚️</span>
                <span>Adjust tempo and volume for each instrument</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">💡</span>
                <span>Tap the lightbulb to learn fun facts!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">⌨️</span>
                <span><strong>NEW:</strong> Use Shift+1-5 to change parts!</span>
              </li>
            </ul>

            <div className="text-sm text-gray-600 dark:text-gray-400 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
              <p className="font-semibold mb-2">🎻 Meet the Orchestra:</p>
              <div className="grid grid-cols-5 gap-2 text-center">
                <div>🐵<br/><span className="text-xs">Drums</span></div>
                <div>🐦<br/><span className="text-xs">Flute</span></div>
                <div>🦁<br/><span className="text-xs">Cello</span></div>
                <div>🐋<br/><span className="text-xs">Bass</span></div>
                <div>🧚<br/><span className="text-xs">Bells</span></div>
              </div>
              <p className="font-semibold mt-3 mb-1">🎛️ Part Variations:</p>
              <div className="text-xs space-y-1">
                <div><strong>A-B:</strong> Simple • <strong>C-D:</strong> Rhythmic • <strong>E-F:</strong> Advanced</div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleStartGame}
            size="lg"
            className={`${playfulComponents.button.primary} transform ${playfulAnimations.hover.scale}`}
          >
            <Play className="w-8 h-8 mr-3" />
            Start Conducting!
          </Button>
        </div>
      </div>
    );
  }

  const activeLayers = layers.filter(l => l.isPlaying).length;

  return (
    <div className={`min-h-screen ${playfulColors.gradients.background} flex flex-col p-4 relative overflow-hidden`}>
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

      {/* Tip Modal */}
      {showTip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowTip(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className={`${playfulTypography.headings.h3} mb-4`}>
              {INSTRUMENT_TIPS[showTip as keyof typeof INSTRUMENT_TIPS]?.title}
            </h3>
            <ul className="space-y-3">
              {INSTRUMENT_TIPS[showTip as keyof typeof INSTRUMENT_TIPS]?.facts.map((fact, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
            <Button onClick={() => setShowTip(null)} className="mt-4 w-full">
              Cool! 🎵
            </Button>
          </div>
        </div>
      )}

      {/* Presets Panel */}
      {showPresets && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPresets(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-lg mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className={`${playfulTypography.headings.h3} mb-4 flex items-center gap-2`}>
              <ListMusic className="w-6 h-6" />
              Try a Music Style!
            </h3>
            <div className="grid gap-3">
              {PRESET_ARRANGEMENTS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl hover:scale-102 transition-all text-left"
                >
                  <span className="text-4xl">{preset.emoji}</span>
                  <div>
                    <div className="font-bold">{preset.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{preset.description}</div>
                  </div>
                </button>
              ))}
            </div>
            <Button variant="outline" onClick={() => setShowPresets(false)} className="mt-4 w-full">
              Close
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-start z-10 max-w-6xl mx-auto w-full space-y-6 pt-16">

        {/* Loading Status */}
        {!samplesLoaded && (
          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg text-center animate-pulse">
            <Download className="w-6 h-6 inline-block mr-2 animate-bounce" />
            <span>Loading orchestra samples... {Math.round(loadingProgress)}%</span>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Header with Status */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4">
            <h2 className={`${playfulTypography.headings.h2} text-gray-800 dark:text-gray-200`}>
              🎭 Conductor Mode
            </h2>
            {samplesLoaded && usingSamples && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                ✨ Real Instruments
              </span>
            )}
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {activeLayers === 0 && "Tap an animal to start the music! 🎵"}
            {activeLayers === 1 && "Great start! Add more instruments! 🎶"}
            {activeLayers === 2 && "Beautiful! Keep adding layers! 🎼"}
            {activeLayers === 3 && "Amazing harmony! Try adding more! 🎻"}
            {activeLayers === 4 && "Almost there! One more instrument! 🥁"}
            {activeLayers === 5 && "🎉 FULL ORCHESTRA! You're a master conductor! 🎉"}
          </p>
          
          {/* Beat Indicator */}
          {activeLayers > 0 && (
            <div className="flex justify-center gap-2 mt-2">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-100 ${
                    beatCount % 4 === i
                      ? 'bg-yellow-400 scale-125 shadow-lg shadow-yellow-400/50'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Master Controls */}
        <div className={`w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${playfulShapes.rounded.container} p-4 ${playfulShapes.shadows.card}`}>
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <Button
              onClick={playAllLayers}
              disabled={activeLayers === 5 || !samplesLoaded}
              size="default"
              className={`${playfulComponents.button.primary}`}
            >
              <Music className="w-5 h-5 mr-2" />
              Play All
            </Button>
            <Button
              onClick={stopAllLayers}
              disabled={activeLayers === 0}
              size="default"
              variant="outline"
              className="border-2"
            >
              <VolumeX className="w-5 h-5 mr-2" />
              Stop All
            </Button>
            <Button
              onClick={() => setShowPresets(true)}
              size="default"
              variant="outline"
              className="border-2 border-purple-400"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Try Presets
            </Button>
            <Button
              onClick={randomizeAllParts}
              size="default"
              variant="outline"
              className="border-2 border-orange-400"
            >
              <Shuffle className="w-5 h-5 mr-2" />
              Random Mix
            </Button>

            {/* Tempo & Volume inline */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
              <Gauge className="w-4 h-4 text-gray-500" />
              <Slider
                value={[tempo]}
                onValueChange={(values) => setTempo(values[0])}
                min={40}
                max={180}
                step={5}
                className="w-24"
                aria-label="Tempo"
              />
              <span className="text-xs font-semibold w-12">{tempo} BPM</span>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
              <Volume2 className="w-4 h-4 text-gray-500" />
              <Slider
                value={[masterVolume]}
                onValueChange={(values) => setMasterVolume(values[0])}
                min={0}
                max={100}
                step={1}
                className="w-24"
                aria-label="Master volume"
              />
              <span className="text-xs font-semibold w-10">{masterVolume}%</span>
            </div>
          </div>
        </div>

        {/* Orchestra Layers - Horizontal Layout */}
        <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-4">
          {layers.map((layer, index) => {
            const currentVariation = layer.variations.find(v => v.id === layer.selectedPart);
            const totalPatternDuration = currentVariation?.pattern.reduce((a, b) => a + b, 0) || 0;

            return (
              <div
                key={layer.id}
                className={`${playfulShapes.rounded.container} ${playfulShapes.shadows.card} overflow-hidden transition-all duration-300 ${
                  layer.isPlaying
                    ? `bg-gradient-to-br ${layer.color} text-white scale-105 ring-4 ring-white/50`
                    : 'bg-white dark:bg-gray-800'
                }`}
              >
                <div className="p-4 space-y-3">
                  {/* Animal/Instrument Header */}
                  <button
                    onClick={() => toggleLayer(layer.id)}
                    disabled={!samplesLoaded}
                    className="w-full text-center space-y-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <div className="flex justify-center">
                      {renderCharacter(layer, "w-16 h-16")}
                    </div>
                    <div>
                      <h3 className={`${playfulTypography.headings.h4} mb-0.5`}>
                        {layer.name}
                      </h3>
                      <p className="text-xs opacity-80">
                        {layer.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      {layer.isPlaying ? (
                        <>
                          <Music className="w-4 h-4" />
                          <span className="text-sm font-semibold">Playing</span>
                        </>
                      ) : (
                        <span className="text-sm opacity-70">Tap to Play</span>
                      )}
                    </div>
                  </button>

                  {/* Part Selector */}
                  <div className="pt-2 border-t border-white/20 dark:border-gray-600">
                    <div className="flex justify-center gap-1 mb-2">
                      {layer.variations.map((variation) => (
                        <button
                          key={variation.id}
                          onClick={() => updateLayerPart(layer.id, variation.id)}
                          className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                            layer.selectedPart === variation.id
                              ? 'bg-white text-gray-800 shadow-lg scale-105'
                              : 'bg-white/20 hover:bg-white/30'
                          }`}
                          title={`${variation.name}: ${variation.description}`}
                        >
                          {variation.id}
                        </button>
                      ))}
                    </div>
                    <div className="text-center">
                      <p className="text-xs opacity-70 font-medium">
                        {currentVariation?.name}
                      </p>
                      <p className="text-xs opacity-50">
                        {currentVariation?.description}
                      </p>
                    </div>
                  </div>

                  {/* Pattern Visualization */}
                  <div className="pt-2 border-t border-white/20 dark:border-gray-600">
                    <div className="flex gap-0.5 justify-center h-6">
                      {currentVariation?.notes.map((note, idx) => (
                        <div
                          key={idx}
                          className={`rounded transition-all duration-100 ${
                            layer.isPlaying && idx === layer.currentNoteIndex
                              ? 'bg-white scale-110 shadow-lg'
                              : layer.isPlaying
                              ? 'bg-white/50'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                          style={{
                            width: `${Math.max((currentVariation.pattern[idx] / totalPatternDuration) * 100, 8)}%`,
                            height: `${Math.min(100, 40 + (currentVariation.notes.length - idx) * 10)}%`,
                          }}
                          title={`${note}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Volume & Learn Button */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/20 dark:border-gray-600">
                    <Volume2 className="w-3 h-3 opacity-60 flex-shrink-0" />
                    <Slider
                      value={[layer.volume]}
                      onValueChange={(values) => updateLayerVolume(layer.id, values[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                      aria-label={`${layer.name} volume`}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTip(layer.id);
                      }}
                      className="p-1 rounded-full hover:bg-white/20 transition-colors"
                      title="Learn about this instrument"
                    >
                      <Lightbulb className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Keyboard Hints */}
                  <div className="text-center space-y-1">
                    <span className="text-xs opacity-50 bg-black/10 px-2 py-0.5 rounded">
                      Press {index + 1} to toggle
                    </span>
                    <span className="text-xs opacity-50 bg-black/10 px-2 py-0.5 rounded block">
                      Shift+{index + 1} for parts
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Feedback & Progress */}
        <div className="text-center space-y-3">
          <div className="flex justify-center gap-2">
            {layers.map(layer => {
              const currentVariation = layer.variations.find(v => v.id === layer.selectedPart);
              return (
                <div
                  key={layer.id}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    layer.isPlaying ? layer.bgColor + ' shadow-lg' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  title={`${layer.name} - Part ${layer.selectedPart}: ${currentVariation?.name}`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Active: {activeLayers}/5</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              Streak: {streak}
            </span>
            <span>•</span>
            <span>Combinations: 6⁵ = 7,776 possible!</span>
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        {samplesLoaded && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <p className="font-semibold mb-1">⌨️ Keyboard Shortcuts</p>
            <p>1-5: Toggle instruments | Shift+1-5: Change parts | Space: Play/Stop All | ←→: Tempo | +/-: Volume</p>
          </div>
        )}
      </div>
    </div>
  );
}
