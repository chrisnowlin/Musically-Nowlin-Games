import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { sampleAudioService } from "@/lib/sampleAudioService";
import { instrumentLibrary } from "@/lib/instrumentLibrary";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, HelpCircle, Volume2, VolumeX, Music, Download, ChevronLeft, Gauge, Sparkles, ListMusic, Star, Lightbulb, Shuffle } from "lucide-react";
import { playfulColors, playfulTypography, playfulShapes, playfulComponents, playfulAnimations, generateDecorativeOrbs } from "@/theme/playful";
import chairUrl from "@/assets/aoc/seating/aoc_chair.png";
import chairSelectedOverlayUrl from "@/assets/aoc/seating/aoc_chair_selected_overlay.png";
import podiumBaseUrl from "@/assets/aoc/podium/aoc_podium_base.svg";
import podiumTrimUrl from "@/assets/aoc/podium/aoc_podium_trim.svg";
import podiumShadowUrl from "@/assets/aoc/podium/aoc_podium_shadow.svg";

// Part variation interface
type PartId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

interface PartVariation {
  id: PartId;
  name: string;
  description: string;
  notes: string[];
  pattern: number[];
  difficulty: 'easy' | 'medium' | 'hard';
}

// Pre-made arrangements for kids to explore
interface PresetArrangement {
  id: string;
  name: string;
  emoji: string;
  description: string;
  layers: Record<string, boolean>;
  parts: Record<string, PartId>;
  tempo: number;
}

const PRESET_ARRANGEMENTS: PresetArrangement[] = [
  {
    id: "strings-section",
    name: "Strings Section",
    emoji: "🎻",
    description: "All strings together — warm and rich.",
    layers: {
      strings_violin_1: true,
      strings_violin_2: true,
      strings_viola: true,
      strings_cello: true,
      strings_bass: true,
    },
    parts: {
      strings_violin_1: 'B',
      strings_violin_2: 'A',
      strings_viola: 'A',
      strings_cello: 'B',
      strings_bass: 'A',
    },
    tempo: 90,
  },
  {
    id: "woodwind-choir",
    name: "Woodwind Choir",
    emoji: "🪈",
    description: "Light and airy woodwinds.",
    layers: {
      winds_flute: true,
      winds_oboe: true,
      winds_clarinet: true,
      winds_bassoon: true,
    },
    parts: {
      winds_flute: 'B',
      winds_oboe: 'A',
      winds_clarinet: 'C',
      winds_bassoon: 'A',
    },
    tempo: 95,
  },
  {
    id: "brass-fanfare",
    name: "Brass Fanfare",
    emoji: "🎺",
    description: "Bold brass calls and deep support.",
    layers: {
      brass_trumpet: true,
      brass_horn: true,
      brass_trombone: true,
      brass_tuba: true,
    },
    parts: {
      brass_trumpet: 'A',
      brass_horn: 'B',
      brass_trombone: 'B',
      brass_tuba: 'A',
    },
    tempo: 105,
  },
  {
    id: "percussion-power",
    name: "Percussion Power",
    emoji: "🥁",
    description: "Big beats from the back row.",
    layers: {
      perc_timpani: true,
      perc_snare: true,
      perc_bass_drum: true,
    },
    parts: {
      perc_timpani: 'C',
      perc_snare: 'B',
      perc_bass_drum: 'A',
    },
    tempo: 100,
  },
  {
    id: "sparkle-colors",
    name: "Sparkle Colors",
    emoji: "✨",
    description: "Bright percussion colors on top.",
    layers: {
      color_glockenspiel: true,
      color_xylophone: true,
      winds_flute: true,
    },
    parts: {
      color_glockenspiel: 'B',
      color_xylophone: 'B',
      winds_flute: 'A',
    },
    tempo: 110,
  },
  {
    id: "full-orchestra",
    name: "Full Orchestra",
    emoji: "🎼",
    description: "Everyone plays together!",
    layers: Object.fromEntries(
      [
        'strings_violin_1',
        'strings_violin_2',
        'strings_viola',
        'strings_cello',
        'strings_bass',
        'winds_flute',
        'winds_oboe',
        'winds_clarinet',
        'winds_bassoon',
        'brass_trumpet',
        'brass_horn',
        'brass_trombone',
        'brass_tuba',
        'perc_timpani',
        'perc_snare',
        'perc_bass_drum',
        'color_glockenspiel',
        'color_xylophone',
      ].map((id) => [id, true])
    ) as Record<string, boolean>,
    parts: {
      strings_violin_1: 'B',
      strings_violin_2: 'A',
      strings_viola: 'C',
      strings_cello: 'B',
      strings_bass: 'A',
      winds_flute: 'C',
      winds_oboe: 'A',
      winds_clarinet: 'B',
      winds_bassoon: 'A',
      brass_trumpet: 'A',
      brass_horn: 'B',
      brass_trombone: 'C',
      brass_tuba: 'A',
      perc_timpani: 'C',
      perc_snare: 'B',
      perc_bass_drum: 'A',
      color_glockenspiel: 'B',
      color_xylophone: 'C',
    },
    tempo: 115,
  },
];

