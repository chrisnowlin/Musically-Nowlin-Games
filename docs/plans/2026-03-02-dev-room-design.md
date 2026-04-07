# Dev Room Design

## Overview

A testing/sandbox room for the Melody Dungeon game, accessible from the menu screen. Contains a merchant and one of each enemy type with static positioning (no movement). Allows developers to test encounters, challenge types, items, and difficulty tiers without playing through the game.

## Approach

**Special Floor (Floor 0)** — The dev room is implemented as a hardcoded floor using the existing `DungeonFloor` tile grid system. All existing rendering (`DungeonGrid`, `HUD`, modals) and encounter logic work as-is, with targeted overrides for dev room behavior.

## Menu Entry & Password Gate

- A **"Dev Room"** button on the menu screen below existing controls
- Clicking opens a **password modal** (text input + submit)
- On correct password, game transitions to floor 0
- Password stored as a constant (`DEV_ROOM_PASSWORD`)

## Floor Layout

- **Floor number: 0** (never reached in normal gameplay)
- **Grid size: 30x30** (large for future additions)
- **Single open room** — all tiles are `Floor` type except perimeter walls
- **Player spawn: center (15, 15)**
- **Entity placement near spawn:**
  - Merchant + MerchantStall at (13, 13) and (14, 13) — northwest of player
  - 10 enemy types in a row south of player at y=18: ghost, skeleton, goblin, slime, bat, wraith, spider, shade, siren, dragon (x positions 10–19)
- **No stairs** — return to menu via "Back to Menu" button
- **No fog of war** — all tiles visible from start
- **Enemies do NOT move** — movement logic skips floor 0

## Challenge Config Panel

When stepping on an enemy in the dev room, before the challenge modal opens:

- **Config panel** with:
  - Challenge type dropdown (all 8 types)
  - Tier slider/dropdown (1–5)
  - "Start Challenge" button
- Selected config overrides the enemy's default challenge type/tier
- **Enemies respawn** after being defeated (cleared flag resets)

## Merchant Behavior

- Shows **ALL items** from the item catalog (no tier/floor restrictions)
- Player starts with **999 gold**
- Standard `MerchantModal` reused with overridden inventory

## Stats, Reset & God Mode

- Player starts with 5 HP and 999 gold
- **Dev toolbar** in HUD (floor 0 only):
  - **"Reset Stats"** button — restores HP to max, gold to 999, clears buffs, resets all enemies
  - **"Infinite Gold"** toggle — purchases are free, gold never decreases
  - **"Infinite Health"** toggle — wrong answers cost no HP
- Toggles visually highlighted when active
