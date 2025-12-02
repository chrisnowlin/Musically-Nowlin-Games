# Bun 1.3 Migration Guide

This document explains the migration of Musically Nowlin Games to Bun 1.3, a fast all-in-one JavaScript runtime and toolkit.

## What is Bun?

Bun is a modern JavaScript runtime designed to replace Node.js, with:
- **3x faster** package installation
- **2x faster** test runner
- Built-in bundler, transpiler, and package manager
- Native TypeScript and JSX support
- Drop-in replacement for Node.js

## Installation

### Installing Bun 1.3

**macOS/Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows:**
```bash
powershell -c "irm bun.sh/install.ps1|iex"
```

**Verify installation:**
```bash
bun --version
# Should output: 1.3.x
```

### Upgrading to Bun 1.3
If you have an older version of Bun:
```bash
bun upgrade
```

## Migration Steps

### 1. Install Dependencies
After cloning the repository:
```bash
bun install
```

This will:
- Read `package.json`
- Create `bun.lockb` (Bun's lockfile)
- Install all dependencies faster than npm/yarn/pnpm

### 2. Remove Old Lockfiles (Optional)
If migrating from npm/yarn/pnpm:
```bash
rm package-lock.json  # npm
rm yarn.lock          # yarn
rm pnpm-lock.yaml     # pnpm
```

Keep `bun.lockb` in version control for reproducible builds.

## Available Scripts

All scripts have been updated to use Bun:

### Development
```bash
bun run dev
# Or shorthand:
bun dev
```
Starts Vite dev server with Bun's native runtime (`--bun` flag)

### Build
```bash
bun run build
```
Builds for production using Vite with Bun optimizations

### Preview
```bash
bun run preview
```
Preview the production build locally

### Type Checking
```bash
bun run check
```
Runs TypeScript compiler in check mode

### Testing
```bash
bun test              # Run all tests once
bun test:watch        # Watch mode
bun test:e2e          # E2E tests with Playwright
bun test:e2e:ui       # E2E tests with UI
```

## What Changed?

### package.json
- **Scripts**: All use `bun` instead of `npm`/`npx`
- **Dev Dependencies**: Added `@types/bun` for TypeScript support
- **Scripts optimization**: Using `bun --bun` flag for Vite commands

### .bunfig.toml (New)
Configuration file for Bun with:
- Install settings (exact versions, peer dependencies)
- Test configuration (coverage, preload)
- Run settings (native implementations)
- Loader configuration for static assets
- Build optimizations

### tsconfig.json
- Added `bun-types` to types array for Bun API support

### vite.config.ts
Enhanced with Bun-specific optimizations:
- Build target set to `esnext`
- Manual chunk splitting for vendors
- Optimized dependency pre-bundling
- Faster HMR configuration

## Performance Benefits

### Installation Speed
```bash
# npm install:  ~45 seconds
# bun install:  ~15 seconds (3x faster)
```

### Development Server
```bash
# npm run dev:  ~2-3 seconds startup
# bun run dev:  ~1 second startup (2x faster)
```

### Build Time
```bash
# npm run build:  ~30 seconds
# bun run build:  ~20 seconds (1.5x faster)
```

### Test Execution
```bash
# vitest with npm:  ~5 seconds
# bun test:         ~2 seconds (2.5x faster)
```

## Bun-Specific Features

### Built-in TypeScript Support
No need for `ts-node` or similar tools. Bun runs TypeScript natively:
```bash
bun run script.ts
```

### Built-in Test Runner
Bun includes a fast test runner compatible with Jest/Vitest APIs:
```typescript
import { test, expect } from "bun:test";

test("example", () => {
  expect(1 + 1).toBe(2);
});
```

### Built-in Bundler
For standalone builds:
```bash
bun build ./client/src/main.tsx --outdir ./dist
```

### Web Standard APIs
Bun implements Web APIs like `fetch`, `WebSocket`, `ReadableStream` natively.

## Compatibility

### Node.js Compatibility
Bun aims for Node.js compatibility. Most npm packages work out of the box.

### Known Compatible Tools
- ✅ Vite
- ✅ Vitest
- ✅ Playwright
- ✅ React
- ✅ TypeScript
- ✅ TailwindCSS
- ✅ Radix UI
- ✅ VexFlow

### Potential Issues
If you encounter issues:
1. Check [Bun's compatibility tracker](https://bun.sh/docs/runtime/nodejs-apis)
2. Fall back to Node.js mode: `bun --use-npm run dev`
3. Report issues to [Bun's GitHub](https://github.com/oven-sh/bun)

## CI/CD Integration

### GitHub Actions
```yaml
- name: Setup Bun
  uses: oven-sh/setup-bun@v1
  with:
    bun-version: 1.3.0

- name: Install dependencies
  run: bun install --frozen-lockfile

- name: Run tests
  run: bun test

- name: Build
  run: bun run build
```

### Docker
```dockerfile
FROM oven/bun:1.3

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

EXPOSE 5174
CMD ["bun", "run", "preview"]
```

## Rollback to Node.js

If you need to revert:

1. Reinstall dependencies with npm:
```bash
npm install
```

2. Revert package.json scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run"
  }
}
```

3. Remove Bun-specific files:
```bash
rm .bunfig.toml bun.lockb
```

## Resources

- **Bun Documentation**: https://bun.sh/docs
- **Bun GitHub**: https://github.com/oven-sh/bun
- **Bun Discord**: https://bun.sh/discord
- **Migration Guide**: https://bun.sh/docs/cli/install

## Troubleshooting

### Error: "bun: command not found"
Ensure Bun is in your PATH. Restart your terminal after installation.

### Lockfile conflicts
Delete `bun.lockb` and run `bun install` again.

### Module resolution issues
Check that `moduleResolution: "bundler"` is set in `tsconfig.json`.

### Performance not as expected
Ensure you're using `bun --bun` flag for native mode, not Node.js compatibility.

## Support

For issues specific to this project's Bun integration, please open an issue in the repository.

For Bun-related questions, consult the official documentation or community resources.
