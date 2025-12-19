/**
 * Animal Orchestra Conductor - Data Constants
 */

import type { PartId, PartVariation, PresetArrangement, OrchestraSeatConfig, InstrumentTip } from './types';

// Pre-made arrangements for kids to explore
export const PRESET_ARRANGEMENTS: PresetArrangement[] = [
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
export const INSTRUMENT_TIPS: Record<string, InstrumentTip> = {
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
      "It's great for marches and rhythm.",
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

export const PART_VARIATIONS: Record<string, PartVariation[]> = {
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

export const INSTRUMENT_PART_VARIATIONS: Record<string, PartVariation[]> = {
  // Existing "core 5" mappings
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

export const ORCHESTRA_SEATS: OrchestraSeatConfig[] = [
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
