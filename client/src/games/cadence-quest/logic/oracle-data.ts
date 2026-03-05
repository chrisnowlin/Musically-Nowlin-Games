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
          value: 1.0,
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
        name: "Drummer's Wisdom",
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
        id: 'spirit-synergy',
        name: 'Harmonic Synergy',
        description: '+15% damage on chord/harmony challenges permanently',
        emoji: '🎸',
        effect: {
          type: 'damage_boost',
          discipline: 'harmony',
          value: 0.15,
          duration: 'permanent',
        },
        flavorText: 'Your chords resonate with cosmic harmony',
      },
      {
        id: 'spirit-restoration',
        name: 'Chordal Restoration',
        description: 'Heal 30% HP after every correct answer for next 3 battles',
        emoji: '💚',
        effect: {
          type: 'heal',
          value: 0.3,
          duration: 'next_3_battles',
        },
        flavorText: 'Harmony flows through you, restoring vitality',
      },
      {
        id: 'spirit-intuition',
        name: 'Harmonic Intuition',
        description: 'Show chord hints permanently',
        emoji: '👁️',
        effect: {
          type: 'accuracy_boost',
          discipline: 'harmony',
          value: 1,
          duration: 'permanent',
        },
        flavorText: 'You can now see the harmony within all chords',
      },
    ],
    flavorText: 'The Spirit knows that all is chord...',
  },

  {
    id: 'dynamics-warden',
    name: 'The Dynamics Warden',
    description: 'A guardian of musical volume and intensity',
    spritePath: '/images/cadence-quest/oracle/warden.svg',
    emoji: '🔊',
    blessings: [
      {
        id: 'warden-boost',
        name: 'Volume Boost',
        description: '+30% base damage for next 3 battles',
        emoji: '💪',
        effect: {
          type: 'damage_boost',
          value: 0.3,
          duration: 'next_3_battles',
        },
        flavorText: 'Your musical presence commands attention',
      },
      {
        id: 'warden-resilience',
        name: 'Dynamic Resilience',
        description: 'Reduce damage taken by 20% for next 3 battles',
        emoji: '🛡️',
        effect: {
          type: 'accuracy_boost',
          value: 0.2,
          duration: 'next_3_battles',
        },
        flavorText: 'You absorb the harsh discord of battle',
      },
      {
        id: 'warden-control',
        name: 'Perfect Control',
        description: '+20% accuracy on all challenges for next battle',
        emoji: '🎯',
        effect: {
          type: 'accuracy_boost',
          value: 0.2,
          duration: 'next_battle',
        },
        flavorText: 'Master your volume, master your fate',
      },
    ],
    flavorText: 'From pianissimo to fortissimo, all is under my watch...',
  },

  {
    id: 'theory-scholar',
    name: 'The Theory Scholar',
    description: 'An ancient sage of musical knowledge',
    spritePath: '/images/cadence-quest/oracle/scholar.svg',
    emoji: '📚',
    blessings: [
      {
        id: 'scholar-knowledge',
        name: "The Scholar's Gift",
        description: 'Gain 2 skill points',
        emoji: '⭐',
        effect: {
          type: 'insight',
          value: 2,
          duration: 'permanent',
        },
        flavorText: 'Knowledge is the greatest treasure',
      },
      {
        id: 'scholar-prescience',
        name: 'Musical Prescience',
        description: 'See challenge options in advance for next 3 battles',
        emoji: '👁️',
        effect: {
          type: 'accuracy_boost',
          value: 1,
          duration: 'next_3_battles',
        },
        flavorText: 'The Scholar has revealed the future to you',
      },
      {
        id: 'scholar-mastery',
        name: 'Theory Mastery',
        description: '+25% XP from battles permanently',
        emoji: '📈',
        effect: {
          type: 'damage_boost',
          value: 0.25,
          duration: 'permanent',
        },
        flavorText: 'Understanding accelerates all things',
      },
    ],
    flavorText: 'I have studied music since before it had a name...',
  },
];

export function getRandomOracle(): OracleEncounter {
  return ORACLE_ENCOUNTERS[Math.floor(Math.random() * ORACLE_ENCOUNTERS.length)];
}

export function getOracleById(oracleId: string): OracleEncounter | undefined {
  return ORACLE_ENCOUNTERS.find(o => o.id === oracleId);
}