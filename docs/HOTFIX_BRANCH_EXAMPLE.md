# Hotfix Branch Example

This file was created on the `hotfix/example-critical-fix` branch to demonstrate the hotfix workflow for critical production issues.

## When to Use Hotfix Branches

Use `hotfix/*` branches for:
- **Critical security vulnerabilities**
- **Production-breaking bugs**
- **Data corruption issues**
- **Any issue that cannot wait for the next release**

## ⚠️ Important: Hotfixes Branch from `main`

Unlike feature and fix branches, hotfixes branch directly from `main` because they need to be deployed immediately without waiting for other changes in `develop`.

## Workflow

```bash
# 1. Create hotfix from main (NOT develop!)
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue

# 2. Make the fix
# ... edit files ...
git add .
git commit -m "fix: patch critical security vulnerability"

# 3. Push and create PR to main
git push -u origin hotfix/critical-issue
gh pr create --base main --title "fix: critical security patch"

# 4. After PR is approved and merged to main, merge to develop too
git checkout develop
git pull origin develop
git merge hotfix/critical-issue
git push origin develop

# 5. Create a patch release tag
git checkout main
git pull origin main
git tag -a v1.0.1 -m "Hotfix v1.0.1: Security patch"
git push origin v1.0.1

# 6. Clean up
git branch -d hotfix/critical-issue
git push origin --delete hotfix/critical-issue
```

## Example Scenarios

| Scenario | Action |
|----------|--------|
| Security vulnerability discovered | Hotfix immediately |
| App crashes on load | Hotfix immediately |
| Data not saving correctly | Hotfix immediately |
| Minor UI glitch | Use regular `fix/*` branch |
| Feature not working as expected | Use regular `fix/*` branch |

## Checklist Before Hotfix

- [ ] Is this truly critical? (Can it wait for next release?)
- [ ] Have you identified the root cause?
- [ ] Is the fix minimal and focused?
- [ ] Have you tested the fix locally?
- [ ] Are you ready to deploy immediately after merge?

## Post-Hotfix Checklist

- [ ] Merged to `main`
- [ ] Merged to `develop`
- [ ] Tagged patch release (e.g., `v1.0.1`)
- [ ] Deployment verified
- [ ] Branch cleaned up



