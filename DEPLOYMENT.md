# Deployment Guide

This application is a static single-page application (SPA) that can be deployed to any static hosting platform. No server-side runtime is required.

## Branching & Release Strategy

We use a robust branching strategy to keep production stable:

```
main (protected)     → Production (auto-deploy via Vercel)
├── develop          → Integration & staging
├── feature/*        → New features
├── fix/*            → Bug fixes
└── hotfix/*         → Critical production fixes
```

### Key Principles

- **Production (`main`)** is always stable and deployable
- **Develop** is for integration testing before release
- **Feature branches** isolate work in progress
- **Merges to main** trigger production deployments via Vercel

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the complete workflow.

## CI/CD Pipeline

### Continuous Integration (All Branches)

Every push triggers the CI pipeline (`.github/workflows/ci.yml`):
- ✅ TypeScript type checking
- ✅ Unit tests with Vitest
- ✅ Production build verification

### Staging Deployments (develop branch)

Pushes to `develop` trigger staging builds (`.github/workflows/deploy-staging.yml`):
- Runs full test suite
- Creates build artifacts for review
- (Optional) Deploy to preview environment

### Production Deployments (Vercel)

Production deployments are handled automatically by Vercel when changes are merged to `main`.

## Release Process

### Standard Release

1. **Ensure develop is stable**
   ```bash
   git checkout develop
   bun test
   bun run check
   ```

2. **Merge to main**
   ```bash
   git checkout main
   git pull origin main
   git merge develop
   git push origin main
   ```

3. **Verify deployment**
   - Vercel automatically deploys on push to main
   - Check Vercel dashboard for deployment status
   - Test critical functionality on production

### Hotfix Release

For critical production bugs:

1. **Create hotfix branch from main**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-bug
   ```

2. **Fix and test**
   ```bash
   # Make fixes
   bun test
   bun run check
   ```

3. **Merge to main and develop**
   ```bash
   git checkout main
   git merge hotfix/critical-bug
   git push origin main

   git checkout develop
   git merge hotfix/critical-bug
   git push origin develop
   ```

## Local Development and Testing

### Development Server
Start the development server with hot module replacement:
```bash
bun dev
```
The app will be available at `http://localhost:5174`

### Production Build
Build the application for production:
```bash
bun run build
```
This generates optimized static files in the `dist/` directory.

### Preview Production Build Locally
Test the production build locally:
```bash
bun run preview
```

## Deployment Platforms

### Vercel (Primary)

Our primary deployment uses Vercel with automatic deployments on push to main.

**How it works:**
1. Push to `main` branch
2. Vercel automatically builds and deploys
3. Preview deployments are created for pull requests

**Configuration:**
The `vercel.json` file handles SPA routing and caching.

### Netlify

#### Option 1: Drag and Drop
1. Build the application: `bun run build`
2. Go to [Netlify](https://netlify.com)
3. Drag and drop the `dist/` folder onto the Netlify dashboard
4. Your site is live!

#### Option 2: Git Integration
1. Push your repository to GitHub
2. Connect your repository to Netlify
3. Set build command: `bun run build`
4. Set publish directory: `dist`
5. Deploy!

The `public/_redirects` file is automatically used by Netlify to handle SPA routing.

### Other Static Hosts

For any static hosting platform (AWS S3, Azure Static Web Apps, Firebase Hosting, etc.):

1. Build the application: `bun run build`
2. Upload the contents of the `dist/` folder
3. Configure the host to redirect all routes to `index.html` for SPA routing

## Environment Variables

This application does not require any environment variables. All functionality is client-side.

## Performance Optimization

The built application includes:
- Minified JavaScript and CSS
- Optimized asset loading
- Source maps for debugging (in development)

## Troubleshooting

### Routes return 404
Make sure your hosting platform is configured to serve `index.html` for all routes. This is required for client-side routing to work.

### Assets not loading
Ensure the `dist/` folder is deployed, not just individual files.

### Web Audio API not working
Some hosting platforms may have CORS restrictions. The application uses only client-side Web Audio API, so this should work on all platforms.

## Support

For issues with deployment, check:
1. That `bun run build` completes without errors
2. That `bun run preview` works locally
3. That your hosting platform is configured for SPA routing
