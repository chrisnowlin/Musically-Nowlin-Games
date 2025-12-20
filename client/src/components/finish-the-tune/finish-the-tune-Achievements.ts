// Achievement definitions for Finish the Tune

import type { Achievement, FinishTheTuneState } from './types';
import { TOTAL_MELODIES } from './finish-the-tune-Logic';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_correct',
    name: 'First Note',
    description: 'Answer your first question correctly',
    icon: '1',
    condition: (state: FinishTheTuneState) => state.score >= 1,
  },
  {
    id: 'streak_5',
    name: 'Hot Streak',
    description: 'Get 5 correct answers in a row',
    icon: '5',
    condition: (state: FinishTheTuneState) => state.streak >= 5 || state.bestStreak >= 5,
  },
  {
    id: 'streak_10',
    name: 'On Fire',
    description: 'Get 10 correct answers in a row',
    icon: '10',
    condition: (state: FinishTheTuneState) => state.streak >= 10 || state.bestStreak >= 10,
  },
  {
    id: 'perfect_10',
    name: 'Perfect Ten',
    description: 'Answer 10 questions with 100% accuracy',
    icon: '100',
    condition: (state: FinishTheTuneState) =>
      state.totalQuestions >= 10 && state.score === state.totalQuestions,
  },
  {
    id: 'all_melodies',
    name: 'Melody Master',
    description: `Discover all ${TOTAL_MELODIES} melody patterns`,
    icon: '8',
    condition: (state: FinishTheTuneState) => state.completedMelodies.size >= TOTAL_MELODIES,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Answer within 3 seconds of melody ending',
    icon: '3s',
    // This is checked separately with timing logic
    condition: () => false,
  },
];

/**
 * Check which achievements should be unlocked based on current state
 */
export function checkAchievements(
  state: FinishTheTuneState,
  currentAchievements: string[]
): string[] {
  const newlyUnlocked: string[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!currentAchievements.includes(achievement.id) && achievement.condition(state)) {
      newlyUnlocked.push(achievement.id);
    }
  }

  return newlyUnlocked;
}

/**
 * Get achievement details by ID
 */
export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/**
 * Get all unlocked achievements as full objects
 */
export function getUnlockedAchievements(achievementIds: string[]): Achievement[] {
  return ACHIEVEMENTS.filter((a) => achievementIds.includes(a.id));
}
