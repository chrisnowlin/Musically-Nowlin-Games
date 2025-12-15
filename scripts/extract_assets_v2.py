
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
bg_color = img[0, 0]
lower_bound = np.maximum(bg_color - 20, 0)
upper_bound = np.minimum(bg_color + 20, 255)
mask = cv2.inRange(img, lower_bound, upper_bound)
alpha_mask = cv2.bitwise_not(mask)
kernel = np.ones((3,3), np.uint8)
alpha_mask = cv2.morphologyEx(alpha_mask, cv2.MORPH_OPEN, kernel)
b, g, r = cv2.split(img)
rgba = cv2.merge([b, g, r, alpha_mask])

# Find contours
contours, _ = cv2.findContours(alpha_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
min_area = 500
valid_contours = [c for c in contours if cv2.contourArea(c) > min_area]
boxes = [cv2.boundingRect(c) for c in valid_contours]
boxes.sort(key=lambda b: b[1]) # Sort by Y

# Robust row grouping
rows = []
current_row = []
if boxes:
    current_row_y = boxes[0][1]
    current_row_h = boxes[0][3]
    for box in boxes:
        x, y, w, h = box
        if y > current_row_y + current_row_h * 0.5:
            current_row.sort(key=lambda b: b[0])
            rows.append(current_row)
            current_row = [box]
            current_row_y = y
            current_row_h = h
        else:
            current_row.append(box)
            current_row_h = max(current_row_h, h)
    if current_row:
        current_row.sort(key=lambda b: b[0])
        rows.append(current_row)

def save_crop(box, rel_path):
    x, y, w, h = box
    crop = rgba[y:y+h, x:x+w]
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    cv2.imwrite(full_path, crop)
    print(f"Saved {rel_path}")

# Extract Assets based on identified structure

# Row 0: Chairs/Stands
if len(rows) > 0:
    r = rows[0]
    items = [
        "seating/aoc_chair.png",
        "seating/aoc_chair_selected_overlay.png",
        "seating/aoc_chair_playing_overlay.png",
        "seating/aoc_music_stand.png",
        "seating/aoc_music_stand_highlight_overlay.png"
    ]
    for i, path in enumerate(items):
        if i < len(r): save_crop(r[i], path)

# Row 2: Glows/Overlays
if len(rows) > 2:
    r = rows[2]
    items = [
        "overlays/aoc_glow_ring_sm.png",
        "overlays/aoc_glow_ring_md.png",
        "overlays/aoc_glow_ring_lg.png",
        "overlays/aoc_spotlight_pool.png",
        "overlays/aoc_disabled_haze_overlay.png"
    ]
    for i, path in enumerate(items):
        if i < len(r): save_crop(r[i], path)

# Row 4: Notes 1-4 + Guide 1
if len(rows) > 4:
    r = rows[4]
    notes = ["overlays/aoc_particle_note_1.png", "overlays/aoc_particle_note_2.png", "overlays/aoc_particle_note_3.png", "overlays/aoc_particle_note_4.png"]
    for i, path in enumerate(notes):
        if i < len(r): save_crop(r[i], path)
    if len(r) > 4:
        save_crop(r[4], "seating/aoc_seating_row_1.png")

# Row 6: Guide 2
if len(rows) > 6:
    r = rows[6]
    if len(r) > 4: # The guide is the 5th item (index 4)
        save_crop(r[4], "seating/aoc_seating_row_2.png")

# Row 7: Notes 5-8 + Guide 3 + Guide 4
if len(rows) > 7:
    r = rows[7]
    notes = ["overlays/aoc_particle_note_5.png", "overlays/aoc_particle_note_6.png", "overlays/aoc_particle_note_7.png", "overlays/aoc_particle_note_8.png"]
    for i, path in enumerate(notes):
        if i < len(r): save_crop(r[i], path)
    if len(r) > 4:
        save_crop(r[4], "seating/aoc_seating_row_3.png")
    if len(r) > 5:
        save_crop(r[5], "seating/aoc_seating_row_4.png")
