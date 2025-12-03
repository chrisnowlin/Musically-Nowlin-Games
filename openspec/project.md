# Project Context

## Purpose
**Musically Nowlin Games** is an educational web application designed to teach musical concepts to children (ages 4-12) through interactive, gamified experiences. The platform features animal characters as musical guides, making learning fun and engaging while building foundational music skills like pitch recognition, rhythm, melody memory, harmony, dynamics, and instrument identification.

**Primary Goals:**
- Make music education accessible and fun for young learners
- Provide immediate audio-visual feedback for learning reinforcement
- Support multiple learning styles through varied game mechanics
- Create a safe, ad-free educational environment

## Tech Stack

### Runtime & Build
- **Bun 1.3** - Fast JavaScript runtime (3x faster installs, 2x faster dev server)
- **Vite 5** - Fast build tool and dev server
- **TypeScript 5.6** - Type-safe development with strict mode

### Frontend
- **React 18** - UI framework with hooks-based architecture
- **Wouter 3** - Lightweight client-side routing
- **TanStack Query 5** - Server state management
- **Tailwind CSS 3.4** - Utility-first styling with custom theme
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **VexFlow 5** - Music notation rendering (for Staff Wars and theory games)

### Audio System
- **Web Audio API** - Browser-native audio synthesis
- **Philharmonia Orchestra Samples** - 15 professional instrument samples
  - Strings: violin, viola, cello, double bass
  - Woodwinds: flute, oboe, clarinet, bassoon
  - Brass: trumpet, french horn, trombone, tuba
  - Percussion: timpani, xylophone, snare drum
- **Custom audio service** for tone generation and playback
- **Melody Library** - 60+ reusable musical patterns

### Backend (Optional)
- **Node.js** with **Express 4** - REST API server
- **TypeScript** - Shared types between client/server
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** (via Neon) - Database for session persistence
- **Express Session** - Session management (optional)

### Development & Testing
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **Testing Library** - React component testing
- **jest-axe** - Accessibility testing

## Project Conventions

### Code Style
- **TypeScript strict mode** enabled for maximum type safety
- **Functional components** with React hooks (no class components)
- **Named exports** preferred over default exports (except for page components)
- **PascalCase** for components and types
- **camelCase** for functions, variables, and file utilities
- **kebab-case** for file names (e.g., `use-mobile.tsx`, `game-utils.ts`)
- **Path aliases**: `@/*` for client code, `@shared/*` for shared types
- **ESM modules** throughout (type: "module" in package.json)
- **Prettier/ESLint** - Follow existing formatting patterns
- **Comments** - Use JSDoc for complex functions, inline comments for non-obvious logic

### Architecture Patterns

#### Monorepo Structure
```
/client       - React frontend (SPA)
  /src
    /components   - Game components and UI
    /pages        - Route pages
    /hooks        - Custom React hooks
    /lib          - Utilities and services
    /config       - Game registry
    /theme        - Theme configuration
  /public
    /audio        - Philharmonia samples
    /images       - Game assets
/server       - Express backend (API + SSR in dev)
/shared       - Shared types, schemas, constants
/openspec     - Specification-driven development docs
/docs         - Project documentation
/scripts      - Build and utility scripts
```

#### Frontend Architecture
- **Component-based** - Reusable UI components in `/components/ui`
- **Page-based routing** - Top-level pages in `/pages`
- **Config-driven games** - Central game registry in `/config/games.ts`
- **Custom hooks** - Reusable logic in `/hooks`
- **Service layer** - Audio and utilities in `/lib`
- **Theme system** - Centralized theme configuration in `/theme`

#### State Management
- **Local state** - React useState for component-specific state
- **Server state** - TanStack Query for API data (future use)
- **Game state** - In-memory state management (no persistence yet)
- **Session state** - Express sessions (optional, for future user tracking)

#### Data Flow
1. Game configuration defined in `config/games.ts`
2. Landing page renders games from config
3. Game components manage their own state
4. Audio service handles sound generation
5. (Future) API calls for score persistence

#### Component Patterns
- **Composition over inheritance** - Build complex UIs from simple components
- **Props interfaces** - Explicit TypeScript interfaces for all component props
- **Controlled components** - Form inputs managed by React state
- **Render props** - For flexible component composition
- **Children props** - For layout components

### Testing Strategy

#### Current Approach
- **Unit tests** for game logic (`gameLogic.test.ts`)
- **Vitest** as test runner with jsdom environment
- **Testing Library** for React component testing
- **Playwright** for end-to-end testing
- **jest-axe** for accessibility testing
- **Type checking** via `bun run check` (tsc --noEmit)

#### Testing Requirements
- All game logic functions must have unit tests
- Test edge cases (e.g., score boundaries, invalid inputs)
- Mock audio APIs in tests (Web Audio API not available in jsdom)
- Test accessibility features (keyboard navigation, ARIA labels)
- Run tests before committing: `bun test`

