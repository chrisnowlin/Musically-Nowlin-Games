# 100-Floor Progression Design

**Date:** 2026-03-01
**Goal:** Redesign the melody dungeon's difficulty system to span 100 floors using a spiral curriculum aligned with NC K-12 Music Standards. The dungeon should be mostly clearable by an end-of-year 5th grader, with the final floors pushing into middle/high school content.

**Replaces:** `2026-03-01-challenge-types-pool-design.md` (the 3-tier, 7-type unlock system)

## Core Principles

1. **The dungeon is a spiral curriculum.** The same concepts appear at every depth — just at increasing complexity. A floor 1 dynamics question asks "which is louder?" A floor 95 dynamics question asks you to distinguish diminuendo from decrescendo.
2. **Floor number = grade band.** No adaptive system. Floor number alone determines the grade-level difficulty of questions.
3. **All challenge types available from floor 1.** No unlock gates. Late-bloomer types (intervals, terms) appear at low frequency with simplified content on early floors, then ramp to full frequency.
4. **5th grader target.** Floors 1–68 use K–5 content. A strong 5th grader can clear ~70% of the dungeon. Floors 69+ push into grades 6–8 and HS.

## 5-Tier System

Each tier maps to a grade band from the NC Standards:

| Tier | Grade Band | Standards Alignment |
|------|-----------|-------------------|
| T1 | K–1 | Opposites, basic identification, 2-3 pitches, steady beat |
| T2 | 2–3 | Changes, broader vocabulary, rests, rounds, pentatonic |
| T3 | 4–5 | Continua, ordering, syncopation, major/minor keys, folk+orchestral |
| T4 | 6–8 | Analysis, bass clef, triplets, texture terms, world music |
| T5 | HS | Subtle distinctions, all content, mixed clefs, advanced terms |

## Floor Zone Map

| Floors | Zone | Tier Weights | Enemy Level | Questions/Enemy |
|--------|------|-------------|-------------|----------------|
| 1–12 | T1 pure | 100% T1 | 1 | 1 |
| 13–18 | T1→T2 transition | Linear blend | 1–2 | 1–2 |
| 19–35 | T2 pure | 100% T2 | 2 | 2 |
| 36–42 | T2→T3 transition | Linear blend | 2–3 | 2–3 |
| 43–68 | T3 pure | 100% T3 | 3 | 3 |
| 69–75 | T3→T4 transition | Linear blend | 3–4 | 3–4 |
| 76–88 | T4 pure | 100% T4 | 4 | 4 |
| 89–94 | T4→T5 transition | Linear blend | 4–5 | 4–5 |
| 95–100 | T5 pure | 100% T5 | 5 | 5 |

### Transition Formula

In a transition zone from tier `low` to tier `high` spanning floors `start` to `end`:

```typescript
const progress = (floor - start) / (end - start);
// P(high tier) = progress
// P(low tier)  = 1 - progress
// Roll Math.random() < progress ? highTier : lowTier
```

Each challenge encounter independently rolls its tier. On floor 15 (T1→T2 transition): ~40% chance of T2, ~60% chance of T1.

### Enemy Level Scaling

Enemy level determines how many questions a regular enemy asks.

- **Regular enemies:** Level matches the zone (see table above). In transition zones, uniform random between the two values.
- **Dragons:** Always +1 above zone standard (capped at 5).
- **Ghosts:** Match zone standard.
- **Doors and Treasure:** Always 1 question. Difficulty from tier only.
- **Mini-Boss (floor % 5 === 0):** 5 rounds (existing system).
- **Big Boss (floor % 10 === 0):** 8 rounds (existing system). Guarantees each of the 8 challenge types appears at least once.

## 8 Challenge Types

### 1. Note Reading (type: `noteReading`)

| Tier | Content | Notes |
|------|---------|-------|
| T1 | Space notes only: F4, A4, C5, E5. Treble clef. | Exists |
| T2 | All treble staff: E4–F5 (lines + spaces) | Exists |
| T3 | Treble + ledger lines: C4, D4 below; G5, A5 above | Exists |
| T4 | Bass clef staff notes: G2–A3 | **New** |
| T5 | Bass clef + ledger lines. Mixed clef (random treble or bass per question). | **New** |

### 2. Dynamics Vocab (type: `dynamics`)

| Tier | Content | Question Format |
|------|---------|----------------|
| T1 | Loud vs soft. f = loud, p = soft. The word "dynamics." | **Opposites** (binary choice): "Which is louder, p or f?" |
| T2 | p, f, mf, mp definitions. Crescendo, decrescendo. | 4-choice multiple choice |
| T3 | pp, ff, sfz, fp. Ordering: rank softest→loudest. | 4-choice MC + **Ordering** format |
| T4 | Diminuendo, morendo. Context: "What happens during a crescendo?" | 4-choice MC |
| T5 | All dynamics. Subtle pairs: diminuendo vs decrescendo, fp vs sfz. | 4-choice MC (closer distractors) |

### 3. Tempo Markings Vocab (type: `tempo`)

