# Teacher Question Pools — Design

## Overview

Expose Melody Dungeon's question pool to teachers for editing and customization. Teachers create named "pools" (playlists of questions) that students access via game codes. Phase 1 focuses on vocabulary and freeform text questions; audio-based challenge editors (rhythm, timbre, intervals, note reading) come in later phases.

## Key Decisions

- **Storage:** PostgreSQL (existing Neon DB) — not client-side
- **Auth:** Google OAuth for teachers; students don't log in
- **Access model:** Separate teacher dashboard at `/melody-dungeon/teacher`
- **Ownership:** Per-teacher private pools + optional shared community publishing
- **Student flow:** Game code entry on start screen; default game (no code) uses built-in questions unchanged
- **Scope for Phase 1:** Vocabulary editing + freeform custom questions (Wizard enemy type)
- **Architecture:** "Playlist" model — pools contain mixed questions across categories

## Authentication

### Google OAuth 2.0

- Add `passport` + `passport-google-oauth20`
- Extend `users` table:
  - `email` (text, nullable)
  - `googleId` (text, nullable, unique)
  - `displayName` (text, nullable)
  - `role` (text, default `'player'`) — values: `'player'` | `'teacher'`
- New endpoints:
  - `GET /api/auth/google` — initiate OAuth redirect
  - `GET /api/auth/google/callback` — handle OAuth callback
- Google OAuth users default to `role = 'teacher'`
- Existing username/password auth continues working for Cadence Quest
- Teacher dashboard requires `role = 'teacher'`

## Database Schema

### `question_pools`

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| teacherId | integer FK → users.id | |
| name | text | e.g., "Unit 3: Dynamics & Tempo" |
| gameCode | text, unique | 6 alphanumeric chars, case-insensitive |
| isShared | boolean, default false | Published to community |
| useDefaults | boolean, default true | Mix in built-in questions |
| createdAt | timestamp | |
| updatedAt | timestamp | |

### `pool_vocab_entries`

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| poolId | integer FK → question_pools.id | |
| term | text | e.g., "Allegro" |
| definition | text | e.g., "Fast" |
| symbol | text, nullable | Unicode music notation |
| tier | integer (1-5) | |
| category | text | 'dynamics' \| 'tempo' \| 'symbols' \| 'terms' |
| format | text, nullable | 'standard' \| 'opposites' \| 'ordering' |
| createdAt | timestamp | |

### `pool_custom_questions` (Wizard questions)

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| poolId | integer FK → question_pools.id | |
| question | text | e.g., "Who composed the Four Seasons?" |
| correctAnswer | text | e.g., "Vivaldi" |
| wrongAnswer1 | text | |
| wrongAnswer2 | text | |
| wrongAnswer3 | text | |
| tier | integer (1-5) | |
| createdAt | timestamp | |

## API Routes

File: `server/routes/questionPools.ts`

### Teacher Pool Management (auth + teacher role required)

- `POST /api/pools` — Create pool
- `GET /api/pools` — List my pools
- `GET /api/pools/:id` — Get pool with all entries
- `PUT /api/pools/:id` — Update pool metadata
- `DELETE /api/pools/:id` — Delete pool
- `POST /api/pools/:id/regenerate-code` — New game code

### Vocab Entries (auth + teacher role required)

- `POST /api/pools/:id/vocab` — Add entry
- `PUT /api/pools/:id/vocab/:entryId` — Edit entry
- `DELETE /api/pools/:id/vocab/:entryId` — Delete entry

### Custom Questions (auth + teacher role required)

- `POST /api/pools/:id/custom` — Add question
- `PUT /api/pools/:id/custom/:qId` — Edit question
- `DELETE /api/pools/:id/custom/:qId` — Delete question

### Community (auth required)

- `GET /api/pools/shared` — Browse shared pools
- `POST /api/pools/:id/clone` — Clone shared pool

### Student/Game (no auth)

- `GET /api/pools/join/:gameCode` — Get pool data for game session

## Teacher Dashboard UI

Route: `/melody-dungeon/teacher`

### Pages

1. **Login** — "Sign in with Google" button
2. **Dashboard** — Pool list as cards (name, code, count, shared badge) + "Create New Pool" + "Browse Community"
3. **Pool Editor** — Header (name, code, useDefaults toggle, isShared toggle) + two tabs:
   - **Vocab tab:** Table grouped by category, inline add/edit/delete
   - **Custom Questions tab (Wizard):** Table of Q&A entries, add/edit/delete
   - **Preview button:** Modal simulating student challenge view
4. **Community Browser** — Grid of shared pools with clone button

Design philosophy: Clean, functional, table-based. Teacher tool, not student-facing.

## Game Integration

### Start Screen

- New "Enter Game Code" input field (optional)
- Fetches pool data from `/api/pools/join/:gameCode` on submit
- Shows pool name as confirmation
- Pool data held in React state for session duration

### During Gameplay

- **Vocab challenges:** If `useDefaults = true`, merge pool entries with hardcoded defaults (added to same tier/category arrays). If `false`, use only pool entries.
- **Custom (Wizard) challenges:** Only available when pool is active with custom questions.
- **Other challenge types:** Unchanged — always use built-in data (Phase 2+).

### Wizard Enemy Type

- New enemy subtype: `wizard` with challenge affinity `custom`
- New `ChallengeType`: `'custom'`
- New `CustomChallenge.tsx` component — 4-choice multiple choice text
- Wizards only spawn when game code is active and pool has custom questions
- Spawn rate scales with number of custom questions (capped)
- New wizard sprite asset needed

## Phased Rollout

### Phase 1 (This build)

- Google OAuth
- Database schema (pools, vocab, custom questions)
- API routes
- Teacher dashboard (login, pool list, editor)
- Game code entry on start screen
- Vocab merging during gameplay
- Wizard enemy + custom challenge
- Community browse/clone

### Phase 2 (Future)

- Rhythm pattern editor (visual builder)
- Timbre/instrument selector
- Note reading editor (staff picker)
- Interval editor

### Phase 3 (Future)

- Student progress tracking per pool
- Teacher analytics dashboard
- Bulk import/export (CSV, JSON)
