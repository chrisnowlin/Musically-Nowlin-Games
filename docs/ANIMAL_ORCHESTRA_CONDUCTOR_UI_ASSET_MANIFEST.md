## Animal Orchestra Conductor — Conductor POV UI Asset Manifest (Expanded Orchestra)

This document is the **designer handoff spec** for the Animal Orchestra Conductor redesign. It defines **every UI piece** we need, plus the **technical requirements** for deliverables so engineering can integrate assets cleanly.

---

### Goals (what the UI must achieve)
- The player feels like they are **seeing through the perspective of the conductor**.
- The orchestra looks like **seated sections** in an orchestra (semi-circular layout, rows, stands/chairs).
- The player can:
  - Select seats/sections
  - Start/stop seats/sections
  - Change the selected seat’s **part A–F**
  - Adjust per-seat volume
  - Use global controls (tempo, master volume, presets, random mix)

---

## 1) Global deliverables (non-image)

### 1.1 Figma source
- **Filename**: `aoc_ui_redesign.fig`
- **Pages**:
  - `Stage_Layout` (desktop/tablet/mobile frames)
  - `Components` (chairs/stands/podium/buttons/parts/overlays)
  - `Characters` (one component per musician)
  - `Tokens` (colors/type/spacing)
  - `SeatLayout` (seat coordinates table)

**Figma requirements**
- Use **components + variants** for interactive states: `idle`, `hover`, `pressed`, `selected`, `playing`, `disabled`.
- Podium panel must be **auto-layout + constraints** so it scales across widths.
- Provide both **light and dark** styling (either variants or token-driven).

### 1.2 Seat layout export (engineering placement)
- **Filename**: `aoc_seat_layout.json`
- **Purpose**: engineering reads this to place the orchestra seats deterministically.

**JSON schema**
```json
[
  {
    "seatId": "strings_violin_1",
    "row": 1,
    "xPct": 32.5,
    "yPct": 62.0,
    "scale": 1.0,
    "zIndex": 10
  }
]
```

**Rules**
- `xPct`, `yPct` are **0–100** relative to the stage canvas container.
- `row`: front row = 1.
- `scale`: relative scale per seat (e.g., back row 0.85, front row 1.05).
- `zIndex`: higher zIndex sits “in front” for overlap.

### 1.3 Design tokens export
- **Filename**: `aoc_tokens.json`
- **Purpose**: allows engineering to match colors/contrast without rasterizing everything.

**Minimum token set**
- `stageBgLight`, `stageBgDark`
- `podiumBg`, `podiumTrim`, `podiumShadow`
- `seatIdle`, `seatHover`, `seatSelected`, `seatPlaying`, `seatDisabled`
- `spotlightColor`, `glowColor`
- `textPrimary`, `textSecondary`, `focusRing`

---

## 2) File conventions (apply to all assets)

### 2.1 Naming
- Prefix: `aoc_`
- Recommended pattern:
  - `aoc_<category>_<name>[_<variant>][_WxH].<ext>`

Examples
- `aoc_stage_backwall_1920x1080.webp`
- `aoc_music_stand.svg`
- `aoc_character_bassoon.svg`

### 2.2 Preferred formats
- **SVG**: UI chrome, seats, characters, icons, minimap
- **PNG/WebP**: painterly backgrounds, soft glows, textures

### 2.3 SVG export rules (important)
- Must include a **`viewBox`**.
- Transparent background.
- No external font dependencies (do not rely on text glyphs). If you must include “note” shapes, draw them as vector shapes.
- Avoid excessive filter usage; prefer simple shapes.
- Keep path counts reasonably optimized.

### 2.4 Interaction/touch requirements
- Any clickable target must be usable at **44×44 CSS px** minimum.
- Provide clear visuals for `selected` + `playing` simultaneously (stackable overlays).

---

## 3) Stage + environment assets (conductor POV)

### 3.1 Stage background (layered)
| Asset ID | File(s) | Type | Required sizes | Notes |
|---|---|---|---|---|
| Back wall + curtains | `aoc_stage_backwall_1920x1080.webp` (+ `2560x1440`, `1366x1024`, `1170x2532`) | Raster | 16:9 + tablet + mobile | No UI text baked in. Keep key detail out of outer 5% margins. |
| Stage floor | `aoc_stage_floor_1920x1080.webp` (+ same sizes) | Raster | same | Subtle perspective lines are encouraged. |
| Vignette overlay | `aoc_stage_vignette_overlay.svg` (or `.png`) | Overlay | scalable | Transparent edges; subtle. |
| Global spotlight overlay (optional) | `aoc_stage_spotlight_overlay.svg` | Overlay | scalable | Engineering can toggle as needed. |

