#!/bin/bash
# Script to restore branch protection rules after rapid testing phase
# Run: ./scripts/restore-branch-protection.sh

echo "Restoring branch protection rules..."

# Restore main branch protection
gh api -X PUT repos/chrisnowlin/Musically-Nowlin-Games/branches/main/protection \
  -f required_status_checks='{"strict":true,"contexts":["Lint & Type Check","Unit Tests","Build"]}' \
  -f enforce_admins=false \
  -f required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":false,"required_approving_review_count":1}' \
  -f restrictions=null

echo "✅ Main branch protection restored"

# Restore develop branch protection  
gh api -X PUT repos/chrisnowlin/Musically-Nowlin-Games/branches/develop/protection \
  -f required_status_checks='{"strict":true,"contexts":["Lint & Type Check","Unit Tests","Build"]}' \
  -f enforce_admins=false \
  -f restrictions=null

echo "✅ Develop branch protection restored"
echo ""
echo "Branch protection rules have been restored:"
echo "- Required status checks: Lint & Type Check, Unit Tests, Build"
echo "- Main: Requires 1 approving review"
echo "- Develop: No PR review required"
