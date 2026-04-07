# Cadence Quest Development Plan - Reusing Da Capo Dungeon Assets

**Status**: Draft  
**Created**: 2026-03-04  
**Author**: AI Assistant  
**Scope**: Enhance Cadence Quest by strategically reusing proven Da Capo Dungeon systems while maintaining distinct game identity

---

## Executive Summary

### Problem Statement
Cadence Quest has underdeveloped systems in:
- Collection/inventory (placeholder strings only)
- Skill tree (effects defined but not applied)
- Special abilities (defined but never activated)
- Victory rewards (minimal feedback)
- Boss encounters (no special mechanics)
- Audio feedback (basic playback only)

### Solution Strategy
Leverage mature, tested systems from Da Capo Dungeon while adapting them to Cadence Quest's JRPG-style gameplay. Maintain clear separation between:
- **Da Capo Dungeon**: Tactical dungeon crawler with exploration, resource management, real-time pressure
- **Cadence Quest**: Strategic JRPG with character progression, narrative encounters, turn-based combat

### Key Principles
1. **Share infrastructure, differ in experience** - Same audio engine, different sound design
2. **Adapt mechanics, not gameplay** - Reuse challenge generation, wrap with JRPG progression
3. **Technical reuse, creative distinction** - Shared code paths, unique content and UX

---

## Phase 1: Audio System Integration

### 1.1 Current State Analysis

**Da Capo Dungeon Audio (`dungeonAudio.ts`)**
- 578 lines of battle-tested audio code
- Web Audio API with iOS Safari fixes
- Background music with ducking/muting
- Note playback (triangle wave oscillator)
- Chord and scale playback
- Listening challenge phrases
- Robust interruption recovery (iPad sleep, phone calls)

**Cadence Quest Audio**
- Basic note playback in challenges
- No sound effects for abilities
- No class-specific audio identity
- No boss battle music
- No victory/defeat sounds

### 1.2 Shared Audio Infrastructure

**Create**: `shared/audio/core-audio.ts`

```typescript
// Shared low-level audio utilities
export class CoreAudioEngine {
  private audioCtx: AudioContext | null = null;
  private scratchBuffer: AudioBuffer | null = null;
  private isUnlocked = false;

  // iOS unlock handling
  async resumeAudioContext(): Promise<boolean>;
  
  // Note playback primitives
  playNote(noteKey: string, duration: number, volume: number, waveType?: OscillatorType): void;
  playNoteAtFrequency(freq: number, duration: number, volume: number, waveType?: OscillatorType): void;
  
  // Chord/scale helpers
  playChord(noteKeys: string[], duration: number, volume: number, waveType?: OscillatorType): void;
  playScale(noteKeys: string[], gap: number, duration: number, volume: number, waveType?: OscillatorType): void;
  
  // Frequency utilities
  noteKeyToFrequency(noteKey: string): number;
  getFrequency(noteKey: string): number;
  
  // Click/percussion sounds
  playClick(volume: number): void;
}

export const NOTE_FREQUENCIES: Record<string, number> = {
  E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0,
  A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0,
  A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25,
  F5: 698.46, G5: 783.99, A5: 880.0,
};
```

### 1.3 Game-Specific Audio Layers

**Da Capo Dungeon**: `client/src/games/da-capo-dungeon/dungeon-audio.ts`
```typescript
// Dungeon crawler audio identity
export class DungeonAudio {
  // Spooky ambient music
  loadBgMusic(url: string): Promise<void>;
  startBgMusic(): void;
  stopBgMusic(): void;
  
  // Boss battle intensity
  loadBattleMusic(key: string, url: string): Promise<void>;
  startBattleMusic(key: string): void;
  
  // Music ducking for challenges
  duckBgMusic(): void;
  unduckBgMusic(): void;
  
  // Exploration sounds
  playDoorUnlock(): void;
  playChestOpen(): void;
  playItemPickup(): void;
}
```

**Cadence Quest**: `client/src/games/cadence-quest/audio/battle-audio.ts` (NEW)
```typescript
// JRPG battle audio identity
export class BattleAudio {
  // Character class attack sounds
  playAttackSound(characterClass: CharacterClass, isCorrect: boolean): void {
    switch (characterClass) {
      case 'bard':
        // Elegant harp sequence on correct
        if (isCorrect) this.playHarpPhrase();
        else this.playDissonantString();
        break;
      case 'drummer':
        // Percussive beat on correct
        if (isCorrect) this.playRhythmHit();
        else this.playOffbeatThunk();
        break;
      case 'harmonist':
        // Warm chord stab on correct
        if (isCorrect) this.playMajorChord();
        else this.playDiminishedChord();
        break;
      case 'conductor':
        // Orchestral swell on correct
        if (isCorrect) this.playCrescendo();
        else this.playDecrescendo();
        break;
    }
  }
  
  // Ability activation sounds
  playAbilityActivation(abilityName: string): void {
    switch (abilityName) {
      case 'Perfect Pitch':
        this.playPerfectPitchSound();
        break;
      case 'Double Time':
        this.playDoubleTimeSound();
        break;
      case 'Resonance':
        this.playResonanceHeal();
        break;
      case 'Crescendo':
        this.playCrescendoBurst();
        break;
    }
  }
  
  // Boss battle themes
  loadBossTheme(regionId: string, url: string): Promise<void>;
  startBossTheme(regionId: string): void;
  
  // Victory/defeat fanfares
  playVictoryFanfare(): void;
  playDefeatSound(): void;
  
  // Region-specific ambient tracks
  playRegionAmbient(regionId: string): void;
}
```

### 1.4 Implementation Details

**Class-Specific Attack Sounds**

```typescript
// Bard: Harp-like sequences
playHarpPhrase(): void {
  const phrase = ['C4', 'E4', 'G4', 'C5'];
  phrase.forEach((note, i) => {
    setTimeout(() => {
      this.core.playNote(note, 0.3, 0.25, 'sine');
    }, i * 120);
  });
}

// Drummer: Percussive hits
playRhythmHit(): void {
  this.core.playClick(0.4);
  setTimeout(() => this.core.playClick(0.3), 100);
  setTimeout(() => this.core.playClick(0.35), 200);
}

// Harmonist: Chord stabs
playMajorChord(): void {
  this.core.playChord(['C4', 'E4', 'G4'], 0.5, 0.3, 'triangle');
}

// Conductor: Orchestral swells
playCrescendo(): void {
  // Rising volume over time
  const notes = ['C4', 'E4', 'G4', 'C5'];
  notes.forEach((note, i) => {
    setTimeout(() => {
      const volume = 0.15 + (i * 0.1);
      this.core.playNote(note, 0.6, volume, 'triangle');
    }, i * 150);
  });
}
```

**Ability Activation Sounds**

```typescript
// Perfect Pitch: Crystal-clear bell tone
playPerfectPitchSound(): void {
  this.core.playNote('C5', 0.8, 0.3, 'sine');
  setTimeout(() => this.core.playNote('E5', 0.8, 0.3, 'sine'), 100);
}

// Double Time: Fast rhythmic pattern
playDoubleTimeSound(): void {
  for (let i = 0; i < 8; i++) {
    setTimeout(() => this.core.playClick(0.25), i * 80);
  }
}

// Resonance: Healing harmonic series
playResonanceHeal(): void {
  const overtones = ['C4', 'C5', 'E5', 'G5'];
  overtones.forEach((note, i) => {
    setTimeout(() => this.core.playNote(note, 0.6, 0.2, 'sine'), i * 100);
  });
}

// Crescendo: Explosive burst
playCrescendoBurst(): void {
  this.core.playChord(['C4', 'E4', 'G4', 'C5', 'E5'], 1.0, 0.4, 'sawtooth');
}
```

### 1.5 Boss Battle Music

**Region-Specific Themes**

```typescript
// Load boss themes for each region
async loadAllBossThemes(): Promise<void> {
  const basePath = import.meta.env.BASE_URL || '/';
  
  await Promise.all([
    this.loadBossTheme('rhythm-realm', `${basePath}audio/boss-rhythm.mp3`),
    this.loadBossTheme('melody-mountains', `${basePath}audio/boss-melody.mp3`),
    this.loadBossTheme('harmony-harbor', `${basePath}audio/boss-harmony.mp3`),
    this.loadBossTheme('dynamics-desert', `${basePath}audio/boss-dynamics.mp3`),
    this.loadBossTheme('theory-tower', `${basePath}audio/boss-theory.mp3`),
  ]);
}
```

**Musical Style Guide**:
- **Rhythm Realm**: Driving percussion, syncopated beats
- **Melody Mountains**: Soaring melodies, major key triumph
- **Harmony Harbor**: Rich chord progressions, jazz influences
- **Dynamics Desert**: Swelling dynamics, dramatic contrasts
- **Theory Tower**: Complex counterpoint, academic grandeur

### 1.6 Victory/Defeat Audio

```typescript
// Victory fanfare: Triumphant major chord progression
playVictoryFanfare(): void {
  const progression = [
    { notes: ['C4', 'E4', 'G4'], delay: 0 },
    { notes: ['F4', 'A4', 'C5'], delay: 300 },
    { notes: ['G4', 'B4', 'D5'], delay: 600 },
    { notes: ['C5', 'E5', 'G5'], delay: 900 },
  ];
  
  progression.forEach(({ notes, delay }) => {
    setTimeout(() => {
      this.core.playChord(notes, 0.6, 0.35, 'triangle');
    }, delay);
  });
}

// Defeat sound: Descending minor progression
playDefeatSound(): void {
  const notes = ['G4', 'Eb4', 'C4', 'Ab3'];
  notes.forEach((note, i) => {
    setTimeout(() => {
      this.core.playNote(note, 0.5, 0.25, 'triangle');
    }, i * 200);
  });
}
```

### 1.7 Migration Path

**Step 1**: Extract shared utilities
```bash
# Create shared audio module
mkdir -p shared/audio
# Extract core functions from da-capo-dungeon/dungeonAudio.ts
```

**Step 2**: Refactor Da Capo Dungeon
```typescript
// Before
import { playNote } from './dungeonAudio';

// After
import { CoreAudioEngine } from '@shared/audio/core-audio';
import { DungeonAudio } from './dungeon-audio';
```

**Step 3**: Create Cadence Quest audio layer
```typescript
// New file: cadence-quest/audio/battle-audio.ts
import { CoreAudioEngine } from '@shared/audio/core-audio';

export class BattleAudio {
  private core = new CoreAudioEngine();
  // JRPG-specific sounds
}
```

**Step 4**: Integrate into battle flow
```typescript
// BattleScreen.tsx
const battleAudio = new BattleAudio();

const handleAnswer = (answer: ChallengeAnswer) => {
  const correct = validateAnswer(challenge, answer);
  
  // Play class-specific attack sound
  battleAudio.playAttackSound(playerCharacter.class, correct);
  
  if (correct && abilityTriggered) {
    battleAudio.playAbilityActivation(abilityName);
  }
  
  // ... rest of battle logic
};
```

### 1.8 Testing Strategy

**Unit Tests**:
```typescript
describe('BattleAudio', () => {
  it('plays bard attack sound on correct answer', () => {
    const audio = new BattleAudio();
    const spy = jest.spyOn(audio, 'playHarpPhrase');
    audio.playAttackSound('bard', true);
    expect(spy).toHaveBeenCalled();
  });
  
  it('plays victory fanfare with correct progression', () => {
    const audio = new BattleAudio();
    const spy = jest.spyOn(audio.core, 'playChord');
    audio.playVictoryFanfare();
    expect(spy).toHaveBeenCalledTimes(4);
  });
});
```

