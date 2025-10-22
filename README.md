# Musically Nowlin Games

Educational music learning platform with 60+ interactive games covering pitch, rhythm, harmony, dynamics, and more.

## Live Demo

🎵 **[Play Now](https://chrisnowlin.github.io/Musically-Nowlin-Games/)** 🎵

## Features

- **60+ Interactive Games** - Learn music theory through engaging gameplay
- **Multiple Categories**:
  - Pitch & Melody Recognition
  - Rhythm & Beat Training
  - Harmony & Chord Theory
  - Dynamics & Expression
  - Tempo & Time Signatures
  - Form & Structure
  - And many more!
- **Real Audio Synthesis** - Powered by Tone.js
- **Progressive Difficulty** - Games designed for all skill levels
- **Visual Learning** - Clear music notation using VexFlow

## Tech Stack

- **Runtime**: Bun 1.3 (fast JavaScript runtime)
- **Framework**: React 18 + TypeScript 5.6
- **Build Tool**: Vite 5
- **Audio**: Web Audio API + Tone.js
- **Music Notation**: VexFlow 5
- **Styling**: TailwindCSS 4
- **UI Components**: Radix UI
- **Routing**: Wouter 3

## Prerequisites

This project uses **Bun 1.3** for faster development and builds.

### Installing Bun

**macOS/Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows:**
```bash
powershell -c "irm bun.sh/install.ps1|iex"
```

**Verify installation:**
```bash
bun --version
# Should output: 1.3.x
```

For detailed migration information, see [BUN_MIGRATION.md](./BUN_MIGRATION.md).

## Local Development

```bash
# Install dependencies (3x faster than npm)
bun install

# Start development server
bun run dev
# or shorthand:
bun dev

# Run tests
bun test
bun test:watch
bun test:e2e

# Type checking
bun run check
```

## Building

```bash
# Production build
bun run build

# Preview production build
bun run preview
```

## Performance Benefits

With Bun 1.3:
- **Installation**: 3x faster than npm
- **Dev server**: 2x faster startup
- **Build time**: 1.5x faster
- **Tests**: 2.5x faster execution

## License

MIT