| Tier | Content | Question Format |
|------|---------|----------------|
| T1 | Fast vs slow. Allegro = fast, Adagio = slow. The word "tempo." | **Opposites** (binary choice) |
| T2 | Allegro, Adagio, Andante, Moderato. Ritardando, accelerando. | 4-choice MC |
| T3 | Presto, Largo, Vivace, Allegretto. Ordering: rank slowest→fastest. | 4-choice MC + **Ordering** format |
| T4 | Grave, Lento, Prestissimo. Tempo primo, a tempo. | 4-choice MC |
| T5 | Rubato, alla breve. All tempos + subtle distinctions. | 4-choice MC |

### 4. Musical Symbols Vocab (type: `symbols`)

| Tier | Content |
|------|---------|
| T1 | Note value symbols: quarter note, half note, whole note. Quarter rest. Treble clef symbol. |
| T2 | Half rest, whole rest, tied note, dotted half note, beamed eighths, beamed sixteenths. Time signatures: 2/4, 3/4, 4/4. |
| T3 | Sharp, flat, natural, fermata, repeat sign, dotted quarter note. 6/8 time signature. "Accidentals" as umbrella term. |
| T4 | D.S., coda, double bar line, tie vs slur, dot rule, triplet notation, bass clef symbol, key signature concept. |
| T5 | Trill, mordent, turn, grace note, 8va, 8vb, tremolo. |

### 5. General Music Terms (type: `terms`)

Low frequency (15% weight) on T1 floors. Ramps to full weight by floor 25.

| Tier | Content |
|------|---------|
| T1 | Simple English: melody, rhythm, beat, loud, soft, fast, slow, high, low, song, singer, instrument. |
| T2 | Unison, round/canon, ostinato, duet, solo, chord, harmony, ensemble, accompaniment. Form: AB, ABA. Articulation (concept). |
| T3 | Staccato, legato, pentatonic scale, syncopation, arpeggio, phrasing, call and response, rondo, theme and variations, timbre. |
| T4 | Da Capo, fine, D.S. al coda, monophonic, homophonic, polyphonic, pizzicato, glissando, triplet. |
| T5 | Con brio, cantabile, dolce, espressivo, maestoso, sotto voce, tutti, major/minor scale, key signature, sight-read, compose, arrangement. |

### 6. Rhythm Tap (type: `rhythmTap`)

| Tier | Beats | Subdivisions | BPM | Tolerance |
|------|-------|-------------|-----|-----------|
| T1 | 4 | Quarter, half | 72 | 350ms |
| T2 | 4 | Quarter, half, quarter rest, eighth | 80 | 300ms |
| T3 | 4–6 | Quarter, eighth, dotted quarter, sixteenth pairs | 95 | 225ms |
| T4 | 6 | + syncopation, triplets, 6/8 meter | 110 | 175ms |
| T5 | 8 | All subdivisions, mixed meters | 120 | 150ms |

### 7. Intervals (type: `interval`)

Low frequency (15% weight) on T1 floors. Ramps to full weight by floor 25.

| Tier | Content | Format |
|------|---------|--------|
| T1 | "Which note is higher?" / "Are these the same note?" | **Simplified** binary choice |
| T2 | Step vs skip vs same. "Did the melody move by step, skip, or stay?" | **Simplified** 3-choice |
| T3 | Unison, 2nd, 3rd. Standard interval identification. | Standard 4-choice |
| T4 | 2nd, 3rd, 4th, 5th. | Standard button selection |
| T5 | 2nd, 3rd, 4th, 5th, 6th, Octave. | Standard button selection |

### 8. Timbre / Instrument ID (type: `timbre`) — NEW

| Tier | Content |
|------|---------|
| T1 | Voice types: singing, speaking, whispering, shouting. |
| T2 | Instrument families (strings, woodwinds, brass, percussion). Classroom instruments: recorder, xylophone, hand drum, tambourine, piano. |
| T3 | Specific instruments: violin, cello, flute, clarinet, trumpet, trombone, snare drum, timpani, piano, guitar, banjo, harmonica. |
| T4 | Expanded: viola, oboe, bassoon, French horn, tuba, harp, saxophone, sitar, djembe, steel drum. Ensemble type ID (orchestra, band, jazz combo, choir). |
| T5 | Subtle pairs: viola vs violin, oboe vs clarinet, trumpet vs cornet, harpsichord vs piano. Electronic/synthesized sounds. |

**Audio assets:** The project already has 13,515 MP3 instrument samples from the Philharmonia Orchestra library at `client/public/audio/philharmonia/`, covering 65 instrument categories. Existing audio services (`audioService.ts`, `sampleAudioService.ts`) and hooks (`useAudioService`) handle playback. Existing timbre games (Timbre 001/002/003, Instrument Detective) provide implementation patterns to reference.

## Challenge Type Frequency Weights

When picking a challenge type for a random encounter (ghosts, dragons, doors, treasure):

