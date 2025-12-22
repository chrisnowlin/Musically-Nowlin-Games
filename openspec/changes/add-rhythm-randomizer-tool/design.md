# Design: Rhythm Randomizer Tool

## Context

Music educators need a rhythm pattern generator that goes beyond basic randomization to support classroom teaching workflows. This tool targets teachers (not students) and focuses on content creation rather than gamified learning.

**Stakeholders**: Music teachers, curriculum developers
**Key constraint**: Must produce print-ready materials and support ensemble activities

## Goals / Non-Goals

**Goals:**
- Generate musically valid rhythm patterns respecting time signatures
- Support multiple notation formats (staff, grid, syllables)
- Enable multi-part ensemble generation for classroom activities
- Export professional-quality PDF worksheets with answer keys
- Integrate with existing audio playback infrastructure

**Non-Goals:**
- Student-facing gamification (no scoring, achievements)
- MIDI export (future consideration)
- Real-time collaboration
- Platform integration with rhythm games (deferred)

## Decisions

### 1. Pattern Representation

**Decision**: Use beat-based duration arrays (similar to existing `rhythm-001Logic.ts`)

```typescript
interface RhythmEvent {
  type: 'note' | 'rest';
  value: NoteValue;           // 'quarter', 'eighth', etc.
  duration: number;           // In beats (quarter = 1)
  isAccented?: boolean;
  isTriplet?: boolean;
  syllable?: string;
}
```

**Rationale**: Aligns with existing rhythm game patterns (`AudioParams.pattern = number[]`), simplifies integration with `audioService.playPhrase()`.

### 2. Notation Rendering

**Decision**: Use VexFlow for staff notation, custom Canvas/SVG for grid notation

**Rationale**:
- VexFlow already in codebase, proven for `vexflowUtils.ts`
- Grid notation is simpler (boxes/circles), doesn't need full music notation library
- Dual approach allows toggle between modes

### 3. Ensemble Generation Strategy

**Decision**: Generate parts with complementary characteristics

| Mode | Part 1 | Part 2+ |
|------|--------|---------|
| Call/Response | Question pattern | Answer (inverted density, different start) |
| Layered | Sparse foundation | Increasing complexity/syncopation |
| Body Percussion | Labeled sounds | Pre-mapped timbres (stomp=low, clap=mid) |

**Rationale**: Ensures parts sound good together, not just random independent lines.

### 4. PDF Generation

**Decision**: Use `jsPDF` with `html2canvas` for VexFlow rendering

**Alternatives considered**:
- `pdf-lib`: Lower-level, more complex for our needs
- Browser print CSS: Less control over layout, no programmatic generation
- Server-side PDF: Adds backend complexity, unnecessary for client-side tool

**Rationale**: jsPDF is well-documented, handles canvas export well, no server needed.

### 5. State Management

**Decision**: Single custom hook (`useRhythmRandomizer`) with local state

**Rationale**:
- No server state needed (tool generates on-demand)
- Complexity doesn't warrant external state library
- Follows existing game hook patterns (`useFinishTheTuneGame`)

## Architecture

```
/client/src/
├── lib/rhythmRandomizer/
│   ├── types.ts              # Interfaces
│   ├── rhythmGenerator.ts    # Single-line generation
│   ├── ensembleGenerator.ts  # Multi-part generation
│   ├── rhythmPlayback.ts     # Audio scheduling
│   ├── rhythmNotation.ts     # VexFlow rendering
│   ├── countingSyllables.ts  # Kodaly/Takadimi/etc.
│   ├── worksheetGenerator.ts # PDF export
│   └── shareUtils.ts         # URL encoding
├── components/RhythmRandomizer/
│   ├── RhythmRandomizerTool.tsx
│   ├── ControlPanel/         # Settings UI
│   ├── Display/              # Notation views
│   ├── Actions/              # Regenerate, share, print
│   └── Worksheet/            # PDF builder UI
├── hooks/
│   └── useRhythmRandomizer.ts
└── pages/tools/
    └── RhythmRandomizerPage.tsx
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| VexFlow rendering performance with many measures | Limit to 8 measures max, virtualize if needed |
| PDF file size with embedded notation | Use vector graphics, compress images |
| Ensemble playback timing drift | Use Web Audio API scheduling, not setTimeout |
| Complex UI overwhelming teachers | Progressive disclosure (Advanced Settings collapsed) |

## Open Questions

1. Should worksheets include QR codes linking to audio playback?
2. What accessibility accommodations needed for visually impaired teachers?
3. Should generated patterns be saveable/loadable (local storage)?
