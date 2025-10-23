# Implementation Tasks

## 1. Remove Server Infrastructure

- [ ] 1.1 Delete `/server` directory (index.ts, routes.ts, storage.ts, vite.ts)
- [ ] 1.2 Remove server-related files (drizzle.config.ts)
- [ ] 1.3 Delete `/shared` directory (no longer needed without server)
- [ ] 1.4 Remove `/scripts/kill-port.mjs` (no longer needed)

## 2. Update Package Configuration

- [ ] 2.1 Remove server dependencies from package.json:
  - [ ] express, @types/express
  - [ ] @neondatabase/serverless
  - [ ] drizzle-orm, drizzle-zod, drizzle-kit
  - [ ] connect-pg-simple, @types/connect-pg-simple
  - [ ] express-session, @types/express-session
  - [ ] passport, passport-local, @types/passport, @types/passport-local
  - [ ] memorystore
  - [ ] ws, @types/ws
  - [ ] tsx (used for server development)
  - [ ] esbuild (used for server bundling)
- [ ] 2.2 Update npm scripts in package.json:
  - [ ] Replace `dev` script: `vite` (instead of tsx server)
  - [ ] Replace `build` script: `vite build` (instead of dual build)
  - [ ] Add `preview` script: `vite preview` (for testing production build)
  - [ ] Remove `predev` script (no port killing needed)
  - [ ] Remove `start` script (no server to start)
  - [ ] Keep `check` and `test` scripts as-is
  - [ ] Remove `db:push` script (no database)

## 3. Update Vite Configuration

- [ ] 3.1 Simplify vite.config.ts to remove server-specific plugins
- [ ] 3.2 Configure base path for deployment (default to "/")
- [ ] 3.3 Ensure build output goes to `/dist` directory
- [ ] 3.4 Configure preview server port (default 4173)

## 4. Add Static Hosting Configuration Files

- [ ] 4.1 Create `public/_redirects` for Netlify SPA routing
- [ ] 4.2 Create `vercel.json` for Vercel SPA routing
- [ ] 4.3 Create `.github/workflows/deploy.yml` for GitHub Pages (optional)
- [ ] 4.4 Update `.replit` file to use `vite` instead of server

## 5. Update Documentation

- [ ] 5.1 Create DEPLOYMENT.md with instructions for:
  - [ ] GitHub Pages deployment
  - [ ] Netlify deployment (drag-and-drop and Git)
  - [ ] Vercel deployment
  - [ ] Local testing with `vite preview`
- [ ] 5.2 Update package.json description if needed
- [ ] 5.3 Update any existing documentation mentioning server setup

## 6. Testing and Validation

- [ ] 6.1 Test development workflow with `npm run dev`
- [ ] 6.2 Test production build with `npm run build`
- [ ] 6.3 Test production preview with `npm run preview`
- [ ] 6.4 Verify all routes work in preview mode
- [ ] 6.5 Verify Web Audio API functionality works
- [ ] 6.6 Test build output can be served from simple HTTP server
- [ ] 6.7 Verify TypeScript compilation with `npm run check`
- [ ] 6.8 Run tests with `npm test` to ensure no regressions
