# 오늘의 색 (Today's Color)

A daily color discovery app built with React, TypeScript, and Vite. Explore a new color every day with rich color analysis and insights.

**Live App:** https://todays-color.vercel.app

## 🚀 Deployment

This project is automatically deployed to Vercel on every push to the main branch.

### Deployment Status
- **Production:** https://todays-color.vercel.app
- **GitHub:** https://github.com/jaeyong8687/todays-color
- **Node.js:** 24.x
- **Framework:** Vite

### CI/CD

GitHub Actions automatically deploys to Vercel when you push to `main`. To set this up:

1. Add these secrets to your GitHub repository:
   - `VERCEL_TOKEN` - Your Vercel API token
   - `VERCEL_ORG_ID` - Your Vercel organization ID
   - `VERCEL_PROJECT_ID` - The Vercel project ID (currently `prj_p3xVPdv0ZFVd1dwW2CdyElHKQMHj`)

2. Pushes to `main` will automatically deploy to production

## Tech Stack

- **React** + **TypeScript** + **Vite**
- **Supabase** for backend
- **Vercel** for hosting

## Development

### Prerequisites
- Node.js 24.x
- npm or yarn

### Getting Started

```bash
npm install
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run linter
```

### Build Output
- Production build size: ~435KB JS + ~34KB CSS
- Optimized with Vite for fast loading

## Project Structure

- `src/` - React components and application code
- `public/` - Static assets
- `dist/` - Built production files (generated)
- `.github/workflows/` - CI/CD workflows

## Resources

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Vercel Documentation](https://vercel.com/docs)
