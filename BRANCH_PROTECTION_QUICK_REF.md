# Branch Protection Quick Reference Card

## 🚀 Quick Setup

```bash
# Apply the branch protection ruleset
./scripts/apply-branch-protection.sh
```

---

## 📋 What's Protected

| Rule | Status | Description |
|------|--------|-------------|
| **Direct Pushes** | ❌ Blocked | Must use pull requests |
| **Force Pushes** | ❌ Blocked | Cannot rewrite history |
| **Branch Deletion** | ❌ Blocked | Cannot delete main branch |
| **PR Approval** | ✅ Required | Need 1 approval to merge |
| **Stale Reviews** | ✅ Dismissed | New commits dismiss approvals |
| **Conversations** | ✅ Required | Must resolve all discussions |
| **Status Checks** | ✅ Required | All CI/CD must pass |
| **Linear History** | ✅ Required | No merge commits |

---

## ✅ Required Status Checks

All 4 checks must pass before merge:

1. **CI/CD Pipeline / test**
   - Linting
   - Type checking
   - Unit tests
   - Integration tests
   - Build
   - E2E tests
   - Code coverage (60% min)

2. **E2E Playwright / e2e (chromium)**
3. **E2E Playwright / e2e (firefox)**
4. **E2E Playwright / e2e (webkit)**

---

## 🔄 Standard Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature
```

### 2. Make Changes
```bash
git add .
git commit -m "feat: your feature"
git push origin feature/your-feature
```

### 3. Create Pull Request
```bash
gh pr create --title "feat: Your Feature" --body "Description"
```

### 4. Wait for CI/CD
- All 4 status checks must pass ✅

### 5. Get Approval
- Request review from team member
- Address feedback
- Resolve all conversations

### 6. Update Branch (if needed)
```bash
git fetch origin
git rebase origin/main
git push --force-with-lease origin feature/your-feature
```

### 7. Merge
- Use "Squash and merge" (recommended)
- Or "Rebase and merge"
- Delete branch after merge

---

## 🚫 What You CAN'T Do

```bash
# ❌ Direct push to main
git push origin main
# Error: Changes must be made through a pull request

# ❌ Force push to main
git push --force origin main
# Error: Cannot force-push to this branch

# ❌ Delete main branch
git push origin --delete main
# Error: Protected branch cannot be deleted

# ❌ Merge without approval
# Error: Review required

# ❌ Merge with failing checks
# Error: Required status checks must pass
```

---

## ✅ What You CAN Do

```bash
# ✅ Create feature branch
git checkout -b feature/new-feature

# ✅ Push to feature branch
git push origin feature/new-feature

# ✅ Force push to feature branch
git push --force-with-lease origin feature/new-feature

# ✅ Create pull request
gh pr create

# ✅ Merge after approval + passing checks
gh pr merge --squash
```

---

## 🔧 Troubleshooting

### "Branch is out of date"
```bash
git fetch origin
git rebase origin/main
git push --force-with-lease origin your-branch
```

### "Review required"
- Request review: `gh pr review --request @username`
- Or use GitHub UI to request review

### "Status checks failing"
1. Check GitHub Actions logs
2. Fix issues locally
3. Push new commits
4. Checks will re-run automatically

### "Conversations not resolved"
- Go to PR on GitHub
- Click "Resolve conversation" on each thread
- Ensure all discussions are addressed

---

## 📊 Merge Strategies

### Squash and Merge (Recommended)
- Combines all commits into one
- Clean history
- Good for feature PRs

```bash
gh pr merge --squash
```

### Rebase and Merge
- Replays commits on main
- Preserves individual commits
- Good for clean commit history

```bash
gh pr merge --rebase
```

### Regular Merge (NOT ALLOWED)
- Creates merge commit
- Blocked by linear history requirement

---

## 🎯 Best Practices

### For PRs
- ✅ Keep PRs small and focused
- ✅ Write clear descriptions
- ✅ Link to related issues
- ✅ Include screenshots for UI changes
- ✅ Ensure all tests pass locally first

### For Commits
- ✅ Use conventional commits format
- ✅ Be descriptive
- ✅ Reference issue numbers
- ✅ Keep commits atomic

### For Reviews
- ✅ Review promptly (same day)
- ✅ Be constructive
- ✅ Check CI/CD results
- ✅ Test locally if needed

---

## 🔗 Quick Links

- **Repository Settings:** https://github.com/GEMDevEng/MicroSite-Forge/settings/rules
- **Pull Requests:** https://github.com/GEMDevEng/MicroSite-Forge/pulls
- **Actions:** https://github.com/GEMDevEng/MicroSite-Forge/actions
- **Full Guide:** [BRANCH_PROTECTION_GUIDE.md](BRANCH_PROTECTION_GUIDE.md)

---

## 📞 Need Help?

1. Check [BRANCH_PROTECTION_GUIDE.md](BRANCH_PROTECTION_GUIDE.md) for detailed documentation
2. Review GitHub Actions logs for CI/CD failures
3. Ask team members for review help
4. Contact repository admin for emergency bypass

---

## 🎉 Summary

**Main branch is protected!**

- ✅ All changes via pull requests
- ✅ 1 approval required
- ✅ All CI/CD checks must pass
- ✅ Cross-browser E2E tests
- ✅ Linear history enforced
- ✅ No force pushes or deletions

**This ensures code quality, security, and collaboration!**