**Integration Tests**:
- Verify audio plays during battle
- Test boss theme starts on boss encounter
- Verify victory/defeat sounds trigger correctly

---

## Phase 2: Challenge Generator Enhancement

### 2.1 Current State Analysis

**Da Capo Dungeon Challenges**
- 9 challenge types with tiered difficulty (1-5)
- Difficulty adapter scales challenge parameters
- Vocabulary, interval, rhythm tap, timbre, custom challenges
- Comprehensive test coverage (10+ test files)
- Teacher pool integration for custom questions

**Cadence Quest Challenges**
- 7 challenge types in `challenge-pool.ts`
- Basic difficulty levels (easy/medium/hard)
- No class-specific modifiers
- No skill tree effect integration
- Limited test coverage

### 2.2 Shared Challenge Core

**Create**: `shared/music-challenges/core-generators.ts`

```typescript
// Shared challenge generation primitives
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Tier = 1 | 2 | 3 | 4 | 5;

export interface BaseChallenge {
  id: string;
  type: ChallengeType;
  discipline: MusicDiscipline;
  difficulty: Difficulty;
}

// Note reading challenge
export interface NoteReadingChallenge extends BaseChallenge {
  type: 'noteReading';
  targetNote: string;
  options: string[];
  useBassClef: boolean;
}

export function generateNoteReadingChallenge(
  difficulty: Difficulty,
  discipline: MusicDiscipline = 'pitch'
): NoteReadingChallenge;

// Interval challenge
export interface IntervalChallenge extends BaseChallenge {
  type: 'interval';
  note1: string;
  note2: string;
  intervalName: string;
  options: string[];
}

export function generateIntervalChallenge(
  difficulty: Difficulty,
  discipline: MusicDiscipline = 'pitch'
): IntervalChallenge;

// Rhythm tap challenge
export interface RhythmTapChallenge extends BaseChallenge {
  type: 'rhythmTap';
  pattern: { time: number; duration: number }[];
  bpm: number;
  toleranceMs: number;
}

export function generateRhythmTapChallenge(
  difficulty: Difficulty,
  discipline: MusicDiscipline = 'rhythm'
): RhythmTapChallenge;

// Chord identify challenge
export interface ChordIdentifyChallenge extends BaseChallenge {
  type: 'chordIdentify';
  chordNotes: string[];
  chordName: string;
  options: string[];
}

export function generateChordIdentifyChallenge(
  difficulty: Difficulty,
  discipline: MusicDiscipline = 'harmony'
): ChordIdentifyChallenge;

// Shared validator
export function validateAnswer(
  challenge: MusicChallenge,
  answer: ChallengeAnswer
): boolean;
```

### 2.3 Game-Specific Adapters

**Da Capo Dungeon Adapter** (`da-capo-dungeon/logic/challenge-adapter.ts`)

```typescript
// Dungeon crawler: Difficulty scales with floor depth
export class DungeonChallengeAdapter {
  generateChallenge(
    type: ChallengeType,
    floorNumber: number,
    tileType: TileType
  ): MusicChallenge {
    // Tier based on floor (1-5)
    const tier = this.floorToTier(floorNumber);
    
    // Bosses get harder tiers
    const isBoss = tileType === TileType.MiniBoss || tileType === TileType.BigBoss;
    const adjustedTier = isBoss ? Math.min(5, tier + 1) : tier;
    
    // Convert tier to difficulty
    const difficulty = this.tierToDifficulty(adjustedTier);
    
    return generateChallenge(type, difficulty);
  }
  
  private floorToTier(floor: number): Tier {
    if (floor <= 5) return 1;
    if (floor <= 15) return 2;
    if (floor <= 30) return 3;
    if (floor <= 50) return 4;
    return 5;
  }
  
  private tierToDifficulty(tier: Tier): Difficulty {
    const map: Record<Tier, Difficulty> = {
      1: 'easy',
      2: 'easy',
      3: 'medium',
      4: 'medium',
      5: 'hard',
    };
    return map[tier];
  }
}
```

**Cadence Quest Adapter** (`cadence-quest/logic/challenge-adapter.ts`)

```typescript
// JRPG: Difficulty scales with character level + class modifiers
export class CadenceChallengeAdapter {
  constructor(
    private characterClass: CharacterClass,
    private characterLevel: number,
    private skillTreeEffects: SkillTreeEffects
  ) {}
  
  generateChallenge(
    type: ChallengeType,
    isBoss: boolean
  ): MusicChallenge {
    // Base difficulty from level
    const baseDifficulty = this.levelToDifficulty(this.characterLevel);
    
    // Bosses are harder
    const difficulty = isBoss ? this.increaseDifficulty(baseDifficulty) : baseDifficulty;
    
    // Generate base challenge
    const challenge = generateChallenge(type, difficulty);
    
    // Apply class-specific modifiers
    const modifiedChallenge = this.applyClassModifiers(challenge);
    
    // Apply skill tree effects
    const finalChallenge = this.applySkillEffects(modifiedChallenge);
    
    return finalChallenge;
  }
  
  private levelToDifficulty(level: number): Difficulty {
    if (level <= 3) return 'easy';
    if (level <= 7) return 'medium';
    return 'hard';
  }
  
  private increaseDifficulty(diff: Difficulty): Difficulty {
    const order: Difficulty[] = ['easy', 'medium', 'hard'];
    const idx = order.indexOf(diff);
    return order[Math.min(idx + 1, 2)];
  }
  
  private applyClassModifiers(challenge: MusicChallenge): MusicChallenge {
    switch (this.characterClass) {
      case 'bard':
        return this.applyBardModifiers(challenge);
      case 'drummer':
        return this.applyDrummerModifiers(challenge);
      case 'harmonist':
        return this.applyHarmonistModifiers(challenge);
      case 'conductor':
        return this.applyConductorModifiers(challenge);
      default:
        return challenge;
    }
  }
  
  private applyBardModifiers(challenge: MusicChallenge): MusicChallenge {
    // Bard excels at pitch/intervals
    if (challenge.type === 'noteReading' || challenge.type === 'interval') {
      // Reduce wrong options (fewer choices = easier)
      if ('options' in challenge && challenge.options.length > 3) {
        const correct = this.getCorrectOption(challenge);
        const wrongOptions = challenge.options.filter(o => o !== correct);
        const reducedWrong = wrongOptions.slice(0, 2);
        return {
          ...challenge,
          options: this.shuffle([correct, ...reducedWrong]),
        };
      }
    }
    return challenge;
  }
  
  private applyDrummerModifiers(challenge: MusicChallenge): MusicChallenge {
    // Drummer excels at rhythm
    if (challenge.type === 'rhythmTap') {
      // Wider timing tolerance
      return {
        ...challenge,
        toleranceMs: challenge.toleranceMs + 50,
      };
    }
    return challenge;
  }
  
  private applyHarmonistModifiers(challenge: MusicChallenge): MusicChallenge {
    // Harmonist excels at chords/scales
    if (challenge.type === 'chordIdentify' || challenge.type === 'scaleIdentify') {
      // Add chord hints (handled in UI)
      return {
        ...challenge,
        showHints: true,
      };
    }
    return challenge;
  }
  
  private applyConductorModifiers(challenge: MusicChallenge): MusicChallenge {
    // Conductor excels at dynamics/listening
    if (challenge.type === 'listening' || challenge.type === 'tempoIdentify') {
      // Show range indicators (handled in UI)
      return {
        ...challenge,
        showRangeIndicators: true,
      };
    }
    return challenge;
  }
  
  private applySkillEffects(challenge: MusicChallenge): MusicChallenge {
    const effects = this.skillTreeEffects;
    
    // Apply rhythm tolerance from skill tree
    if (challenge.type === 'rhythmTap' && effects.rhythmTolerance) {
      challenge = {
        ...challenge,
        toleranceMs: challenge.toleranceMs + effects.rhythmTolerance,
      };
    }
    
    // Apply option reduction from skill tree
    if ('options' in challenge && effects.optionsReduce) {
      const correct = this.getCorrectOption(challenge);
      const wrongOptions = challenge.options.filter(o => o !== correct);
      const reducedWrong = wrongOptions.slice(0, challenge.options.length - 1 - effects.optionsReduce);
      challenge = {
        ...challenge,
        options: this.shuffle([correct, ...reducedWrong]),
      };
    }
    
    // Add chord hints if skill unlocked
    if (effects.chordHints && challenge.type === 'chordIdentify') {
      challenge = { ...challenge, showHints: true };
    }
    
    // Add staff helpers if skill unlocked
    if (effects.staffHelpers && challenge.type === 'noteReading') {
      challenge = { ...challenge, showStaffHelpers: true };
    }
    
    return challenge;
  }
  
  private getCorrectOption(challenge: MusicChallenge): string {
    switch (challenge.type) {
      case 'noteReading':
        return challenge.targetNote.replace(/\d+/, '');
      case 'interval':
        return challenge.intervalName;
      case 'chordIdentify':
        return challenge.chordName;
      case 'scaleIdentify':
        return challenge.scaleName;
      case 'tempoIdentify':
        return challenge.options.find(o => {
          const opt = TEMPO_OPTIONS.find(t => t.label === o);
          return opt?.bpm === challenge.bpm;
        }) || challenge.options[0];
      case 'listening':
        return challenge.correctAnswer;
      default:
        return challenge.options[0];
    }
  }
  
  private shuffle<T>(arr: T[]): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
}
```

### 2.4 Skill Tree Effect Types

```typescript
// shared/types/cadence-quest.ts (extend existing)

export interface SkillTreeEffects {
  // Rhythm branch
  rhythmTolerance?: number;      // +ms tolerance
  rhythmDamage?: number;         // +damage multiplier
  streakPersist?: number;        // streak persists N more turns
  speedBonus?: number;           // +speed accuracy
  
  // Pitch branch
  optionsReduce?: number;        // -N wrong options
  pitchDamage?: number;          // +damage multiplier
  hearTwice?: boolean;           // play note twice
  intervalAccuracy?: number;     // +interval accuracy
  
  // Harmony branch
  chordHints?: boolean;          // show chord hints
  harmonyDamage?: number;        // +damage multiplier
  healOnCorrect?: number;        // heal % on correct
  chordAccuracy?: number;        // +chord accuracy
  
  // Dynamics branch
  rangeIndicators?: boolean;     // show dynamic ranges
  dynamicsDamage?: number;       // +damage multiplier
  burstDamage?: number;          // burst damage charges
  expressionAccuracy?: number;   // +expression accuracy
  
  // Theory branch
  staffHelpers?: boolean;        // show staff line helpers
  theoryDamage?: number;         // +damage multiplier
  changeChallenge?: number;      // reroll challenge charges
  theoryAccuracy?: number;       // +theory accuracy
}
```

### 2.5 Integration Points

**BattleScreen.tsx Integration**

```typescript
// Before
const challenge = generateChallengeForRegion(disciplineFocus, difficulty);

// After
const challengeAdapter = new CadenceChallengeAdapter(
  playerCharacter.class,
  playerCharacter.level,
  playerCharacter.stats.skillTreeEffects
);

const challenge = challengeAdapter.generateChallenge(
  disciplineFocus,
  isBoss
);
```

