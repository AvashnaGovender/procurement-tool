import cv2

# Load image
img = cv2.imread("test.png-1.png", 0)

# Threshold
_, thresh = cv2.threshold(img, 150, 255, cv2.THRESH_BINARY_INV)

# Find contours
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Filter likely signature regions
for c in contours:
    x,y,w,h = cv2.boundingRect(c)
    if 50 < w < 300 and 20 < h < 100:  # heuristic signature size
        cv2.rectangle(img, (x,y), (x+w, y+h), (0,255,0), 2)

cv2.imwrite("check3.png", img)
