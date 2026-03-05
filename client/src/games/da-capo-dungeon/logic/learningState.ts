/**
 * Learning State — tracks per-concept mastery, guided-mode history, and confusion pairs.
 *
 * Systems that use this module:
 *  - System 2 (Guided Examples): checks `seenConcepts` to decide guided vs assessed mode
 *  - System 4 (Corrective Feedback): records misses + confusion pairs on wrong answers
 *  - System 5 (Spaced Repetition): uses mastery levels + confusion pairs to weight concept selection
 */

import type { Tier, ChallengeType } from './dungeonTypes';

// ── Concept IDs ─────────────────────────────────────────────
// Every knowledge unit gets a unique string ID so we can track it.
// Format: "<challengeType>:<subCategory>:<specificConcept>"
// Examples: "vocab:dynamics:f", "noteReading:treble:E4", "interval:highLow:Higher"

/** Build a concept ID for a vocab/terms/dynamics/tempo/symbols entry. */
export function vocabConceptId(category: string, term: string): string {
  return `vocab:${category}:${term}`;
}

/** Build a concept ID for a note reading question. */
export function noteReadingConceptId(clef: 'treble' | 'bass', noteKey: string): string {
  return `noteReading:${clef}:${noteKey}`;
}

/** Build a concept ID for an interval question. */
export function intervalConceptId(mode: string, intervalName: string): string {
  return `interval:${mode}:${intervalName}`;
}

/** Build a concept ID for a rhythm pattern. */
export function rhythmConceptId(patternId: string): string {
  return `rhythm:${patternId}`;
}

/** Build a concept ID for a timbre question. */
export function timbreConceptId(timbreId: string): string {
  return `timbre:${timbreId}`;
}

// ── Mastery Levels ──────────────────────────────────────────

export type MasteryLevel = 'new' | 'learning' | 'familiar' | 'mastered';

export interface ConceptMastery {
  conceptId: string;
  correct: number;
  attempts: number;
  lastSeenFloor: number;
  streak: number;
  masteryLevel: MasteryLevel;
}

function computeMasteryLevel(m: ConceptMastery): MasteryLevel {
  if (m.attempts === 0) return 'new';
  const accuracy = m.correct / m.attempts;
  if (m.correct >= 5 && accuracy > 0.85 && m.streak >= 3) return 'mastered';
  if (m.correct >= 3 && accuracy >= 0.6) return 'familiar';
  return 'learning';
}

// ── Learning State ──────────────────────────────────────────

export interface LearningState {
  /** Concepts the student has seen in guided mode this run. */
  seenConcepts: Set<string>;
  /** Per-concept mastery tracking. */
  conceptMastery: Map<string, ConceptMastery>;
  /** Confusion pairs: correctId → wrongId → count. */
  confusionPairs: Map<string, Map<string, number>>;
}

export function createLearningState(): LearningState {
  return {
    seenConcepts: new Set(),
    conceptMastery: new Map(),
    confusionPairs: new Map(),
  };
}

// ── State Mutations ─────────────────────────────────────────
// All return new state objects (immutable pattern for React).

/** Mark a concept as seen in guided mode. */
export function markGuidedSeen(state: LearningState, conceptId: string): LearningState {
  const seenConcepts = new Set(state.seenConcepts);
  seenConcepts.add(conceptId);
  return { ...state, seenConcepts };
}

/** Record a correct answer for a concept. */
export function recordCorrect(state: LearningState, conceptId: string, floorNumber: number): LearningState {
  const conceptMastery = new Map(state.conceptMastery);
  const existing = conceptMastery.get(conceptId);
  const updated: ConceptMastery = existing
    ? {
        ...existing,
        correct: existing.correct + 1,
        attempts: existing.attempts + 1,
        lastSeenFloor: floorNumber,
        streak: existing.streak + 1,
        masteryLevel: 'new', // placeholder, recomputed below
      }
    : {
        conceptId,
        correct: 1,
        attempts: 1,
        lastSeenFloor: floorNumber,
        streak: 1,
        masteryLevel: 'new',
      };
  updated.masteryLevel = computeMasteryLevel(updated);
  conceptMastery.set(conceptId, updated);
  return { ...state, conceptMastery };
}

