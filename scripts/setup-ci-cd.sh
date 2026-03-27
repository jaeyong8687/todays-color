#!/bin/bash

# Setup script for GitHub secrets required for Vercel CI/CD

echo "🔐 GitHub Secrets Setup Script"
echo "=============================="
echo ""
echo "This script helps you add the necessary secrets to enable automatic deployments."
echo ""
echo "Required secrets:"
echo "  1. VERCEL_TOKEN - Personal access token from Vercel"
echo "  2. VERCEL_ORG_ID - Team ID: team_FdXeg0yjjEpa0Vh52I9BdLW1"
echo "  3. VERCEL_PROJECT_ID - Project ID: prj_p3xVPdv0ZFVd1dwW2CdyElHKQMHj"
echo ""
echo "Steps:"
echo "1. Get VERCEL_TOKEN from: https://vercel.com/account/tokens"
echo "2. Visit: https://github.com/jaeyong8687/todays-color/settings/secrets/actions"
echo "3. Add each secret using 'New repository secret' button"
echo ""
echo "After adding all secrets, the next push to main will trigger automatic deployment."
echo ""

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Please install it or use the web interface."
    exit 1
fi

echo "Using GitHub CLI to add secrets..."
echo ""

# Get current directory
REPO_OWNER=$(git remote get-url origin | sed 's/.*github.com[:/]\([^/]*\).*/\1/')
REPO_NAME=$(git remote get-url origin | sed 's/.*\/\([^/]*\)\.git$/\1/')

echo "Repository: $REPO_OWNER/$REPO_NAME"
echo ""

read -p "Enter your Vercel API Token (from https://vercel.com/account/tokens): " VERCEL_TOKEN

if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Vercel token is required"
    exit 1
fi

echo "Setting secrets..."

gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN"
gh secret set VERCEL_ORG_ID --body "team_FdXeg0yjjEpa0Vh52I9BdLW1"
gh secret set VERCEL_PROJECT_ID --body "prj_p3xVPdv0ZFVd1dwW2CdyElHKQMHj"

echo ""
echo "✅ Secrets configured successfully!"
echo ""
echo "Next steps:"
echo "1. Make a test commit: git commit --allow-empty -m 'test: trigger CI/CD'"
echo "2. Push to main: git push origin main"
echo "3. Check GitHub Actions: https://github.com/$REPO_OWNER/$REPO_NAME/actions"
