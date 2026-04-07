// Finish the Tune - Main exports
export { default as FinishTheTuneGame } from './FinishTheTuneGame';
export { default } from './FinishTheTuneGame';

// Component exports
export { MelodyVisualizer } from './MelodyVisualizer';
export { StartScreen } from './StartScreen';
export { OptionsCard } from './OptionsCard';
export { StreakCounter } from './StreakCounter';
export { ConfettiOverlay } from './ConfettiOverlay';
export { ProgressTracker } from './ProgressTracker';
export { SettingsPanel } from './SettingsPanel';
export { TimerDisplay } from './TimerDisplay';
export { AchievementBadge, AchievementToast } from './AchievementBadge';
export { PianoKeyboard } from './PianoKeyboard';

// Type exports
export type {
  NoteEvent,
  FeedbackState,
  Question,
  MelodyPattern,
  Difficulty,
  FinishTheTuneState,
  GameAction,
  PersistedState,
  Achievement,
} from './types';
export { PITCH_COLORS } from './types';

// Logic exports
export * from './finish-the-tune-Logic';
export * from './finish-the-tune-Achievements';