**Technical requirements**
- If raster, export as **WebP** preferred; PNG acceptable.
- If using multiple layers, ensure they align perfectly at each size.

---

## 4) Seating kit (chairs + stands + row guides)

### 4.1 Seating rows (optional guides)
| Asset ID | File(s) | Type | Notes |
|---|---|---|---|
| Row guides | `aoc_seating_row_1.svg` … `aoc_seating_row_4.svg` | SVG | Subtle semi-circular guides; decorative. |

### 4.2 Chair + stand components
| Asset ID | File(s) | Type | Variants/states | Technical requirements |
|---|---|---|---|---|
| Chair | `aoc_chair.svg` | SVG | idle | Provide clear visual **bottom-center anchor**. |
| Chair selected overlay | `aoc_chair_selected_overlay.svg` | SVG overlay | selected | Transparent overlay, stackable over chair. |
| Chair playing overlay | `aoc_chair_playing_overlay.svg` | SVG/PNG overlay | playing | Separate glow/pulse overlay. |
| Music stand | `aoc_music_stand.svg` | SVG | idle | Must be legible at small sizes. |
| Stand highlight overlay | `aoc_music_stand_highlight_overlay.svg` | SVG overlay | hover/selected | Stackable overlay. |

**Sizing system**
- Provide a canonical SVG `viewBox` for seats/stands. Recommendation: chair+stand fits comfortably in a **300×300** viewBox.

---

## 5) Feedback overlays (selection/play clarity)

| Asset ID | File(s) | Type | Sizes | Notes |
|---|---|---|---|---|
| Glow rings | `aoc_glow_ring_sm.png`, `aoc_glow_ring_md.png`, `aoc_glow_ring_lg.png` | PNG | 256² / 512² / 1024² | Transparent background. |
| Seat spotlight pool | `aoc_spotlight_pool.svg` (or `.png`) | Overlay | scalable | Placed on floor under seat. |
| Note particles | `aoc_particle_note_1.svg` … `aoc_particle_note_8.svg` | SVG | scalable | Simple vector note sprites. |
| Disabled haze overlay | `aoc_disabled_haze_overlay.svg` | SVG overlay | scalable | Used when seats are disabled/unavailable. |

---

## 6) Conductor podium UI (always visible)

The podium is the fixed control surface at the bottom of the screen. It should read like a **conductor stand** holding controls and a “score” inspector.

### 6.1 Podium shell
| Asset ID | File(s) | Type | Notes |
|---|---|---|---|
| Podium base | `aoc_podium_base.svg` | SVG | Stretch-friendly (see 9-slice guidance below). |
| Podium trim | `aoc_podium_trim.svg` | SVG | Optional overlay; tintable for light/dark. |
| Podium shadow | `aoc_podium_shadow.svg` | SVG | Optional overlay gradient. |

### 6.2 Button + slider skins (optional)
If provided, engineering can skin existing button/slider components.

| Asset ID | File(s) | Type | States |
|---|---|---|---|
| Primary button | `aoc_btn_primary_idle.svg`, `hover`, `pressed`, `disabled` | SVG | 4 |
| Secondary button | `aoc_btn_secondary_idle.svg`, `hover`, `pressed`, `disabled` | SVG | 4 |
| Slider track | `aoc_slider_track.svg` | SVG | idle |
| Slider fill | `aoc_slider_fill.svg` | SVG | idle |
| Slider thumb | `aoc_slider_thumb_idle.svg`, `hover`, `active` | SVG | 3 |

### 6.3 Selected-seat “score” inspector
| Asset ID | File(s) | Type | States/variants | Notes |
|---|---|---|---|---|
| Score panel background | `aoc_score_panel_bg.svg` | SVG | idle | No baked labels. |
| Part selector staff background | `aoc_part_selector_staff.svg` | SVG | idle | Staff lines/measures background. |
| Part chips | `aoc_part_chip_idle.svg`, `hover`, `selected`, `disabled` | SVG | 4 | Used for parts A–F. |

### 6.4 9-slice / stretch guidance (required)
- If a panel must stretch, either:
  - Deliver **simple SVG** that scales cleanly, OR
  - Deliver **caps + center tile** pieces:
    - `*_cap_left.svg`, `*_cap_right.svg`, `*_center_tile.svg`
