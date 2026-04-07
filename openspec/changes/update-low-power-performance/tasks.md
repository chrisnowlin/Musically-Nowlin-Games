## 1. Branch + Baseline
- [x] 1.1 Bring local `develop` up to the latest `main` commits used for low-power image and reduced-motion support
- [x] 1.2 Create an implementation branch from the updated `develop` baseline

## 2. Runtime Audio Optimization
- [x] 2.1 Refactor Treble Runner to reuse a single audio context and gain graph for repeated sound effects
- [x] 2.2 Keep the existing gameplay feedback sounds and mute controls working after the refactor

## 3. Bundle Size Optimization
- [x] 3.1 Lazy-load worksheet export UI and generator code in Rhythm Randomizer
- [x] 3.2 Apply the same export deferral to Sight Reading Randomizer

## 4. Startup Cost Optimization
- [x] 4.1 Defer Animal Orchestra sample loading until interaction or active instrument use
- [x] 4.2 Switch Animal Orchestra and Treble Runner backgrounds onto the optimized image path where possible
- [x] 4.3 Remove redundant shared viewport resize subscriptions

## 5. Verification
- [x] 5.1 Run typecheck/build validation
- [x] 5.2 Review bundle output for the targeted routes and summarize any remaining high-cost follow-up items
