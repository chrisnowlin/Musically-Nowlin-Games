# Branch Examples

This file demonstrates the branching workflow. Each example branch type is documented here.

## Feature Branch: `feature/example-new-game`

**Purpose**: Add new features to the application

**Workflow**:
1. Branch from `develop`
2. Implement the feature
3. Create PR to `develop`
4. After CI passes, merge to `develop`

```bash
# Create feature branch
git checkout develop
git checkout -b feature/my-feature

# Work on feature...
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push -u origin feature/my-feature
gh pr create --base develop
```

## Fix Branch: `fix/example-audio-bug`

**Purpose**: Fix non-critical bugs

**Workflow**:
1. Branch from `develop`
2. Fix the bug
3. Create PR to `develop`
4. After CI passes, merge to `develop`

```bash
# Create fix branch
git checkout develop
git checkout -b fix/bug-description

# Fix the bug...
git add .
git commit -m "fix: resolve audio playback issue"

# Push and create PR
git push -u origin fix/bug-description
gh pr create --base develop
```

## Hotfix Branch: `hotfix/example-critical-fix`

**Purpose**: Fix critical production bugs immediately

**Workflow**:
1. Branch from `main` (not develop!)
2. Fix the critical bug
3. Create PR to `main`
4. After merge, also merge to `develop`
5. Tag a patch release

```bash
# Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-bug

# Fix the bug...
git add .
git commit -m "fix: patch critical security issue"

# Push and create PR to main
git push -u origin hotfix/critical-bug
gh pr create --base main

# After merging to main, also merge to develop
git checkout develop
git merge hotfix/critical-bug
git push origin develop

# Tag the release
git checkout main
git tag -a v1.0.1 -m "Hotfix v1.0.1"
git push origin v1.0.1
```

## Branch Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/description` | `feature/add-rhythm-game` |
| Bug Fix | `fix/description` | `fix/audio-latency` |
| Hotfix | `hotfix/description` | `hotfix/security-patch` |
| Refactor | `refactor/description` | `refactor/audio-service` |

## Quick Reference

```bash
# List all branches
git branch -a

# Switch branches
git checkout branch-name

# Delete local branch after merge
git branch -d feature/my-feature

# Delete remote branch
git push origin --delete feature/my-feature
```






