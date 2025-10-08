# Branch Protection Ruleset Guide

## Overview

This document describes the comprehensive branch protection ruleset configured for the `main` branch of the MicroSite-Forge repository to enforce code quality, security, and collaboration best practices.

---

## 🛡️ Protection Rules Summary

### Ruleset Name: **Protect main branch**
- **Status:** Active
- **Target:** `main` branch only
- **Enforcement:** Strict (all rules must be satisfied)

---

## 📋 Configured Rules

### 1. ✅ Prevent Direct Pushes to Main

**Rules Applied:**
- **Require Pull Request:** All changes must go through a pull request
- **No Force Pushes:** `non_fast_forward` rule prevents force pushes
- **No Branch Deletion:** `deletion` rule prevents accidental branch deletion
- **No Direct Creation:** `creation` rule prevents direct commits

**Impact:**
- ❌ `git push origin main` - BLOCKED
- ❌ `git push --force origin main` - BLOCKED
- ✅ Create PR → Review → Merge - ALLOWED

---

### 2. ✅ Pull Request Requirements

**Configuration:**
```json
{
  "required_approving_review_count": 1,
  "dismiss_stale_reviews_on_push": true,
  "require_code_owner_review": false,
  "require_last_push_approval": false,
  "required_review_thread_resolution": true
}
```

**Rules:**
- **Minimum Approvals:** At least 1 approval required before merge
- **Dismiss Stale Reviews:** Approvals are dismissed when new commits are pushed
- **Resolve Conversations:** All review conversations must be resolved
- **Code Owner Review:** Not required (can be enabled later if CODEOWNERS file is added)
- **Last Push Approval:** Not required (allows PR author to make final changes)

**Workflow:**
1. Developer creates PR
2. At least 1 reviewer approves
3. All conversations must be resolved
4. If new commits are pushed, approval is dismissed and re-review is required
5. Merge is allowed only after all requirements are met

---

### 3. ✅ Status Check Requirements

**Mode:** Strict (branch must be up-to-date with main before merge)

**Required Checks:**

#### CI/CD Pipeline
- **Check:** `CI/CD Pipeline / test`
- **Workflow:** `.github/workflows/ci.yml`
- **Includes:**
  - ✅ Linting (`npm run lint`)
  - ✅ Type checking (`npm run type-check`)
  - ✅ Unit tests (`npm run test:coverage`)
  - ✅ Integration tests (`npm run test:integration`)
  - ✅ Build (`npm run build`)
  - ✅ E2E tests (`npm run test:e2e`)
  - ✅ Code coverage check (60% minimum)

#### E2E Playwright Tests (Multi-Browser)
- **Check 1:** `E2E Playwright / e2e (chromium)`
- **Check 2:** `E2E Playwright / e2e (firefox)`
- **Check 3:** `E2E Playwright / e2e (webkit)`
- **Workflow:** `.github/workflows/e2e-playwright.yml`
- **Purpose:** Ensures cross-browser compatibility

**Impact:**
- All 4 status checks must pass (green ✅) before merge is allowed
- If branch is behind main, must update branch first (strict mode)
- Failed checks block merge until fixed

---

### 4. ✅ Linear History Requirement

**Rule:** `required_linear_history`

**Impact:**
- ❌ Merge commits - NOT ALLOWED
- ✅ Squash merge - ALLOWED
- ✅ Rebase merge - ALLOWED

**Benefits:**
- Clean, linear commit history
- Easier to understand project evolution
- Simpler to revert changes if needed
- Better for `git bisect` debugging

**Recommended Merge Strategy:**
- **Squash and merge** - Combines all PR commits into one (recommended for feature PRs)
- **Rebase and merge** - Replays commits on top of main (good for clean commit history)

---

### 5. ✅ Bypass Actors

**Configuration:**
```json
{
  "actor_id": 5,
  "actor_type": "RepositoryRole",
  "bypass_mode": "pull_request"
}
```

**Meaning:**
- **Repository Admins** can bypass the "require pull request" rule in emergencies
- Admins still cannot force push or delete the branch
- Admins must still pass all status checks
- Use bypass sparingly (emergency hotfixes only)

**Emergency Bypass Process:**
1. Admin creates emergency branch
2. Admin can push directly to main if absolutely necessary
3. Status checks must still pass
4. Document reason in commit message
5. Create follow-up PR for review

---

## 🚀 How to Work with Protected Main Branch

### Standard Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes and Commit**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request**
   - Go to GitHub repository
   - Click "Compare & pull request"
   - Fill in PR description
   - Request review from team member

