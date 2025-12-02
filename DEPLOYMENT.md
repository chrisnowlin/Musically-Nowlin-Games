# Deployment Guide

This application is a static single-page application (SPA) that can be deployed to any static hosting platform. No server-side runtime is required.

## Branching & Release Strategy

We use a robust branching strategy to keep production stable:

```
main (protected)     → Production (deploy on tags only)
├── develop          → Integration & staging
├── feature/*        → New features
├── fix/*            → Bug fixes
└── hotfix/*         → Critical production fixes
```

### Key Principles

- **Production (`main`)** is always stable and deployable
- **Develop** is for integration testing before release
- **Feature branches** isolate work in progress
- **Tagged releases** trigger production deployments

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

### Production Deployments (Tagged Releases)

Production deployments are triggered **only by version tags** (`.github/workflows/deploy.yml`):

```bash
# Create and push a release tag
git tag -a v1.2.3 -m "Release v1.2.3"
git push origin v1.2.3
```

This ensures:
- Production is never accidentally updated
- Every release is intentional and versioned
- Easy rollback by deploying a previous tag

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

3. **Create release tag**
   ```bash
   # Use semantic versioning: MAJOR.MINOR.PATCH
   git tag -a v1.2.3 -m "Release v1.2.3: Description of changes"
   git push origin v1.2.3
   ```

4. **Verify deployment**
   - Check GitHub Actions for deployment status
   - Visit https://chrisnowlin.github.io/Musically-Nowlin-Games/
   - Test critical functionality

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

4. **Create patch release**
   ```bash
   git checkout main
   git tag -a v1.2.4 -m "Hotfix v1.2.4: Fix critical bug"
   git push origin v1.2.4
   ```

### Rollback

To rollback to a previous version:

```bash
# Option 1: Redeploy previous tag (via GitHub Actions)
# Go to Actions → Deploy to GitHub Pages → Run workflow
# Select the tag to deploy

# Option 2: Create a new tag pointing to old commit
git tag -a v1.2.5 v1.2.2 -m "Rollback to v1.2.2"
git push origin v1.2.5
```

## Local Development and Testing

### Development Server
Start the development server with hot module replacement:
```bash
bun dev
```
The app will be available at `http://localhost:5173`

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
The app will be available at `http://localhost:4173`

## Deployment Platforms

### GitHub Pages (Primary)

Our primary deployment uses GitHub Pages with automated deployments via GitHub Actions.

**How it works:**
1. Push a version tag (e.g., `v1.2.3`)
2. GitHub Actions runs tests and builds
3. Automatically deploys to GitHub Pages
4. Live at: https://chrisnowlin.github.io/Musically-Nowlin-Games/

**Manual deployment (emergency only):**
```bash
bun run build
# Manually upload dist/ contents to gh-pages branch
```

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

### Vercel

#### Option 1: Git Integration (Recommended)
1. Push your repository to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project" and import your repository
4. Vercel auto-detects the build settings
5. Deploy!

#### Option 2: Using Vercel CLI
```bash
npm install -g vercel
vercel
```

The `vercel.json` file is automatically used to handle SPA routing.

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

### Deployment not triggering
- Ensure you pushed a tag, not just a commit: `git push origin v1.2.3`
- Check that the tag follows the `v*` pattern
- View GitHub Actions logs for errors

### Need to deploy without a tag
Use the "Run workflow" button in GitHub Actions:
1. Go to Actions → Deploy to GitHub Pages
2. Click "Run workflow"
3. Select the branch/tag to deploy

## Support

For issues with deployment, check:
1. That `bun run build` completes without errors
2. That `bun run preview` works locally
3. That your hosting platform is configured for SPA routing
4. GitHub Actions logs for CI/CD issues
