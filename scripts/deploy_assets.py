
import os
import shutil

sliced_dir = "sliced_assets"
target_base = "client/src/assets/aoc"
public_base = "client/public/aoc"

# Ensure targets exist
os.makedirs(os.path.join(target_base, "seating"), exist_ok=True)
os.makedirs(os.path.join(public_base, "overlays"), exist_ok=True)

# Mapping: sliced_name -> (target_base_dir, subdir, target_name)
# target_base_dir can be "src" (target_base) or "public" (public_base)
# Based on my previous manual fix, overlays go to public, seating to src.

mapping = {
    "aoc_chair.png": ("src", "seating", "aoc_chair.png"),
    "ie_eeaoc_chair_selected_overlay.pngaoc_chair_selected_overlay.png": ("src", "seating", "aoc_chair_selected_overlay.png"),
    "asset_6.png": ("src", "seating", "aoc_chair_playing_overlay.png"), # Updated index
    "aoc_music_stand.png": ("src", "seating", "aoc_music_stand.png"),
    "aoc_music_stand_highlight_overlay.png": ("src", "seating", "aoc_music_stand_highlight_overlay.png"),
    
    # Rows
    "titi_sine_ped_ane.png": ("src", "seating", "aoc_seating_row_1.png"),
    "petieiintnt_linia_lines_en_.png": ("src", "seating", "aoc_seating_row_2.png"),
    "asset_20.png": ("src", "seating", "aoc_seating_row_3.png"), # Kept asset_20 (6k) 
    "aoc_sesting_row_4.png": ("src", "seating", "aoc_seating_row_4.png"),

    # Overlays (Public)
    "asset_8.png": ("public", "overlays", "aoc_glow_ring_sm.png"),
    "asset_7.png": ("public", "overlays", "aoc_glow_ring_md.png"), # Updated
    "asset_0.png": ("public", "overlays", "aoc_glow_ring_lg.png"),
    "_.png": ("public", "overlays", "aoc_spotlight_pool.png"),
    "aoc_disabled_haze_overlay_png.png": ("public", "overlays", "aoc_disabled_haze_overlay.png"),

    # Particles (Public)
    "asset_12.png": ("public", "overlays", "aoc_particle_note_1.png"), # Updated
    "aoc_particle_note_2.png": ("public", "overlays", "aoc_particle_note_2.png"),
    "aoc_particle_note_3.png": ("public", "overlays", "aoc_particle_note_3.png"),
    "asset_13.png": ("public", "overlays", "aoc_particle_note_4.png"), # Updated
    "aoc_particle_note_s.png": ("public", "overlays", "aoc_particle_note_5.png"),
    "aoc_particle_note_6.png": ("public", "overlays", "aoc_particle_note_6.png"),
    "aoc_particle_note_7.png": ("public", "overlays", "aoc_particle_note_7.png"),
    "aoc_particle_note_8.png": ("public", "overlays", "aoc_particle_note_8.png"),
}

for src, (base, subdir, dst) in mapping.items():
    src_path = os.path.join(sliced_dir, src)
    if base == "src":
        base_path = target_base
    else:
        base_path = public_base
        
    dst_path = os.path.join(base_path, subdir, dst)
    
    if os.path.exists(src_path):
        print(f"Moving {src} -> {base}/{subdir}/{dst}")
        shutil.copy2(src_path, dst_path)
    else:
        print(f"Warning: Source {src} not found")

print("Done moving assets")
