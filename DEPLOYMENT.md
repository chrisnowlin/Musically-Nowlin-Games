# Deployment Guide

This application is a static single-page application (SPA) that can be deployed to any static hosting platform. No server-side runtime is required.

## Local Development and Testing

### Development Server
Start the development server with hot module replacement:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### Production Build
Build the application for production:
```bash
npm run build
```
This generates optimized static files in the `dist/` directory.

### Preview Production Build Locally
Test the production build locally:
```bash
npm run preview
```
The app will be available at `http://localhost:4173`

## Deployment Platforms

### GitHub Pages

#### Option 1: Using GitHub Actions (Recommended)

1. Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

2. In your repository settings:
   - Go to Settings → Pages
   - Set "Source" to "Deploy from a branch"
   - Select "gh-pages" branch and "/ (root)" folder

#### Option 2: Manual Deployment

1. Build the application: `npm run build`
2. Copy the contents of the `dist/` folder to your `gh-pages` branch
3. Push to GitHub

### Netlify

#### Option 1: Drag and Drop
1. Build the application: `npm run build`
2. Go to [Netlify](https://netlify.com)
3. Drag and drop the `dist/` folder onto the Netlify dashboard
4. Your site is live!

#### Option 2: Git Integration
1. Push your repository to GitHub
2. Connect your repository to Netlify
3. Set build command: `npm run build`
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

1. Build the application: `npm run build`
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
1. That `npm run build` completes without errors
2. That `npm run preview` works locally
3. That your hosting platform is configured for SPA routing

