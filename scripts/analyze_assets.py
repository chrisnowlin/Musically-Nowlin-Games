
import cv2
import numpy as np
import os

image_path = "/Users/cnowlin/.cursor/projects/Users-cnowlin-Developer-Musically-Nowlin-Games/assets/Gemini_Generated_Image_kxjrvnkxjrvnkxjr-ea89c400-b3c3-4bd2-9f21-9a914455af89.png"

# Load image
img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)

# Check if image loaded
if img is None:
    print(f"Error: Could not load image at {image_path}")
    exit(1)

# Extract alpha channel
if img.shape[2] == 4:
    alpha = img[:, :, 3]
else:
    print("Image has no alpha channel, assuming black background or needing manual slicing")
    # For now, let's assume transparency. If not, we might need thresholding.
    # Create a dummy alpha based on brightness? No, let's stick to alpha for now.
    exit(1)

# Threshold alpha to get binary mask
_, thresh = cv2.threshold(alpha, 10, 255, cv2.THRESH_BINARY)

# Find contours
contours, hierarchy = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

print(f"Found {len(contours)} contours")

# Filter small contours
min_area = 100
valid_contours = [c for c in contours if cv2.contourArea(c) > min_area]

print(f"Found {len(valid_contours)} valid contours > {min_area}px area")

# Sort contours by position (top-to-bottom, then left-to-right) to help identify them
# Bounding rect: x, y, w, h
boxes = [cv2.boundingRect(c) for c in valid_contours]

# Sort by y (with some tolerance) then x
# This is a bit tricky, but let's just print them for now
for i, box in enumerate(boxes):
    x, y, w, h = box
    print(f"Box {i}: x={x}, y={y}, w={w}, h={h}")

# Determine if we can map these to the expected assets