4. **Wait for CI/CD Checks**
   - All 4 status checks must pass:
     - ✅ CI/CD Pipeline / test
     - ✅ E2E Playwright / e2e (chromium)
     - ✅ E2E Playwright / e2e (firefox)
     - ✅ E2E Playwright / e2e (webkit)

5. **Address Review Comments**
   - Respond to feedback
   - Make requested changes
   - Push new commits (approval will be dismissed)

6. **Resolve All Conversations**
   - Click "Resolve conversation" on each thread
   - Ensure all discussions are addressed

7. **Get Approval**
   - At least 1 team member must approve
   - Approval must be current (not stale)

8. **Update Branch if Needed**
   - If main has moved ahead, update your branch:
   ```bash
   git fetch origin
   git rebase origin/main
   git push --force-with-lease origin feature/your-feature-name
   ```

9. **Merge Pull Request**
   - Choose merge strategy:
     - **Squash and merge** (recommended)
     - **Rebase and merge**
   - Click "Merge pull request"
   - Delete feature branch after merge

---

## 🔧 Applying the Ruleset

### Method 1: Using GitHub CLI (Recommended)

```bash
# Navigate to repository
cd /Users/user/Documents/GitHub/MicroSite-Forge

# Apply the ruleset using the configuration file
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/GEMDevEng/MicroSite-Forge/rulesets \
  --input .github/branch-protection-ruleset.json
```

### Method 2: Using GitHub Web UI

1. Navigate to: https://github.com/GEMDevEng/MicroSite-Forge/settings/rules
2. Click "New ruleset" → "New branch ruleset"
3. Configure as follows:

**Ruleset Name:** `Protect main branch`

**Enforcement status:** Active

**Target branches:**
- Include: `main`

**Branch protections:**
- ✅ Restrict deletions
- ✅ Require a pull request before merging
  - Required approvals: 1
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require conversation resolution before merging
- ✅ Require status checks to pass
  - ✅ Require branches to be up to date before merging
  - Required checks:
    - `CI/CD Pipeline / test`
    - `E2E Playwright / e2e (chromium)`
    - `E2E Playwright / e2e (firefox)`
    - `E2E Playwright / e2e (webkit)`
- ✅ Block force pushes
- ✅ Require linear history

**Bypass list:**
- Repository admin (pull request only)

4. Click "Create"

---

## ✅ Verification Steps

### 1. Test Direct Push (Should Fail)

```bash
# Try to push directly to main
git checkout main
echo "test" >> test.txt
git add test.txt
git commit -m "test: direct push"
git push origin main
```

**Expected Result:**
```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Changes must be made through a pull request.
To https://github.com/GEMDevEng/MicroSite-Forge.git
 ! [remote rejected] main -> main (protected branch hook declined)
error: failed to push some refs to 'https://github.com/GEMDevEng/MicroSite-Forge.git'
```

### 2. Test Pull Request Workflow (Should Succeed)

```bash
# Create feature branch
git checkout -b test/branch-protection
echo "test" >> test.txt
git add test.txt
git commit -m "test: verify branch protection"
git push origin test/branch-protection

# Create PR via GitHub UI or CLI
gh pr create --title "Test: Verify branch protection" --body "Testing ruleset"

# Wait for CI/CD checks to pass
# Get approval from team member
# Merge PR
gh pr merge --squash
```

**Expected Result:**
- ✅ PR created successfully
- ✅ CI/CD checks run automatically
- ✅ Approval required before merge button is enabled
- ✅ Merge succeeds after all requirements met

### 3. Test Force Push (Should Fail)

```bash
git checkout main
git reset --hard HEAD~1
git push --force origin main
```

**Expected Result:**
```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Cannot force-push to this branch.
```

---

## 📊 Status Check Details

### CI/CD Pipeline Workflow

**File:** `.github/workflows/ci.yml`

**Triggers:**
- Push to `main` or `develop`
- Pull request to `main`

