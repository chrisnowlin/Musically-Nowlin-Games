# Deployment Specification

## ADDED Requirements

### Requirement: Static Site Generation

The application SHALL be deployable as a static single-page application without requiring a Node.js server at runtime.

#### Scenario: Build generates static assets

- **WHEN** the build command is executed
- **THEN** a complete static site is generated in the dist directory
- **AND** all HTML, CSS, JavaScript, and assets are self-contained
- **AND** no server-side code is required to run the application

#### Scenario: Client-side routing works on static hosts

- **WHEN** a user navigates directly to a non-root route (e.g., /game/high-or-low)
- **THEN** the static hosting configuration handles the route correctly
- **AND** the React app loads and displays the correct page
- **AND** no 404 errors occur for valid application routes

### Requirement: Development Without Server

The application SHALL support local development using Vite's built-in dev server without requiring Express.

#### Scenario: Start dev server

- **WHEN** the development command is executed
- **THEN** Vite's dev server starts on port 5173 (or specified port)
- **AND** hot module replacement works for instant updates
- **AND** no Express server is involved in the development workflow

#### Scenario: Preview production build locally

- **WHEN** the preview command is executed after building
- **THEN** a local static file server runs the production build
- **AND** the application behaves identically to production deployment
- **AND** client-side routing works correctly

### Requirement: Multiple Deployment Targets

The application SHALL be compatible with common static hosting platforms without modification.

#### Scenario: GitHub Pages deployment

- **WHEN** the static build is deployed to GitHub Pages
- **THEN** the application loads correctly at the GitHub Pages URL
- **AND** client-side routing works with the Pages configuration
- **AND** all assets load with correct paths

#### Scenario: Netlify deployment

- **WHEN** the static build is deployed to Netlify
- **THEN** the application loads correctly
- **AND** Netlify's built-in SPA routing handles all routes
- **AND** the deployment can be done via drag-and-drop or Git integration

#### Scenario: Vercel deployment

- **WHEN** the static build is deployed to Vercel
- **THEN** the application loads correctly
- **AND** Vercel's routing configuration handles client-side routes
- **AND** deployment works via Git integration or CLI

#### Scenario: Local file system serving

- **WHEN** the built application is opened locally via file:// protocol or simple HTTP server
- **THEN** the application runs correctly
- **AND** all Web Audio API features work as expected
- **AND** no server-side dependencies are required

### Requirement: Zero Runtime Dependencies

The application SHALL not require any server-side runtime dependencies or backend services.

#### Scenario: No API calls required

- **WHEN** the application runs in the browser
- **THEN** no HTTP requests are made to backend APIs
- **AND** all game logic executes client-side
- **AND** audio generation uses only Web Audio API

#### Scenario: Standalone operation

- **WHEN** the application is loaded in a browser
- **THEN** it operates entirely using client-side resources
- **AND** no database connections are established
- **AND** no session management occurs server-side
- **AND** game state is managed entirely in browser memory or localStorage

### Requirement: Simplified Package Dependencies

The application SHALL remove all server-specific dependencies from package.json.

#### Scenario: Build dependencies are minimal

- **WHEN** package.json is reviewed
- **THEN** Express and server-related packages are not present
- **AND** only client-side and build-time dependencies remain
- **AND** the dependency tree is lighter and faster to install

#### Scenario: No backend type definitions

- **WHEN** TypeScript dependencies are reviewed
- **THEN** @types/express and similar server types are removed
- **AND** only client-side type definitions remain
