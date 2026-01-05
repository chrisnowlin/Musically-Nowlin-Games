# Contributing to Musically Nowlin Games

Thank you for your interest in contributing! This guide explains our development workflow and branching strategy.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/chrisnowlin/Musically-Nowlin-Games.git
cd Musically-Nowlin-Games

# Install dependencies
bun install

# Start development server
bun dev

# Run tests
bun test

# Type check
bun run check
```

## Branching Strategy

We use a modified Git Flow strategy to keep production deployments stable while allowing rapid feature development.

```
main (protected)     → Production (auto-deploy via Vercel)
├── develop          → Integration & staging
├── feature/*        → New features
├── fix/*            → Bug fixes
├── refactor/*       → Code improvements
└── hotfix/*         → Critical production fixes
```

### Branch Descriptions

| Branch | Purpose | Branches From | Merges To |
|--------|---------|---------------|-----------|
| `main` | Production-ready code | - | - |
| `develop` | Integration testing | `main` (initially) | `main` (releases) |
| `feature/*` | New features | `develop` | `develop` |
| `fix/*` | Bug fixes | `develop` | `develop` |
| `refactor/*` | Code improvements | `develop` | `develop` |
| `hotfix/*` | Critical fixes | `main` | `main` AND `develop` |

## Development Workflow

### 1. Starting a New Feature

```bash
# Ensure you have the latest develop branch
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/my-new-feature

# Make your changes, commit frequently
git add .
git commit -m "feat: add new game component"

# Push to remote
git push -u origin feature/my-new-feature
```

### 2. Creating a Pull Request

1. Push your branch to GitHub
2. Create a PR targeting the `develop` branch
3. Fill out the PR template with:
   - What changes were made
   - How to test the changes
   - Screenshots (if UI changes)
4. Wait for CI to pass
5. Request review if needed
6. Squash and merge when approved

### 3. Bug Fixes

```bash
# For non-critical bugs, branch from develop
git checkout develop
git pull origin develop
git checkout -b fix/broken-audio-playback

# Make fixes and create PR to develop
```

### 4. Hotfixes (Critical Production Issues)

```bash
# For critical production bugs, branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# Make the fix
git commit -m "fix: patch critical security vulnerability"

# Create PR to main
# After merging to main, also merge to develop:
git checkout develop
git merge hotfix/critical-security-fix
git push origin develop
```

## Release Process

### Creating a Release

1. **Ensure develop is stable**
   - All tests pass
   - Features are complete and tested
   - No known critical bugs

2. **Merge develop to main**
   ```bash
   git checkout main
   git pull origin main
   git merge develop
   git push origin main
   ```

3. **Create a version tag**
   ```bash
   # Determine version number using semantic versioning
   # MAJOR.MINOR.PATCH (e.g., v1.2.3)
   
   git tag -a v1.2.3 -m "Release v1.2.3: Add new rhythm games"
   git push origin v1.2.3
   ```

4. **Automatic deployment**
   - Vercel automatically deploys when main is updated
   - Preview deployments are created for pull requests

### Semantic Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (v2.0.0) - Breaking changes, major rewrites
- **MINOR** (v1.1.0) - New features, backward compatible
- **PATCH** (v1.0.1) - Bug fixes, backward compatible

Examples:
- Adding a new game: `v1.3.0` (minor)
- Fixing audio bug: `v1.2.1` (patch)
- Rewriting the audio system: `v2.0.0` (major)

## Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>: <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style (formatting, semicolons) |
| `refactor` | Code change that neither fixes nor adds |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |

### Examples

```bash
# Feature
git commit -m "feat: add melody memory game"

# Bug fix
git commit -m "fix: correct pitch calculation in audio service"

# Documentation
git commit -m "docs: update README with new game instructions"

# Refactor
git commit -m "refactor: simplify game state management"

# Breaking change
git commit -m "feat!: redesign game API

BREAKING CHANGE: Game components now require new props"
```

## Code Quality

### Before Submitting a PR

1. **Run type checking**
   ```bash
   bun run check
   ```

2. **Run tests**
   ```bash
   bun test
   ```

3. **Test locally**
   ```bash
   bun dev
   # Open http://localhost:5173 and test your changes
   ```

4. **Build successfully**
   ```bash
   bun run build
   ```

### CI Pipeline

Every PR triggers our CI pipeline which:
- ✅ Type checks with TypeScript
- ✅ Runs unit tests
- ✅ Builds the application
- ✅ Uploads build artifacts

PRs cannot be merged until CI passes.

## Project Structure

```
client/
├── src/
│   ├── components/     # React components
│   │   ├── ui/         # Reusable UI components
│   │   └── *Game.tsx   # Game components
│   ├── pages/          # Page components (routes)
│   ├── lib/            # Utilities and services
│   │   ├── audio/      # Audio system
│   │   └── gameLogic/  # Game logic modules
│   ├── hooks/          # Custom React hooks
│   ├── config/         # Configuration files
│   └── test/           # Test files
├── public/             # Static assets
│   └── audio/          # Audio samples
└── index.html          # Entry point
```

## Getting Help

- **Documentation**: Check the `openspec/` directory for detailed specs
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

## License

MIT License - see [LICENSE](LICENSE) for details.









