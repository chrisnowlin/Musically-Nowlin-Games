# Branching Guide for Developers

This guide explains our Git branching strategy, the purpose of each branch type, and what work belongs on each.

## Branch Overview

```
main (protected)     → Production code, always deployable
├── develop          → Integration branch, staging environment
├── feature/*        → New features and enhancements
├── fix/*            → Bug fixes (non-critical)
├── refactor/*       → Code improvements without behavior changes
└── hotfix/*         → Critical production fixes (emergency only)
```

---

## 🔵 `main` Branch

**Purpose**: Production-ready code that is deployed to users.

### Characteristics
- **Protected**: Requires PR and passing CI checks
- **Stable**: Always in a deployable state
- **Tagged**: Releases are marked with version tags (e.g., `v1.2.3`)

### What Goes Here
- ✅ Merged code from `develop` (scheduled releases)
- ✅ Merged hotfixes (emergency patches)
- ✅ Version tags for releases

### What Does NOT Go Here
- ❌ Direct commits (use PRs)
- ❌ Untested code
- ❌ Work in progress

### Deployment
Production deployments are triggered **only by version tags**:
```bash
git tag -a v1.2.3 -m "Release v1.2.3"
git push origin v1.2.3
```

---

## 🟢 `develop` Branch

**Purpose**: Integration branch where features are combined and tested before release.

### Characteristics
- **Protected**: Requires passing CI checks
- **Integration**: All feature branches merge here first
- **Staging**: Can be deployed to a staging environment for testing

### What Goes Here
- ✅ Merged feature branches
- ✅ Merged fix branches
- ✅ Merged refactor branches
- ✅ Merged hotfixes (after they go to main)

### What Does NOT Go Here
- ❌ Direct commits for large changes
- ❌ Incomplete features
- ❌ Code that breaks the build

### Workflow
```bash
# Merge a completed feature
git checkout develop
git merge feature/new-game
git push origin develop
```

---

## 🟣 `feature/*` Branches

**Purpose**: Develop new features, enhancements, or capabilities.

### When to Use
| ✅ Use for | ❌ Don't use for |
|-----------|-----------------|
| New games | Bug fixes |
| New UI components | Refactoring existing code |
| New functionality | Documentation-only changes |
| API additions | Configuration changes |
| Major enhancements | Hotfixes |

### Examples of Feature Work
- Adding a new music game (`feature/add-melody-match-game`)
- Implementing a new audio visualization (`feature/audio-waveform-display`)
- Adding user preferences (`feature/user-settings-panel`)
- Creating a new game mode (`feature/multiplayer-mode`)
- Adding accessibility features (`feature/screen-reader-support`)

### Naming Convention
```
feature/[short-description]
feature/[ticket-number]-[description]
```

**Examples**:
- `feature/add-rhythm-game`
- `feature/improve-landing-page`
- `feature/MUSIC-123-add-leaderboard`

### Workflow
```bash
# 1. Create from develop
git checkout develop
git pull origin develop
git checkout -b feature/my-new-feature

# 2. Work on the feature (commit often)
git add .
git commit -m "feat: add initial game component"
git commit -m "feat: implement scoring logic"
git commit -m "test: add unit tests for game logic"

# 3. Push and create PR to develop
git push -u origin feature/my-new-feature
gh pr create --base develop --title "feat: add new rhythm game"

# 4. After merge, clean up
git checkout develop
git pull origin develop
git branch -d feature/my-new-feature
```

### Commit Message Prefix
Use `feat:` for feature commits:
```
feat: add new rhythm game component
feat: implement score calculation
feat: add game over screen
```

---

## 🟠 `fix/*` Branches

**Purpose**: Fix bugs that are not critical enough for a hotfix.

### When to Use
| ✅ Use for | ❌ Don't use for |
|-----------|-----------------|
| Non-critical bugs | Critical production issues (use hotfix) |
| UI glitches | New features |
| Logic errors | Refactoring |
| Edge case handling | Performance improvements |
| Test failures | Security vulnerabilities |

### Examples of Fix Work
- Fixing audio not playing on certain browsers (`fix/safari-audio-playback`)
- Correcting score calculation edge case (`fix/score-overflow`)
- Fixing responsive layout issues (`fix/mobile-layout-overflow`)
- Resolving race condition in game state (`fix/game-state-race-condition`)
- Fixing accessibility issues (`fix/keyboard-navigation`)

### Naming Convention
```
fix/[short-description]
fix/[ticket-number]-[description]
```

**Examples**:
- `fix/audio-latency`
- `fix/score-not-saving`
- `fix/BUG-456-button-not-clickable`

### Workflow
```bash
# 1. Create from develop
git checkout develop
git pull origin develop
git checkout -b fix/audio-playback-issue

# 2. Fix the bug
git add .
git commit -m "fix: resolve audio context suspension on iOS"

# 3. Push and create PR to develop
git push -u origin fix/audio-playback-issue
gh pr create --base develop --title "fix: resolve audio playback on iOS"

# 4. After merge, clean up
git checkout develop
git pull origin develop
git branch -d fix/audio-playback-issue
```

### Commit Message Prefix
Use `fix:` for bug fix commits:
```
fix: resolve audio not playing on Safari
fix: correct pitch calculation for flat notes
fix: handle null game state gracefully
```

---

## 🔴 `hotfix/*` Branches

**Purpose**: Emergency fixes for critical production issues.

### ⚠️ Important: Hotfixes Branch from `main`

Unlike other branches, hotfixes branch from `main` because they need to bypass `develop` and go directly to production.

