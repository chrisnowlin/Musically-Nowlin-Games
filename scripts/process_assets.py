
import cv2
import numpy as np
import pytesseract
import os

image_path = "/Users/cnowlin/.cursor/projects/Users-cnowlin-Developer-Musically-Nowlin-Games/assets/Gemini_Generated_Image_6n21zi6n21zi6n21-d0bfe0f8-34f1-405f-b1e2-82cbf75f916b.png"
output_dir = "sliced_assets"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
if img is None:
    exit(1)

# Check alpha
if img.shape[2] == 4:
    print("Alpha channel detected")
    b, g, r, a = cv2.split(img)
    object_mask = a
    img_bgr = cv2.merge([b, g, r])
else:
    print("No alpha channel, using color detection")
    img_bgr = img
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    corners = np.concatenate([img[0,:], img[-1,:], img[:,0], img[:,-1]])
    bg_color = np.median(corners, axis=0).astype(np.uint8)
    print(f"Background color (BGR): {bg_color}")

    h, w = img.shape[:2]
    mask = np.zeros((h+2, w+2), np.uint8)
    img_flood = img.copy()
    # Tolerance increased to handle checkerboard patterns
    tolerance = (40, 40, 40)
    cv2.floodFill(img_flood, mask, (0,0), (255, 255, 255), tolerance, tolerance, flags=8 | (255 << 8) | cv2.FLOODFILL_MASK_ONLY)
    bg_mask = mask[1:-1, 1:-1]
    object_mask = cv2.bitwise_not(bg_mask)
    
    kernel = np.ones((5,5), np.uint8) # Increased kernel size
    object_mask = cv2.morphologyEx(object_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    object_mask = cv2.morphologyEx(object_mask, cv2.MORPH_OPEN, kernel, iterations=1) # Remove small noise

contours, _ = cv2.findContours(object_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

boxes = []
for cnt in contours:
    x, y, w, h = cv2.boundingRect(cnt)
    if w * h > 500: # Decreased size threshold
        boxes.append((x, y, w, h))

boxes.sort(key=lambda b: (b[1], b[0]))

# Existing merge logic
merged_boxes = []
while boxes:
    b = boxes.pop(0)
    x, y, w, h = b
    merged = True
    while merged:
        merged = False
        rest = []
        for b2 in boxes:
            x2, y2, w2, h2 = b2
            x_overlap = max(0, min(x + w, x2 + w2) - max(x, x2))
            if y2 > y: y_dist = y2 - (y + h)
            else: y_dist = y - (y2 + h2)
            
            # Reduced vertical merge distance to avoid merging rows
            if y_dist < 15 and x_overlap > min(w, w2) * 0.5:
                min_x = min(x, x2)
                min_y = min(y, y2)
                max_x = max(x + w, x2 + w2)
                max_y = max(y + h, y2 + h2)
                x, y, w, h = min_x, min_y, max_x - min_x, max_y - min_y
                merged = True
            else:
                rest.append(b2)
        boxes = rest
    merged_boxes.append((x, y, w, h))

boxes = merged_boxes
print(f"Found {len(boxes)} objects")

for i, (x, y, w, h) in enumerate(boxes):
    roi_bgr = img_bgr[y:y+h, x:x+w]
    roi_mask = object_mask[y:y+h, x:x+w]
    
    # Text detection
    split_y = int(h * 0.8) # 80% split
    if h - split_y < 10:
        split_y = max(0, h - 30)
        
    text_roi = roi_bgr[split_y:, :]
    
    text = ""
    if text_roi.size > 0 and text_roi.shape[0] > 5:
        text_gray = cv2.cvtColor(text_roi, cv2.COLOR_BGR2GRAY)
        _, text_thresh = cv2.threshold(text_gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        custom_config = r'--oem 3 --psm 6'
        try:
            text = pytesseract.image_to_string(text_thresh, config=custom_config).strip()
        except:
            pass
    
    filename = text.replace(" ", "_").lower()
    filename = "".join(c for c in filename if c.isalnum() or c in "._-")
    
    if not filename.endswith(".png"):
        filename += ".png"
    
    if len(filename) < 8 or "character" not in filename: # Heuristic for these specific assets
        filename = f"asset_{i}.png"
        
    print(f"Object {i}: {filename} (from '{text}')")
    
    b, g, r = cv2.split(roi_bgr)
    alpha = roi_mask.copy()
    rgba = cv2.merge([b, g, r, alpha])
    
    save_path = os.path.join(output_dir, filename)
    cv2.imwrite(save_path, rgba)

print("Done processing")
