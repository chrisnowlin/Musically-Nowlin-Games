import type { MusicChallenge, ChallengeAnswer } from '@shared/types/cadence-quest';
import { validateAnswer } from '@shared/logic/challenge-pool';

type Difficulty = 'easy' | 'medium' | 'hard';

/** Probability of correct answer: easy=0.4, medium=0.6, hard=0.8 */
const ACCURACY: Record<Difficulty, number> = {
  easy: 0.4,
  medium: 0.6,
  hard: 0.8,
};

/** Min/max response time in ms */
const RESPONSE_TIME: Record<Difficulty, [number, number]> = {
  easy: [3000, 6000],
  medium: [2000, 4500],
  hard: [1000, 3000],
};

function pickCorrectAnswer(challenge: MusicChallenge): string | number[] {
  switch (challenge.type) {
    case 'noteReading':
      return challenge.targetNote.replace(/\d+/, '');
    case 'interval':
      return challenge.intervalName;
    case 'dynamics':
      return challenge.dynamicLevel;
    case 'chordIdentify':
      return challenge.chordName;
    case 'scaleIdentify':
      return challenge.scaleName;
    case 'tempoIdentify': {
      const opt = challenge.options.find((o) => o.bpm === challenge.bpm);
      return opt?.label ?? challenge.options[0]?.label ?? '';
    }
    case 'listening':
      return challenge.correctAnswer;
    case 'rhythmTap':
      return challenge.pattern.map((b) => b.time);
    default:
      return '';
  }
}

export function simulateAIAnswer(
  challenge: MusicChallenge,
  difficulty: Difficulty,
  shownAt: number
): Promise<ChallengeAnswer> {
  const [minMs, maxMs] = RESPONSE_TIME[difficulty];
  const delay = minMs + Math.random() * (maxMs - minMs);
  const correct = Math.random() < ACCURACY[difficulty];
  const correctValue = pickCorrectAnswer(challenge);

  return new Promise((resolve) => {
    setTimeout(() => {
      let value: string | number[];
      if (correct) {
        value = correctValue;
      } else {
        if (challenge.type === 'noteReading' && typeof correctValue === 'string') {
          const wrong = challenge.options.filter((o) => o !== correctValue);
          value = wrong[Math.floor(Math.random() * wrong.length)] ?? correctValue;
        } else if (challenge.type === 'rhythmTap') {
          value = challenge.pattern.map((b) => b.time * (0.8 + Math.random() * 0.4));
        } else if (challenge.type === 'tempoIdentify') {
          const wrong = challenge.options.filter((o) => o.bpm !== challenge.bpm);
          value = wrong[Math.floor(Math.random() * wrong.length)]?.label ?? String(correctValue);
        } else if ('options' in challenge && Array.isArray(challenge.options)) {
          const wrong = (challenge.options as string[]).filter((o) => o !== correctValue);
          value = wrong[Math.floor(Math.random() * wrong.length)] ?? String(correctValue);
        } else {
          value = String(correctValue);
        }
      }
      resolve({
        challengeId: challenge.id,
        value,
        responseTimeMs: Date.now() - shownAt,
      });
    }, delay);
  });
}