#### Test File Locations
- Unit tests: `client/src/test/*.test.ts`
- Hook tests: `client/src/hooks/__tests__/*.test.ts`
- E2E tests: Root level `*.test.ts` files
- Test setup: `client/src/test/setup.ts`

### Git Workflow

#### Branching Strategy

```
main (protected)     → Production (deploy on tags only)
├── develop          → Integration & staging
├── feature/*        → New features (from develop)
├── fix/*            → Bug fixes (from develop)
├── refactor/*       → Code improvements (from develop)
└── hotfix/*         → Critical production fixes (from main)
```

**Branch Purposes:**
- **main** - Production-ready code. Only receives merges from `develop` or `hotfix/*`. Deployments triggered by version tags (e.g., `v1.2.3`).
- **develop** - Integration branch for testing features together. Staging deployments run here.
- **feature/[name]** - New features (e.g., `feature/add-rhythm-game`). Branch from `develop`, merge back to `develop`.
- **fix/[name]** - Bug fixes. Branch from `develop`, merge back to `develop`.
- **refactor/[name]** - Code improvements without behavior changes. Branch from `develop`, merge back to `develop`.
- **hotfix/[name]** - Critical production fixes. Branch from `main`, merge to both `main` AND `develop`.

#### Release Process

1. **Feature Development**
   - Create branch from `develop`: `git checkout -b feature/new-game develop`
   - Develop and test locally
   - Create PR to merge into `develop`
   - CI runs tests automatically

2. **Integration Testing**
   - Features merged to `develop` are built and tested
   - Staging deployment allows testing before production

3. **Production Release**
   - When `develop` is stable, merge to `main`: `git checkout main && git merge develop`
   - Create a version tag: `git tag -a v1.2.3 -m "Release v1.2.3"`
   - Push the tag: `git push origin v1.2.3`
   - GitHub Actions automatically deploys to production

4. **Hotfixes**
   - For critical production bugs: `git checkout -b hotfix/critical-bug main`
   - Fix and test
   - Merge to `main` AND `develop`
   - Tag a patch release: `git tag -a v1.2.4 -m "Hotfix v1.2.4"`

#### Semantic Versioning

