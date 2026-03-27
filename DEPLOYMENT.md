# Deployment Guide

## Current Setup

**Production URL:** https://todays-color.vercel.app  
**Repository:** https://github.com/jaeyong8687/todays-color  
**Vercel Project ID:** prj_p3xVPdv0ZFVd1dwW2CdyElHKQMHj  

## Environment

- **Node.js:** 24.x
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Framework:** Vite

## Deployment Methods

### 1. Automatic Deployment (GitHub Actions)

Pushes to the `main` branch automatically trigger deployment to Vercel via GitHub Actions.

**Required GitHub Secrets:**
- `VERCEL_TOKEN` - API token from Vercel
- `VERCEL_ORG_ID` - Organization ID (team_FdXeg0yjjEpa0Vh52I9BdLW1)
- `VERCEL_PROJECT_ID` - Project ID (prj_p3xVPdv0ZFVd1dwW2CdyElHKQMHj)

### 2. Manual Deployment (Vercel CLI)

```bash
# Requires Vercel CLI installed and authenticated
vercel deploy --prod
```

### 3. Direct to Vercel

Push to GitHub and connect Vercel to the repository for automatic deployments.

## Deployment History

- **2026-03-27 07:25** - Fresh deployment (recreated Vercel project to fix corrupted build state)
- **Node Version:** Updated from 22.x to 24.x to match Vercel default

## Rollback

To rollback to a previous deployment, use the Vercel dashboard or CLI:

```bash
vercel rollback
```

## Monitoring

- Check deployment status at: https://vercel.com/jaeyong-lees-projects-54baf1c4/todays-color
- View logs in GitHub Actions: https://github.com/jaeyong8687/todays-color/actions

## Troubleshooting

### Build Failures

1. Check Node version matches 24.x
2. Verify dependencies are installed
3. Run `npm run build` locally to test

### Environment Variables

All environment variables should be configured in Vercel project settings.

### DNS/Domain Issues

Current domain: todays-color.vercel.app  
Can be connected to custom domain via Vercel settings.

## Next Steps

1. **GitHub Secrets Setup** - Add VERCEL_TOKEN, VERCEL_ORG_ID, and VERCEL_PROJECT_ID to GitHub
2. **CI/CD Activation** - Once secrets are configured, GitHub Actions will auto-deploy on push
3. **Custom Domain** - Optionally configure a custom domain in Vercel settings
