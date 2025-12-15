
import os
import shutil

sliced_dir = "sliced_assets"
target_dir = "client/public/aoc/stage"

os.makedirs(target_dir, exist_ok=True)

# Mapping based on 2x2 grid assumption
# 0: TL, 1: TR, 2: BL, 3: BR
# Guessing:
# 0 -> Backwall
# 2 -> Floor
# 1 -> Spotlight?
# 3 -> Vignette?

mapping = {
    "sy.png": "aoc_stage_backwall.png", # Object 0
    "_aeon__loe_eee_ee_ofan_ae_eee_ee._bess_eee7a_ee_ee2_nen_a.png": "aoc_stage_overlay_1.png", # Object 1
    "asset_2.png": "aoc_stage_floor.png", # Object 2
    "asset_3.png": "aoc_stage_overlay_2.png", # Object 3
}

for src, dst in mapping.items():
    src_path = os.path.join(sliced_dir, src)
    dst_path = os.path.join(target_dir, dst)
    
    if os.path.exists(src_path):
        print(f"Moving {src} -> {dst}")
        shutil.copy2(src_path, dst_path)
    else:
        print(f"Warning: {src} not found")
        
print("Stage assets deployed")
