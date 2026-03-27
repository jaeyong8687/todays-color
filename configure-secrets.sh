#!/bin/bash
set -e

REPO="jaeyong8687/todays-color"
VERCEL_ORG_ID="team_FdXeg0yjjEpa0Vh52I9BdLW1"
VERCEL_PROJECT_ID="prj_p3xVPdv0ZFVd1dwW2CdyElHKQMHj"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          GitHub Secrets Configuration for CI/CD               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "This script will configure GitHub secrets for automatic Vercel deployments."
echo "Repository: $REPO"
echo ""

# Check if gh is installed
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) not found. Please install it:"
  echo "   brew install gh"
  exit 1
fi

# Check if already logged in
if ! gh auth status &> /dev/null; then
  echo "❌ Not logged into GitHub. Please run:"
  echo "   gh auth login"
  exit 1
fi

echo "Step 1/3: Configuring VERCEL_ORG_ID..."
gh secret set VERCEL_ORG_ID --body "$VERCEL_ORG_ID" --repo "$REPO" 2>/dev/null && echo "✅ VERCEL_ORG_ID set" || echo "⚠️  Could not set VERCEL_ORG_ID"

echo ""
echo "Step 2/3: Configuring VERCEL_PROJECT_ID..."
gh secret set VERCEL_PROJECT_ID --body "$VERCEL_PROJECT_ID" --repo "$REPO" 2>/dev/null && echo "✅ VERCEL_PROJECT_ID set" || echo "⚠️  Could not set VERCEL_PROJECT_ID"

echo ""
echo "Step 3/3: Configuring VERCEL_TOKEN..."
echo ""
echo "You need to generate a Vercel token:"
echo "  1. Go to: https://vercel.com/account/tokens"
echo "  2. Click 'Create Token'"
echo "  3. Name it: GitHub Actions"
echo "  4. Copy the token"
echo ""
read -p "Paste your Vercel token (will be masked): " -s VERCEL_TOKEN
echo ""

if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ No token provided. Exiting."
  exit 1
fi

gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN" --repo "$REPO" 2>/dev/null && echo "✅ VERCEL_TOKEN set" || echo "❌ Failed to set VERCEL_TOKEN"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    Secrets Configured! ✅                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Verifying secrets..."
echo ""
gh secret list --repo "$REPO" 2>/dev/null || echo "Could not verify secrets"

echo ""
echo "Next step: Test the CI/CD workflow"
echo ""
echo "Run this command to trigger a deployment:"
echo "  cd ~/todays-color"
echo "  git commit --allow-empty -m 'test: verify GitHub Actions CI/CD'"
echo "  git push origin main"
echo ""
echo "Then monitor:"
echo "  GitHub Actions: https://github.com/$REPO/actions"
echo "  Vercel Dashboard: https://vercel.com/dashboard/todays-color"