// Learning tips about each instrument section
const INSTRUMENT_TIPS: Record<string, { title: string; facts: string[] }> = {
  // Strings
  violin: {
    title: "🎻 Violin",
    facts: [
      "Violins usually sit near the front of the orchestra.",
      "The violin often carries important melodies.",
      "Try different parts to change the musical shape!",
    ],
  },
  viola: {
    title: "🎻 Viola",
    facts: [
      "The viola sounds warmer and deeper than a violin.",
      "Violas often play the middle harmony notes.",
      "They help make the orchestra sound full!",
    ],
  },
  cello: {
    title: "🎻 Cello",
    facts: [
      "Cellos have a rich, warm sound.",
      "They can play both harmony and melody lines.",
      "Cellos sit in the string section near the front-middle.",
    ],
  },
  "double-bass": {
    title: "🎻 Double Bass",
    facts: [
      "The double bass is one of the tallest instruments in the orchestra!",
      "Bass notes are the foundation that everything sits on.",
      "Low sounds can feel like they vibrate in your chest.",
    ],
  },

  // Woodwinds
  flute: {
    title: "🪈 Flute",
    facts: [
      "Flutes can sound bright, light, and sparkly.",
      "Woodwinds sit behind the strings in many orchestras.",
      "The melody is the tune you can hum!",
    ],
  },
  oboe: {
    title: "🪈 Oboe",
    facts: [
      "The oboe has a distinctive, clear sound.",
      "Oboes use a double reed to make sound.",
      "Woodwinds add color and character to the orchestra.",
    ],
  },
  clarinet: {
    title: "🪈 Clarinet",
    facts: [
      "Clarinets can sound smooth and warm.",
      "They can play softly or very loudly!",
      "Woodwinds often blend beautifully together.",
    ],
  },
  bassoon: {
    title: "🪈 Bassoon",
    facts: [
      "The bassoon has a deep, rich woodwind sound.",
      "It can play bass lines or funny character sounds.",
      "Bassoons often support harmony in the middle-low range.",
    ],
  },

  // Brass
  trumpet: {
    title: "🎺 Trumpet",
    facts: [
      "Trumpets are bright and powerful.",
      "Brass can sound like heroic fanfares!",
      "Try faster parts to make it more exciting.",
    ],
  },
  "french-horn": {
    title: "🎺 French Horn",
    facts: [
      "French horns have a warm, noble sound.",
      "They often connect brass and woodwinds harmonically.",
      "Horns can sound gentle or very powerful.",
    ],
  },
  trombone: {
    title: "🎺 Trombone",
    facts: [
      "Trombones use a slide instead of buttons.",
      "They can sound bold and strong.",
      "Low brass adds power and depth.",
    ],
  },
  tuba: {
    title: "🎺 Tuba",
    facts: [
      "The tuba is one of the lowest brass instruments.",
      "It provides a deep foundation for brass sounds.",
      "Slow parts can feel like a giant heartbeat!",
    ],
  },

  // Percussion / Color
  timpani: {
    title: "🥁 Timpani",
    facts: [
      "Timpani drums can be tuned to play different notes!",
      "Percussion often sits at the back of the orchestra.",
      "Try different patterns to change the energy!",
    ],
  },
  "snare-drum": {
    title: "🥁 Snare Drum",
    facts: [
      "The snare drum has crisp, sharp hits.",
      "It’s great for marches and rhythm.",
      "Changing patterns can change the groove instantly.",
    ],
  },
  "bass-drum": {
    title: "🥁 Bass Drum",
    facts: [
      "The bass drum makes big, deep accents.",
      "It can make music feel dramatic and powerful.",
      "Try slower patterns for huge thunder sounds!",
    ],
  },
  glockenspiel: {
    title: "✨ Glockenspiel",
    facts: [
      "Glockenspiels are bright, bell-like instruments.",
      "They add sparkle on top of the orchestra.",
      "Fast parts can sound magical!",
    ],
  },
  xylophone: {
    title: "✨ Xylophone",
    facts: [
      "Xylophones are wooden bars hit with mallets.",
      "They sound bright and playful.",
      "Try rhythmic parts to make it dance!",
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

const INSTRUMENT_PART_VARIATIONS: Record<string, PartVariation[]> = {
  // Existing “core 5” mappings
  timpani: PART_VARIATIONS.percussion,
  flute: PART_VARIATIONS.melody,
  cello: PART_VARIATIONS.harmony,
  'double-bass': PART_VARIATIONS.bass,
  glockenspiel: PART_VARIATIONS.sparkle,

  // Expanded orchestra instruments (minimal, sample-backed patterns).
  violin: [
    {
      id: 'A',
      name: 'Warm Up (Strings)',
      description: 'Gentle violin tones',
      notes: ['G4', 'A4', 'C5', 'D5', 'E5', 'D5', 'C5', 'A4'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'easy',
    },
    {
      id: 'B',
      name: 'Arpeggio',
      description: 'Outline a bright chord',
      notes: ['C5', 'E5', 'C5', 'E5', 'D5', 'C5', 'A4', 'G4'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'easy',
    },
    {
      id: 'C',
      name: 'Quick Bows',
      description: 'Faster rhythmic energy',
      notes: ['G4', 'A4', 'C5', 'D5', 'E5', 'D5', 'C5', 'A4'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'medium',
    },
    {
      id: 'D',
      name: 'Minor Mood',
      description: 'A minor color in the strings',
      notes: ['A4', 'C5', 'E5', 'C5', 'A4', 'C5', 'E5', 'C5'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'medium',
    },
    {
      id: 'E',
      name: 'Progression Hints',
      description: 'Feels like a chord journey',
      notes: ['C5', 'E5', 'D5', 'C5', 'A4', 'C5', 'D5', 'E5'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'medium',
    },
    {
      id: 'F',
      name: 'Virtuoso Run',
      description: 'Fast violin run through available notes',
      notes: ['G4', 'A4', 'C5', 'D5', 'E5', 'D5', 'C5', 'A4', 'G4', 'A4', 'C5', 'D5'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'hard',
    },
  ],
  viola: [
    {
      id: 'A',
      name: 'Mellow Middle',
      description: 'Warm viola support',
      notes: ['C3', 'A3', 'C3', 'A3'],
      pattern: [600, 600, 600, 600],
      difficulty: 'easy',
    },
    {
      id: 'B',
      name: 'Octave Colors',
      description: 'Jump between low and high',
      notes: ['C3', 'C5', 'A3', 'A4'],
      pattern: [600, 600, 600, 600],
      difficulty: 'easy',
    },
    {
      id: 'C',
      name: 'Fast Pulse',
      description: 'Rhythmic viola pulse',
      notes: ['C3', 'A3', 'C3', 'A3', 'C3', 'A3', 'C3', 'A3'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'medium',
    },
    {
      id: 'D',
      name: 'Dark Tint',
      description: 'Lower viola emphasis',
      notes: ['C3', 'C3', 'A3', 'A3', 'C3', 'A3', 'C3', 'A3'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'medium',
    },
    {
      id: 'E',
      name: 'Wide Leaps',
      description: 'Jump between registers',
      notes: ['C3', 'C5', 'A3', 'A4', 'C3', 'C5', 'A3', 'A4'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'medium',
    },
    {
      id: 'F',
      name: 'Fast Alternation',
      description: 'Quick viola motion',
      notes: ['C3', 'A3', 'C3', 'A3', 'C3', 'A3', 'C3', 'A3', 'C5', 'A4', 'C5', 'A4'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'hard',
    },
  ],
  clarinet: [
    {
      id: 'A',
      name: 'Woody Triad',
      description: 'Clarinet chord tones',
      notes: ['C4', 'E4', 'G4', 'E4'],
      pattern: [600, 600, 600, 600],
      difficulty: 'easy',
    },
    {
      id: 'B',
      name: 'Bouncy',
      description: 'Light clarinet rhythm',
      notes: ['C4', 'E4', 'G4', 'E4', 'C4', 'E4', 'G4', 'E4'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'easy',
    },
    {
      id: 'C',
      name: 'Quick Tonguing',
      description: 'Faster repeated figures',
      notes: ['C4', 'E4', 'G4', 'E4', 'C4', 'E4', 'G4', 'E4', 'C4', 'E4', 'G4', 'E4'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'medium',
    },
    {
      id: 'D',
      name: 'Low Echo',
      description: 'More weight on C',
      notes: ['C4', 'C4', 'E4', 'C4', 'G4', 'E4', 'C4', 'C4'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'medium',
    },
    {
      id: 'E',
      name: 'Answer Phrases',
      description: 'Little question-and-answer patterns',
      notes: ['C4', 'E4', 'G4', 'G4', 'E4', 'C4', 'E4', 'C4'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'medium',
    },
    {
      id: 'F',
      name: 'Fast Reed Run',
      description: 'Quick triad motion',
      notes: ['C4', 'E4', 'G4', 'E4', 'C4', 'E4', 'G4', 'E4', 'C4', 'E4', 'G4', 'E4'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'hard',
    },
  ],
  oboe: [
    {
      id: 'A',
      name: 'Reed Song',
      description: 'Oboe sings chord tones',
      notes: ['C4', 'E4', 'G4', 'E4'],
      pattern: [600, 600, 600, 600],
      difficulty: 'easy',
    },
    {
      id: 'B',
      name: 'Echo',
      description: 'Call-and-response feel',
      notes: ['G4', 'E4', 'C4', 'E4', 'G4', 'E4', 'C4', 'E4'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'easy',
    },
    {
      id: 'C',
      name: 'Quick Reed',
      description: 'Faster oboe motion',
      notes: ['C4', 'E4', 'G4', 'E4', 'C4', 'E4', 'G4', 'E4'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'medium',
    },
    {
      id: 'D',
      name: 'Minor Hint',
      description: 'E-focused for a moodier feel',
      notes: ['E4', 'C4', 'E4', 'G4', 'E4', 'C4', 'E4', 'E4'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'medium',
    },
    {
      id: 'E',
      name: 'Sustained Calls',
      description: 'Longer tones, clearer phrases',
      notes: ['C4', 'E4', 'G4', 'E4'],
      pattern: [800, 600, 600, 400],
      difficulty: 'easy',
    },
    {
      id: 'F',
      name: 'Fast Double-Reed',
      description: 'Quick patterning',
      notes: ['C4', 'E4', 'G4', 'E4', 'C4', 'E4', 'G4', 'E4', 'C4', 'E4', 'G4', 'E4'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'hard',
    },
  ],
  bassoon: [
    {
      id: 'A',
      name: 'Deep Steps',
      description: 'Bassoon low foundation',
      notes: ['A2', 'C3', 'E3', 'G3'],
      pattern: [600, 600, 600, 600],
      difficulty: 'easy',
    },
    {
      id: 'B',
      name: 'Walking',
      description: 'Stepwise bassoon motion',
      notes: ['A2', 'C3', 'E3', 'G3', 'E3', 'C3', 'A2', 'C3'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'easy',
    },
    {
      id: 'C',
      name: 'Busy Reed',
      description: 'Faster bassoon groove',
      notes: ['A2', 'C3', 'E3', 'G3', 'E3', 'C3', 'A2', 'C3', 'E3', 'G3', 'E3', 'C3'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'medium',
    },
    {
      id: 'D',
      name: 'Minor Shadow',
      description: 'Darker emphasis on A',
      notes: ['A2', 'A2', 'C3', 'E3', 'A2', 'C3', 'E3', 'A2'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'medium',
    },
    {
      id: 'E',
      name: 'Progression Walk',
      description: 'Bassoon steps through harmony',
      notes: ['C3', 'E3', 'G3', 'E3', 'A2', 'C3', 'E3', 'C3'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'medium',
    },
    {
      id: 'F',
      name: 'Fast Low Run',
      description: 'Quick bassoon motion',
      notes: ['A2', 'C3', 'E3', 'G3', 'E3', 'C3', 'A2', 'C3', 'E3', 'G3', 'E3', 'C3'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'hard',
    },
  ],
  trumpet: [
    {
      id: 'A',
      name: 'Fanfare',
      description: 'Bright trumpet triad',
      notes: ['C4', 'E4', 'G4', 'E4'],
      pattern: [600, 600, 600, 600],
      difficulty: 'easy',
    },
    {
      id: 'B',
      name: 'March',
      description: 'Punchy trumpet rhythm',
      notes: ['C4', 'C4', 'E4', 'E4', 'G4', 'G4', 'E4', 'E4'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'easy',
    },
    {
      id: 'C',
      name: 'Fast Calls',
      description: 'Quick trumpet calls',
      notes: ['C4', 'E4', 'G4', 'E4', 'C4', 'E4', 'G4', 'E4'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'medium',
    },
    {
      id: 'D',
      name: 'Minor Glint',
      description: 'Leans on E for a moodier color',
      notes: ['E4', 'C4', 'E4', 'G4', 'E4', 'C4', 'E4', 'E4'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'medium',
    },
    {
      id: 'E',
      name: 'Chord Roots',
      description: 'Feels like a progression',
      notes: ['C4', 'C4', 'E4', 'E4', 'G4', 'G4', 'C4', 'C4'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'easy',
    },
    {
      id: 'F',
      name: 'Rapid Fanfare',
      description: 'Fast trumpet flourish',
      notes: ['C4', 'E4', 'G4', 'E4', 'C4', 'E4', 'G4', 'E4', 'C4', 'E4', 'G4', 'E4'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'hard',
    },
  ],
  'french-horn': [
    {
      id: 'A',
      name: 'Noble Horn',
      description: 'Warm horn tones',
      notes: ['C3', 'E3', 'G3', 'E3'],
      pattern: [600, 600, 600, 600],
      difficulty: 'easy',
    },
    {
      id: 'B',
      name: 'Horn Echo',
      description: 'Gentle call and response',
      notes: ['G3', 'E3', 'C3', 'E3', 'G3', 'E3', 'C3', 'E3'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'easy',
    },
    {
      id: 'C',
      name: 'Fast Horn',
      description: 'Quicker rhythmic horn',
      notes: ['C3', 'E3', 'G3', 'E3', 'C3', 'E3', 'G3', 'E3'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'medium',
    },
    {
      id: 'D',
      name: 'Low Glow',
      description: 'More weight on C and E',
      notes: ['C3', 'C3', 'E3', 'E3', 'C3', 'E3', 'C3', 'E3'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'medium',
    },
    {
      id: 'E',
      name: 'Horn Progression',
      description: 'A gentle chord-journey feel',
      notes: ['C3', 'E3', 'G3', 'E3', 'G3', 'E3', 'C3', 'E3'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'medium',
    },
    {
      id: 'F',
      name: 'Fast Brass Swell',
      description: 'Quick horn motion',
      notes: ['C3', 'E3', 'G3', 'E3', 'C3', 'E3', 'G3', 'E3', 'C3', 'E3', 'G3', 'E3'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'hard',
    },
  ],
  trombone: [
    {
      id: 'A',
      name: 'Slide Bass',
      description: 'Two-tone trombone groove',
      notes: ['C3', 'E3', 'C3', 'E3'],
      pattern: [600, 600, 600, 600],
      difficulty: 'easy',
    },
    {
      id: 'B',
      name: 'Offbeats',
      description: 'Punchy alternating hits',
      notes: ['C3', 'C3', 'E3', 'E3', 'C3', 'C3', 'E3', 'E3'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'easy',
    },
    {
      id: 'C',
      name: 'Rapid Slides',
      description: 'Fast alternation',
      notes: ['C3', 'E3', 'C3', 'E3', 'C3', 'E3', 'C3', 'E3', 'C3', 'E3', 'C3', 'E3'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'medium',
    },
    {
      id: 'D',
      name: 'Heavy Hits',
      description: 'More space between notes',
      notes: ['C3', 'E3', 'C3', 'E3'],
      pattern: [800, 400, 800, 400],
      difficulty: 'easy',
    },
    {
      id: 'E',
      name: 'Slide Pulse',
      description: 'Steady driving alternation',
      notes: ['C3', 'E3', 'C3', 'E3', 'C3', 'E3', 'C3', 'E3'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'medium',
    },
    {
      id: 'F',
      name: 'Fast Slide',
      description: 'Quick alternating brass',
      notes: ['C3', 'E3', 'C3', 'E3', 'C3', 'E3', 'C3', 'E3', 'C3', 'E3', 'C3', 'E3'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'hard',
    },
  ],
  tuba: [
    {
      id: 'A',
      name: 'Big Bass',
      description: 'Deep tuba pulse',
      notes: ['A1', 'A1', 'A2', 'A1'],
      pattern: [600, 600, 600, 600],
      difficulty: 'easy',
    },
    {
      id: 'B',
      name: 'Heartbeat',
      description: 'Steady low thump',
      notes: ['A1', 'A1', 'A1', 'A1', 'A2', 'A1', 'A1', 'A1'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'easy',
    },
    {
      id: 'C',
      name: 'Fast Oom',
      description: 'Quick oom-pah feel',
      notes: ['A1', 'A2', 'A1', 'A2', 'A1', 'A2', 'A1', 'A2'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'medium',
    },
    {
      id: 'D',
      name: 'Low Drone',
      description: 'Heavy low A foundation',
      notes: ['A1', 'A1', 'A1', 'A1'],
      pattern: [900, 500, 500, 500],
      difficulty: 'easy',
    },
    {
      id: 'E',
      name: 'Oom Pah',
      description: 'Alternating low and higher A',
      notes: ['A1', 'A2', 'A1', 'A2', 'A1', 'A2', 'A1', 'A2'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'medium',
    },
    {
      id: 'F',
      name: 'Rapid Oom',
      description: 'Fast alternation',
      notes: ['A1', 'A2', 'A1', 'A2', 'A1', 'A2', 'A1', 'A2', 'A1', 'A2', 'A1', 'A2'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'hard',
    },
  ],
  'snare-drum': [
    {
      id: 'A',
      name: 'Backbeat',
      description: 'Simple snare hits',
      notes: ['A1', 'A1', 'A1', 'A1'],
      pattern: [600, 600, 600, 600],
      difficulty: 'easy',
    },
    {
      id: 'B',
      name: 'March Snare',
      description: 'March-style rhythm',
      notes: ['A1', 'A1', 'A1', 'A1', 'A1', 'A1', 'A1', 'A1'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'easy',
    },
    {
      id: 'C',
      name: 'Drum Roll',
      description: 'Faster roll feel',
      notes: ['A1', 'A1', 'A1', 'A1', 'A1', 'A1', 'A1', 'A1', 'A1', 'A1', 'A1', 'A1'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'medium',
    },
    {
      id: 'D',
      name: 'Offbeat Snap',
      description: 'Snare accents with space',
      notes: ['A1', 'A1', 'A1', 'A1', 'A1', 'A1'],
      pattern: [400, 800, 400, 400, 200, 200],
      difficulty: 'medium',
    },
    {
      id: 'E',
      name: 'Fill',
      description: 'Little drum fill at the end',
      notes: ['A1', 'A1', 'A1', 'A1', 'A1', 'A1', 'A1', 'A1'],
      pattern: [600, 600, 300, 300, 200, 200, 100, 100],
      difficulty: 'medium',
    },
    {
      id: 'F',
      name: 'Super Roll',
      description: 'Very fast snare roll',
      notes: ['A1', 'A1', 'A1', 'A1', 'A1', 'A1', 'A1', 'A1', 'A1', 'A1', 'A1', 'A1'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'hard',
    },
  ],
  'bass-drum': [
    {
      id: 'A',
      name: 'Boom',
      description: 'Big bass drum hits',
      notes: ['A0', 'A0', 'A0', 'A0'],
      pattern: [600, 600, 600, 600],
      difficulty: 'easy',
    },
    {
      id: 'B',
      name: 'Boom… Boom…',
      description: 'Slower accents',
      notes: ['A0', 'A0', 'A0', 'A0'],
      pattern: [1200, 400, 400, 400],
      difficulty: 'easy',
    },
    {
      id: 'C',
      name: 'Fast Boom',
      description: 'Quicker accents',
      notes: ['A0', 'A0', 'A0', 'A0', 'A0', 'A0', 'A0', 'A0'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'medium',
    },
    {
      id: 'D',
      name: 'Slow Thunder',
      description: 'Big dramatic accents',
      notes: ['A0', 'A0', 'A0', 'A0'],
      pattern: [900, 500, 500, 500],
      difficulty: 'easy',
    },
    {
      id: 'E',
      name: 'Pulse Accents',
      description: 'Accents on a steady pulse',
      notes: ['A0', 'A0', 'A0', 'A0', 'A0', 'A0'],
      pattern: [400, 400, 800, 400, 200, 200],
      difficulty: 'medium',
    },
    {
      id: 'F',
      name: 'Rapid Thunder',
      description: 'Fast bass drum rumble',
      notes: ['A0', 'A0', 'A0', 'A0', 'A0', 'A0', 'A0', 'A0', 'A0', 'A0', 'A0', 'A0'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'hard',
    },
  ],
  xylophone: [
    {
      id: 'A',
      name: 'Bright Triad',
      description: 'Cheerful xylophone tones',
      notes: ['C5', 'E5', 'G5', 'E5'],
      pattern: [600, 600, 600, 600],
      difficulty: 'easy',
    },
    {
      id: 'B',
      name: 'Bouncy Bars',
      description: 'Fun rhythmic pattern',
      notes: ['C5', 'E5', 'G5', 'E5', 'C5', 'E5', 'G5', 'E5'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'easy',
    },
    {
      id: 'C',
      name: 'Quick Sparkle',
      description: 'Faster mallet motion',
      notes: ['C5', 'E5', 'G5', 'E5', 'C5', 'E5', 'G5', 'E5'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'medium',
    },
    {
      id: 'D',
      name: 'Minor Hint',
      description: 'E-focused shimmer',
      notes: ['E5', 'C5', 'E5', 'G5', 'E5', 'C5', 'E5', 'E5'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'medium',
    },
    {
      id: 'E',
      name: 'Echo Bars',
      description: 'Repeating echo pattern',
      notes: ['G5', 'G5', 'E5', 'E5', 'C5', 'C5', 'E5', 'E5'],
      pattern: [300, 300, 300, 300, 300, 300, 300, 300],
      difficulty: 'easy',
    },
    {
      id: 'F',
      name: 'Mallet Run',
      description: 'Fast xylophone run',
      notes: ['C5', 'E5', 'G5', 'E5', 'C5', 'G5', 'E5', 'C5', 'G5', 'E5', 'C5', 'G5'],
      pattern: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
      difficulty: 'hard',
    },
  ],
};

interface OrchestraLayer {
  id: string;
  name: string;
  family: 'strings' | 'woodwinds' | 'brass' | 'percussion' | 'color';
  seat: { row: number; xPct: number; yPct: number; scale: number; zIndex: number };
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
  selectedPart: PartId;
  variations: PartVariation[];
}

interface OrchestraSeatConfig {
  id: string;
  name: string;
  family: OrchestraLayer['family'];
  instrumentName: string;
  animal: string;
  emoji: string;
  color: string;
  bgColor: string;
  character?: OrchestraLayer['character'];
  description: string;
  defaultVolume: number;
  seat: OrchestraLayer['seat'];
}

const ORCHESTRA_SEATS: OrchestraSeatConfig[] = [
  // Row 1 (front - mostly strings)
  {
    id: 'strings_violin_1',
    name: 'Violin I',
    family: 'strings',
    instrumentName: 'violin',
    animal: 'Bird',
    emoji: '🐦',
    color: 'from-sky-400 to-blue-600',
    bgColor: 'bg-sky-500',
    character: 'bird',
    description: 'Bright soaring strings!',
    defaultVolume: 70,
    seat: { row: 1, xPct: 25, yPct: 82, scale: 0.85, zIndex: 40 },
  },
  {
    id: 'strings_violin_2',
    name: 'Violin II',
    family: 'strings',
    instrumentName: 'violin',
    animal: 'Bird',
    emoji: '🐦',
    color: 'from-sky-500 to-indigo-600',
    bgColor: 'bg-indigo-500',
    character: null,
    description: 'Second violin support!',
    defaultVolume: 65,
    seat: { row: 1, xPct: 41, yPct: 82, scale: 0.85, zIndex: 40 },
  },
  {
    id: 'strings_viola',
    name: 'Viola',
    family: 'strings',
    instrumentName: 'viola',
    animal: 'Fox',
    emoji: '🦊',
    color: 'from-violet-500 to-purple-700',
    bgColor: 'bg-violet-600',
    character: null,
    description: 'Warm middle strings!',
    defaultVolume: 62,
    seat: { row: 1, xPct: 59, yPct: 82, scale: 0.85, zIndex: 40 },
  },
  {
    id: 'strings_cello',
    name: 'Cello',
    family: 'strings',
    instrumentName: 'cello',
    animal: 'Bear',
    emoji: '🐻',
    color: 'from-emerald-500 to-green-700',
    bgColor: 'bg-emerald-600',
    character: 'lion',
    description: 'Rich warm support!',
    defaultVolume: 60,
    seat: { row: 1, xPct: 75, yPct: 82, scale: 0.85, zIndex: 40 },
  },

  // Row 2 (winds + bass)
  {
    id: 'strings_bass',
    name: 'Double Bass',
    family: 'strings',
    instrumentName: 'double-bass',
    animal: 'Whale',
    emoji: '🐋',
    color: 'from-amber-600 to-orange-700',
    bgColor: 'bg-amber-600',
    character: null,
    description: 'Deep foundation!',
    defaultVolume: 65,
    seat: { row: 2, xPct: 18, yPct: 74, scale: 0.75, zIndex: 30 },
  },
  {
    id: 'winds_flute',
    name: 'Flute',
    family: 'woodwinds',
    instrumentName: 'flute',
    animal: 'Butterfly',
    emoji: '🦋',
    color: 'from-cyan-400 to-blue-600',
    bgColor: 'bg-cyan-500',
    character: null,
    description: 'Sparkly melodies!',
    defaultVolume: 68,
    seat: { row: 2, xPct: 32, yPct: 74, scale: 0.75, zIndex: 30 },
  },
  {
    id: 'winds_oboe',
    name: 'Oboe',
    family: 'woodwinds',
    instrumentName: 'oboe',
    animal: 'Duck',
    emoji: '🦆',
    color: 'from-teal-500 to-emerald-600',
    bgColor: 'bg-teal-600',
    character: null,
    description: 'Reed song!',
    defaultVolume: 60,
    seat: { row: 2, xPct: 46, yPct: 74, scale: 0.75, zIndex: 30 },
  },
  {
    id: 'winds_clarinet',
    name: 'Clarinet',
    family: 'woodwinds',
    instrumentName: 'clarinet',
    animal: 'Cat',
    emoji: '🐱',
    color: 'from-slate-500 to-slate-700',
    bgColor: 'bg-slate-600',
    character: null,
    description: 'Smooth woodwind tone!',
    defaultVolume: 60,
    seat: { row: 2, xPct: 60, yPct: 74, scale: 0.75, zIndex: 30 },
  },
  {
    id: 'winds_bassoon',
    name: 'Bassoon',
    family: 'woodwinds',
    instrumentName: 'bassoon',
    animal: 'Owl',
    emoji: '🦉',
    color: 'from-lime-700 to-emerald-800',
    bgColor: 'bg-lime-700',
    character: null,
    description: 'Deep woodwind voice!',
    defaultVolume: 58,
    seat: { row: 2, xPct: 74, yPct: 74, scale: 0.75, zIndex: 30 },
  },

  // Row 3 (brass)
  {
    id: 'brass_trumpet',
    name: 'Trumpet',
    family: 'brass',
    instrumentName: 'trumpet',
    animal: 'Rooster',
    emoji: '🐓',
    color: 'from-yellow-400 to-orange-500',
    bgColor: 'bg-yellow-500',
    character: null,
    description: 'Bright fanfares!',
    defaultVolume: 62,
    seat: { row: 3, xPct: 26, yPct: 65, scale: 0.65, zIndex: 20 },
  },
  {
    id: 'brass_horn',
    name: 'French Horn',
    family: 'brass',
    instrumentName: 'french-horn',
    animal: 'Deer',
    emoji: '🦌',
    color: 'from-amber-500 to-yellow-700',
    bgColor: 'bg-amber-600',
    character: null,
    description: 'Warm noble brass!',
    defaultVolume: 58,
    seat: { row: 3, xPct: 40, yPct: 65, scale: 0.65, zIndex: 20 },
  },
  {
    id: 'brass_trombone',
    name: 'Trombone',
    family: 'brass',
    instrumentName: 'trombone',
    animal: 'Lion',
    emoji: '🦁',
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-600',
    character: null,
    description: 'Powerful low brass!',
    defaultVolume: 58,
    seat: { row: 3, xPct: 54, yPct: 65, scale: 0.65, zIndex: 20 },
  },
  {
    id: 'brass_tuba',
    name: 'Tuba',
    family: 'brass',
    instrumentName: 'tuba',
    animal: 'Elephant',
    emoji: '🐘',
    color: 'from-red-600 to-rose-800',
    bgColor: 'bg-rose-700',
    character: null,
    description: 'Deep brass foundation!',
    defaultVolume: 60,
    seat: { row: 3, xPct: 68, yPct: 65, scale: 0.65, zIndex: 20 },
  },

  // Row 4 (percussion + color)
  {
    id: 'perc_timpani',
    name: 'Timpani',
    family: 'percussion',
    instrumentName: 'timpani',
    animal: 'Elephant',
    emoji: '🐘',
    color: 'from-purple-500 to-purple-700',
    bgColor: 'bg-purple-500',
    character: 'monkey',
    description: 'Dramatic tuned drums!',
    defaultVolume: 78,
    seat: { row: 4, xPct: 18, yPct: 56, scale: 0.55, zIndex: 10 },
  },
  {
    id: 'perc_snare',
    name: 'Snare Drum',
    family: 'percussion',
    instrumentName: 'snare-drum',
    animal: 'Monkey',
    emoji: '🐵',
    color: 'from-stone-400 to-stone-700',
    bgColor: 'bg-stone-600',
    character: null,
    description: 'Crisp marching hits!',
    defaultVolume: 55,
    seat: { row: 4, xPct: 34, yPct: 56, scale: 0.55, zIndex: 10 },
  },
  {
    id: 'perc_bass_drum',
    name: 'Bass Drum',
    family: 'percussion',
    instrumentName: 'bass-drum',
    animal: 'Hippo',
    emoji: '🦛',
    color: 'from-neutral-700 to-neutral-900',
    bgColor: 'bg-neutral-800',
    character: null,
    description: 'Big booming accents!',
    defaultVolume: 55,
    seat: { row: 4, xPct: 50, yPct: 56, scale: 0.55, zIndex: 10 },
  },
  {
    id: 'color_glockenspiel',
    name: 'Glockenspiel',
    family: 'color',
    instrumentName: 'glockenspiel',
    animal: 'Fairy',
    emoji: '🧚',
    color: 'from-pink-400 to-rose-500',
    bgColor: 'bg-pink-400',
    character: null,
    description: 'Magical bell sparkle!',
    defaultVolume: 50,
    seat: { row: 4, xPct: 66, yPct: 56, scale: 0.55, zIndex: 10 },
  },
  {
    id: 'color_xylophone',
    name: 'Xylophone',
    family: 'color',
    instrumentName: 'xylophone',
    animal: 'Parrot',
    emoji: '🦜',
    color: 'from-fuchsia-500 to-purple-700',
    bgColor: 'bg-fuchsia-600',
    character: null,
    description: 'Bright wooden clicks!',
    defaultVolume: 55,
    seat: { row: 4, xPct: 82, yPct: 56, scale: 0.55, zIndex: 10 },
  },
];

function createInitialLayers(): OrchestraLayer[] {
  return ORCHESTRA_SEATS.map((seat) => ({
    id: seat.id,
    name: seat.name,
    family: seat.family,
    seat: seat.seat,
    instrumentName: seat.instrumentName,
    animal: seat.animal,
    emoji: seat.emoji,
    color: seat.color,
    bgColor: seat.bgColor,
    isPlaying: false,
    volume: seat.defaultVolume,
    currentNoteIndex: 0,
    character: seat.character ?? null,
    description: seat.description,
    selectedPart: 'A',
    variations: INSTRUMENT_PART_VARIATIONS[seat.instrumentName] ?? PART_VARIATIONS.melody,
  }));
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
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);

  const [layers, setLayers] = useState<OrchestraLayer[]>(() => createInitialLayers());

  const activeSourcesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());
  const intervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const animationFrameRef = useRef<Map<string, number>>(new Map());
  const isPlayingRef = useRef<Map<string, boolean>>(new Map());
    const decorativeOrbs = generateDecorativeOrbs();

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

  const updateLayerPart = useCallback((layerId: string, partId: PartId) => {
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
        const partPool = layer.variations.map(v => v.id);
        const randomPart = partPool[Math.floor(Math.random() * partPool.length)] ?? 'A';
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
          };
  }, []);

  const toggleLayer = useCallback(async (layerId: string) => {
    setLayers(prev => {
      const updated = prev.map(layer => {
        if (layer.id === layerId) {
          const newIsPlaying = !layer.isPlaying;

          if (newIsPlaying) {
            playLayerPattern(layer);
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
        const shouldPlay = Boolean((preset.layers as Record<string, boolean>)[layer.id]);
        const selectedPart = ((preset.parts as Record<string, PartId>)[layer.id] ?? 'A') as PartId;
        
        const updatedLayer = { 
          ...layer, 
          isPlaying: shouldPlay,
          selectedPart
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
      // Seat hotkeys
      // 1-9 = seats 1-9, 0 = seat 10, QWERTYUI = seats 11-18
      const seatHotkeys: Record<string, number> = {
        '1': 0,
        '2': 1,
        '3': 2,
        '4': 3,
        '5': 4,
        '6': 5,
        '7': 6,
        '8': 7,
        '9': 8,
        '0': 9,
        q: 10,
        w: 11,
        e: 12,
        r: 13,
        t: 14,
        y: 15,
        u: 16,
        i: 17,
      };

      const key = e.key.toLowerCase();
      if (key in seatHotkeys) {
        e.preventDefault();
        const layerIndex = seatHotkeys[key]!;
        if (layerIndex < layers.length) {
          const layer = layers[layerIndex];
          setSelectedSeatId(layer.id);

          if (e.shiftKey) {
            const currentPartIndex = layer.variations.findIndex(v => v.id === layer.selectedPart);
            const safeIndex = currentPartIndex >= 0 ? currentPartIndex : 0;
            const nextPartIndex = layer.variations.length > 0 ? (safeIndex + 1) % layer.variations.length : 0;
            const nextPart = layer.variations[nextPartIndex]?.id ?? 'A';
            updateLayerPart(layer.id, nextPart);
          } else {
            toggleLayer(layer.id);
          }
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
    // Determine character image based on instrument
    let characterImage = layer.instrumentName.replace(/-/g, '_');
    
    // Special case for Violin II (different character)
    if (layer.id === 'strings_violin_2') {
      characterImage = 'violin_alt';
    }

    // Special case: Increase size for Violin I, II, Viola & Cello (custom assets are larger/different scale)
    let finalSize = size;
    if (layer.id === 'strings_violin_1' || layer.id === 'strings_violin_2' || layer.id === 'strings_viola' || layer.id === 'strings_cello') {
      finalSize = "w-32 h-32";
    }

    const imageUrl = `/aoc/characters/aoc_character_${characterImage}.png`;

    return (
      <div className={`${finalSize} relative flex items-center justify-center`}>
        <img
          src={imageUrl}
          alt={`${layer.animal} playing ${layer.instrumentName}`}
          className={`block w-full h-full object-contain ${layer.isPlaying ? 'animate-tilt-subtle' : ''}`}
        />
      </div>
    );
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
  const totalSeats = layers.length;
  const selectedSeat = selectedSeatId ? layers.find(l => l.id === selectedSeatId) : undefined;
  const activeTip = showTip ? INSTRUMENT_TIPS[showTip] : undefined;

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
              {activeTip?.title ?? "🎵 Orchestra"}
            </h3>
            <ul className="space-y-3">
              {activeTip?.facts?.map((fact, i) => (
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

      <div className="flex-1 flex flex-col items-center justify-start z-10 max-w-6xl mx-auto w-full space-y-6 pt-16 pb-80 md:pb-72">

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
            {activeLayers === 0 && "Tap a musician to start the orchestra! 🎵"}
            {activeLayers > 0 && activeLayers < totalSeats && `${activeLayers}/${totalSeats} playing — add more sections! 🎶`}
            {activeLayers === totalSeats && "🎉 FULL ORCHESTRA! You're a master conductor! 🎉"}
          </p>
        </div>

        {/* Stage View (Conductor POV) */}
        <div
          className={`w-full flex-1 min-h-[420px] sm:min-h-[520px] relative overflow-hidden ${playfulShapes.rounded.container} ${playfulShapes.shadows.card} border border-white/20`}
          aria-label="Orchestra stage"
        >
          {/* Back wall */}
          <div
            className="absolute left-0 right-0 top-0 h-1/2 bg-cover bg-center"
            // Prefer a custom backwall image if present; fall back to the default.
            // If the first URL 404s, the second background layer will still render.
            style={{
              backgroundImage:
                "url('/aoc/stage/aoc_stage_backwall_custom.png'), url('/aoc/stage/aoc_stage_backwall.png')",
              // Show the *bottom half* of the back wall image in the top half of the stage.
              // Custom image scaled to 102.5% to align curtains with the floor image.
              // Fallback image remains at 100%.
              backgroundSize: "102.5% 205%, 100% 200%",
              backgroundPosition: "center bottom, center bottom",
              backgroundRepeat: "no-repeat, no-repeat",
            }}
          />

          {/* Floor */}
          <div
            className="absolute left-0 right-0 bottom-0 h-1/2 bg-cover bg-bottom"
            // Prefer a custom floor image if present; fall back to the default.
            // If the first URL 404s, the second background layer will still render.
            style={{
              backgroundImage:
                "url('/aoc/stage/aoc_stage_floor_custom.png'), url('/aoc/stage/aoc_stage_floor.png')",
              // Show the *top half* of the floor image in the bottom half of the stage.
              backgroundSize: "100% 200%, 100% 200%",
              backgroundPosition: "center top, center top",
              backgroundRepeat: "no-repeat, no-repeat",
            }}
          />

          {/* Atmospheric overlays */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/45" />

          {/* Seats */}
          {layers.map((layer) => {
            const isSelected = selectedSeatId === layer.id;
            return (
              <button
                key={layer.id}
                type="button"
                disabled={!samplesLoaded}
                onClick={() => {
                  if (selectedSeatId === layer.id) {
                    toggleLayer(layer.id);
                  } else {
                    setSelectedSeatId(layer.id);
                  }
                }}
                className={`absolute touch-target select-none outline-none rounded-2xl disabled:opacity-60 focus-visible:ring-4 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/30 ${
                  isSelected ? "ring-4 ring-blue-300/80" : ""
                }`}
                style={{
                  left: `${layer.seat.xPct}%`,
                  top: `${layer.seat.yPct}%`,
                  transform: `translate(-50%, -50%) scale(${layer.seat.scale})`,
                  zIndex: layer.seat.zIndex,
                }}
                aria-label={`${layer.name} seat`}
              >
                <div className="relative flex flex-col items-center">
                  {/* Seat Visuals Container - Wider to fit effects without shrinking chair */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-48 pointer-events-none flex items-end justify-center">
                    
                    {/* Chair */}
                    {layer.isPlaying ? (
                      <img
                        // Use the same ring-chair asset as the selected state to keep sizing consistent.
                        src={chairSelectedOverlayUrl}
                        alt=""
                        className="w-full h-full object-contain object-bottom"
                      />
                    ) : isSelected ? (
                      <img
                        src={chairSelectedOverlayUrl}
                        alt=""
                        className="w-full h-full object-contain object-bottom"
                      />
                    ) : (
                      <img
                        src={chairUrl}
                        alt=""
                        className="w-full h-full object-contain object-bottom opacity-95"
                      />
                    )}

                    {/* Character */}
                    <div className="absolute inset-x-0 bottom-16 flex justify-center">
                      {renderCharacter(layer, "w-20 h-20")}
                    </div>
                  </div>

                  {/* Spacer to maintain button size flow if needed, or just rely on w-32 h-44 of button */}
                  <div className="w-32 h-44" /> 

                  {/* Seat label */}
                  <div className="mt-1 px-2 py-0.5 rounded-full bg-black/40 text-white text-[10px] font-semibold tracking-wide z-50">
                    {layer.name} · {layer.selectedPart}
                  </div>
                </div>
              </button>
            );
          })}
        </div>


      </div>

      {/* Conductor Podium (always visible) */}
      <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 origin-bottom transform scale-90 sm:scale-100">
        <div className="max-w-6xl mx-auto">
          <div className={`relative overflow-hidden ${playfulShapes.rounded.container} ${playfulShapes.shadows.card}`}>
            <img src={podiumShadowUrl} alt="" className="absolute inset-0 w-full h-full opacity-70 pointer-events-none" />
            <img src={podiumBaseUrl} alt="" className="absolute inset-0 w-full h-full opacity-90 pointer-events-none" />
            <img src={podiumTrimUrl} alt="" className="absolute inset-0 w-full h-full opacity-70 pointer-events-none" />

            <div className="relative p-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Global controls */}
                <div className="bg-black/35 rounded-2xl p-4 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-bold tracking-wide">Conductor Podium</div>
                    {samplesLoaded && usingSamples && (
                      <span className="text-xs bg-emerald-500/20 border border-emerald-300/30 px-2 py-1 rounded-full">
                        ✨ Real Instruments
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      onClick={playAllLayers}
                      disabled={activeLayers === totalSeats || !samplesLoaded}
                      size="sm"
                      className={`${playfulComponents.button.primary}`}
                    >
                      <Music className="w-4 h-4 mr-2" />
                      Play All
                    </Button>
                    <Button
                      onClick={stopAllLayers}
                      disabled={activeLayers === 0}
                      size="sm"
                      variant="outline"
                      className="border-2"
                    >
                      <VolumeX className="w-4 h-4 mr-2" />
                      Stop All
                    </Button>
                    <Button
                      onClick={() => setShowPresets(true)}
                      size="sm"
                      variant="outline"
                      className="border-2 border-purple-400"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Presets
                    </Button>
                    <Button
                      onClick={randomizeAllParts}
                      size="sm"
                      variant="outline"
                      className="border-2 border-orange-400"
                    >
                      <Shuffle className="w-4 h-4 mr-2" />
                      Random Mix
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-3">
                    <div className="flex items-center gap-3">
                      <Gauge className="w-4 h-4 opacity-80" />
                      <div className="flex-1">
                        <div className="text-xs opacity-80 mb-1">Baton speed (tempo)</div>
                        <Slider
                          value={[tempo]}
                          onValueChange={(values) => setTempo(values[0])}
                          min={40}
                          max={180}
                          step={5}
                          className="w-full"
                          aria-label="Tempo"
                        />
                      </div>
                      <div className="text-xs font-semibold w-14 text-right">{tempo} BPM</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Volume2 className="w-4 h-4 opacity-80" />
                      <div className="flex-1">
                        <div className="text-xs opacity-80 mb-1">Hall volume</div>
                        <Slider
                          value={[masterVolume]}
                          onValueChange={(values) => setMasterVolume(values[0])}
                          min={0}
                          max={100}
                          step={1}
                          className="w-full"
                          aria-label="Master volume"
                        />
                      </div>
                      <div className="text-xs font-semibold w-12 text-right">{masterVolume}%</div>
                    </div>
                  </div>

                  {/* Mini-map (mobile) */}
                  <div className="mt-4 md:hidden">
                    <div className="text-xs opacity-80 mb-2">Mini-map (tap a dot to select)</div>
                    <div className="relative w-full h-28 rounded-xl border border-white/15 bg-black/20 overflow-hidden">
                      {layers.map((layer) => {
                        const isSelected = selectedSeatId === layer.id;
                        const isPlaying = layer.isPlaying;
                        const dotColor = isSelected ? "bg-sky-400" : isPlaying ? "bg-yellow-300" : "bg-slate-300/70";

                        return (
                          <button
                            key={layer.id}
                            type="button"
                            onClick={() => setSelectedSeatId(layer.id)}
                            className={`touch-target absolute -translate-x-1/2 -translate-y-1/2 outline-none focus-visible:ring-4 focus-visible:ring-white/40`}
                            style={{ left: `${layer.seat.xPct}%`, top: `${layer.seat.yPct}%` }}
                            aria-label={`Select ${layer.name}`}
                          >
                            <span className={`block w-3 h-3 rounded-full ${dotColor}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Selected seat inspector */}
                <div className="bg-black/35 rounded-2xl p-4 text-white">
                  <div className="font-bold tracking-wide">Score / Selected Seat</div>

                  {!selectedSeat ? (
                    <div className="mt-3 text-sm opacity-80">Select a musician on the stage to conduct their part.</div>
                  ) : (
                    <>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold">{selectedSeat.name}</div>
                          <div className="text-xs opacity-80">{selectedSeat.description}</div>
                        </div>
                        <Button
                          onClick={() => toggleLayer(selectedSeat.id)}
                          disabled={!samplesLoaded}
                          size="sm"
                          className={`${playfulComponents.button.primary}`}
                        >
                          {selectedSeat.isPlaying ? "Stop" : "Cue"}
                        </Button>
                      </div>

                      <div className="mt-3">
                        <div className="text-xs opacity-80 mb-2">Part (A–F)</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedSeat.variations.map((variation) => (
                            <button
                              key={variation.id}
                              type="button"
                              onClick={() => updateLayerPart(selectedSeat.id, variation.id)}
                              className={`touch-target px-3 py-2 rounded-xl text-sm font-bold border transition-colors outline-none focus-visible:ring-4 focus-visible:ring-white/40 ${
                                selectedSeat.selectedPart === variation.id
                                  ? "bg-white text-gray-900 border-white"
                                  : "bg-white/10 border-white/20 hover:bg-white/15"
                              }`}
                              title={`${variation.name}: ${variation.description}`}
                            >
                              {variation.id}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 grid gap-2">
                        <div className="text-xs opacity-80">
                          {selectedSeat.variations.find(v => v.id === selectedSeat.selectedPart)?.name}
                        </div>
                        <div className="text-xs opacity-70">
                          {selectedSeat.variations.find(v => v.id === selectedSeat.selectedPart)?.description}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        <Volume2 className="w-4 h-4 opacity-80" />
                        <div className="flex-1">
                          <div className="text-xs opacity-80 mb-1">Seat volume</div>
                          <Slider
                            value={[selectedSeat.volume]}
                            onValueChange={(values) => updateLayerVolume(selectedSeat.id, values[0])}
                            min={0}
                            max={100}
                            step={1}
                            className="w-full"
                            aria-label={`${selectedSeat.name} volume`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowTip(selectedSeat.instrumentName)}
                          className="touch-target p-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                          title="Learn about this instrument"
                          aria-label="Learn about this instrument"
                        >
                          <Lightbulb className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