### When to Use
| ✅ Use for | ❌ Don't use for |
|-----------|-----------------|
| Security vulnerabilities | Minor bugs |
| Production crashes | UI improvements |
| Data corruption | New features |
| Service outages | Refactoring |
| Critical user-facing bugs | Non-urgent fixes |

### Decision Criteria
Ask yourself:
1. **Is this breaking production?** → Hotfix
2. **Is user data at risk?** → Hotfix
3. **Is this a security issue?** → Hotfix
4. **Can it wait for the next release?** → Use `fix/*` instead

### Examples of Hotfix Work
- Patching a security vulnerability (`hotfix/xss-vulnerability`)
- Fixing app crash on startup (`hotfix/startup-crash`)
- Correcting data loss issue (`hotfix/save-data-corruption`)
- Fixing authentication bypass (`hotfix/auth-bypass`)

### Naming Convention
```
hotfix/[short-description]
hotfix/[severity]-[description]
```

**Examples**:
- `hotfix/critical-auth-bypass`
- `hotfix/production-crash`
- `hotfix/data-corruption`

### Workflow
```bash
# 1. Create from main (NOT develop!)
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# 2. Make the minimal fix
git add .
git commit -m "fix: patch XSS vulnerability in user input"

# 3. Push and create PR to main
git push -u origin hotfix/critical-security-fix
gh pr create --base main --title "fix: critical security patch"

# 4. After merging to main, ALSO merge to develop
git checkout develop
git pull origin develop
git merge hotfix/critical-security-fix
git push origin develop

# 5. Tag a patch release
git checkout main
git pull origin main
git tag -a v1.2.4 -m "Hotfix v1.2.4: Security patch"
git push origin v1.2.4

# 6. Clean up
git branch -d hotfix/critical-security-fix
git push origin --delete hotfix/critical-security-fix
```

### Commit Message Prefix
Use `fix:` for hotfix commits (same as regular fixes):
```
fix: patch critical security vulnerability
fix: prevent production crash on null input
fix: resolve data corruption in save system
```

---

## 🟡 `refactor/*` Branches

**Purpose**: Improve code quality without changing behavior.

### When to Use
| ✅ Use for | ❌ Don't use for |
|-----------|-----------------|
| Code cleanup | Bug fixes |
| Performance optimization | New features |
| Reducing technical debt | Changing functionality |
| Improving readability | Adding tests for new code |
| Restructuring modules | Hotfixes |

### Examples of Refactor Work
- Simplifying complex functions (`refactor/simplify-audio-service`)
- Extracting reusable components (`refactor/extract-game-timer`)
- Improving type safety (`refactor/strict-typescript`)
- Optimizing render performance (`refactor/memoize-game-components`)
- Reorganizing file structure (`refactor/reorganize-lib-folder`)

### Naming Convention
```
refactor/[short-description]
```

**Examples**:
- `refactor/simplify-game-state`
- `refactor/extract-audio-hooks`
- `refactor/improve-type-definitions`

### Workflow
```bash
# 1. Create from develop
git checkout develop
git pull origin develop
git checkout -b refactor/simplify-audio-service

# 2. Make improvements (ensure tests still pass!)
git add .
git commit -m "refactor: extract audio context initialization"
git commit -m "refactor: simplify playNote function"

# 3. Verify no behavior changes
bun test
bun run check

# 4. Push and create PR to develop
git push -u origin refactor/simplify-audio-service
gh pr create --base develop --title "refactor: simplify audio service"
```

### Commit Message Prefix
Use `refactor:` for refactoring commits:
```
refactor: extract common game logic to shared module
refactor: simplify state management in GameProvider
refactor: improve audio service error handling
```

---

## Quick Reference

### Branch Creation Commands

```bash
# Feature (from develop)
git checkout -b feature/name develop

# Fix (from develop)
git checkout -b fix/name develop

# Refactor (from develop)
git checkout -b refactor/name develop

# Hotfix (from main!)
git checkout -b hotfix/name main
```

### Commit Message Prefixes

| Prefix | Use For |
|--------|---------|
| `feat:` | New features |
| `fix:` | Bug fixes and hotfixes |
| `refactor:` | Code improvements |
| `docs:` | Documentation |
| `test:` | Adding/updating tests |
| `chore:` | Maintenance tasks |
| `perf:` | Performance improvements |
| `style:` | Code formatting |

### PR Targets

| Branch Type | PR Target |
|-------------|-----------|
| `feature/*` | `develop` |
| `fix/*` | `develop` |
| `refactor/*` | `develop` |
| `hotfix/*` | `main` (then also merge to `develop`) |

### Release Process

```bash
# 1. Merge develop to main
git checkout main
git merge develop
git push origin main

# 2. Tag the release
git tag -a v1.3.0 -m "Release v1.3.0"
git push origin v1.3.0

# Deployment happens automatically!
```

---

## Decision Flowchart

```
Is this a critical production issue?
├── YES → hotfix/* (from main)
└── NO
    └── Is this a new feature or enhancement?
        ├── YES → feature/* (from develop)
        └── NO
            └── Is this fixing a bug?
                ├── YES → fix/* (from develop)
                └── NO
                    └── Is this improving existing code?
                        ├── YES → refactor/* (from develop)
                        └── NO → Probably docs or chore (commit to develop)
```

---

## Need Help?

- **Unsure which branch type?** → Default to `feature/*`
- **Small documentation change?** → Commit directly to `develop`
- **Multiple concerns?** → Split into separate branches
- **Questions?** → Check `CONTRIBUTING.md` or ask the team

