# Da Capo Dungeon

A music education roguelike where students conquer 100 floors of procedurally generated dungeons by solving music theory challenges.

## Overview

Da Capo Dungeon is an educational game that combines turn-based dungeon exploration with music theory practice. Students navigate through themed dungeon levels, battling enemies by correctly answering music questions. The game adapts difficulty across 100 floors and includes consumables, buffs, special floors, and boss battles.

## Key Features

### 🎵 8 Challenge Types
- **Note Reading** – Identify musical notes on treble and bass clefs
- **Rhythm Tap** – Tap rhythms in time with the beat (supports rests, triplets, dotted notes)
- **Intervals** – Identify melodic intervals (high/low, step/skip, or standard naming)
- **Dynamics** – Match Italian terms to volume levels with ordering challenges
- **Tempo** – Learn tempo markings with ordering challenges
- **Symbols** – Identify musical notation symbols and Italian terms
- **Terms** – General music theory vocabulary
- **Timbre** – Identify instrument families and specific instruments by sound

### 🏰 100 Floors with Increasing Difficulty
- Floors 1-12: Tier 1 (K-1) content
- Floors 13-18: Tier 1 → Tier 2 transition
- Floors 19-35: Tier 2 (Grades 2-3)
- Floors 36-42: Tier 2 → Tier 3 transition
- Floors 43-68: Tier 3 (Grades 4-5)
- Floors 69-75: Tier 3 → Tier 4 transition
- Floors 76-88: Tier 4 (Grades 6-8)
- Floors 89-94: Tier 4 → Tier 5 transition
- Floors 95-100: Tier 5 (High School)

### 🎮 Gameplay Elements
- **Procedural Dungeon Generation** – Each floor is unique with themed environments
- **Enemy Variety** – Ghosts, skeletons, dragons, goblins, slimes, bats, wraiths, spiders, shades, sirens, and wizards
- **Consumables** – Potions, keys, gold
- **Buff System** – Persistent buffs from shops, passive buffs you can arm before battles
- **Special Floors** – Loot floors, healing pools, fortune tellers, challenge arenas
- **Boss Battles** – Mini-bosses and big bosses at strategic intervals
- **Themes** – 8 visual themes with different wall/floor aesthetics

### 👨‍🏫 Teacher Dashboard
- Custom question pools via web interface
- Community-shared question sets
- Real-time challenge editing
- Character selection for students

## Grade Level & Tier System

The game uses a 5-tier difficulty system aligned with K-12 music education standards:

| Tier | Grade Level | Challenge Characteristics |
|------|-------------|---------------------------|
| **Tier 1** | K-1 | Simple vocabulary, binary choices, basic note reading on staff spaces |
| **Tier 2** | 2-3 | 4-choice multiple choice, staff lines + spaces, rests in rhythm |
| **Tier 3** | 4-5 | Ordering challenges, ledger lines, dotted notes, syncopation |
| **Tier 4** | 6-8 | Compound intervals, bass clef, advanced symbols, Italian terms |
| **Tier 5** | High School | Subtle distinctions (same-family instruments), complex rhythms, advanced terminology |

## File Structure

```
challenges/
├── VocabularyChallenge.tsx      # Music terms with 3 formats: standard MC, opposites, ordering
├── NoteReadingChallenge.tsx     # Staff note identification (treble & bass clefs)
├── RhythmTapChallenge.tsx       # Rhythm tapping with visual feedback
├── IntervalChallenge.tsx        # 3 modes: high/low, step/skip, standard naming
├── TimbreChallenge.tsx          # Instrument identification (T1 synth, T2+ Philharmonia samples)
└── CustomChallenge.tsx          # Custom/teacher-provided questions

logic/
├── dungeonTypes.ts              # Core TypeScript interfaces and constants
├── difficultyAdapter.ts         # Tier-based challenge parameters by floor
├── vocabData.ts                 # Vocabulary entries by category, tier, and format
├── timbreData.ts                # Instrument families and pools
├── rhythmPatterns.ts            # Curated rhythm patterns by tier
├── dungeonGenerator.ts          # Procedural floor generation
└── [other game logic files]

teacher/
├── TeacherDashboard.tsx         # Main teacher admin interface
├── PoolEditor.tsx               # Question pool CRUD
└── CommunityBrowser.tsx         # Browse shared questions
```

## Adding or Modifying Questions

### Vocabulary Questions
Edit `logic/vocabData.ts`. Each entry follows this structure:

```typescript
{
  term: 'Allegro',
  definition: 'Fast',
  tier: 1,
  category: 'tempo',
  format: 'opposites' // optional: 'standard' | 'opposites' | 'ordering'
}
```

### Timbre/Instrument Questions
Edit `logic/timbreData.ts`. Pools are organized by tier:
- **T1**: Synthesized sounds (high/low/fast/slow)
- **T2**: Instrument families
- **T3-T5**: Specific instruments from `instrumentLibrary`

### Rhythm Patterns
Edit `logic/rhythmPatterns.ts`. Patterns are curated arrays of subdivisions:

```typescript
{
  id: 't1-01',
  subdivisions: ['quarter', 'quarter', 'quarter', 'quarter']
}
```

### Note Reading Notes
Edit `logic/difficultyAdapter.ts` → `getNoteReadingParams()` to adjust available notes per tier.

### Interval Types
Edit `logic/difficultyAdapter.ts` → `getIntervalParams()` to adjust available intervals per tier.

## Challenge Formats

### Standard Multiple Choice
- 4 answer options
- Randomly chosen distractors
- Default format for most questions

### Opposites (Binary Choice)
- 2 options only
- Kid-friendly for younger students
- Used in Tier 1 for opposing concepts (f vs p, Allegro vs Adagio)

### Ordering (Tap in Sequence)
- Students tap items in correct order
- Used for dynamic and tempo hierarchies (e.g., "softest to loudest: pp, p, mp, mf, f, ff")
- Visual feedback shows tapped sequence

## Development

### Run locally
```bash
npm run dev
```

### Run tests
```bash
npm run test
```

### Build
```bash
npm run build
```

## Credits

- **Game Design & Architecture** – Musically Nowlin Games
- **Sound Engine** – Web Audio API for synthesized sounds
- **Instrument Samples** – Philharmonia Orchestra samples (T2+ timbre challenges)
- **Notation Rendering** – LilyPond (cached SVG assets)

## License

[Insert license information if applicable]