Use [Semantic Versioning](https://semver.org/) for release tags:
- **MAJOR** (v2.0.0) - Breaking changes
- **MINOR** (v1.1.0) - New features, backward compatible
- **PATCH** (v1.0.1) - Bug fixes, backward compatible

#### Commit Conventions
- Use conventional commits format:
  - `feat: add rhythm repeat game`
  - `fix: correct pitch calculation in audio service`
  - `refactor: simplify game state management`
  - `docs: update README with new game instructions`
  - `test: add tests for melody memory logic`
  - `chore: update dependencies`

#### Pull Request Process
1. Create feature branch from `develop` (or `main` for hotfixes)
2. Implement changes following OpenSpec proposals (if applicable)
3. Run `bun run check` and `bun test`
4. Create PR with clear description targeting `develop` (or `main` for hotfixes)
5. CI must pass before merging
6. Squash and merge to target branch
7. For releases: merge `develop` → `main`, then tag

## Domain Context

### Musical Concepts
- **Pitch** - Frequency of sound (measured in Hz), perceived as "high" or "low"
- **Musical notes** - Standard pitch values (C4 = 261.63 Hz, A4 = 440 Hz, etc.)
- **Octaves** - Doubling of frequency (C4 to C5 is one octave)
- **Intervals** - Distance between two pitches (unison, third, fifth, octave, etc.)
- **Rhythm** - Patterns of sound duration and timing
- **Meter** - Organization of beats (4/4, 3/4, 6/8, etc.)
- **Melody** - Sequence of pitches forming a musical phrase
- **Harmony** - Multiple pitches sounding together (chords, consonance/dissonance)
- **Dynamics** - Volume levels (piano, forte, crescendo, diminuendo)
- **Timbre** - Quality/color of sound (what makes instruments sound different)
- **Form** - Structure of music (ABA, rondo, verse-chorus, etc.)

### Educational Approach
- **Scaffolded learning** - Start with simple concepts (high/low) before complex ones
- **Immediate feedback** - Visual and audio cues for correct/incorrect answers
- **Gamification** - Points, characters, and progression to maintain engagement
- **Age-appropriate** - Games designed for specific age ranges (4-7, 6-9, 7-12)
- **Multi-sensory** - Combine audio, visual, and interactive elements
- **Progressive difficulty** - Easy, medium, and hard modes for all skill levels

### Animal Characters
- **Bella Bird** - Represents high-pitched sounds, cheerful personality
- **Leo Lion** - Represents low-pitched sounds, confident and strong
- **Milo Monkey** - Represents mid-range sounds, playful and curious
- Characters provide personality and relatability for young learners

### Game Categories (70+ Games)

#### Pitch & Melody
- **High or Low?** - Compare two pitches, identify which is higher/lower
- **Pitch Ladder Jump** - Identify pitch direction (up, down, same)
- **Interval Trainer** - Recognize melodic and harmonic intervals
- **Melody Master** - Transposition, inversion, retrograde patterns
- **Scale Climber** - Identify ascending/descending scales
- **Contour Master** - Analyze melodic shape and direction

#### Rhythm & Tempo
- **Rhythm Echo Challenge** - Listen and reproduce rhythm patterns
- **Beat Keeper Challenge** - Tap along with steady beat
- **Beat & Pulse Trainer** - 5 modes for comprehensive rhythm training
- **Meter Master** - Identify time signatures (4/4, 3/4, 6/8)
- **Rhythm Notation Master** - Read and write rhythmic notation
- **Polyrhythm Master** - Layer multiple rhythms simultaneously

#### Harmony & Theory
- **Harmony Helper** - Identify consonance vs dissonance
- **Chord Master** - Triads, seventh chords, extended chords
- **Scale Builder** - Construct major, minor, and modal scales
- **Key Signature Master** - Identify keys and accidentals
- **Staff Wars** - Note reading game with scrolling staff

#### Timbre & Dynamics
- **Instrument Detective** - Identify instrument families by sound
- **Loud or Quiet Safari** - Compare dynamic levels
- **Tone Color Match** - Match melodies across different instruments
- **Expression Master** - Phrasing and articulation

#### Listening & Analysis
- **Musical Form Explorer** - ABA, rondo, verse-chorus structures
- **Musical Style Detective** - Period and genre identification
- **Composer Detective** - Recognize composer styles
- **Same or Different?** - Compare musical phrases

#### Creative & Cross-Curricular
- **Compose Your Song** - Arrange notes to create melodies
- **Animal Orchestra Conductor** - Layer parts to build arrangements
- **Musical Math** - Add and subtract note durations
- **Music & Movement Studio** - Connect music to physical gesture

## Important Constraints

### Technical Constraints
- **Browser compatibility** - Must support modern browsers (Chrome, Firefox, Safari, Edge)
- **Web Audio API** - Required for sound generation (no fallback for older browsers)
- **Philharmonia samples** - Real instrument audio files in `/client/public/audio/philharmonia/`
- **Client-side rendering** - SPA architecture, no SSR in production
- **Mobile responsive** - Must work on tablets and phones (touch-friendly)
- **Performance** - Smooth animations at 60fps, audio latency < 100ms

### Educational Constraints
- **Age-appropriate content** - No violence, scary imagery, or inappropriate themes
- **Accessibility** - WCAG 2.1 AA compliance for inclusive learning
- **No ads or tracking** - Privacy-focused, safe for children
- **Offline capability** (future) - Games should work without internet after initial load

### Business Constraints
- **Free to use** - No monetization currently planned
- **Open source** (potential) - Consider licensing for educational use
- **No user accounts** (currently) - Anonymous play, optional persistence later

### Development Constraints
- **Simplicity first** - Avoid over-engineering, keep code under 100 lines per file when possible
- **No frameworks** - Avoid heavy game engines, use vanilla Web APIs
- **Boring technology** - Prefer proven, stable libraries over cutting-edge
- **Fast iteration** - Prioritize shipping working games over perfect architecture

## External Dependencies

### Required Services
- **Neon PostgreSQL** - Serverless Postgres database (optional, for future persistence)
  - Connection via `@neondatabase/serverless`
  - Used for game session tracking (not yet implemented)

### Browser APIs
- **Web Audio API** - Core dependency for all audio generation
  - `AudioContext`, `OscillatorNode`, `GainNode`
  - No polyfill available, modern browsers only
- **localStorage** (future) - For client-side game progress persistence

### Third-Party Libraries
- **Radix UI** - Accessible component primitives (dialogs, tooltips, etc.)
- **Lucide Icons** - Icon library for game UI
- **Framer Motion** - Animation library for engaging interactions
- **Tailwind CSS** - Utility-first styling framework
- **VexFlow** - Music notation rendering for staff-based games

### Audio Assets
- **Philharmonia Orchestra** - Professional instrument samples
  - Located in `client/public/audio/philharmonia/`
  - Organized by instrument family and note
  - Volume-normalized for consistent playback

### Development Services
- **Bun** - Package management and runtime
- **Vite dev server** - Hot module replacement during development
- **TypeScript compiler** - Type checking and compilation
- **GitHub Actions** - CI/CD pipelines

### Future Dependencies (Planned)
- **Authentication provider** (optional) - For user accounts and progress tracking
- **Analytics service** (optional) - Privacy-focused usage analytics
- **CDN** (optional) - For production asset delivery
