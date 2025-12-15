## Animal Orchestra Conductor — Conductor POV UI Asset Manifest (Expanded Orchestra)

This document is the **designer handoff spec** for the Animal Orchestra Conductor redesign. It defines **every UI piece** we need, plus the **technical requirements** for deliverables so engineering can integrate assets cleanly.

**NOTE:** Final deliverables must be **PNG** or **JPEG** format. Vector (SVG) sources should be kept for future edits, but the runtime assets will be raster images.

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
- `aoc_stage_backwall_1920x1080.jpg`
- `aoc_music_stand.png`
- `aoc_character_bassoon.png`

### 2.2 Required formats
- **PNG (24-bit or 32-bit)**: REQUIRED for all UI elements, characters, icons, and overlays that need **transparency**.
- **JPEG**: Acceptable ONLY for fully opaque, rectangular background images (e.g., stage back wall) to save file size.

### 2.3 Image export rules (important)
- **Resolution**: All assets must be exported at high resolution (Retina-ready).
  - **Standard**: Export at **2x** or **3x** the logical CSS pixel size.
  - Example: If a button is 44x44px in CSS, the PNG should be at least **88x88px** (2x) or **132x132px** (3x).
- **Transparency**: PNGs must have a clean transparent background (alpha channel). No white/black mattes.
- **Trimming**: Trim transparent whitespace tightly around the visual content, unless a specific padding is required for alignment (e.g., keeping a glow effect centered).
- **Compression**: Optimize all PNG/JPEG files (e.g., using TinyPNG or ImageOptim) to reduce file size without visible quality loss.

### 2.4 Interaction/touch requirements
- Any clickable target must be usable at **44×44 CSS px** minimum.
- Provide clear visuals for `selected` + `playing` simultaneously (stackable overlays).

---

## 3) Stage + environment assets (conductor POV)

### 3.1 Stage background (layered)
| Asset ID | File(s) | Type | Required sizes | Notes |
|---|---|---|---|---|
| Back wall + curtains | `aoc_stage_backwall_1920x1080.jpg` (+ `2560x1440`, `1366x1024`, `1170x2532`) | JPEG/PNG | 16:9 + tablet + mobile | No UI text baked in. Keep key detail out of outer 5% margins. |
| Stage floor | `aoc_stage_floor_1920x1080.jpg` (+ same sizes) | JPEG/PNG | same | Subtle perspective lines are encouraged. |
| Vignette overlay | `aoc_stage_vignette_overlay.png` | PNG | scalable | Transparent edges; subtle gradient. |
| Global spotlight overlay (optional) | `aoc_stage_spotlight_overlay.png` | PNG | scalable | Engineering can toggle as needed. |

**Technical requirements**
- If using multiple layers, ensure they align perfectly at each size.
- Backgrounds can be JPEG if opaque, otherwise PNG.

---

## 4) Seating kit (chairs + stands + row guides)

### 4.1 Seating rows (optional guides)
| Asset ID | File(s) | Type | Notes |
|---|---|---|---|
| Row guides | `aoc_seating_row_1.png` … `aoc_seating_row_4.png` | PNG | Subtle semi-circular guides; decorative. |

### 4.2 Chair + stand components
| Asset ID | File(s) | Type | Variants/states | Technical requirements |
|---|---|---|---|---|
| Chair | `aoc_chair.png` | PNG | idle | Provide clear visual **bottom-center anchor**. |
| Chair selected overlay | `aoc_chair_selected_overlay.png` | PNG overlay | selected | Transparent overlay, stackable over chair. |
| Chair playing overlay | `aoc_chair_playing_overlay.png` | PNG overlay | playing | Separate glow/pulse overlay. |
| Music stand | `aoc_music_stand.png` | PNG | idle | Must be legible at small sizes. |
| Stand highlight overlay | `aoc_music_stand_highlight_overlay.png` | PNG overlay | hover/selected | Stackable overlay. |

**Sizing system**
- Target logical size: Chair+stand fits in **300×300 CSS px**.
- **Export size**: **900×900px** (3x) recommended for crisp edges on high-DPI displays.

---

## 5) Feedback overlays (selection/play clarity)

| Asset ID | File(s) | Type | Sizes | Notes |
|---|---|---|---|---|
| Glow rings | `aoc_glow_ring_sm.png`, `aoc_glow_ring_md.png`, `aoc_glow_ring_lg.png` | PNG | 256² / 512² / 1024² | Transparent background. Soft edges. |
| Seat spotlight pool | `aoc_spotlight_pool.png` | PNG | scalable | Placed on floor under seat. |
| Note particles | `aoc_particle_note_1.png` … `aoc_particle_note_8.png` | PNG | scalable | Simple note sprites. |
| Disabled haze overlay | `aoc_disabled_haze_overlay.png` | PNG | scalable | Used when seats are disabled/unavailable. |

---

## 6) Conductor podium UI (always visible)

The podium is the fixed control surface at the bottom of the screen. It should read like a **conductor stand** holding controls and a “score” inspector.

### 6.1 Podium shell
| Asset ID | File(s) | Type | Notes |
|---|---|---|---|
| Podium base | `aoc_podium_base.png` | PNG | Stretch-friendly (see 9-slice guidance below). |
| Podium trim | `aoc_podium_trim.png` | PNG | Optional overlay; tintable for light/dark. |
| Podium shadow | `aoc_podium_shadow.png` | PNG | Optional overlay gradient. |

