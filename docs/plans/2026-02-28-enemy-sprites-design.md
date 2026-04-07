# Enemy Sprite Art: Skeleton & Goblin

**Date:** 2026-02-28

## Problem

`melody-dungeon-skeleton.png` and `melody-dungeon-goblin.png` are placeholder copies of the
ghost sprite. All three enemy types render identically in-game. The `ENEMY_SPRITE` map in
`DungeonGrid.tsx` already points to the correct paths — only the image assets need replacing.

## Approach

Generate sprites with a Python/Pillow script using a 64×64 pixel grid scaled 32× via
nearest-neighbor interpolation to produce 2048×2048 RGBA PNGs matching the existing asset
dimensions and style.

## Shared Style

- Canvas: 2048×2048 RGBA, transparent background
- Pixel grid: 64×64 logical pixels, each 32×32 actual pixels
- Black outlines (1px in logical space)
- Red glowing eyes (matching ghost + dragon)
- Music note accent in red/dark red (matches ghost motif)

## Skeleton Design

**Palette**
- Bone white: `#F5F0E8`
- Bone mid: `#D4CFC0`
- Bone shadow: `#A09880`
- Outline: `#1A1008`
- Eye socket: `#0D0808`
- Eye glow: `#FF2020`
- Music note: `#CC1010`

**Visual Features**
- Large oval skull (top 40% of canvas)
- Dark hollow eye sockets with red inner glow
- Small nasal cavity triangle
- Row of teeth along skull base
- Thin neck
- Ribcage with visible spine
- Thin arm bones extending outward
- Music note held in one hand (bottom right)

## Goblin Design

**Palette**
- Body green: `#3D9970`
- Highlight green: `#52BE80`
- Shadow green: `#1E8449`
- Outline: `#145A32`
- Eye glow: `#FF2020`
- Teeth: `#FDFEFE`
- Purple accent: `#8E44AD`

**Visual Features**
- Large round head (top 50%), stocky body (bottom 50%)
- Oversized pointed ears on each side
- Squinting red glowing eyes
- Wide grin with 4 jagged white teeth
- Short wide torso
- Stubby arms with clawed fingers
- Purple accent detail (small cape/collar) to tie into game palette
- Music note floating nearby

## Output

Script saved to `scripts/generate-enemy-sprites.py`.
Outputs overwrite:
- `client/public/images/melody-dungeon-skeleton.png`
- `client/public/images/melody-dungeon-goblin.png`
