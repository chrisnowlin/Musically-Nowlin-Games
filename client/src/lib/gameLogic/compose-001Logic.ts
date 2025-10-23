/**
 * Game Logic for Composition Studio
 * ID: compose-001
 * Unified Skill: Composing original music
 */

import { getRandomChallenge, getChallengesForMode, Challenge } from "./compose-001Modes";

export interface Note {
  name: string;
  frequency: number;
}

export interface RhythmNote {
  duration: string;
  symbol: string;
  beats: number;
}

export interface Chord {
  name: string;
  notes: string[];
  type: "major" | "minor";
}

export interface Composition {
  type: "melody" | "rhythm" | "harmony";
  notes?: string[];
  rhythm?: string[];
  chords?: string[];
}

export interface GameRound {
  id: string;
  mode: "melody" | "rhythm" | "harmony";
  challenge: Challenge;
  difficulty: number;
  timeLimit?: number;
}

export interface ValidationResult {
  valid: boolean;
  score: number;
  feedback: string;
  details?: {
    metRequirements: string[];
    missedRequirements: string[];
    bonusPoints: number;
  };
}

// Musical data
export const NOTES: Note[] = [
  { name: "C", frequency: 261.63 },
  { name: "D", frequency: 293.66 },
  { name: "E", frequency: 329.63 },
  { name: "F", frequency: 349.23 },
  { name: "G", frequency: 392.00 },
  { name: "A", frequency: 440.00 },
  { name: "B", frequency: 493.88 },
  { name: "C2", frequency: 523.25 },
];

export const RHYTHM_NOTES: RhythmNote[] = [
  { duration: "whole", symbol: "𝅝", beats: 4 },
  { duration: "half", symbol: "𝅗𝅥", beats: 2 },
  { duration: "quarter", symbol: "♩", beats: 1 },
  { duration: "eighth", symbol: "♪", beats: 0.5 },
  { duration: "sixteenth", symbol: "𝅘𝅥𝅯", beats: 0.25 },
  { duration: "rest", symbol: "𝄽", beats: 1 },
];

export const CHORDS: Chord[] = [
  { name: "C Major", notes: ["C", "E", "G"], type: "major" },
  { name: "D Minor", notes: ["D", "F", "A"], type: "minor" },
  { name: "E Minor", notes: ["E", "G", "B"], type: "minor" },
  { name: "F Major", notes: ["F", "A", "C2"], type: "major" },
  { name: "G Major", notes: ["G", "B", "D"], type: "major" },
  { name: "A Minor", notes: ["A", "C", "E"], type: "minor" },
];

export function generateRound(mode: "melody" | "rhythm" | "harmony", difficulty: number): GameRound {
  const challenge = getRandomChallenge(mode, difficulty);
  
  return {
    id: `round-${Date.now()}-${Math.random()}`,
    mode,
    challenge,
    difficulty,
    timeLimit: Math.max(60, 120 - difficulty * 10), // 60-120 seconds based on difficulty
  };
}

