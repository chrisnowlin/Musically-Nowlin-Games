
import cv2
import numpy as np
import os

image_path = "/Users/cnowlin/.cursor/projects/Users-cnowlin-Developer-Musically-Nowlin-Games/assets/Gemini_Generated_Image_kxjrvnkxjrvnkxjr-ea89c400-b3c3-4bd2-9f21-9a914455af89.png"
base_dir = "/Users/cnowlin/Developer/Musically-Nowlin-Games/client/src/assets/aoc"

# Load image
img = cv2.imread(image_path)
if img is None:
    print("Error loading image")
    exit(1)

# Background removal
bg_color = img[0, 0] # [76, 81, 80]
lower_bound = np.maximum(bg_color - 20, 0)
upper_bound = np.minimum(bg_color + 20, 255)
mask = cv2.inRange(img, lower_bound, upper_bound)
# Invert mask: background is 255 in mask, we want background to be 0 alpha
alpha_mask = cv2.bitwise_not(mask)

# Refine mask to remove noise
kernel = np.ones((3,3), np.uint8)
alpha_mask = cv2.morphologyEx(alpha_mask, cv2.MORPH_OPEN, kernel)

# Create RGBA image
b, g, r = cv2.split(img)
rgba = cv2.merge([b, g, r, alpha_mask])

# Find contours on mask
contours, _ = cv2.findContours(alpha_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Filter valid contours
min_height = 50
valid_boxes = []
for c in contours:
    x, y, w, h = cv2.boundingRect(c)
    if h > min_height:
        valid_boxes.append((x, y, w, h))

# Sort boxes by Y
valid_boxes.sort(key=lambda b: b[1])

# Categorize
row1 = [] # Chairs/Stands
row2 = [] # Glows/Spotlight
notes = [] # Notes (Left side)
guides = [] # Guides (Right side)

# Helper to group by Y
def group_by_y(boxes, threshold=100):
    rows = []
    current_row = []
    if not boxes: return rows
    
    current_y = boxes[0][1]
    
    for box in boxes:
        if box[1] > current_y + threshold:
            rows.append(current_row)
            current_row = [box]
            current_y = box[1]
        else:
            current_row.append(box)
    if current_row:
        rows.append(current_row)
    return rows

rows = group_by_y(valid_boxes)

# Map rows to categories
# Row 0: 5 items
if len(rows) > 0:
    row1 = sorted(rows[0], key=lambda b: b[0])

# Row 1: 5 items
if len(rows) > 1:
    row2 = sorted(rows[1], key=lambda b: b[0])

# Remaining rows are mixed notes and guides
remaining = []
for r in rows[2:]:
    remaining.extend(r)

# Split remaining by X coordinate
for box in remaining:
    if box[0] < 1200:
        notes.append(box)
    else:
        guides.append(box)

# Sort notes and guides
notes.sort(key=lambda b: (b[1] // 100, b[0])) # Sort by rough row then X
guides.sort(key=lambda b: b[1]) # Sort by Y

print(f"Row 1 (Chairs): {len(row1)}")
print(f"Row 2 (Glows): {len(row2)}")
print(f"Notes: {len(notes)}")
print(f"Guides: {len(guides)}")

# Define filenames
filenames_row1 = [
    "seating/aoc_chair.png",
    "seating/aoc_chair_selected_overlay.png",
    "seating/aoc_chair_playing_overlay.png",
    "seating/aoc_music_stand.png",
    "seating/aoc_music_stand_highlight_overlay.png"
]

filenames_row2 = [
    "overlays/aoc_glow_ring_sm.png",
    "overlays/aoc_glow_ring_md.png",
    "overlays/aoc_glow_ring_lg.png",
    "overlays/aoc_spotlight_pool.png",
    "overlays/aoc_disabled_haze_overlay.png"
]

filenames_notes = [f"overlays/aoc_particle_note_{i+1}.png" for i in range(8)]
filenames_guides = [f"seating/aoc_seating_row_{i+1}.png" for i in range(4)]

# Save function
def save_crop(box, rel_path):
    x, y, w, h = box
    crop = rgba[y:y+h, x:x+w]
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    cv2.imwrite(full_path, crop)
    print(f"Saved {rel_path}")

# Execute save
for i, box in enumerate(row1):
    if i < len(filenames_row1):
        save_crop(box, filenames_row1[i])

for i, box in enumerate(row2):
    if i < len(filenames_row2):
        save_crop(box, filenames_row2[i])

for i, box in enumerate(notes):
    if i < len(filenames_notes):
        save_crop(box, filenames_notes[i])

for i, box in enumerate(guides):
    if i < len(filenames_guides):
        save_crop(box, filenames_guides[i])

