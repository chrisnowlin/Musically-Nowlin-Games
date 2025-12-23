# Fix Branch Example

This file was created on the `fix/example-audio-bug` branch to demonstrate the bug fix workflow.

## When to Use Fix Branches

Use `fix/*` branches for:
- Non-critical bug fixes
- Minor issues that don't require immediate production deployment
- Bugs discovered during development or testing

## Workflow

1. **Create from develop**: `git checkout -b fix/bug-name develop`
2. **Fix the issue**: Make necessary code changes
3. **Test locally**: Run `bun test` and `bun run check`
4. **Push and PR**: Create a pull request to `develop`
5. **Merge**: After CI passes, merge to `develop`

## Example Commit Messages

```
fix: resolve audio context not resuming on iOS
fix: correct pitch calculation for sharp notes
fix: handle edge case in score calculation
fix: prevent memory leak in audio service
```

## Difference from Hotfix

| Aspect | Fix Branch | Hotfix Branch |
|--------|------------|---------------|
| **Urgency** | Normal | Critical |
| **Branch from** | `develop` | `main` |
| **Merge to** | `develop` | `main` AND `develop` |
| **Release** | Next scheduled release | Immediate patch release |