**SkillTree.tsx Enhancement**

```typescript
// Add skill unlocking functionality
const SkillTree: React.FC<SkillTreeProps> = ({ character, onBack }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  const handleUnlockSkill = (nodeId: string) => {
    if (character.stats.skillPoints <= 0) return;
    if (isUnlocked(nodeId)) return;
    if (!hasParent(SKILL_TREE.find(n => n.id === nodeId)!)) return;
    
    // Dispatch skill unlock action
    dispatch({ type: 'UNLOCK_SKILL', nodeId });
  };
  
  return (
    <div className="skill-tree-container">
      {SKILL_TREE.map(node => (
        <div
          key={node.id}
          className={cn('skill-node', {
            unlocked: isUnlocked(node.id),
            available: canUnlock(node),
            locked: !canUnlock(node),
          })}
          onClick={() => handleUnlockSkill(node.id)}
        >
          <h3>{node.name}</h3>
          <p>{node.description}</p>
          {isUnlocked(node.id) && <span className="badge">Unlocked</span>}
          {canUnlock(node) && !isUnlocked(node.id) && (
            <span className="cost">1 Skill Point</span>
          )}
        </div>
      ))}
    </div>
  );
};
```

### 2.6 Testing Strategy

**Unit Tests for Adapter**

```typescript
describe('CadenceChallengeAdapter', () => {
  it('reduces options for bard on pitch challenges', () => {
    const adapter = new CadenceChallengeAdapter('bard', 5, {});
    const challenge = adapter.generateChallenge('noteReading', false);
    expect(challenge.options.length).toBeLessThanOrEqual(3);
  });
  
  it('increases rhythm tolerance for drummer', () => {
    const adapter = new CadenceChallengeAdapter('drummer', 5, {});
    const baseChallenge = generateChallenge('rhythmTap', 'medium');
    const modified = adapter.generateChallenge('rhythmTap', false);
    expect(modified.toleranceMs).toBeGreaterThan(baseChallenge.toleranceMs);
  });
  
  it('applies skill tree effects', () => {
    const effects: SkillTreeEffects = {
      rhythmTolerance: 50,
      optionsReduce: 1,
    };
    const adapter = new CadenceChallengeAdapter('bard', 5, effects);
    
    const rhythmChallenge = adapter.generateChallenge('rhythmTap', false);
    expect(rhythmChallenge.toleranceMs).toBeGreaterThanOrEqual(250);
    
    const pitchChallenge = adapter.generateChallenge('noteReading', false);
    expect(pitchChallenge.options.length).toBeLessThanOrEqual(3);
  });
  
  it('increases difficulty for bosses', () => {
    const adapter = new CadenceChallengeAdapter('bard', 5, {});
    const normal = adapter.generateChallenge('noteReading', false);
    const boss = adapter.generateChallenge('noteReading', true);
    
    expect(boss.difficulty).not.toBe('easy');
  });
});
```

---

## Phase 3: Item & Equipment Systems

### 3.1 Current State Analysis

**Da Capo Dungeon Items** (`merchantItems.ts`)
- 14 purchasable items
- Consumable-focused (potions, temporary buffs)
- Price scales with floor depth
- Categories: core, exploration, combat, economy, difficulty
- Chest drops provide random items

**Cadence Quest Collection**
- `ownedInstruments` and `ownedSpells` arrays
- Display only shows IDs as strings
- No equipment slots
- No passive effects
- No visual representation

### 3.2 Design Philosophy

**Da Capo Dungeon**: Tactical consumables for dungeon survival
**Cadence Quest**: Permanent equipment with character identity

### 3.3 Equipment System Architecture

**Create**: `shared/types/cadence-quest.ts` (extend)

```typescript
export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

export interface Equipment {
  id: string;
  name: string;
  description: string;
  emoji: string;
  slot: EquipmentSlot;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  
  // Passive effects (always active while equipped)
  passiveEffects: {
    damageModifier?: number;              // +X% damage
    classBonus?: {                        // Bonus for specific class
      class: CharacterClass;
      bonus: number;
    };
    disciplineBonus?: {                   // Bonus for specific discipline
      discipline: MusicDiscipline;
      bonus: number;
    };
    maxHpBonus?: number;                  // +X max HP
    accuracyBonus?: number;               // +X% accuracy
    criticalChance?: number;              // +X% crit chance
    healOnCorrect?: number;               // Heal X% on correct answer
    streakProtection?: number;            // Preserve streak on miss (charges)
  };
  
  // Visual representation
  spritePath: string;
  
  // Lore/flavor
  flavorText?: string;
  source: 'drop' | 'quest' | 'shop' | 'boss';
}

export interface CharacterEquipment {
  weapon: Equipment | null;
  armor: Equipment | null;
  accessory: Equipment | null;
}
```

### 3.4 Equipment Database

**Create**: `cadence-quest/logic/equipment-data.ts`

```typescript
import type { Equipment } from '@shared/types/cadence-quest';

// WEAPONS (primary damage dealers)

export const WEAPONS: Equipment[] = [
  // Common weapons (starting tier)
  {
    id: 'practice-flute',
    name: 'Practice Flute',
    description: 'A simple flute for beginners',
    emoji: '🎵',
    slot: 'weapon',
    rarity: 'common',
    passiveEffects: {
      disciplineBonus: { discipline: 'pitch', bonus: 0.05 },
    },
    spritePath: '/images/cadence-quest/equipment/flute.svg',
    source: 'shop',
  },
  {
    id: 'wooden-drumsticks',
    name: 'Wooden Drumsticks',
    description: 'Basic drumsticks for rhythm practice',
    emoji: '🥁',
    slot: 'weapon',
    rarity: 'common',
    passiveEffects: {
      disciplineBonus: { discipline: 'rhythm', bonus: 0.05 },
    },
    spritePath: '/images/cadence-quest/equipment/drumsticks.svg',
    source: 'shop',
  },
  
  // Uncommon weapons
  {
    id: 'silver-tuning-fork',
    name: 'Silver Tuning Fork',
    description: 'Resonates with perfect pitch',
    emoji: '🔔',
    slot: 'weapon',
    rarity: 'uncommon',
    passiveEffects: {
      accuracyBonus: 0.1,
      disciplineBonus: { discipline: 'pitch', bonus: 0.1 },
    },
    spritePath: '/images/cadence-quest/equipment/tuning-fork.svg',
    source: 'drop',
    flavorText: 'Forged by master craftsmen of Melody Mountains',
  },
  
  // Rare weapons
  {
    id: 'conductors-baton',
    name: "Conductor's Baton",
    description: 'Channels the power of orchestration',
    emoji: '🎼',
    slot: 'weapon',
    rarity: 'rare',
    passiveEffects: {
      damageModifier: 0.15,
      classBonus: { class: 'conductor', bonus: 0.1 },
    },
    spritePath: '/images/cadence-quest/equipment/baton.svg',
    source: 'boss',
    flavorText: 'Once wielded by the legendary Maestro Fortissimo',
  },
  
  // Epic weapons
  {
    id: 'harmony-lute',
    name: 'Harmony Lute',
    description: 'Strums chords of pure resonance',
    emoji: '🎸',
    slot: 'weapon',
    rarity: 'epic',
    passiveEffects: {
      damageModifier: 0.2,
      healOnCorrect: 0.05,
      disciplineBonus: { discipline: 'harmony', bonus: 0.15 },
    },
    spritePath: '/images/cadence-quest/equipment/lute.svg',
    source: 'boss',
    flavorText: 'Said to have been played by the Harmonist Primus',
  },
  
  // Legendary weapons
  {
    id: 'symphony-blade',
    name: 'Symphony Blade',
    description: 'Cuts through discord with perfect harmony',
    emoji: '⚔️',
    slot: 'weapon',
    rarity: 'legendary',
    passiveEffects: {
      damageModifier: 0.3,
      criticalChance: 0.15,
      classBonus: { class: 'conductor', bonus: 0.2 },
    },
    spritePath: '/images/cadence-quest/equipment/symphony-blade.svg',
    source: 'boss',
    flavorText: 'Forged in the fires of Theory Tower itself',
  },
];

// ARMOR (defensive and utility)

export const ARMOR: Equipment[] = [
  {
    id: 'scholars-robe',
    name: "Scholar's Robe",
    description: 'Basic protection for music students',
    emoji: '👘',
    slot: 'armor',
    rarity: 'common',
    passiveEffects: {
      maxHpBonus: 5,
    },
    spritePath: '/images/cadence-quest/equipment/robe.svg',
    source: 'shop',
  },
  {
    id: 'harmonist-vestments',
    name: 'Harmonist Vestments',
    description: 'Channels protective harmonies',
    emoji: '🧥',
    slot: 'armor',
    rarity: 'rare',
    passiveEffects: {
      maxHpBonus: 15,
      healOnCorrect: 0.03,
      classBonus: { class: 'harmonist', bonus: 0.1 },
    },
    spritePath: '/images/cadence-quest/equipment/vestments.svg',
    source: 'boss',
    flavorText: 'Woven from threads of pure harmony',
  },
];

// ACCESSORIES (utility and special effects)

export const ACCESSORIES: Equipment[] = [
  {
    id: 'lucky-pick',
    name: 'Lucky Pick',
    description: 'Increases critical hit chance',
    emoji: '🎸',
    slot: 'accessory',
    rarity: 'uncommon',
    passiveEffects: {
      criticalChance: 0.1,
    },
    spritePath: '/images/cadence-quest/equipment/pick.svg',
    source: 'drop',
  },
  {
    id: 'streakkeepers-amulet',
    name: "Streakkeeper's Amulet",
    description: 'Preserves streak on one wrong answer',
    emoji: '📿',
    slot: 'accessory',
    rarity: 'rare',
    passiveEffects: {
      streakProtection: 1,
    },
    spritePath: '/images/cadence-quest/equipment/amulet.svg',
    source: 'boss',
    flavorText: 'Contains a fragment of eternal rhythm',
  },
];

export const ALL_EQUIPMENT = [...WEAPONS, ...ARMOR, ...ACCESSORIES];
```

### 3.5 Boss Drop Tables

**Create**: `cadence-quest/logic/boss-drops.ts`

