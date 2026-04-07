## Context
The codebase already includes an optimized image component, a shared Web Audio scheduler, and recent low-power improvements on `main`. The remaining issues are concentrated in a few routes that bypass those shared patterns and in tool pages that eagerly import large export dependencies.

## Goals
- Reduce avoidable CPU and memory churn during gameplay on low-power devices
- Decrease initial route bundle cost for notation tools
- Shorten time-to-interaction for Animal Orchestra and other media-heavy routes

## Non-Goals
- Replacing VexFlow or redesigning the notation stack
- Rewriting all audio systems in the app to a single shared service
- Reworking every image asset path in this pass

## Decisions
### Use route-level audio reuse instead of per-event allocation
Treble Runner only needs simple oscillator cues. Reusing one `AudioContext` and master gain is enough to remove the per-event allocation cost without changing its gameplay model.

### Defer export dependencies at the UI boundary
`jspdf` and `html2canvas` should only load when the player opens worksheet export controls. Deferring at the menu or builder boundary keeps the normal play/study path light.

### Defer bulk audio preload until player intent is clear
Animal Orchestra should not block its landing screen on loading every pattern sample. It can initialize on user action and progressively warm caches for enabled instruments.

### Fix shared listener duplication centrally
`useResponsiveLayout` should derive device flags from the viewport it already owns rather than nesting another viewport subscription.