| Type | Floors 1–12 | Floors 13–24 | Floors 25+ |
|------|------------|-------------|------------|
| noteReading | 1.0 | 1.0 | 1.0 |
| dynamics | 1.0 | 1.0 | 1.0 |
| tempo | 1.0 | 1.0 | 1.0 |
| symbols | 1.0 | 1.0 | 1.0 |
| rhythmTap | 1.0 | 1.0 | 1.0 |
| timbre | 1.0 | 1.0 | 1.0 |
| interval | 0.15 | 0.5 | 1.0 |
| terms | 0.15 | 0.5 | 1.0 |

Enemy affinity overrides weights: a Goblin on floor 3 still gives an interval question (at T1 simplified) regardless of low weight.

## Enemy Roster

| Enemy | Challenge Affinity | Thematic Reason |
|-------|-------------------|-----------------|
| Slime | noteReading | Classic starter — basic challenge |
| Bat | dynamics | Bats are sensitive to volume |
| Wraith | tempo | Wraiths move at eerie speeds |
| Spider | symbols | Spiders weave notation webs |
| Skeleton | rhythmTap | Bones keep the beat |
| Shade | terms | Shades whisper obscure knowledge |
| Goblin | interval | Goblins play tricks on your ears |
| **Siren** | **timbre** | **Sirens mimic sounds and instruments** |
| Ghost | Random (wildcard) | Ghosts surprise you |
| Dragon | Random (wildcard) | Boss-tier, tests everything |

All enemy subtypes available from floor 1 (no unlock gating).

## New Question Formats

### Opposites (T1 dynamics, T1 tempo)
Binary choice: "Which is louder, p or f?" Two large buttons. Used for K-1 level content where the standard is "identify opposites."

### Ordering (T3 dynamics, T3 tempo)
Rank 4 items in sequence: "Order from softest to loudest: f, pp, mf, p." Tap items in order or drag to sort. Used where the standard is "continua" of dynamics/tempos.

### Simplified Intervals (T1–T2 intervals)
T1: Binary "higher or lower?" / "same or different?" with two buttons.
T2: Three-choice "step, skip, or same?" Used to build ear training foundations before formal interval naming.

## What Gets Removed

- `UNLOCK_FLOORS` map — replaced by frequency weights (all types available from floor 1)
- `getTierForChallenge()` 3-tier function — replaced by `getFloorZone()` + `rollTier()` 5-tier system
- `Tier = 1 | 2 | 3` — becomes `Tier = 1 | 2 | 3 | 4 | 5`
- `pickEnemyLevel()` (caps at 3 by floor 10) — replaced by zone-based scaling (1–5)
- Current vocab content organization (3 tiers per category) — reorganized into 5 tiers aligned with NC Standards

## Files Changed

| File | Change |
|------|--------|
| `dungeonTypes.ts` | `Tier` → `1\|2\|3\|4\|5`. Add `'timbre'` to `ChallengeType`. Add `'siren'` to `EnemySubtype`. |
| `difficultyAdapter.ts` | **Rewrite.** Floor zone table, `getFloorZone()`, `rollTier()`, `getChallengeTypeWeight()`, `rollChallengeType()`. Expand all param functions to 5 tiers. |
| `challengeHelpers.ts` | Update `getSubtypeChallengePool()` for siren. Update `getEnemySubtypesForFloor()` (all subtypes from floor 1). Update `generateBigBossSequence()` for 8 types. |
| `dungeonGenerator.ts` | New `pickEnemyLevel()` using floor zones. |
| `vocabData.ts` | **Major expansion.** Reorganize all entries across 5 tiers. Add ~30-40 new entries. Add format metadata (opposites, ordering). |
| `VocabularyChallenge.tsx` | Add opposites format (binary choice). Add ordering format (rank sequence). Handle 5 tiers. |
| `NoteReadingChallenge.tsx` | Add bass clef support (T4-T5). |
| `RhythmTapChallenge.tsx` | Add rests, dotted rhythms, triplets, syncopation. 5-tier params. |
| `IntervalChallenge.tsx` | Add simplified T1 (high/low) and T2 (step/skip/same) formats. 5-tier params. |
| `TimbreChallenge.tsx` **(new)** | Instrument ID component. Reuse Philharmonia samples + existing audio services. Reference Timbre 001/002/003 and Instrument Detective for patterns. |
| `ChallengeModal.tsx` | Add timbre routing. Use new `rollTier()` and `rollChallengeType()`. |
| `DirectionsModal.tsx` | Update help text for 8 types, 5 tiers, siren enemy. |

## NC Standards Coverage

| Standard Strand | Challenge Type | Grade Levels Covered |
|----------------|---------------|---------------------|
| Pitch reading (staff notation) | noteReading | K–HS |
| Dynamics vocabulary & symbols | dynamics | K–HS |
| Tempo vocabulary & markings | tempo | K–HS |
| Notation symbols & values | symbols | K–HS |
| Music terminology | terms | K–HS |
| Rhythmic performance | rhythmTap | K–HS |
| Pitch relationships | interval | K–HS (simplified T1-T2) |
| Instrument/voice identification | timbre | K–HS |
| Form identification | terms (as vocabulary) | 2–HS |
| Texture identification | terms (as vocabulary) | 6–HS |
| Articulations | dynamics + terms | 1–HS |
