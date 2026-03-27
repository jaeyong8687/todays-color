#!/bin/bash
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║    Final Step: Configure VERCEL_TOKEN for Auto-Deployment     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "The app is deployed and CI/CD is almost ready!"
echo ""
echo "To enable automatic deployments on every push to main:"
echo ""
echo "1. Go to: https://vercel.com/account/tokens"
echo "2. Click 'Create Token'"
echo "3. Name it: GitHub Actions"
echo "4. Copy the token (it looks like a long random string)"
echo "5. Paste it below when prompted"
echo ""
read -p "Enter your Vercel token (will be masked): " -s VERCEL_TOKEN
echo ""
echo ""

if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ No token provided."
  exit 1
fi

echo "Setting VERCEL_TOKEN..."
gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN" --repo jaeyong8687/todays-color

if [ $? -eq 0 ]; then
  echo "✅ All secrets configured!"
  echo ""
  echo "Verifying..."
  gh secret list --repo jaeyong8687/todays-color
  echo ""
  echo "✨ CI/CD is now ready! Your app will auto-deploy on every push to main."
else
  echo "❌ Failed to set token"
  exit 1
fi
