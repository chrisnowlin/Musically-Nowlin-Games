## Why

The current Musically Nowlin Games project is planned for shutdown after a replacement site is available. Visitors need a clear, site-wide notice that explains the upcoming transition and gives them a direct path to the new site.

## What Changes

- Add a site-wide shutdown/migration notification popup in the app shell.
- Add a persistent site-wide shutdown/migration banner in the app shell.
- Provide a primary action that redirects users to `https://musicallynowlin.com`.
- Allow users to dismiss the popup so it does not repeatedly interrupt the same browser.

## Impact

- Affected specs: `site-migration-notice`
- Affected code:
  - `client/src/App.tsx` to render the notice surfaces globally.
  - `client/src/common/` for focused notice components and any small helper needed for persistence.
  - `client/src/test/` or colocated tests for the notice behavior.
