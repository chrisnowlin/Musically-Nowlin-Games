# Rhythm Randomizer Tool

## Why

Music educators need a tool to quickly generate rhythm patterns for classroom exercises, worksheets, and ensemble activities. Existing free tools (rhythmrandomizer.com, 4four.io) offer basic pattern generation but lack **worksheet export**, **multi-part ensemble generation**, and **assessment formatting** - features essential for teaching.

## What Changes

- **NEW capability**: `tool-rhythm-randomizer` - A standalone rhythm generation tool for educators
- Add new page at `/tools/rhythm-randomizer`
- Create rhythm generation logic with configurable parameters
- Implement dual notation display (VexFlow staff + simplified grid)
- Build ensemble mode for generating coordinated multi-part rhythms
- Create PDF worksheet export with answer keys
- Support multiple counting syllable systems (Kodaly, Takadimi, Gordon, Numbers)

## Impact

- **Affected specs**: NEW `tool-rhythm-randomizer` capability
- **Affected code**:
  - `/client/src/lib/rhythmRandomizer/` - New logic module
  - `/client/src/components/RhythmRandomizer/` - New component tree
  - `/client/src/pages/tools/` - New tools page directory
  - `/client/src/hooks/useRhythmRandomizer.ts` - New state hook
  - `/client/src/App.tsx` - Add route
- **Dependencies**: jsPDF for PDF export (new dependency)

## Key Differentiators

| Feature | Description | Why Unique |
|---------|-------------|------------|
| Worksheet Generator | Export PDF with exercises, answer keys, blank completion | No existing tool offers this |
| Ensemble Mode | Generate 2-4 coordinated parts (call/response, layers, body percussion) | Competitors only do single-line |
| Assessment Tools | Quiz formats, difficulty variants, answer key toggle | Education-focused features |