```typescript
import type { Equipment } from '@shared/types/cadence-quest';
import { ALL_EQUIPMENT } from './equipment-data';

interface BossDropTable {
  regionId: string;
  guaranteed: Equipment[];
  possible: Equipment[];
  dropChance: number;  // 0-1
}

export const BOSS_DROP_TABLES: BossDropTable[] = [
  {
    regionId: 'rhythm-realm',
    guaranteed: [],
    possible: ALL_EQUIPMENT.filter(e => 
      e.rarity === 'uncommon' && 
      e.passiveEffects.disciplineBonus?.discipline === 'rhythm'
    ),
    dropChance: 0.3,
  },
  {
    regionId: 'melody-mountains',
    guaranteed: [],
    possible: ALL_EQUIPMENT.filter(e => 
      e.rarity === 'uncommon' && 
      e.passiveEffects.disciplineBonus?.discipline === 'pitch'
    ),
    dropChance: 0.3,
  },
  {
    regionId: 'harmony-harbor',
    guaranteed: [
      ALL_EQUIPMENT.find(e => e.id === 'harmony-lute')!,
    ],
    possible: ALL_EQUIPMENT.filter(e => 
      e.rarity === 'rare' && 
      e.passiveEffects.disciplineBonus?.discipline === 'harmony'
    ),
    dropChance: 0.5,
  },
  {
    regionId: 'dynamics-desert',
    guaranteed: [],
    possible: ALL_EQUIPMENT.filter(e => 
      e.rarity === 'rare' && 
      e.passiveEffects.disciplineBonus?.discipline === 'dynamics'
    ),
    dropChance: 0.5,
  },
  {
    regionId: 'theory-tower',
    guaranteed: [
      ALL_EQUIPMENT.find(e => e.id === 'symphony-blade')!,
    ],
    possible: ALL_EQUIPMENT.filter(e => e.rarity === 'epic'),
    dropChance: 0.75,
  },
];

export function rollBossDrop(regionId: string): Equipment | null {
  const table = BOSS_DROP_TABLES.find(t => t.regionId === regionId);
  if (!table) return null;
  
  // Guaranteed drop
  if (table.guaranteed.length > 0) {
    return table.guaranteed[0];
  }
  
  // Chance-based drop
  if (Math.random() < table.dropChance && table.possible.length > 0) {
    const idx = Math.floor(Math.random() * table.possible.length);
    return table.possible[idx];
  }
  
  return null;
}
```

### 3.6 Enhanced CollectionScreen

**Replace**: `cadence-quest/CollectionScreen.tsx`

```typescript
import React from 'react';
import { ChevronLeft, Sword, Shield, Gem } from 'lucide-react';
import type { Character, Equipment, EquipmentSlot } from '@shared/types/cadence-quest';
import { cn } from '@/common/utils/utils';

interface CollectionScreenProps {
  character: Character;
  onBack: () => void;
  onEquip: (equipment: Equipment, slot: EquipmentSlot) => void;
  onUnequip: (slot: EquipmentSlot) => void;
}

const RARITY_COLORS = {
  common: 'border-gray-500 bg-gray-500/20',
  uncommon: 'border-green-500 bg-green-500/20',
  rare: 'border-blue-500 bg-blue-500/20',
  epic: 'border-purple-500 bg-purple-500/20',
  legendary: 'border-amber-500 bg-amber-500/20',
};

const RARITY_TEXT = {
  common: 'text-gray-300',
  uncommon: 'text-green-300',
  rare: 'text-blue-300',
  epic: 'text-purple-300',
  legendary: 'text-amber-300',
};

const CollectionScreen: React.FC<CollectionScreenProps> = ({
  character,
  onBack,
  onEquip,
  onUnequip,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);
  
  const equipped = character.equipment;
  const inventory = character.inventory.filter(item => {
    // Don't show equipped items in inventory
    return !Object.values(equipped).some(eq => eq?.id === item.id);
  });
  
  const renderEquipmentSlot = (slot: EquipmentSlot, icon: React.ReactNode, label: string) => {
    const item = equipped[slot];
    return (
      <div
        onClick={() => setSelectedSlot(slot)}
        className={cn(
          'p-4 rounded-xl border-2 cursor-pointer transition-all',
          item ? RARITY_COLORS[item.rarity] : 'border-gray-600 bg-gray-800/60',
          selectedSlot === slot && 'ring-2 ring-purple-500'
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-sm text-gray-300">{label}</span>
        </div>
        {item ? (
          <div className="flex items-center gap-3">
            <span className="text-3xl">{item.emoji}</span>
            <div>
              <h3 className={cn('font-bold', RARITY_TEXT[item.rarity])}>
                {item.name}
              </h3>
              <p className="text-xs text-gray-400">{item.description}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUnequip(slot);
                }}
                className="mt-2 text-xs text-red-400 hover:text-red-300"
              >
                Unequip
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Empty slot</p>
        )}
      </div>
    );
  };
  
  const availableItems = selectedSlot
    ? inventory.filter(item => item.slot === selectedSlot)
    : [];
  
  return (
    <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg text-purple-800 hover:bg-purple-200/60"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-purple-900">Equipment</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderEquipmentSlot('weapon', <Sword className="text-purple-400" />, 'Weapon')}
        {renderEquipmentSlot('armor', <Shield className="text-blue-400" />, 'Armor')}
        {renderEquipmentSlot('accessory', <Gem className="text-amber-400" />, 'Accessory')}
      </div>
      
      {selectedSlot && (
        <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-600">
          <h3 className="text-lg font-bold text-white mb-3">
            Available {selectedSlot}s
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {availableItems.map(item => (
              <div
                key={item.id}
                onClick={() => onEquip(item, selectedSlot)}
                className={cn(
                  'p-3 rounded-lg border cursor-pointer hover:scale-105 transition-transform',
                  RARITY_COLORS[item.rarity]
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <h4 className={cn('font-bold text-sm', RARITY_TEXT[item.rarity])}>
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-300">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
            {availableItems.length === 0 && (
              <p className="text-gray-400 col-span-2 text-center py-4">
                No {selectedSlot}s available
              </p>
            )}
          </div>
        </div>
      )}
      
      <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-600">
        <h3 className="text-lg font-bold text-white mb-3">Inventory</h3>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {inventory.map(item => (
            <div
              key={item.id}
              className={cn(
                'p-2 rounded-lg border text-center',
                RARITY_COLORS[item.rarity]
              )}
            >
              <span className="text-2xl">{item.emoji}</span>
              <p className={cn('text-xs font-bold mt-1', RARITY_TEXT[item.rarity])}>
                {item.name}
              </p>
            </div>
          ))}
          {inventory.length === 0 && (
            <p className="text-gray-400 col-span-full text-center py-4">
              No items in inventory
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionScreen;
```

---

## Phase 4: Boss Battle System

### 4.1 Current State Analysis

**Da Capo Dungeon Bosses**
- Multi-stage challenges with HP tracking
- `BossBattleMeta` tracks damage, potions used, shield usage
- Boss-specific music tracks
- Special tile types (MiniBoss, BigBoss, BossBody)
- Victory converts boss to stairs

**Cadence Quest Bosses**
- Single challenge per encounter
- No special mechanics
- Basic damage calculation
- No boss identity beyond name
- No multi-stage battles

### 4.2 Boss Encounter Design

**Boss Structure**

```typescript
// shared/types/cadence-quest.ts (extend)

export interface BossEncounter {
  id: string;
  name: string;
  title: string;
  regionId: string;
  description: string;
  
  // Visual identity
  spritePath: string;
  emoji: string;
  
  // Battle mechanics
  stages: BossStage[];
  abilities: BossAbility[];
  
  // Stats
  maxHp: number;
  level: number;
  
  // Rewards
  guaranteedDrops: Equipment[];
  possibleDrops: Equipment[];
  xpReward: number;
  goldReward: number;
  
  // Lore
  flavorText: string;
  defeatQuote: string;
}

export interface BossStage {
  order: number;
  discipline: MusicDiscipline;
  difficulty: Difficulty;
  
  // Damage mechanics
  correctAnswerDamage: number;     // Damage to boss on correct
  wrongAnswerDamage: number;       // Damage to player on wrong
  
  // Stage-specific modifiers
  timeLimit?: number;              // Seconds
  comboRequired?: number;          // Need X correct in a row
  abilityTriggers?: string[];      // Abilities that activate this stage
}

export interface BossAbility {
  id: string;
  name: string;
  description: string;
  trigger: 'on_stage_start' | 'on_correct' | 'on_wrong' | 'on_hp_threshold';
  triggerValue?: number;           // HP % for threshold triggers
  
  effect: {
    type: 'buff_self' | 'debuff_player' | 'environment_change' | 'heal';
    duration?: number;             // Turns
    value?: number;                // Magnitude
  };
  
  // Visual/audio
  animationPath?: string;
  soundEffect?: string;
}
```

### 4.3 Boss Database

**Create**: `cadence-quest/logic/boss-data.ts`