**Steps:**
1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Generate Supabase types
5. Run linting
6. Run type checking
7. Run unit tests with coverage
8. Run integration tests
9. Check code coverage (60% minimum)
10. Upload coverage to Codecov
11. Build application
12. Install Playwright browsers
13. Run E2E tests
14. Upload Playwright report

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_ACCESS_TOKEN`
- `CODECOV_TOKEN`
- `VERCEL_TOKEN` (for deployment)
- `VERCEL_ORG_ID` (for deployment)
- `VERCEL_PROJECT_ID` (for deployment)

### E2E Playwright Workflow

**File:** `.github/workflows/e2e-playwright.yml`

**Triggers:**
- Pull request opened, synchronized, or reopened

**Matrix Strategy:**
- Runs tests on 3 browsers: chromium, firefox, webkit
- Each browser is a separate required check

**Steps:**
1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Install Playwright browsers
5. Build and start app
6. Run Playwright tests for each browser
7. Upload report on failure

---

## 🔒 Security Benefits

1. **Code Review Enforcement**
   - All changes reviewed by at least one team member
   - Reduces bugs and security vulnerabilities
   - Knowledge sharing across team

2. **Automated Testing**
   - All tests must pass before merge
   - Prevents broken code from reaching production
   - Ensures cross-browser compatibility

3. **Linear History**
   - Easier to audit changes
   - Simpler to track security issues
   - Better for compliance requirements

4. **No Force Pushes**
   - Prevents accidental history rewriting
   - Protects against malicious changes
   - Maintains audit trail

5. **Branch Protection**
   - Prevents accidental deletion
   - Ensures main branch stability
   - Reduces deployment risks

---

## 🎯 Best Practices

### For Developers

1. **Keep PRs Small**
   - Easier to review
   - Faster to merge
   - Less likely to have conflicts

2. **Write Clear PR Descriptions**
   - Explain what changed and why
   - Link to related issues
   - Include screenshots for UI changes

3. **Respond to Reviews Promptly**
   - Address feedback quickly
   - Ask questions if unclear
   - Mark conversations as resolved

4. **Keep Branch Up-to-Date**
   - Regularly rebase on main
   - Resolve conflicts early
   - Ensure CI/CD passes

5. **Write Good Commit Messages**
   - Follow conventional commits format
   - Be descriptive
   - Reference issue numbers

### For Reviewers

1. **Review Promptly**
   - Don't block team progress
   - Aim for same-day reviews
   - Use GitHub notifications

2. **Be Constructive**
   - Suggest improvements
   - Explain reasoning
   - Approve when ready

3. **Check CI/CD Results**
   - Verify all checks passed
   - Review test coverage
   - Check for warnings

4. **Test Locally if Needed**
   - Pull branch and test
   - Verify functionality
   - Check edge cases

---

## 🚨 Troubleshooting

### Issue: "Required status check is expected but not present"

**Cause:** Status check name doesn't match configured name

**Solution:**
1. Check actual status check names in a recent PR
2. Update ruleset with correct names
3. Re-apply ruleset

### Issue: "Branch is out of date with the base branch"

**Cause:** Strict mode requires branch to be up-to-date

**Solution:**
```bash
git fetch origin
git rebase origin/main
git push --force-with-lease origin your-branch
```

### Issue: "Review required but can't approve own PR"

**Cause:** Need another team member to review

**Solution:**
- Request review from team member
- Wait for approval
- Or add yourself as collaborator with review permissions

### Issue: "CI/CD checks failing"

**Cause:** Code doesn't pass tests or build

**Solution:**
1. Check CI/CD logs in GitHub Actions
2. Fix failing tests or build errors
3. Push new commits
4. Wait for checks to re-run

---

## 📝 Maintenance

### Updating the Ruleset

1. Edit `.github/branch-protection-ruleset.json`
2. Apply updated ruleset:
   ```bash
   # Get ruleset ID
   gh api /repos/GEMDevEng/MicroSite-Forge/rulesets | jq '.[] | select(.name=="Protect main branch") | .id'
   
   # Update ruleset
   gh api \
     --method PUT \
     -H "Accept: application/vnd.github+json" \
     /repos/GEMDevEng/MicroSite-Forge/rulesets/RULESET_ID \
     --input .github/branch-protection-ruleset.json
   ```

### Adding New Required Checks

1. Add new workflow to `.github/workflows/`
2. Update `branch-protection-ruleset.json` with new check name
3. Re-apply ruleset
4. Test with a PR

---

## 📚 Additional Resources

- [GitHub Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [GitHub Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub CLI Documentation](https://cli.github.com/manual/)

---

## ✅ Summary

The branch protection ruleset ensures:
- ✅ All changes go through pull requests
- ✅ At least 1 approval required
- ✅ All CI/CD checks must pass
- ✅ Cross-browser E2E tests pass
- ✅ Linear commit history
- ✅ No force pushes or deletions
- ✅ Conversations resolved before merge
- ✅ Branch up-to-date before merge

This creates a robust, secure, and collaborative development workflow for the MicroSite-Forge project.

