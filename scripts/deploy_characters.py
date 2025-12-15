
import os
import shutil
import cv2

sliced_dir = "sliced_assets"
target_dir = "client/public/aoc/characters"

os.makedirs(target_dir, exist_ok=True)

ordered_names = [
    "aoc_character_violin.png",
    "aoc_character_violin_alt.png",
    "aoc_character_viola.png",
    "aoc_character_cello.png",
    "aoc_character_double_bass.png",
    
    "aoc_character_flute.png",
    "aoc_character_oboe.png",
    "aoc_character_clarinet.png",
    "aoc_character_bassoon.png",
    
    "aoc_character_trumpet.png",
    "aoc_character_french_horn.png",
    "aoc_character_trombone.png",
    "aoc_character_tuba.png",
    
    "aoc_character_timpani.png",
    "aoc_character_snare_drum.png",
    "aoc_character_bass_drum.png",
    "aoc_character_glockenspiel.png",
    "aoc_character_xylophone.png"
]

files = [f for f in os.listdir(sliced_dir) if f.endswith(".png")]

# Get sizes
file_stats = []
for f in files:
    path = os.path.join(sliced_dir, f)
    size = os.path.getsize(path)
    # Extract index for sorting
    idx = int(f.split('_')[1].split('.')[0]) if 'asset' in f else 999
    file_stats.append({'file': f, 'size': size, 'idx': idx})

# Sort by size desc to find candidates
file_stats.sort(key=lambda x: x['size'], reverse=True)

# Take top 18
candidates = file_stats[:18]

# Sort candidates by Index (Y-order) to match ordered_names
candidates.sort(key=lambda x: x['idx'])

print(f"Selected {len(candidates)} candidates based on size")

for i, cand in enumerate(candidates):
    src = cand['file']
    if i < len(ordered_names):
        dst = ordered_names[i]
        shutil.copy2(os.path.join(sliced_dir, src), os.path.join(target_dir, dst))
        print(f"Deployed {src} ({cand['size']} bytes) -> {dst}")
    else:
        print(f"Extra file {src} ignored")