```typescript
import type { BossEncounter } from '@shared/types/cadence-quest';

export const BOSSES: BossEncounter[] = [
  // RHYTHM REALM BOSS
  {
    id: 'metronome-mage',
    name: 'Chronos',
    title: 'The Metronome Mage',
    regionId: 'rhythm-realm',
    description: 'Master of tempo and timing',
    spritePath: '/images/cadence-quest/bosses/metronome-mage.svg',
    emoji: '⏱️',
    maxHp: 150,
    level: 5,
    stages: [
      {
        order: 1,
        discipline: 'rhythm',
        difficulty: 'medium',
        correctAnswerDamage: 25,
        wrongAnswerDamage: 15,
        timeLimit: 20,
      },
      {
        order: 2,
        discipline: 'rhythm',
        difficulty: 'medium',
        correctAnswerDamage: 30,
        wrongAnswerDamage: 20,
        abilityTriggers: ['tempo-shift'],
      },
      {
        order: 3,
        discipline: 'rhythm',
        difficulty: 'hard',
        correctAnswerDamage: 35,
        wrongAnswerDamage: 25,
        comboRequired: 2,
      },
    ],
    abilities: [
      {
        id: 'tempo-shift',
        name: 'Tempo Shift',
        description: 'Increases challenge speed by 20%',
        trigger: 'on_stage_start',
        triggerValue: 2,
        effect: {
          type: 'environment_change',
          duration: 1,
          value: 1.2,
        },
        soundEffect: 'tempo-shift.wav',
      },
      {
        id: 'rhythm-mirror',
        name: 'Rhythm Mirror',
        description: 'Reflects 50% of damage back to player',
        trigger: 'on_hp_threshold',
        triggerValue: 50,
        effect: {
          type: 'buff_self',
          duration: 2,
          value: 0.5,
        },
      },
    ],
    guaranteedDrops: [],
    possibleDrops: [], // From boss-drops.ts
    xpReward: 500,
    goldReward: 300,
    flavorText: 'Time flows differently in the Rhythm Realm...',
    defeatQuote: 'Your timing... is impeccable...',
  },
  
  // MELODY MOUNTAINS BOSS
  {
    id: 'siren-sovereign',
    name: 'Aria',
    title: 'The Siren Sovereign',
    regionId: 'melody-mountains',
    description: 'Her voice can shatter mountains',
    spritePath: '/images/cadence-quest/bosses/siren.svg',
    emoji: '👸',
    maxHp: 180,
    level: 10,
    stages: [
      {
        order: 1,
        discipline: 'pitch',
        difficulty: 'medium',
        correctAnswerDamage: 30,
        wrongAnswerDamage: 18,
      },
      {
        order: 2,
        discipline: 'pitch',
        difficulty: 'hard',
        correctAnswerDamage: 35,
        wrongAnswerDamage: 22,
        abilityTriggers: ['siren-song'],
      },
      {
        order: 3,
        discipline: 'pitch',
        difficulty: 'hard',
        correctAnswerDamage: 40,
        wrongAnswerDamage: 28,
        comboRequired: 3,
      },
    ],
    abilities: [
      {
        id: 'siren-song',
        name: 'Siren Song',
        description: 'Confuses the player, swapping answer options',
        trigger: 'on_stage_start',
        triggerValue: 2,
        effect: {
          type: 'debuff_player',
          duration: 1,
          value: 1,
        },
      },
      {
        id: 'perfect-pitch-aura',
        name: 'Perfect Pitch Aura',
        description: 'Heals 10% HP on correct answer',
        trigger: 'on_correct',
        effect: {
          type: 'heal',
          value: 0.1,
        },
      },
    ],
    guaranteedDrops: [], // Silver Tuning Fork
    possibleDrops: [],
    xpReward: 800,
    goldReward: 450,
    flavorText: 'Only those with perfect pitch may pass...',
    defeatQuote: 'Your melody... surpasses even mine...',
  },
  
  // HARMONY HARBOR BOSS
  {
    id: 'chord-kraken',
    name: 'Harmonia',
    title: 'The Chord Kraken',
    regionId: 'harmony-harbor',
    description: 'Guardian of harmonic secrets',
    spritePath: '/images/cadence-quest/bosses/kraken.svg',
    emoji: '🦑',
    maxHp: 220,
    level: 15,
    stages: [
      {
        order: 1,
        discipline: 'harmony',
        difficulty: 'medium',
        correctAnswerDamage: 35,
        wrongAnswerDamage: 20,
      },
      {
        order: 2,
        discipline: 'harmony',
        difficulty: 'hard',
        correctAnswerDamage: 40,
        wrongAnswerDamage: 25,
        abilityTriggers: ['dissonance-wave'],
      },
      {
        order: 3,
        discipline: 'harmony',
        difficulty: 'hard',
        correctAnswerDamage: 45,
        wrongAnswerDamage: 30,
        comboRequired: 3,
      },
    ],
    abilities: [
      {
        id: 'dissonance-wave',
        name: 'Dissonance Wave',
        description: 'Reduces player accuracy by 15%',
        trigger: 'on_stage_start',
        triggerValue: 2,
        effect: {
          type: 'debuff_player',
          duration: 2,
          value: 0.15,
        },
      },
      {
        id: 'harmonic-shield',
        name: 'Harmonic Shield',
        description: 'Absorbs next 30 damage',
        trigger: 'on_hp_threshold',
        triggerValue: 40,
        effect: {
          type: 'buff_self',
          value: 30,
        },
      },
    ],
    guaranteedDrops: [], // Harmony Lute
    possibleDrops: [],
    xpReward: 1200,
    goldReward: 600,
    flavorText: 'The depths hold many harmonic mysteries...',
    defeatQuote: 'Your resonance... rings true...',
  },
  
  // DYNAMICS DESERT BOSS
  {
    id: 'fortress-phoenix',
    name: 'Crescendo',
    title: 'The Fortress Phoenix',
    regionId: 'dynamics-desert',
    description: 'Born from the loudest crescendo',
    spritePath: '/images/cadence-quest/bosses/phoenix.svg',
    emoji: '🔥',
    maxHp: 260,
    level: 20,
    stages: [
      {
        order: 1,
        discipline: 'dynamics',
        difficulty: 'medium',
        correctAnswerDamage: 40,
        wrongAnswerDamage: 25,
      },
      {
        order: 2,
        discipline: 'dynamics',
        difficulty: 'hard',
        correctAnswerDamage: 45,
        wrongAnswerDamage: 30,
        abilityTriggers: ['fortissimo-burst'],
      },
      {
        order: 3,
        discipline: 'dynamics',
        difficulty: 'hard',
        correctAnswerDamage: 50,
        wrongAnswerDamage: 35,
        comboRequired: 3,
      },
    ],
    abilities: [
      {
        id: 'fortissimo-burst',
        name: 'Fortissimo Burst',
        description: 'Deals 40 damage to player',
        trigger: 'on_stage_start',
        triggerValue: 2,
        effect: {
          type: 'environment_change',
          value: 40,
        },
      },
      {
        id: 'phoenix-rebirth',
        name: 'Phoenix Rebirth',
        description: 'Heals 20% HP when below 30%',
        trigger: 'on_hp_threshold',
        triggerValue: 30,
        effect: {
          type: 'heal',
          value: 0.2,
        },
      },
    ],
    guaranteedDrops: [],
    possibleDrops: [],
    xpReward: 1500,
    goldReward: 750,
    flavorText: 'From piano to fortissimo, I have risen...',
    defeatQuote: 'Even in silence... my legacy endures...',
  },
  
  // THEORY TOWER BOSS
  {
    id: 'grand-maestro',
    name: 'Maestro Fortissimo',
    title: 'The Grand Maestro',
    regionId: 'theory-tower',
    description: 'The ultimate musical challenge',
    spritePath: '/images/cadence-quest/bosses/maestro.svg',
    emoji: '🎼',
    maxHp: 350,
    level: 25,
    stages: [
      {
        order: 1,
        discipline: 'theory',
        difficulty: 'hard',
        correctAnswerDamage: 50,
        wrongAnswerDamage: 30,
      },
      {
        order: 2,
        discipline: 'theory',
        difficulty: 'hard',
        correctAnswerDamage: 55,
        wrongAnswerDamage: 35,
        abilityTriggers: ['counterpoint-storm'],
      },
      {
        order: 3,
        discipline: 'theory',
        difficulty: 'hard',
        correctAnswerDamage: 60,
        wrongAnswerDamage: 40,
        comboRequired: 4,
      },
      {
        order: 4,
        discipline: 'theory',
        difficulty: 'hard',
        correctAnswerDamage: 70,
        wrongAnswerDamage: 50,
        timeLimit: 15,
        abilityTriggers: ['final-crescendo'],
      },
    ],
    abilities: [
      {
        id: 'counterpoint-storm',
        name: 'Counterpoint Storm',
        description: 'Mixes all challenge types randomly',
        trigger: 'on_stage_start',
        triggerValue: 2,
        effect: {
          type: 'environment_change',
          duration: 2,
        },
      },
      {
        id: 'theory-mastery',
        name: 'Theory Mastery',
        description: 'All damage reduced by 30%',
        trigger: 'on_hp_threshold',
        triggerValue: 50,
        effect: {
          type: 'buff_self',
          duration: 99,
          value: 0.3,
        },
      },
      {
        id: 'final-crescendo',
        name: 'Final Crescendo',
        description: 'Doubles damage for both players',
        trigger: 'on_stage_start',
        triggerValue: 4,
        effect: {
          type: 'environment_change',
          duration: 1,
          value: 2.0,
        },
      },
    ],
    guaranteedDrops: [], // Symphony Blade
    possibleDrops: [],
    xpReward: 2500,
    goldReward: 1200,
    flavorText: 'You have climbed far, but theory is infinite...',
    defeatQuote: 'At last... a true master of music...',
  },
];
```

### 4.4 Boss Battle Engine

**Create**: `cadence-quest/logic/boss-battle-engine.ts`

```typescript
import type {
  BossEncounter,
  BossStage,
  BossAbility,
  BattleState,
  MusicChallenge,
  ChallengeAnswer,
  Character,
} from '@shared/types/cadence-quest';
import { CadenceChallengeAdapter } from './challenge-adapter';
import { BattleAudio } from '../audio/battle-audio';

export interface BossBattleState {
  boss: BossEncounter;
  currentStage: number;
  bossHp: number;
  bossMaxHp: number;
  activeAbilities: Map<string, number>;  // abilityId -> turns remaining
  playerDebuffs: Map<string, number>;    // debuffId -> turns remaining
  combo: number;                         // Current combo count
  turnCount: number;
}

export class BossBattleEngine {
  private challengeAdapter: CadenceChallengeAdapter;
  private audio: BattleAudio;
  
  constructor(
    private character: Character,
    private boss: BossEncounter
  ) {
    this.challengeAdapter = new CadenceChallengeAdapter(
      character.class,
      character.level,
      character.stats.skillTreeEffects
    );
    this.audio = new BattleAudio();
  }
  
  initializeBattle(): BossBattleState {
    // Start boss theme music
    this.audio.startBossTheme(this.boss.regionId);
    
    return {
      boss: this.boss,
      currentStage: 0,
      bossHp: this.boss.maxHp,
      bossMaxHp: this.boss.maxHp,
      activeAbilities: new Map(),
      playerDebuffs: new Map(),
      combo: 0,
      turnCount: 0,
    };
  }
  
  generateChallenge(state: BossBattleState): MusicChallenge {
    const stage = this.getCurrentStage(state);
    
    // Generate challenge for this stage
    const challenge = this.challengeAdapter.generateChallenge(
      stage.discipline,
      true  // isBoss = true
    );
    
    // Apply boss ability modifiers
    let modifiedChallenge = challenge;
    
    // Tempo Shift: Increase speed
    if (state.activeAbilities.has('tempo-shift') && challenge.type === 'rhythmTap') {
      modifiedChallenge = {
        ...challenge,
        bpm: Math.floor(challenge.bpm * 1.2),
      };
    }
    
    // Siren Song: Shuffle options (handled in UI)
    if (state.playerDebuffs.has('siren-song')) {
      modifiedChallenge = { ...challenge, shuffled: true };
    }
    
    return modifiedChallenge;
  }
  
  processAnswer(
    state: BossBattleState,
    challenge: MusicChallenge,
    answer: ChallengeAnswer,
    isCorrect: boolean
  ): {
    newState: BossBattleState;
    damageToBoss: number;
    damageToPlayer: number;
    abilitiesTriggered: BossAbility[];
    stageCompleted: boolean;
    battleCompleted: boolean;
  } {
    const stage = this.getCurrentStage(state);
    let newState = { ...state };
    let damageToBoss = 0;
    let damageToPlayer = 0;
    const abilitiesTriggered: BossAbility[] = [];
    
    // Calculate damage
    if (isCorrect) {
      damageToBoss = this.calculateDamageToBoss(stage, state);
      newState.bossHp = Math.max(0, newState.bossHp - damageToBoss);
      newState.combo += 1;
      
      // Trigger boss heal abilities (Siren's Perfect Pitch Aura)
      const healAbilities = this.boss.abilities.filter(
        a => a.trigger === 'on_correct' && a.effect.type === 'heal'
      );
      for (const ability of healAbilities) {
        const healAmount = Math.floor(this.boss.maxHp * (ability.effect.value || 0));
        newState.bossHp = Math.min(this.boss.maxHp, newState.bossHp + healAmount);
        abilitiesTriggered.push(ability);
      }
    } else {
      damageToPlayer = this.calculateDamageToPlayer(stage, state);
      newState.combo = 0;
      
      // Reflect damage if Rhythm Mirror is active
      if (state.activeAbilities.has('rhythm-mirror')) {
        const reflectedDamage = Math.floor(damageToBoss * 0.5);
        damageToPlayer += reflectedDamage;
      }
    }
    
    // Update turn count
    newState.turnCount += 1;
    
    // Decrement ability/debuff durations
    newState = this.decrementDurations(newState);
    
    // Check for ability triggers
    newState = this.checkAbilityTriggers(newState, abilitiesTriggered);
    
    // Check stage completion
    const stageCompleted = this.isStageComplete(newState);
    if (stageCompleted) {
      newState.currentStage += 1;
      newState.combo = 0;
    }
    
    // Check battle completion
    const battleCompleted = newState.bossHp <= 0 || 
                           newState.currentStage >= this.boss.stages.length;
    
    return {
      newState,
      damageToBoss,
      damageToPlayer,
      abilitiesTriggered,
      stageCompleted,
      battleCompleted,
    };
  }
  
  private getCurrentStage(state: BossBattleState): BossStage {
    return this.boss.stages[state.currentStage];
  }
  
  private calculateDamageToBoss(stage: BossStage, state: BossBattleState): number {
    let damage = stage.correctAnswerDamage;
    
    // Apply damage reduction from Theory Mastery
    if (state.activeAbilities.has('theory-mastery')) {
      damage = Math.floor(damage * 0.7);
    }
    
    // Apply Final Crescendo double damage
    if (state.activeAbilities.has('final-crescendo')) {
      damage = Math.floor(damage * 2);
    }
    
    return damage;
  }
  
  private calculateDamageToPlayer(stage: BossStage, state: BossBattleState): number {
    let damage = stage.wrongAnswerDamage;
    
    // Apply Final Crescendo double damage
    if (state.activeAbilities.has('final-crescendo')) {
      damage = Math.floor(damage * 2);
    }
    
    return damage;
  }
  
  private checkAbilityTriggers(
    state: BossBattleState,
    triggered: BossAbility[]
  ): BossBattleState {
    let newState = { ...state };
    
    for (const ability of this.boss.abilities) {
      // Skip if already triggered
      if (triggered.some(a => a.id === ability.id)) continue;
      
      // Check trigger conditions
      let shouldTrigger = false;
      
      switch (ability.trigger) {
        case 'on_stage_start':
          const stageIndex = ability.triggerValue;
          if (newState.currentStage === stageIndex) {
            shouldTrigger = true;
          }
          break;
          
        case 'on_hp_threshold':
          const threshold = ability.triggerValue || 0;
          const hpPercent = (newState.bossHp / newState.bossMaxHp) * 100;
          if (hpPercent <= threshold) {
            shouldTrigger = true;
          }
          break;
      }
      
      if (shouldTrigger) {
        triggered.push(ability);
        
        // Apply ability effect
        switch (ability.effect.type) {
          case 'buff_self':
            if (ability.effect.duration) {
              newState.activeAbilities.set(ability.id, ability.effect.duration);
            }
            break;
            
          case 'debuff_player':
            if (ability.effect.duration) {
              newState.playerDebuffs.set(ability.id, ability.effect.duration);
            }
            break;
            
          case 'heal':
            const healAmount = Math.floor(newState.bossMaxHp * (ability.effect.value || 0));
            newState.bossHp = Math.min(newState.bossMaxHp, newState.bossHp + healAmount);
            break;
        }
        
        // Play ability sound
        if (ability.soundEffect) {
          this.audio.playAbilityActivation(ability.name);
        }
      }
    }
    
    return newState;
  }
  
  private isStageComplete(state: BossBattleState): boolean {
    const stage = this.getCurrentStage(state);
    
    // Boss HP depleted
    if (state.bossHp <= 0) return true;
    
    // Combo requirement met
    if (stage.comboRequired && state.combo >= stage.comboRequired) {
      return true;
    }
    
    // Could add more stage completion conditions
    return false;
  }
  
  private decrementDurations(state: BossBattleState): BossBattleState {
    const newState = { ...state };
    
    // Decrement boss abilities
    for (const [abilityId, turns] of newState.activeAbilities) {
      if (turns <= 1) {
        newState.activeAbilities.delete(abilityId);
      } else {
        newState.activeAbilities.set(abilityId, turns - 1);
      }
    }
    
    // Decrement player debuffs
    for (const [debuffId, turns] of newState.playerDebuffs) {
      if (turns <= 1) {
        newState.playerDebuffs.delete(debuffId);
      } else {
        newState.playerDebuffs.set(debuffId, turns - 1);
      }
    }
    
    return newState;
  }
}
```

