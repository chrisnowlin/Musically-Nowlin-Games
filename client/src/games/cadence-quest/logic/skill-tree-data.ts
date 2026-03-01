import type { SkillNode, MusicDiscipline } from '@shared/types/cadence-quest';

const createBranch = (
  branch: MusicDiscipline,
  tiers: { name: string; description: string; effect: Record<string, unknown> }[]
): SkillNode[] =>
  tiers.map((t, i) => ({
    id: `${branch}-${i}`,
    branch,
    tier: i,
    name: t.name,
    description: t.description,
    requires: i === 0 ? [] : [`${branch}-${i - 1}`],
    effect: t.effect,
  }));

export const SKILL_TREE: SkillNode[] = [
  ...createBranch('rhythm', [
    { name: 'Wider Timing', description: '+50ms tolerance', effect: { rhythmTolerance: 50 } },
    { name: 'Rhythm Bonus', description: '+15% rhythm damage', effect: { rhythmDamage: 0.15 } },
    { name: 'Streak Extend', description: 'Streak persists 1 more turn', effect: { streakPersist: 1 } },
    { name: 'Tempo Sense', description: '+10% speed bonus', effect: { speedBonus: 0.1 } },
    { name: 'Polyrhythm', description: 'Unlock polyrhythm ability', effect: { ability: 'polyrhythm' } },
  ]),
  ...createBranch('pitch', [
    { name: 'Note Range', description: 'Fewer wrong options', effect: { optionsReduce: 1 } },
    { name: 'Pitch Bonus', description: '+15% pitch damage', effect: { pitchDamage: 0.15 } },
    { name: 'Perfect Ear', description: 'Hear note twice', effect: { hearTwice: true } },
    { name: 'Interval Master', description: '+10% interval accuracy', effect: { intervalAccuracy: 0.1 } },
    { name: 'Transposition', description: 'Unlock transposition ability', effect: { ability: 'transposition' } },
  ]),
  ...createBranch('harmony', [
    { name: 'Chord Hints', description: 'Show chord hints', effect: { chordHints: true } },
    { name: 'Harmony Bonus', description: '+15% harmony damage', effect: { harmonyDamage: 0.15 } },
    { name: 'Resolution', description: 'Heal 5% on correct', effect: { healOnCorrect: 0.05 } },
    { name: 'Progression Sense', description: '+10% chord accuracy', effect: { chordAccuracy: 0.1 } },
    { name: 'Modulation', description: 'Unlock modulation ability', effect: { ability: 'modulation' } },
  ]),
  ...createBranch('dynamics', [
    { name: 'Dynamic Range', description: 'Show range indicators', effect: { rangeIndicators: true } },
    { name: 'Expression Bonus', description: '+15% dynamics damage', effect: { dynamicsDamage: 0.15 } },
    { name: 'Fortissimo', description: 'Burst damage once per battle', effect: { burstDamage: 1 } },
    { name: 'Crescendo Master', description: '+10% expression accuracy', effect: { expressionAccuracy: 0.1 } },
    { name: 'Full Dynamic', description: 'Unlock full dynamic control', effect: { ability: 'full_dynamic' } },
  ]),
  ...createBranch('theory', [
    { name: 'Staff Helpers', description: 'Show staff line helpers', effect: { staffHelpers: true } },
    { name: 'Theory Bonus', description: '+15% theory damage', effect: { theoryDamage: 0.15 } },
    { name: 'Modulation', description: 'Change challenge type once', effect: { changeChallenge: 1 } },
    { name: 'Form Sense', description: '+10% theory accuracy', effect: { theoryAccuracy: 0.1 } },
    { name: 'Theory Master', description: 'Unlock theory mastery', effect: { ability: 'theory_master' } },
  ]),
];