- Avoid complex textures that look distorted under stretch.

---

## 7) Modals / overlays (Presets + Tips)

| Asset ID | File(s) | Type | Notes |
|---|---|---|---|
| Modal frame | `aoc_modal_frame.svg` | SVG | Themed frame container only. |
| Preset card bg | `aoc_preset_card_bg.svg` | SVG | Optional; no text baked in. |
| Tip frame | `aoc_tip_frame.svg` | SVG | Optional decorative frame. |

---

## 8) Mini-map (mobile assist)

| Asset ID | File(s) | Type | States |
|---|---|---|---|
| Stage outline | `aoc_minimap_stage_outline.svg` | SVG | idle |
| Seat dot | `aoc_minimap_seat_dot_idle.svg`, `playing`, `selected` | SVG | 3 |

---

## 9) Expanded Orchestra — 18-seat roster (what engineering expects)

Engineering will implement each seat as a playable “layer”. The `instrumentName` should match what is available in the app’s instrument library.

### 9.1 Seat roster table
| Seat ID | Family | instrumentName (code) | Character asset | Notes |
|---|---|---|---|---|
| `strings_violin_1` | strings | `violin` | `aoc_character_violin.svg` | If we want visual variety, also export `aoc_character_violin_alt.svg`. |
| `strings_violin_2` | strings | `violin` | `aoc_character_violin.svg` | May reuse same SVG; engineering can add subtle badge/tint. |
| `strings_viola` | strings | `viola` | `aoc_character_viola.svg` | |
| `strings_cello` | strings | `cello` | `aoc_character_cello.svg` | |
| `strings_bass` | strings | `double-bass` | `aoc_character_double_bass.svg` | |
| `winds_flute` | woodwinds | `flute` | `aoc_character_flute.svg` | |
| `winds_oboe` | woodwinds | `oboe` | `aoc_character_oboe.svg` | |
| `winds_clarinet` | woodwinds | `clarinet` | `aoc_character_clarinet.svg` | |
| `winds_bassoon` | woodwinds | `bassoon` | `aoc_character_bassoon.svg` | |
| `brass_trumpet` | brass | `trumpet` | `aoc_character_trumpet.svg` | |
| `brass_horn` | brass | `french-horn` | `aoc_character_french_horn.svg` | |
| `brass_trombone` | brass | `trombone` | `aoc_character_trombone.svg` | |
| `brass_tuba` | brass | `tuba` | `aoc_character_tuba.svg` | |
| `perc_timpani` | percussion | `timpani` | `aoc_character_timpani.svg` | |
| `perc_snare` | percussion | `snare-drum` | `aoc_character_snare.svg` | |
| `perc_bass_drum` | percussion | `bass-drum` | `aoc_character_bass_drum.svg` | |
| `color_glockenspiel` | percussion | `glockenspiel` | `aoc_character_glockenspiel.svg` | |
| `color_xylophone` | percussion | `xylophone` | `aoc_character_xylophone.svg` | |

### 9.2 Character SVG technical requirements (apply to all)
- **Format**: SVG, transparent background
- **Consistent `viewBox`**: recommend `viewBox="0 0 300 400"`
- **Seated look**: characters must read as seated in an orchestra; either:
  - seated pose inside the character SVG, or
  - designed to sit behind `aoc_music_stand.svg` cleanly.
- **Animation-friendly layering** (strongly preferred): group IDs for
  - `head`, `arms`, `instrument`, `notes`
- **No font-based music note glyphs**; if notes are included, draw them as vector shapes.

---

## 10) Export package structure

Designer export should mirror this structure:

```
aoc_ui_exports/
  stage/
  seating/
  characters/
  podium/
  overlays/
  minimap/
  aoc_seat_layout.json
  aoc_tokens.json
```

---

## 11) Acceptance checklist (handoff-ready)
- [ ] All SVGs have a `viewBox` and no external font dependencies
- [ ] All overlays have correct transparency and layer cleanly
- [ ] Interactive elements have visuals for: idle/hover/selected/playing/disabled
- [ ] Podium panels are stretch-safe (or have caps/center tile exports)
- [ ] Character art reads clearly at mobile scale
- [ ] `aoc_seat_layout.json` exists and matches the seat IDs above
- [ ] Light + dark mode is supported via token palette or variants
