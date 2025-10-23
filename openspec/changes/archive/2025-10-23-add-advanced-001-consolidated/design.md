# Advanced Music Analyzer (advanced-001) — Design

## Overview
A consolidated, multi‑mode game with three modes: advanced-harmony, advanced-rhythm, advanced-form. It shares a base UI with per‑mode logic and audio playback using the existing sampleAudioService.

## Architecture
- Component: `client/src/components/Advanced001Game.tsx`
  - Mode selection UI (pre‑game)
  - Round generation, answer validation, scoring
  - Per‑mode audio playback behaviors
  - Multi‑mode state: `currentMode`, `level`, `correctStreak`, `score`, `round`, etc.
  - Progress persistence via `localStorage` (per mode): high scores, rounds played, achievements, last selected mode
- Logic: `client/src/lib/gameLogic/advanced-001Logic.ts`
  - Question banks and `generateRound(mode, difficulty)`
  - `validateAnswer`, `calculateScore`
- Modes: `client/src/lib/gameLogic/advanced-001Modes.ts`
  - Mode metadata and difficulty curves

## Mode definitions & curves
- Harmony: steady ramp (level → difficulty bounded 1..5)
- Rhythm: slightly faster ramp (ceil(level × 1.2))
- Form: medium ramp (ceil(level × 1.1))

## State management
- In‑memory state per session
- Persistence (localStorage):
  - `advanced-001:lastMode`
  - `advanced-001:highScores` (Record<mode, number>)
  - `advanced-001:roundsPlayed` (Record<mode, number>)
  - `advanced-001:achievements` (Record<mode, string[]>)
- Difficulty progression:
  - Start at level 1
  - After each round: +1 level on correct, −1 on incorrect (bounded 1..5)
  - Generate new rounds using mode‑specific difficulty curves

## Audio
- Uses shared `sampleAudioService`
- Per‑mode behavior:
  - Harmony: parallel chord playback
  - Rhythm: pattern sequence with timed steps
  - Form: short melodic sequences

## UI/UX
- Pre‑game: mode selection, instructions, statistics panel (per‑mode high score, rounds played, level, achievement badges)
- In‑game: question, replay button, options, result feedback, next round/finish
- Accessibility: semantic buttons; keyboard focusable controls (basic). Axe audit planned.

## Testing plan
- Logic unit tests: round generation, validation, scoring (added)
- Mode curves tests: difficulty bounds & ramp behaviors (added)
- Component tests (pending jsdom config):
  - Mode selection and start
  - Answer interaction and result feedback
  - Difficulty progression across rounds
- Integration tests (pending jsdom config): 
  - Direct route load to /games/advanced-001 and navigation
- Accessibility tests (pending axe-core install): 
  - Keyboard navigation, screen reader roles, axe audit

## Performance
- Minimal memoization on computed values; audio context reused via service
- Future work: node pooling, broader React.memo, bundle code‑splitting/lazy routes

