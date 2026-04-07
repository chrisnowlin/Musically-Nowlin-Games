import type { MusicChallenge, CharacterClass, MusicDiscipline } from '@shared/types/cadence-quest';
import { generateChallenge, generateChallengeForRegion } from '@shared/logic/challenge-pool';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface SkillTreeEffects {
  rhythmTolerance?: number;
  rhythmDamage?: number;
  streakPersist?: number;
  speedBonus?: number;
  optionsReduce?: number;
  pitchDamage?: number;
  hearTwice?: boolean;
  intervalAccuracy?: number;
  chordHints?: boolean;
  harmonyDamage?: number;
  healOnCorrect?: number;
  chordAccuracy?: number;
  rangeIndicators?: boolean;
  dynamicsDamage?: number;
  burstDamage?: number;
  expressionAccuracy?: number;
  staffHelpers?: boolean;
  theoryDamage?: number;
  changeChallenge?: number;
  theoryAccuracy?: number;
}

/**
 * Adapter class that applies class-specific modifiers and skill tree effects
 * to challenges generated for Cadence Quest
 */
export class CadenceChallengeAdapter {
  constructor(
    private characterClass: CharacterClass,
    private characterLevel: number,
    private skillTreeEffects: SkillTreeEffects = {}
  ) {}

  /**
   * Generate a challenge with class and skill tree modifiers applied
   */
  generateChallenge(
    type: MusicDiscipline,
    isBoss: boolean
  ): MusicChallenge {
    const baseDifficulty = this.levelToDifficulty(this.characterLevel);
    const difficulty = isBoss ? this.increaseDifficulty(baseDifficulty) : baseDifficulty;
    const challenge = generateChallenge(type, difficulty);
    return this.applyAllModifiers(challenge);
  }

  /**
   * Generate a challenge for a specific region with modifiers applied
   */
  generateChallengeForRegion(
    regionDiscipline: MusicDiscipline,
    isBoss: boolean
  ): MusicChallenge {
    const baseDifficulty = this.levelToDifficulty(this.characterLevel);
    const difficulty = isBoss ? this.increaseDifficulty(baseDifficulty) : baseDifficulty;
    const challenge = generateChallengeForRegion(regionDiscipline, difficulty);
    return this.applyAllModifiers(challenge);
  }

  private applyAllModifiers(challenge: MusicChallenge): MusicChallenge {
    let modified = this.applyClassModifiers(challenge);
    modified = this.applySkillEffects(modified);
    return modified;
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
    if (challenge.type === 'noteReading' || challenge.type === 'interval') {
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
    if (challenge.type === 'rhythmTap') {
      return {
        ...challenge,
        toleranceMs: challenge.toleranceMs + 50,
      };
    }
    return challenge;
  }

  private applyHarmonistModifiers(challenge: MusicChallenge): MusicChallenge {
    if (challenge.type === 'chordIdentify' || challenge.type === 'scaleIdentify') {
      return {
        ...challenge,
        showHints: true,
      };
    }
    return challenge;
  }

  private applyConductorModifiers(challenge: MusicChallenge): MusicChallenge {
    if (challenge.type === 'listening' || challenge.type === 'tempoIdentify') {
      return {
        ...challenge,
        showRangeIndicators: true,
      };
    }
    return challenge;
  }

  private applySkillEffects(challenge: MusicChallenge): MusicChallenge {
    const effects = this.skillTreeEffects;

    if (challenge.type === 'rhythmTap' && effects.rhythmTolerance) {
      challenge = {
        ...challenge,
        toleranceMs: challenge.toleranceMs + effects.rhythmTolerance,
      };
    }

    if ('options' in challenge && effects.optionsReduce) {
      const correct = this.getCorrectOption(challenge);
      
      if (challenge.type === 'tempoIdentify') {
        const tempoChallenge = challenge as import('@shared/types/cadence-quest').TempoIdentifyChallenge;
        const wrongOptions = tempoChallenge.options.filter(o => o.bpm !== tempoChallenge.bpm);
        const newCount = Math.max(2, tempoChallenge.options.length - effects.optionsReduce);
        const reducedWrong = wrongOptions.slice(0, newCount - 1);
        challenge = {
          ...tempoChallenge,
          options: this.shuffle([...reducedWrong, tempoChallenge.options.find(o => o.bpm === tempoChallenge.bpm)!]),
        };
      } else {
        const options = challenge.options as string[];
        const wrongOptions = options.filter(o => o !== correct);
        const newCount = Math.max(2, options.length - effects.optionsReduce);
        const reducedWrong = wrongOptions.slice(0, newCount - 1);
        challenge = {
          ...challenge,
          options: this.shuffle([correct, ...reducedWrong]),
        };
      }
    }

    if (effects.chordHints && challenge.type === 'chordIdentify') {
      challenge = { ...challenge, showHints: true };
    }

    if (effects.staffHelpers && challenge.type === 'noteReading') {
      challenge = { ...challenge, showStaffHelpers: true };
    }

    if (effects.rangeIndicators && challenge.type === 'tempoIdentify') {
      challenge = { ...challenge, showRangeIndicators: true };
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
        const opt = challenge.options.find(o => o.bpm === challenge.bpm);
        return opt?.label ?? '';
      case 'listening':
        return challenge.correctAnswer;
      default:
        return '';
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
}

/**
 * Merge skill tree data into SkillTreeEffects format
 */
export function mergeSkillTreeEffects(
  skillTree: Record<MusicDiscipline, number[]>
): SkillTreeEffects {
  const effects: SkillTreeEffects = {};

  for (const [discipline, tiers] of Object.entries(skillTree)) {
    for (const tier of tiers) {
      const effect = getTierEffect(discipline as MusicDiscipline, tier);
      Object.assign(effects, effect);
    }
  }

  return effects;
}

function getTierEffect(discipline: MusicDiscipline, tier: number): Partial<SkillTreeEffects> {
  const tierEffects: Record<MusicDiscipline, Partial<SkillTreeEffects>[]> = {
    rhythm: [
      { rhythmTolerance: 50 },
      { rhythmDamage: 0.15 },
      { streakPersist: 1 },
      { speedBonus: 0.1 },
    ],
    pitch: [
      { optionsReduce: 1 },
      { pitchDamage: 0.15 },
      { hearTwice: true },
      { intervalAccuracy: 0.1 },
    ],
    harmony: [
      { chordHints: true },
      { harmonyDamage: 0.15 },
      { healOnCorrect: 0.05 },
      { chordAccuracy: 0.1 },
    ],
    dynamics: [
      { rangeIndicators: true },
      { dynamicsDamage: 0.15 },
      { burstDamage: 1 },
      { expressionAccuracy: 0.1 },
    ],
    theory: [
      { staffHelpers: true },
      { theoryDamage: 0.15 },
      { changeChallenge: 1 },
      { theoryAccuracy: 0.1 },
    ],
  };

  return tierEffects[discipline]?.[tier] ?? {};
}