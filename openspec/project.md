# Project Context

## Purpose
**Music Learning Games** is an educational web application designed to teach musical concepts to children (ages 4-10) through interactive, gamified experiences. The platform features animal characters as musical guides, making learning fun and engaging while building foundational music skills like pitch recognition, rhythm, melody memory, and instrument identification.

**Primary Goals:**
- Make music education accessible and fun for young learners
- Provide immediate audio-visual feedback for learning reinforcement
- Support multiple learning styles through varied game mechanics
- Create a safe, ad-free educational environment

## Tech Stack

### Frontend
- **React 18** - UI framework with hooks-based architecture
- **TypeScript 5.6** - Type-safe development
- **Vite 5** - Fast build tool and dev server
- **Wouter 3** - Lightweight client-side routing
- **TanStack Query 5** - Server state management
- **Tailwind CSS 4** - Utility-first styling with custom theme
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### Backend
- **Node.js** with **Express 4** - REST API server
- **TypeScript** - Shared types between client/server
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** (via Neon) - Database for session persistence
- **Express Session** - Session management (optional)

### Audio
- **Web Audio API** - Browser-native audio synthesis
- Custom audio service for tone generation and playback

### Development Tools
- **Vitest** - Unit testing framework
- **Testing Library** - React component testing
- **tsx** - TypeScript execution for development
- **esbuild** - Production bundling
- **Drizzle Kit** - Database migrations

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
/server       - Express backend (API + SSR in dev)
/shared       - Shared types, schemas, constants
/openspec     - Specification-driven development docs
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
- **Type checking** via `npm run check` (tsc --noEmit)

#### Testing Requirements
- All game logic functions must have unit tests
- Test edge cases (e.g., score boundaries, invalid inputs)
- Mock audio APIs in tests (Web Audio API not available in jsdom)
- Test accessibility features (keyboard navigation, ARIA labels)
- Run tests before committing: `npm test`

#### Test File Locations
- Unit tests: `client/src/test/*.test.ts`
- Test setup: `client/src/test/setup.ts`
- Component tests: Co-located with components (future)

### Git Workflow

#### Branching Strategy
- **main** - Production-ready code
- **feature/[name]** - New features (e.g., `feature/add-rhythm-game`)
- **fix/[name]** - Bug fixes
- **refactor/[name]** - Code improvements without behavior changes

#### Commit Conventions
- Use conventional commits format:
  - `feat: add rhythm repeat game`
  - `fix: correct pitch calculation in audio service`
  - `refactor: simplify game state management`
  - `docs: update README with new game instructions`
  - `test: add tests for melody memory logic`
  - `chore: update dependencies`

#### Pull Request Process
1. Create feature branch from main
2. Implement changes following OpenSpec proposals (if applicable)
3. Run `npm run check` and `npm test`
4. Create PR with clear description
5. Wait for approval before merging
6. Squash and merge to main

## Domain Context

### Musical Concepts
- **Pitch** - Frequency of sound (measured in Hz), perceived as "high" or "low"
- **Musical notes** - Standard pitch values (C4 = 261.63 Hz, A4 = 440 Hz, etc.)
- **Octaves** - Doubling of frequency (C4 to C5 is one octave)
- **Rhythm** - Patterns of sound duration and timing
- **Melody** - Sequence of pitches forming a musical phrase
- **Timbre** - Quality/color of sound (what makes instruments sound different)

### Educational Approach
- **Scaffolded learning** - Start with simple concepts (high/low) before complex ones
- **Immediate feedback** - Visual and audio cues for correct/incorrect answers
- **Gamification** - Points, characters, and progression to maintain engagement
- **Age-appropriate** - Games designed for specific age ranges (4-7, 6-9, 7-10)
- **Multi-sensory** - Combine audio, visual, and interactive elements

### Animal Characters
- **Ellie Elephant** - Plays trumpet, represents lower/mid-range sounds
- **Gary Giraffe** - Plays violin, represents higher-range sounds
- Characters provide personality and relatability for young learners

### Game Mechanics
- **High or Low?** - Compare two pitches, identify which is higher/lower
- **Rhythm Repeat** (planned) - Listen and reproduce rhythm patterns
- **Melody Memory** (planned) - Match melodic sequences
- **Sound Safari** (planned) - Explore instrument timbres
- **Pitch Perfect** (planned) - Advanced pitch training
- **Music Quiz** (planned) - Test musical knowledge

## Important Constraints

### Technical Constraints
- **Browser compatibility** - Must support modern browsers (Chrome, Firefox, Safari, Edge)
- **Web Audio API** - Required for sound generation (no fallback for older browsers)
- **No external audio files** - All sounds generated programmatically via Web Audio API
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

### Development Services
- **npm registry** - Package management
- **Vite dev server** - Hot module replacement during development
- **TypeScript compiler** - Type checking and compilation

### Future Dependencies (Planned)
- **Authentication provider** (optional) - For user accounts and progress tracking
- **Analytics service** (optional) - Privacy-focused usage analytics
- **CDN** (optional) - For production asset delivery
