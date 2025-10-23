# Convert to Static Single-Page Application

## Why

The application currently requires a Node.js/Express server to run, even though it makes no API calls and has no backend dependencies. This creates unnecessary deployment complexity and prevents hosting on simple static file hosts like GitHub Pages, Netlify, or Vercel's free tier. Converting to a pure static SPA will simplify deployment, reduce hosting costs to zero, and allow the app to run entirely in the browser.

## What Changes

- Remove Express server and all backend infrastructure
- Configure Vite to build a standalone static site
- Update package.json scripts to support static-only development and deployment
- Add support for client-side routing in static hosting environments
- Document deployment options for various static hosting providers (GitHub Pages, Netlify, Vercel, etc.)

## Impact

- **Affected specs**: Deployment (new capability)
- **Affected code**:
  - `/server/` directory (to be removed)
  - `package.json` (scripts and dependencies)
  - `vite.config.ts` (build configuration)
  - Root-level documentation (deployment instructions)
- **Breaking changes**: None - the application functionality remains identical
- **Benefits**:
  - Zero hosting costs on platforms like GitHub Pages
  - Simpler deployment workflow (just serve static files)
  - Better performance (no server round-trips)
  - Easier to scale (CDN-ready)
  - Can run locally by opening index.html in browser (after build)
