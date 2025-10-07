#!/bin/bash

# Script to apply branch protection ruleset to MicroSite-Forge repository
# This script uses the GitHub CLI to create a comprehensive branch protection ruleset

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Repository details
REPO_OWNER="GEMDevEng"
REPO_NAME="MicroSite-Forge"
RULESET_FILE=".github/branch-protection-ruleset.json"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Branch Protection Ruleset Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo -e "${YELLOW}Install it from: https://cli.github.com/${NC}"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI is installed${NC}"

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub CLI${NC}"
    echo -e "${YELLOW}Run: gh auth login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Authenticated with GitHub CLI${NC}"

# Check if ruleset file exists
if [ ! -f "$RULESET_FILE" ]; then
    echo -e "${RED}❌ Ruleset file not found: $RULESET_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Ruleset configuration file found${NC}"
echo ""

# Display ruleset summary
echo -e "${BLUE}Ruleset Configuration Summary:${NC}"
echo -e "  ${YELLOW}Repository:${NC} $REPO_OWNER/$REPO_NAME"
echo -e "  ${YELLOW}Target Branch:${NC} main"
echo -e "  ${YELLOW}Enforcement:${NC} Active"
echo ""
echo -e "${BLUE}Protection Rules:${NC}"
echo -e "  ✅ Prevent direct pushes to main"
echo -e "  ✅ Require pull request with 1 approval"
echo -e "  ✅ Dismiss stale reviews on new commits"
echo -e "  ✅ Require conversation resolution"
echo -e "  ✅ Require status checks to pass:"
echo -e "     - CI/CD Pipeline / test"
echo -e "     - E2E Playwright / e2e (chromium)"
echo -e "     - E2E Playwright / e2e (firefox)"
echo -e "     - E2E Playwright / e2e (webkit)"
echo -e "  ✅ Require linear history (no merge commits)"
echo -e "  ✅ Block force pushes"
echo -e "  ✅ Block branch deletion"
echo ""

# Ask for confirmation
read -p "$(echo -e ${YELLOW}Do you want to apply this ruleset? [y/N]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Ruleset application cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}Applying ruleset...${NC}"

# Check if ruleset already exists
EXISTING_RULESET=$(gh api \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/$REPO_OWNER/$REPO_NAME/rulesets \
  --jq '.[] | select(.name=="Protect main branch") | .id' 2>/dev/null || echo "")

if [ -n "$EXISTING_RULESET" ]; then
    echo -e "${YELLOW}⚠️  Ruleset 'Protect main branch' already exists (ID: $EXISTING_RULESET)${NC}"
    read -p "$(echo -e ${YELLOW}Do you want to update it? [y/N]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Updating existing ruleset...${NC}"
        gh api \
          --method PUT \
          -H "Accept: application/vnd.github+json" \
          -H "X-GitHub-Api-Version: 2022-11-28" \
          /repos/$REPO_OWNER/$REPO_NAME/rulesets/$EXISTING_RULESET \
          --input "$RULESET_FILE" > /dev/null
        echo -e "${GREEN}✅ Ruleset updated successfully!${NC}"
    else
        echo -e "${YELLOW}⚠️  Keeping existing ruleset unchanged${NC}"
        exit 0
    fi
else
    echo -e "${BLUE}Creating new ruleset...${NC}"
    gh api \
      --method POST \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      /repos/$REPO_OWNER/$REPO_NAME/rulesets \
      --input "$RULESET_FILE" > /dev/null
    echo -e "${GREEN}✅ Ruleset created successfully!${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Branch Protection Setup Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Display verification steps
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo -e "${YELLOW}1. Verify the ruleset:${NC}"
echo -e "   Visit: https://github.com/$REPO_OWNER/$REPO_NAME/settings/rules"
echo ""
echo -e "${YELLOW}2. Test direct push (should fail):${NC}"
echo -e "   git checkout main"
echo -e "   echo 'test' >> test.txt"
echo -e "   git add test.txt"
echo -e "   git commit -m 'test: direct push'"
echo -e "   git push origin main"
echo ""
echo -e "${YELLOW}3. Test PR workflow (should succeed):${NC}"
echo -e "   git checkout -b test/branch-protection"
echo -e "   echo 'test' >> test.txt"
echo -e "   git add test.txt"
echo -e "   git commit -m 'test: verify branch protection'"
echo -e "   git push origin test/branch-protection"
echo -e "   gh pr create --title 'Test: Branch Protection' --body 'Testing ruleset'"
echo ""
echo -e "${BLUE}For more information, see: BRANCH_PROTECTION_GUIDE.md${NC}"
echo ""