### 4.5 Boss Battle UI

**Create**: `cadence-quest/BossBattleScreen.tsx`

```typescript
import React, { useState, useCallback } from 'react';
import { BossBattleEngine, BossBattleState } from './logic/boss-battle-engine';
import type { BossEncounter, Character, MusicChallenge, ChallengeAnswer } from '@shared/types/cadence-quest';
import ChallengePanel from './ChallengePanel';
import BattleHUD from './BattleHUD';
import { cn } from '@/common/utils/utils';

interface BossBattleScreenProps {
  boss: BossEncounter;
  character: Character;
  onVictory: (won: boolean, xpEarned: number, goldEarned: number, drops: Equipment[]) => void;
}

const BossBattleScreen: React.FC<BossBattleScreenProps> = ({
  boss,
  character,
  onVictory,
}) => {
  const engine = new BossBattleEngine(character, boss);
  const [battleState, setBattleState] = useState<BossBattleState>(() => 
    engine.initializeBattle()
  );
  const [currentChallenge, setCurrentChallenge] = useState<MusicChallenge | null>(null);
  const [challengeShownAt, setChallengeShownAt] = useState<number>(0);
  const [playerHp, setPlayerHp] = useState(character.stats.maxHp);
  const [lastResult, setLastResult] = useState<{
    damageToBoss: number;
    damageToPlayer: number;
    abilities: BossAbility[];
  } | null>(null);
  
  // Generate first challenge on mount
  React.useEffect(() => {
    const challenge = engine.generateChallenge(battleState);
    setCurrentChallenge(challenge);
    setChallengeShownAt(Date.now());
  }, []);
  
  const handleAnswer = useCallback((answer: ChallengeAnswer) => {
    if (!currentChallenge) return;
    
    const isCorrect = validateAnswer(currentChallenge, answer);
    
    const result = engine.processAnswer(
      battleState,
      currentChallenge,
      answer,
      isCorrect
    );
    
    setBattleState(result.newState);
    setLastResult({
      damageToBoss: result.damageToBoss,
      damageToPlayer: result.damageToPlayer,
      abilities: result.abilitiesTriggered,
    });
    
    // Apply damage to player
    if (result.damageToPlayer > 0) {
      setPlayerHp(prev => Math.max(0, prev - result.damageToPlayer));
    }
    
    // Check battle end
    if (result.battleCompleted) {
      const won = result.newState.bossHp <= 0;
      onVictory(
        won,
        won ? boss.xpReward : 0,
        won ? boss.goldReward : 0,
        won ? rollBossDrop(boss.regionId) : []
      );
      return;
    }
    
    // Generate next challenge
    if (result.stageCompleted) {
      // Show stage transition
      setTimeout(() => {
        const nextChallenge = engine.generateChallenge(result.newState);
        setCurrentChallenge(nextChallenge);
        setChallengeShownAt(Date.now());
        setLastResult(null);
      }, 1500);
    } else {
      const nextChallenge = engine.generateChallenge(result.newState);
      setCurrentChallenge(nextChallenge);
      setChallengeShownAt(Date.now());
      setLastResult(null);
    }
  }, [currentChallenge, battleState, engine, boss, onVictory]);
  
  const stage = boss.stages[battleState.currentStage];
  const bossHpPercent = (battleState.bossHp / battleState.bossMaxHp) * 100;
  
  return (
    <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto">
      {/* Boss Header */}
      <div className="bg-gradient-to-r from-red-900/40 to-purple-900/40 rounded-xl p-6 border border-red-500/30">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-6xl">{boss.emoji}</span>
          <div>
            <h2 className="text-2xl font-bold text-red-300">{boss.name}</h2>
            <p className="text-sm text-purple-300">{boss.title}</p>
          </div>
        </div>
        
        {/* Boss HP Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">HP</span>
            <span className="text-red-300">{battleState.bossHp} / {battleState.bossMaxHp}</span>
          </div>
          <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
              style={{ width: `${bossHpPercent}%` }}
            />
          </div>
        </div>
        
        {/* Stage Indicator */}
        <div className="flex gap-2 mt-3">
          {boss.stages.map((s, i) => (
            <div
              key={i}
              className={cn(
                'flex-1 h-2 rounded-full',
                i < battleState.currentStage ? 'bg-green-500' :
                i === battleState.currentStage ? 'bg-yellow-500' :
                'bg-gray-700'
              )}
            />
          ))}
        </div>
      </div>
      
      {/* Player HUD */}
      <BattleHUD
        player={{
          id: character.id,
          name: character.name,
          class: character.class,
          hp: playerHp,
          maxHp: character.stats.maxHp,
          streak: battleState.combo,
          isPlayer: true,
        }}
        opponent={{
          id: boss.id,
          name: boss.name,
          class: character.class,
          hp: battleState.bossHp,
          maxHp: battleState.bossMaxHp,
          streak: 0,
          isPlayer: false,
        }}
        activeTurn="player"
        streak={battleState.combo}
      />
      
      {/* Active Abilities Display */}
      {battleState.activeAbilities.size > 0 && (
        <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/20">
          <h4 className="text-sm font-bold text-red-300 mb-2">Boss Buffs</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from(battleState.activeAbilities.entries()).map(([id, turns]) => {
              const ability = boss.abilities.find(a => a.id === id);
              return ability ? (
                <div key={id} className="bg-red-800/50 px-3 py-1 rounded text-sm text-red-200">
                  {ability.name} ({turns})
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
      
      {/* Player Debuffs Display */}
      {battleState.playerDebuffs.size > 0 && (
        <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/20">
          <h4 className="text-sm font-bold text-purple-300 mb-2">Your Debuffs</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from(battleState.playerDebuffs.entries()).map(([id, turns]) => {
              const ability = boss.abilities.find(a => a.id === id);
              return ability ? (
                <div key={id} className="bg-purple-800/50 px-3 py-1 rounded text-sm text-purple-200">
                  {ability.name} ({turns})
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
      
      {/* Last Result Feedback */}
      {lastResult && (
        <div className={cn(
          'rounded-lg p-3 border',
          lastResult.damageToBoss > 0 
            ? 'bg-green-900/30 border-green-500/30'
            : 'bg-red-900/30 border-red-500/30'
        )}>
          {lastResult.damageToBoss > 0 && (
            <p className="text-green-300 text-sm">
              Dealt {lastResult.damageToBoss} damage!
            </p>
          )}
          {lastResult.damageToPlayer > 0 && (
            <p className="text-red-300 text-sm">
              Took {lastResult.damageToPlayer} damage!
            </p>
          )}
          {lastResult.abilities.map(ability => (
            <p key={ability.id} className="text-amber-300 text-sm mt-1">
              <strong>{ability.name}:</strong> {ability.description}
            </p>
          ))}
        </div>
      )}
      
      {/* Challenge Panel */}
      {currentChallenge && (
        <div className="bg-gray-800/80 rounded-xl p-6 border border-purple-500/30">
          <ChallengePanel
            challenge={currentChallenge}
            shownAt={challengeShownAt}
            onAnswer={handleAnswer}
            disabled={false}
          />
        </div>
      )}
      
      {/* Stage Info */}
      <div className="text-center text-sm text-gray-400">
        Stage {battleState.currentStage + 1} / {boss.stages.length} • 
        {stage.discipline} challenge • 
        {stage.comboRequired && ` Need ${stage.comboRequired} combo`}
        {stage.timeLimit && ` ${stage.timeLimit}s time limit`}
      </div>
    </div>
  );
};

export default BossBattleScreen;
```

---

## Phase 5: Victory & Rewards System

### 5.1 Current State Analysis

**Da Capo Dungeon Victory**
- Simple victory/defeat screen
- Floor completion modal
- High gold tracking in localStorage
- Chest reward modal with item display

**Cadence Quest Victory**
- Minimal text-only screen
- No XP display
- No level-up notifications
- No item drop visualization
- No stats summary

### 5.2 Enhanced Victory Screen

**Replace**: `cadence-quest/VictoryScreen.tsx`

