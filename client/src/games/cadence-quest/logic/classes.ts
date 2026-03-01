import type { CharacterClass } from '@shared/types/cadence-quest';
import { Music2, Drum, Guitar, Music4 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ClassInfo {
  id: CharacterClass;
  name: string;
  description: string;
  primaryStat: string;
  challengeBonus: string;
  specialAbility: { name: string; description: string };
  icon: LucideIcon;
  color: string;
  emoji: string;
  /** 8-bit sprite path (transparent PNG/SVG) */
  spritePath: string;
}

export const CLASS_INFO: Record<CharacterClass, ClassInfo> = {
  bard: {
    id: 'bard',
    name: 'Bard',
    description: 'Master of melody and pitch. Excels at note reading and intervals.',
    primaryStat: 'Melody',
    challengeBonus: '+25% damage on pitch & interval challenges',
    specialAbility: {
      name: 'Perfect Pitch',
      description: 'Auto-correct one wrong answer per battle',
    },
    icon: Music2,
    color: 'bg-amber-500',
    emoji: '\uD83C\uDFB5',
    spritePath: '/images/cadence-quest/bard.svg',
  },
  drummer: {
    id: 'drummer',
    name: 'Drummer',
    description: 'Rhythm specialist. Crushes tempo and rhythm challenges.',
    primaryStat: 'Rhythm',
    challengeBonus: '+25% damage on rhythm & tempo challenges',
    specialAbility: {
      name: 'Double Time',
      description: 'Get two challenges in one turn',
    },
    icon: Drum,
    color: 'bg-orange-500',
    emoji: '\uD83E\uDD41',
    spritePath: '/images/cadence-quest/drummer.svg',
  },
  harmonist: {
    id: 'harmonist',
    name: 'Harmonist',
    description: 'Chord and scale expert. Harmony challenges deal extra damage.',
    primaryStat: 'Harmony',
    challengeBonus: '+25% damage on chord & scale challenges',
    specialAbility: {
      name: 'Resonance',
      description: 'Correct answers heal 10% of max HP',
    },
    icon: Guitar,
    color: 'bg-teal-500',
    emoji: '\uD83C\uDFB6',
    spritePath: '/images/cadence-quest/harmonist.svg',
  },
  conductor: {
    id: 'conductor',
    name: 'Conductor',
    description: 'Expression and dynamics master. Dominates listening challenges.',
    primaryStat: 'Expression',
    challengeBonus: '+25% damage on dynamics & listening challenges',
    specialAbility: {
      name: 'Crescendo',
      description: 'Damage increases each consecutive turn',
    },
    icon: Music4,
    color: 'bg-violet-500',
    emoji: '\uD83C\uDFBC',
    spritePath: '/images/cadence-quest/conductor.svg',
  },
};