### 6.2 Button + slider skins (optional)
If provided, engineering can skin existing button/slider components.

| Asset ID | File(s) | Type | States |
|---|---|---|---|
| Primary button | `aoc_btn_primary_idle.png`, `hover`, `pressed`, `disabled` | PNG | 4 |
| Secondary button | `aoc_btn_secondary_idle.png`, `hover`, `pressed`, `disabled` | PNG | 4 |
| Slider track | `aoc_slider_track.png` | PNG | idle |
| Slider fill | `aoc_slider_fill.png` | PNG | idle |
| Slider thumb | `aoc_slider_thumb_idle.png`, `hover`, `active` | PNG | 3 |

### 6.3 Selected-seat “score” inspector
| Asset ID | File(s) | Type | States/variants | Notes |
|---|---|---|---|---|
| Score panel background | `aoc_score_panel_bg.png` | PNG | idle | No baked labels. |
| Part selector staff background | `aoc_part_selector_staff.png` | PNG | idle | Staff lines/measures background. |
| Part chips | `aoc_part_chip_idle.png`, `hover`, `selected`, `disabled` | PNG | 4 | Used for parts A–F. |

### 6.4 9-slice / stretch guidance (required)
- If a panel must stretch, deliver **caps + center tile** pieces to avoid distortion:
  - `*_cap_left.png`, `*_cap_right.png`, `*_center_tile.png`
- OR provide a very high-resolution PNG if stretching isn't extreme.

---

## 7) Modals / overlays (Presets + Tips)

| Asset ID | File(s) | Type | Notes |
|---|---|---|---|
| Modal frame | `aoc_modal_frame.png` | PNG | Themed frame container only. |
| Preset card bg | `aoc_preset_card_bg.png` | PNG | Optional; no text baked in. |
| Tip frame | `aoc_tip_frame.png` | PNG | Optional decorative frame. |

---

## 8) Mini-map (mobile assist)

| Asset ID | File(s) | Type | States |
|---|---|---|---|
| Stage outline | `aoc_minimap_stage_outline.png` | PNG | idle |
| Seat dot | `aoc_minimap_seat_dot_idle.png`, `playing`, `selected` | PNG | 3 |

---

## 9) Expanded Orchestra — 18-seat roster (what engineering expects)

Engineering will implement each seat as a playable “layer”. The `instrumentName` should match what is available in the app’s instrument library.

### 9.1 Seat roster table
| Seat ID | Family | instrumentName (code) | Character asset | Notes |
|---|---|---|---|---|
| `strings_violin_1` | strings | `violin` | `aoc_character_violin.png` | If we want visual variety, also export `_alt.png`. |
| `strings_violin_2` | strings | `violin` | `aoc_character_violin.png` | May reuse same PNG; engineering can add subtle badge/tint. |
| `strings_viola` | strings | `viola` | `aoc_character_viola.png` | |
| `strings_cello` | strings | `cello` | `aoc_character_cello.png` | |
| `strings_bass` | strings | `double-bass` | `aoc_character_double_bass.png` | |
| `winds_flute` | woodwinds | `flute` | `aoc_character_flute.png` | |
| `winds_oboe` | woodwinds | `oboe` | `aoc_character_oboe.png` | |
| `winds_clarinet` | woodwinds | `clarinet` | `aoc_character_clarinet.png` | |
| `winds_bassoon` | woodwinds | `bassoon` | `aoc_character_bassoon.png` | |
| `brass_trumpet` | brass | `trumpet` | `aoc_character_trumpet.png` | |
| `brass_horn` | brass | `french-horn` | `aoc_character_french_horn.png` | |
| `brass_trombone` | brass | `trombone` | `aoc_character_trombone.png` | |
| `brass_tuba` | brass | `tuba` | `aoc_character_tuba.png` | |
| `perc_timpani` | percussion | `timpani` | `aoc_character_timpani.png` | |
| `perc_snare` | percussion | `snare-drum` | `aoc_character_snare.png` | |
| `perc_bass_drum` | percussion | `bass-drum` | `aoc_character_bass_drum.png` | |
| `color_glockenspiel` | percussion | `glockenspiel` | `aoc_character_glockenspiel.png` | |
| `color_xylophone` | percussion | `xylophone` | `aoc_character_xylophone.png` | |

### 9.2 Character Image technical requirements (apply to all)
- **Format**: PNG, transparent background (alpha channel preserved).
- **Resolution**: Export at **3x** logical size (e.g., if character is displayed at 150x200px, export at **450x600px**).
- **Seated look**: characters must read as seated in an orchestra; either:
  - seated pose inside the character image, or
  - designed to sit behind `aoc_music_stand.png` cleanly.
- **No font-based music note glyphs**; notes should be drawn shapes if included.

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
- [ ] All assets are **PNG** or **JPEG** (no SVGs).
- [ ] PNGs have correct **transparency** and no white/black halos.
- [ ] Assets are exported at **high resolution** (2x/3x) for crispness on all devices.
- [ ] Interactive elements have visuals for: idle/hover/selected/playing/disabled
- [ ] Podium panels are stretch-safe (or have caps/center tile exports)
- [ ] Character art reads clearly at mobile scale
- [ ] `aoc_seat_layout.json` exists and matches the seat IDs above
- [ ] Light + dark mode is supported via token palette or variants