```typescript
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw, Star, Coins, Sword, Heart } from 'lucide-react';
import type { Equipment } from '@shared/types/cadence-quest';
import { cn } from '@/common/utils/utils';

interface VictoryScreenProps {
  victory: boolean;
  xpEarned: number;
  goldEarned: number;
  itemsDropped: Equipment[];
  leveledUp: boolean;
  newLevel?: number;
  stats: {
    challengesCorrect: number;
    challengesTotal: number;
    maxCombo: number;
    averageResponseTime: number;
  };
  onContinue: () => void;
}

const RARITY_COLORS = {
  common: 'border-gray-500 bg-gray-500/20',
  uncommon: 'border-green-500 bg-green-500/20',
  rare: 'border-blue-500 bg-blue-500/20',
  epic: 'border-purple-500 bg-purple-500/20',
  legendary: 'border-amber-500 bg-amber-500/20 animate-pulse',
};

const VictoryScreen: React.FC<VictoryScreenProps> = ({
  victory,
  xpEarned,
  goldEarned,
  itemsDropped,
  leveledUp,
  newLevel,
  stats,
  onContinue,
}) => {
  const accuracy = stats.challengesTotal > 0
    ? Math.round((stats.challengesCorrect / stats.challengesTotal) * 100)
    : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-6 p-8 max-w-2xl mx-auto"
    >
      {/* Victory/Defeat Header */}
      <div className="flex flex-col items-center gap-2">
        {victory ? (
          <>
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Trophy className="w-20 h-20 text-amber-500" />
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-amber-600"
            >
              Victory!
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-purple-800 text-center"
            >
              Your musical prowess prevails!
            </motion.p>
          </>
        ) : (
          <>
            <RotateCcw className="w-20 h-20 text-slate-600" />
            <h2 className="text-4xl font-bold text-slate-600">Defeat</h2>
            <p className="text-purple-800 text-center">
              Better luck next time. Keep practicing!
            </p>
          </>
        )}
      </div>
      
      {/* Level Up Notification */}
      <AnimatePresence>
        {leveledUp && newLevel && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="bg-gradient-to-r from-amber-600 to-amber-500 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8" />
              <div>
                <h3 className="text-2xl font-bold">Level Up!</h3>
                <p className="text-amber-100">You are now level {newLevel}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Rewards */}
      {victory && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full bg-gray-800/80 rounded-xl p-6 border border-purple-500/30"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Star className="text-amber-500" />
            Rewards
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-300 mb-1">
                <Star size={16} />
                <span className="text-sm">XP Earned</span>
              </div>
              <p className="text-2xl font-bold text-purple-200">+{xpEarned}</p>
            </div>
            
            <div className="bg-amber-900/30 rounded-lg p-4 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-300 mb-1">
                <Coins size={16} />
                <span className="text-sm">Gold Earned</span>
              </div>
              <p className="text-2xl font-bold text-amber-200">+{goldEarned}</p>
            </div>
          </div>
          
          {/* Item Drops */}
          {itemsDropped.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                <Sword size={16} />
                Items Dropped
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {itemsDropped.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className={cn(
                      'p-3 rounded-lg border flex items-center gap-3',
                      RARITY_COLORS[item.rarity]
                    )}
                  >
                    <span className="text-3xl">{item.emoji}</span>
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="text-xs text-gray-300 capitalize">{item.rarity}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
      
      {/* Battle Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full bg-gray-800/60 rounded-xl p-6 border border-gray-600"
      >
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Heart className="text-red-400" />
          Battle Statistics
        </h3>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Accuracy:</span>
            <span className={cn(
              'font-bold',
              accuracy >= 80 ? 'text-green-400' :
              accuracy >= 60 ? 'text-yellow-400' :
              'text-red-400'
            )}>
              {accuracy}%
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Challenges:</span>
            <span className="text-white">
              {stats.challengesCorrect} / {stats.challengesTotal}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Max Combo:</span>
            <span className="text-amber-400">{stats.maxCombo}x</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Avg. Response:</span>
            <span className="text-blue-400">
              {(stats.averageResponseTime / 1000).toFixed(1)}s
            </span>
          </div>
        </div>
      </motion.div>
      
      {/* Continue Button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={onContinue}
        className="px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg transition-colors"
      >
        Continue
      </motion.button>
    </motion.div>
  );
};

export default VictoryScreen;
```

### 5.3 XP & Leveling System

**Create**: `cadence-quest/logic/experience-system.ts`

```typescript
import type { Character } from '@shared/types/cadence-quest';

export interface LevelUpResult {
  leveledUp: boolean;
  newLevel: number;
  newSkillPoints: number;
  unlockedAbilities: string[];
}

export function calculateLevelFromXp(xp: number): number {
  // XP curve: Level = floor(sqrt(xp / 100))
  // Level 1: 0-99 XP
  // Level 2: 100-399 XP
  // Level 3: 400-899 XP
  // Level 5: 1600-2499 XP
  // Level 10: 8100-9999 XP
  // Level 20: 36100-39999 XP
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function xpNeededForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

export function processXpGain(
  character: Character,
  xpGained: number
): LevelUpResult {
  const currentXp = character.stats.xp + xpGained;
  const currentLevel = character.level;
  const newLevel = calculateLevelFromXp(currentXp);
  
  const leveledUp = newLevel > currentLevel;
  const levelDiff = newLevel - currentLevel;
  
  // Grant skill points on level up (1 per level)
  const newSkillPoints = leveledUp ? levelDiff : 0;
  
  // Check for unlocked abilities
  const unlockedAbilities: string[] = [];
  if (leveledUp) {
    for (let lvl = currentLevel + 1; lvl <= newLevel; lvl++) {
      const abilities = ABILITIES_UNLOCKED_AT_LEVEL[lvl];
      if (abilities) {
        unlockedAbilities.push(...abilities);
      }
    }
  }
  
  return {
    leveledUp,
    newLevel,
    newSkillPoints,
    unlockedAbilities,
  };
}

// Abilities unlocked at specific levels
const ABILITIES_UNLOCKED_AT_LEVEL: Record<number, string[]> = {
  5: ['class_ability_1'],   // Bard: Perfect Pitch, Drummer: Double Time, etc.
  10: ['class_ability_2'],
  15: ['class_ability_3'],
  20: ['ultimate_ability'],
};
```

### 5.4 Battle Stats Tracking

**Extend**: `cadence-quest/logic/useGameState.ts`

```typescript
interface BattleStats {
  challengesCorrect: number;
  challengesTotal: number;
  maxCombo: number;
  totalResponseTime: number;
  startTime: number;
}

export function useGameState() {
  const [battleStats, setBattleStats] = useState<BattleStats | null>(null);
  
  const startBattleTracking = useCallback(() => {
    setBattleStats({
      challengesCorrect: 0,
      challengesTotal: 0,
      maxCombo: 0,
      totalResponseTime: 0,
      startTime: Date.now(),
    });
  }, []);
  
  const recordChallengeResult = useCallback((
    correct: boolean,
    responseTime: number,
    currentCombo: number
  ) => {
    setBattleStats(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        challengesTotal: prev.challengesTotal + 1,
        challengesCorrect: correct 
          ? prev.challengesCorrect + 1 
          : prev.challengesCorrect,
        maxCombo: Math.max(prev.maxCombo, currentCombo),
        totalResponseTime: prev.totalResponseTime + responseTime,
      };
    });
  }, []);
  
  const getFinalStats = useCallback((): BattleStats | null => {
    if (!battleStats) return null;
    
    return {
      ...battleStats,
      averageResponseTime: battleStats.challengesTotal > 0
        ? battleStats.totalResponseTime / battleStats.challengesTotal
        : 0,
    };
  }, [battleStats]);
  
  return {
    // ... existing state
    battleStats,
    startBattleTracking,
    recordChallengeResult,
    getFinalStats,
  };
}
```

---

## Phase 6: Musical Oracle (Special Encounters)

### 6.1 Design Philosophy

**Da Capo Fortune Teller**: Random temporary buffs
**Cadence Quest Musical Oracle**: Discipline-specific narrative encounters with permanent/semi-permanent effects

### 6.2 Oracle Encounter Structure

```typescript
// shared/types/cadence-quest.ts

export interface OracleEncounter {
  id: string;
  name: string;
  description: string;
  spritePath: string;
  emoji: string;
  
  // Oracle offers 3 blessings, player picks 1
  blessings: OracleBlessing[];
  
  // Lore
  flavorText: string;
}

export interface OracleBlessing {
  id: string;
  name: string;
  description: string;
  emoji: string;
  
  effect: {
    type: 'damage_boost' | 'accuracy_boost' | 'heal' | 'insight' | 'luck';
    discipline?: MusicDiscipline;  // Discipline-specific or general
    value: number;                // Magnitude
    duration: 'next_battle' | 'permanent' | 'next_3_battles';
  };
  
  flavorText: string;
}
```

### 6.3 Oracle Database

**Create**: `cadence-quest/logic/oracle-data.ts`

```typescript
import type { OracleEncounter } from '@shared/types/cadence-quest';

export const ORACLE_ENCOUNTERS: OracleEncounter[] = [
  {
    id: 'muse-of-melody',
    name: 'The Muse of Melody',
    description: 'A spectral figure humming an eternal song',
    spritePath: '/images/cadence-quest/oracle/muse.svg',
    emoji: '👼',
    blessings: [
      {
        id: 'muse-insight',
        name: 'Melodic Insight',
        description: '+20% accuracy on pitch challenges for next 3 battles',
        emoji: '🎯',
        effect: {
          type: 'accuracy_boost',
          discipline: 'pitch',
          value: 0.2,
          duration: 'next_3_battles',
        },
        flavorText: 'The Muse shares her perfect pitch with you',
      },
      {
        id: 'muse-healing',
        name: 'Soothing Melody',
        description: 'Heal to full HP',
        emoji: '💚',
        effect: {
          type: 'heal',
          value: 1.0,  // 100% heal
          duration: 'next_battle',
        },
        flavorText: 'Her song washes away your wounds',
      },
      {
        id: 'muse-luck',
        name: 'Lucky Melody',
        description: 'Double gold from next battle',
        emoji: '🍀',
        effect: {
          type: 'luck',
          value: 2.0,
          duration: 'next_battle',
        },
        flavorText: 'Fortune favors the melodious',
      },
    ],
    flavorText: 'The Muse appears before those who seek musical truth...',
  },
  
  {
    id: 'rhythm-sage',
    name: 'The Rhythm Sage',
    description: 'An ancient drummer whose beats transcend time',
    spritePath: '/images/cadence-quest/oracle/sage.svg',
    emoji: '🥁',
    blessings: [
      {
        id: 'sage-tempo',
        name: 'Temporal Rhythm',
        description: '+100ms timing tolerance on rhythm challenges for next battle',
        emoji: '⏱️',
        effect: {
          type: 'accuracy_boost',
          discipline: 'rhythm',
          value: 100,
          duration: 'next_battle',
        },
        flavorText: 'The Sage slows time itself for your rhythms',
      },
      {
        id: 'sage-fury',
        name: 'Rhythmic Fury',
        description: '+25% damage on rhythm challenges for next 3 battles',
        emoji: '⚡',
        effect: {
          type: 'damage_boost',
          discipline: 'rhythm',
          value: 0.25,
          duration: 'next_3_battles',
        },
        flavorText: 'Your beats strike with thunderous power',
      },
      {
        id: 'sage-wisdom',
        name: 'Drummer\'s Wisdom',
        description: 'Gain 1 skill point',
        emoji: '⭐',
        effect: {
          type: 'insight',
          value: 1,
          duration: 'permanent',
        },
        flavorText: 'The Sage imparts ancient rhythmic knowledge',
      },
    ],
    flavorText: 'In the beginning, there was rhythm...',
  },
  
  {
    id: 'harmony-spirit',
    name: 'The Harmony Spirit',
    description: 'A being of pure chordal resonance',
    spritePath: '/images/cadence-quest/oracle/spirit.svg',
    emoji: '✨',
    blessings: [
      {
        id: 'spirit-resonance',
        name: 'Chord Resonance',
        description: 'Show chord hints for all harmony challenges next battle',
        emoji: '🔍',
        effect: {
          type: 'insight',
          discipline: 'harmony',
          value: 1,
          duration: 'next_battle',
        },
        flavorText: 'The Spirit reveals the structure of harmony',
      },
      {
        id: 'spirit-healing',
        name: 'Harmonic Healing',
        description: 'Heal 5% HP on every correct answer for next battle',
        emoji: '💖',
        effect: {
          type: 'heal',
          value: 0.05,
          duration: 'next_battle',
        },
        flavorText: 'Harmony restores body and soul',
      },
      {
        id: 'spirit-power',
        name: 'Resonant Power',
        description: '+30% damage on all challenges for next battle',
        emoji: '💪',
        effect: {
          type: 'damage_boost',
          value: 0.3,
          duration: 'next_battle',
        },
        flavorText: 'The Spirit amplifies your musical essence',
      },
    ],
    flavorText: 'When notes combine, magic happens...',
  },
];
```