/** Record a wrong answer for a concept, optionally with a confusion pair. */
export function recordWrong(
  state: LearningState,
  correctConceptId: string,
  floorNumber: number,
  wrongConceptId?: string
): LearningState {
  // Update mastery
  const conceptMastery = new Map(state.conceptMastery);
  const existing = conceptMastery.get(correctConceptId);
  const updated: ConceptMastery = existing
    ? {
        ...existing,
        attempts: existing.attempts + 1,
        lastSeenFloor: floorNumber,
        streak: 0,
        masteryLevel: 'new',
      }
    : {
        conceptId: correctConceptId,
        correct: 0,
        attempts: 1,
        lastSeenFloor: floorNumber,
        streak: 0,
        masteryLevel: 'new',
      };
  updated.masteryLevel = computeMasteryLevel(updated);
  conceptMastery.set(correctConceptId, updated);

  // Update confusion pairs
  let confusionPairs = state.confusionPairs;
  if (wrongConceptId) {
    confusionPairs = new Map(confusionPairs);
    const inner = new Map(confusionPairs.get(correctConceptId) ?? new Map());
    inner.set(wrongConceptId, (inner.get(wrongConceptId) ?? 0) + 1);
    confusionPairs.set(correctConceptId, inner);
  }

  return { ...state, conceptMastery, confusionPairs };
}

// ── Queries ─────────────────────────────────────────────────

/** Whether a concept should get guided mode (never seen before). */
export function shouldGuide(state: LearningState, conceptId: string): boolean {
  return !state.seenConcepts.has(conceptId);
}

/** Get the mastery record for a concept (undefined if never seen). */
export function getMastery(state: LearningState, conceptId: string): ConceptMastery | undefined {
  return state.conceptMastery.get(conceptId);
}

/** Get the mastery level for a concept ('new' if never tracked). */
export function getMasteryLevel(state: LearningState, conceptId: string): MasteryLevel {
  return state.conceptMastery.get(conceptId)?.masteryLevel ?? 'new';
}

/** Get the most-confused alternative for a concept (for smart distractor selection). */
export function getTopConfusion(state: LearningState, conceptId: string): string | undefined {
  const inner = state.confusionPairs.get(conceptId);
  if (!inner || inner.size === 0) return undefined;
  let topId: string | undefined;
  let topCount = 0;
  for (const [wrongId, count] of inner) {
    if (count > topCount) {
      topCount = count;
      topId = wrongId;
    }
  }
  return topId;
}

// ── Mastery-Weighted Selection ──────────────────────────────

/** Selection weight multiplier based on mastery level. */
export function masteryWeight(level: MasteryLevel): number {
  switch (level) {
    case 'new': return 3;
    case 'learning': return 2;
    case 'familiar': return 1;
    case 'mastered': return 0.3;
  }
}

/** Minimum floor spacing before a concept should reappear. */
export function minSpacing(level: MasteryLevel): number {
  switch (level) {
    case 'new': return 0;
    case 'learning': return 1;
    case 'familiar': return 2;
    case 'mastered': return 5;
  }
}

/**
 * Pick a weighted-random item from a pool using mastery data.
 * Each item must provide a conceptId. Items that were seen too recently
 * (based on minSpacing) are deprioritized but not excluded.
 */
export function weightedPick<T>(
  pool: T[],
  getConceptId: (item: T) => string,
  state: LearningState,
  currentFloor: number,
): T {
  if (pool.length === 0) throw new Error('weightedPick: empty pool');
  if (pool.length === 1) return pool[0];

  const weights = pool.map((item) => {
    const id = getConceptId(item);
    const mastery = state.conceptMastery.get(id);
    const level = mastery?.masteryLevel ?? 'new';
    let w = masteryWeight(level);

    // Spacing penalty: halve weight if seen too recently
    if (mastery) {
      const floorsSince = currentFloor - mastery.lastSeenFloor;
      if (floorsSince < minSpacing(level)) {
        w *= 0.5;
      }
    }

    return w;
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * totalWeight;
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}
