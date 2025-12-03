## Why

Currently, each animal in the Animal Orchestra Conductor game plays only one fixed musical pattern. This limits creative exploration and replayability. Adding 3 selectable parts per animal allows users to mix and match different musical phrases, creating thousands of unique combinations while learning how different melodic and rhythmic choices affect the overall sound.

## What Changes

- Each of the 5 animal/instrument layers will have **3 different musical parts** to choose from
- Parts are designed with musical intentionality:
  - **Variation A** - Simple, foundational pattern (current default)
  - **Variation B** - Complementary/alternate pattern (rhythmically varied)
  - **Variation C** - Contrasting pattern (more complex or stylistically different)
- Users can switch between parts using a **part selector UI** on each animal card
- Parts are designed to harmonize well in any combination
- **Educational value**: Teaches arrangement concepts (how different parts combine)
- Total unique combinations: 3⁵ = 243 different arrangements!

## Impact

- **Affected specs**: `game-animal-orchestra-conductor`
- **Affected code**: 
  - `AnimalOrchestraConductorGameWithSamples.tsx` - Add part selection UI and part data
  - May update `instrumentLibrary.ts` if new samples needed
- **No breaking changes** - Current behavior preserved as "Variation A" defaults
- **New educational content** - Learning tips about arrangement and part selection