export function validateComposition(
  composition: Composition,
  round: GameRound,
  timeSpent: number
): ValidationResult {
  const { challenge } = round;
  const validation = challenge.validation;
  
  let valid = true;
  let score = 0;
  const metRequirements: string[] = [];
  const missedRequirements: string[] = [];
  let bonusPoints = 0;

  // Check length requirements
  if (validation.minLength && validation.maxLength) {
    let compositionLength = 0;
    
    switch (composition.type) {
      case "melody":
        compositionLength = composition.notes?.length || 0;
        break;
      case "rhythm":
        compositionLength = composition.rhythm?.length || 0;
        break;
      case "harmony":
        compositionLength = composition.chords?.length || 0;
        break;
    }

    if (compositionLength >= validation.minLength && compositionLength <= validation.maxLength) {
      metRequirements.push(`Length: ${compositionLength} elements`);
      score += 50;
    } else {
      valid = false;
      missedRequirements.push(`Length should be ${validation.minLength}-${validation.maxLength} elements`);
    }
  }

  // Check required elements
  if (validation.requiredElements) {
    validation.requiredElements.forEach(element => {
      let hasElement = false;
      
      switch (element) {
        case "rest":
          hasElement = composition.rhythm?.includes("𝄽") || false;
          break;
        case "quarter":
          hasElement = composition.rhythm?.includes("♩") || false;
          break;
        case "eighth":
          hasElement = composition.rhythm?.includes("♪") || false;
          break;
        case "C Major":
          hasElement = composition.chords?.includes("C Major") || false;
          break;
        case "major":
          hasElement = composition.chords?.some(chord => 
            CHORDS.find(c => c.name === chord)?.type === "major"
          ) || false;
          break;
        case "minor":
          hasElement = composition.chords?.some(chord => 
            CHORDS.find(c => c.name === chord)?.type === "minor"
          ) || false;
          break;
        case "variety":
          if (composition.type === "melody") {
            const uniqueNotes = new Set(composition.notes);
            hasElement = uniqueNotes.size >= 3;
          } else if (composition.type === "rhythm") {
            const uniqueRhythm = new Set(composition.rhythm);
            hasElement = uniqueRhythm.size >= 2;
          }
          break;
      }

      if (hasElement) {
        metRequirements.push(`Includes ${element}`);
        score += 25;
      } else {
        valid = false;
        missedRequirements.push(`Missing ${element}`);
      }
    });
  }

  // Check patterns
  if (validation.patterns) {
    validation.patterns.forEach(pattern => {
      pattern.forEach(patternType => {
        let hasPattern = false;
        
        switch (patternType) {
          case "ascending":
            if (composition.notes && composition.notes.length >= 2) {
              hasPattern = composition.notes.every((note, index) => {
                if (index === 0) return true;
                const prevFreq = NOTES.find(n => n.name === composition.notes![index - 1])?.frequency || 0;
                const currFreq = NOTES.find(n => n.name === note)?.frequency || 0;
                return currFreq > prevFreq;
              });
            }
            break;
          case "contour":
            if (composition.notes && composition.notes.length >= 3) {
              let directionChanges = 0;
              for (let i = 1; i < composition.notes.length - 1; i++) {
                const prevFreq = NOTES.find(n => n.name === composition.notes![i - 1])?.frequency || 0;
                const currFreq = NOTES.find(n => n.name === composition.notes![i])?.frequency || 0;
                const nextFreq = NOTES.find(n => n.name === composition.notes![i + 1])?.frequency || 0;
                
                if ((currFreq > prevFreq && nextFreq < currFreq) || 
                    (currFreq < prevFreq && nextFreq > currFreq)) {
                  directionChanges++;
                }
              }
              hasPattern = directionChanges >= 1;
            }
            break;
          case "repetition":
            if (composition.type === "melody" && composition.notes && composition.notes.length >= 4) {
              // Check for repeated patterns of 2-3 notes
              for (let patternLength = 2; patternLength <= 3; patternLength++) {
                for (let i = 0; i <= composition.notes.length - patternLength * 2; i++) {
                  const pattern = composition.notes.slice(i, i + patternLength);
                  const nextPattern = composition.notes.slice(i + patternLength, i + patternLength * 2);
                  if (JSON.stringify(pattern) === JSON.stringify(nextPattern)) {
                    hasPattern = true;
                    break;
                  }
                }
                if (hasPattern) break;
              }
            }
            break;
          case "steady":
            if (composition.rhythm) {
              const steadyBeats = composition.rhythm.every(symbol => {
                const rhythmNote = RHYTHM_NOTES.find(r => r.symbol === symbol);
                return rhythmNote && rhythmNote.beats === 1;
              });
              hasPattern = steadyBeats;
            }
            break;
          case "I-IV-V":
            if (composition.chords && composition.chords.length >= 3) {
              hasPattern = composition.chords.includes("C Major") && 
                          composition.chords.includes("F Major") && 
                          composition.chords.includes("G Major");
            }
            break;
          case "cadence":
            if (composition.chords && composition.chords.length >= 2) {
              const lastChord = composition.chords[composition.chords.length - 1];
              hasPattern = lastChord === "C Major"; // Perfect cadence to tonic
            }
            break;
        }

        if (hasPattern) {
          metRequirements.push(`Shows ${patternType} pattern`);
          score += 30;
          bonusPoints += 10;
        } else if (patternType !== "cadence") { // Cadence is optional bonus
          valid = false;
          missedRequirements.push(`Missing ${patternType} pattern`);
        }
      });
    });
  }

  // Time bonus
  if (round.timeLimit && timeSpent < round.timeLimit) {
    const timeBonus = Math.round((round.timeLimit - timeSpent) / round.timeLimit * 50);
    bonusPoints += timeBonus;
    metRequirements.push(`Quick completion: +${timeBonus} points`);
  }

  // Base completion score
  if (valid) {
    score += 100; // Base completion score
  }

  return {
    valid,
    score: Math.max(0, score + bonusPoints),
    feedback: valid ? "Great composition!" : "Keep working on it!",
    details: {
      metRequirements,
      missedRequirements,
      bonusPoints,
    },
  };
}

export function calculateScore(validationResult: ValidationResult, difficulty: number): number {
  const baseScore = validationResult.score;
  const difficultyMultiplier = 1 + (difficulty - 1) * 0.2; // 1.0 to 1.8 multiplier
  return Math.round(baseScore * difficultyMultiplier);
}

export function getNextChallenge(mode: string, currentRound: number, difficulty: number): Challenge {
  const challenges = getChallengesForMode(mode);
  const challengeIndex = currentRound % challenges.length;
  return challenges[challengeIndex];
}

export function getDifficultyProgression(round: number): number {
  // Increase difficulty every 3 rounds, max difficulty 5
  return Math.min(5, Math.floor(round / 3) + 1);
}