### 6.4 Oracle Encounter UI

**Create**: `cadence-quest/OracleEncounterScreen.tsx`

```typescript
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { OracleEncounter, OracleBlessing } from '@shared/types/cadence-quest';
import { cn } from '@/common/utils/utils';

interface OracleEncounterScreenProps {
  oracle: OracleEncounter;
  onSelectBlessing: (blessing: OracleBlessing) => void;
  onSkip: () => void;
}

const OracleEncounterScreen: React.FC<OracleEncounterScreenProps> = ({
  oracle,
  onSelectBlessing,
  onSkip,
}) => {
  const [selectedBlessing, setSelectedBlessing] = useState<OracleBlessing | null>(null);
  
  const handleConfirm = () => {
    if (selectedBlessing) {
      onSelectBlessing(selectedBlessing);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-6 p-8 max-w-3xl mx-auto"
    >
      {/* Oracle Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-8xl mb-4"
        >
          {oracle.emoji}
        </motion.div>
        <h2 className="text-3xl font-bold text-purple-200 mb-2">
          {oracle.name}
        </h2>
        <p className="text-purple-300 italic mb-4">
          "{oracle.flavorText}"
        </p>
        <p className="text-gray-300">{oracle.description}</p>
      </div>
      
      {/* Blessings */}
      <div className="w-full">
        <div className="flex items-center gap-2 mb-4 justify-center">
          <Sparkles className="text-amber-400" />
          <h3 className="text-xl font-bold text-white">Choose Your Blessing</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {oracle.blessings.map((blessing, i) => (
            <motion.div
              key={blessing.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              onClick={() => setSelectedBlessing(blessing)}
              className={cn(
                'p-6 rounded-xl border-2 cursor-pointer transition-all',
                selectedBlessing?.id === blessing.id
                  ? 'border-amber-500 bg-amber-900/40 scale-105'
                  : 'border-purple-500/30 bg-purple-900/20 hover:border-purple-400'
              )}
            >
              <div className="text-center">
                <span className="text-5xl mb-3 block">{blessing.emoji}</span>
                <h4 className="text-lg font-bold text-white mb-2">
                  {blessing.name}
                </h4>
                <p className="text-sm text-gray-300 mb-3">
                  {blessing.description}
                </p>
                <p className="text-xs text-purple-300 italic">
                  "{blessing.flavorText}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleConfirm}
          disabled={!selectedBlessing}
          className={cn(
            'px-8 py-3 rounded-lg font-bold transition-all',
            selectedBlessing
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          )}
        >
          Accept Blessing
        </button>
        
        <button
          onClick={onSkip}
          className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
        >
          Decline
        </button>
      </div>
    </motion.div>
  );
};

export default OracleEncounterScreen;
```

---

## Implementation Roadmap

### Week 1: Foundation (Audio & Core Challenges)

**Day 1-2**: Audio System
- [ ] Extract `CoreAudioEngine` from Da Capo Dungeon
- [ ] Create `shared/audio/core-audio.ts`
- [ ] Create `BattleAudio` class for Cadence Quest
- [ ] Implement class-specific attack sounds
- [ ] Add ability activation sounds
- [ ] Test on iOS Safari

**Day 3-4**: Challenge Generators
- [ ] Create `shared/music-challenges/core-generators.ts`
- [ ] Extract note reading, interval, rhythm tap generators
- [ ] Create `CadenceChallengeAdapter`
- [ ] Implement class-specific modifiers
- [ ] Add skill tree effect application

**Day 5**: Integration
- [ ] Integrate audio into BattleScreen
- [ ] Replace challenge generation with adapter
- [ ] Test challenge difficulty scaling
- [ ] Verify skill tree effects apply correctly

### Week 2: Equipment & Collection

**Day 1-2**: Equipment System
- [ ] Define equipment types and interfaces
- [ ] Create equipment database (20+ items)
- [ ] Implement boss drop tables
- [ ] Add drop roll logic

**Day 3-4**: Collection Screen
- [ ] Redesign CollectionScreen with equipment slots
- [ ] Implement equip/unequip functionality
- [ ] Add inventory management
- [ ] Create equipment tooltips with stats

**Day 5**: Integration
- [ ] Add equipment passive effects to battle calculations
- [ ] Update character state with equipment
- [ ] Test equipment drops from bosses

### Week 3: Boss Battles

**Day 1-2**: Boss Data
- [ ] Create boss database (5 region bosses)
- [ ] Design boss stages and abilities
- [ ] Add boss sprites/assets
- [ ] Create boss battle themes

**Day 3-4**: Boss Engine
- [ ] Implement `BossBattleEngine`
- [ ] Add multi-stage challenge flow
- [ ] Implement boss abilities system
- [ ] Add ability triggers and effects

**Day 5**: Boss UI
- [ ] Create BossBattleScreen component
- [ ] Add boss HP display and stage indicators
- [ ] Implement ability/debuff visualization
- [ ] Test all 5 boss encounters

### Week 4: Victory & Progression

**Day 1-2**: Victory Screen
- [ ] Redesign VictoryScreen with rewards
- [ ] Add XP and gold display
- [ ] Implement item drop visualization
- [ ] Add battle stats summary

**Day 3-4**: Leveling System
- [ ] Implement XP calculation
- [ ] Add level-up notifications
- [ ] Grant skill points on level up
- [ ] Test level progression curve

**Day 5**: Polish
- [ ] Add victory/defeat fanfares
- [ ] Smooth animations and transitions
- [ ] Test full battle loop
- [ ] Balance XP/gold rewards

### Week 5: Special Features & Polish

**Day 1-2**: Oracle Encounters
- [ ] Create oracle database (3 oracles)
- [ ] Design blessing effects
- [ ] Implement OracleEncounterScreen
- [ ] Add blessing application logic

**Day 3**: Integration & Testing
- [ ] Add oracles to world map
- [ ] Integrate all systems
- [ ] Full playthrough testing
- [ ] Bug fixes

**Day 4-5**: Final Polish
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Accessibility improvements
- [ ] Documentation updates

---

## Testing Strategy

### Unit Tests

**Audio System**
```typescript
describe('BattleAudio', () => {
  it('plays correct class-specific attack sounds', () => {});
  it('plays ability activation sounds', () => {});
  it('handles audio context suspension on iOS', () => {});
});
```

**Challenge Adapter**
```typescript
describe('CadenceChallengeAdapter', () => {
  it('applies class modifiers correctly', () => {});
  it('applies skill tree effects', () => {});
  it('scales difficulty with character level', () => {});
});
```

**Boss Engine**
```typescript
describe('BossBattleEngine', () => {
  it('processes multi-stage battles', () => {});
  it('triggers boss abilities at correct HP thresholds', () => {});
  it('calculates damage correctly with abilities active', () => {});
});
```

### Integration Tests

**Battle Flow**
- Complete battle from start to finish
- Boss battle with all stages
- Victory with item drops
- Defeat and retry

**Progression**
- Gain XP and level up
- Unlock new abilities
- Equip items and see passive effects

### E2E Tests

**Full Game Loop**
1. Create character
2. Complete region encounters
3. Defeat boss
4. Level up and unlock skills
5. Equip dropped items
6. Visit oracle for blessing
7. Defeat final boss

---

## Success Metrics

### Code Reuse
- [ ] 60%+ of audio infrastructure reused
- [ ] 80%+ of challenge generators reused
- [ ] <20% duplication between games

### Game Feel
- [ ] Clear distinction between dungeon crawler and JRPG
- [ ] Class identity feels unique
- [ ] Boss encounters are memorable
- [ ] Progression feels rewarding

### Performance
- [ ] Battle transitions < 300ms
- [ ] Audio latency < 100ms
- [ ] No dropped frames during animations

### Player Experience
- [ ] Victory feels celebratory
- [ ] Defeat doesn't feel punishing
- [ ] Rewards are clearly communicated
- [ ] Progression is visible and satisfying

---

## Risk Mitigation

### Technical Risks

**Risk**: Audio context issues on iOS
- **Mitigation**: Reuse proven iOS unlock code from Da Capo
- **Fallback**: Silent mode with visual cues only

**Risk**: Boss battles too difficult/easy
- **Mitigation**: Extensive playtesting with adjustable damage values
- **Fallback**: Dynamic difficulty adjustment based on player performance

**Risk**: Equipment system too complex
- **Mitigation**: Start with simple 3-slot system
- **Fallback**: Remove accessory slot if overwhelming

### Design Risks

**Risk**: Games feel too similar
- **Mitigation**: Different audio identity, UI themes, progression systems
- **Validation**: User testing with "can you tell these apart?" questions

**Risk**: Too much content to create
- **Mitigation**: Start with 1 boss per region, expand later
- **Fallback**: Reuse challenge types with different parameters

---

## Future Enhancements

### Post-Launch (v2.0)
- Party system (recruit NPCs)
- Crafting system (combine items)
- Daily challenges
- Leaderboards
- Achievement system
- Story mode with cutscenes

### Long-Term (v3.0+)
- PvP tournaments
- Guild system
- Seasonal events
- New regions and bosses
- Advanced class specializations

---

## Conclusion

This plan provides a comprehensive roadmap for enhancing Cadence Quest by strategically reusing Da Capo Dungeon's proven systems while maintaining distinct game identities. By sharing infrastructure but differing in experience, both games benefit from code reuse without sacrificing their unique appeal.

**Key Takeaways**:
1. Share low-level systems (audio, challenge generation)
2. Differ in high-level design (JRPG vs dungeon crawler)
3. Create unique content (equipment, bosses, abilities)
4. Maintain separate visual/audio identities
5. Test thoroughly to ensure distinct game feel

This approach maximizes development efficiency while delivering two compelling, distinct musical gaming experiences.
