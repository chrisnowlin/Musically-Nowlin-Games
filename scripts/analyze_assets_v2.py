
import cv2
import numpy as np
import os

image_path = "/Users/cnowlin/.cursor/projects/Users-cnowlin-Developer-Musically-Nowlin-Games/assets/Gemini_Generated_Image_kxjrvnkxjrvnkxjr-ea89c400-b3c3-4bd2-9f21-9a914455af89.png"

# Load image
img = cv2.imread(image_path)

if img is None:
    print(f"Error: Could not load image at {image_path}")
    exit(1)

# Sample background color from top-left
bg_color = img[0, 0]
print(f"Background color: {bg_color}")

# Calculate difference from background
diff = cv2.absdiff(img, bg_color)
gray_diff = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)

# Threshold
_, thresh = cv2.threshold(gray_diff, 10, 255, cv2.THRESH_BINARY)

# Find contours
contours, hierarchy = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

min_area = 500  # Increased threshold as these are likely decent sized icons
valid_contours = [c for c in contours if cv2.contourArea(c) > min_area]

print(f"Found {len(valid_contours)} valid contours")

# Get bounding boxes
boxes = [cv2.boundingRect(c) for c in valid_contours]

# Sort boxes
# We want to sort them roughly by row then column to match the visual layout
# Sort by y first
boxes.sort(key=lambda b: b[1])

# Group into rows
rows = []
current_row = []
if boxes:
    current_row_y = boxes[0][1]
    current_row_h = boxes[0][3]
    
    for box in boxes:
        x, y, w, h = box
        # If this box is significantly lower than the current row, start a new row
        if y > current_row_y + current_row_h * 0.5:
            # Sort current row by x
            current_row.sort(key=lambda b: b[0])
            rows.append(current_row)
            current_row = [box]
            current_row_y = y
            current_row_h = h
        else:
            current_row.append(box)
            # Update row height/y to be robust
            current_row_h = max(current_row_h, h)

    # Append last row
    if current_row:
        current_row.sort(key=lambda b: b[0])
        rows.append(current_row)

print(f"Found {len(rows)} rows of items")

total_items = 0
for r_idx, row in enumerate(rows):
    print(f"Row {r_idx}: {len(row)} items")
    for i, box in enumerate(row):
        print(f"  Item {i}: {box}")
    total_items += len(row)

print(f"Total items found: {total_items}")
