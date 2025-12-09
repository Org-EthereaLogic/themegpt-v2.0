import numpy as np
from PIL import Image, ImageDraw
import os

def generate_wink_frame(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    # Convert to numpy array for analysis
    arr = np.array(img)
    
    # Image dimensions
    h, w = arr.shape[:2]
    
    # Target area: Right Eye (Viewer's right side, so x > w/2)
    # And usually in the upper half (y < h/2), but let's say y < h*0.6
    # We look for a dark patch.
    
    # Define search region
    start_x = int(w * 0.55)
    end_x = int(w * 0.85)
    start_y = int(h * 0.25)
    end_y = int(h * 0.55)
    
    # Extract channel data (assuming dark eye on light background)
    # Sum of R+G+B. Dark = low sum.
    region = arr[start_y:end_y, start_x:end_x]
    rgb_sum = np.sum(region[:, :, :3], axis=2)
    
    # Threshold for "dark" (eye)
    # refined heuristic: find darkest spot
    min_val = np.min(rgb_sum)
    # coordinates of darkest spot in region
    y_min, x_min = np.where(rgb_sum == min_val)
    
    # Take the center of the dark blob
    cy_local = int(np.mean(y_min))
    cx_local = int(np.mean(x_min))
    
    eye_cy = start_y + cy_local
    eye_cx = start_x + cx_local
    
    print(f"Found eye center estimate at: {eye_cx}, {eye_cy}")
    
    # Sample skin color from nearby (e.g. 50 pixels to the left of the eye center, to avoid edge of face)
    # Or just check pixels around the detected center until we hit a light color
    
    # Let's sample a few points around the estimated eye center and pick the mode or average of bright colors
    # Heuristic: verify pixel at (eye_cx - 40, eye_cy) is not dark
    
    sample_x = eye_cx - 60
    sample_y = eye_cy
    
    skin_color = img.getpixel((sample_x, sample_y))
    print(f"Sampled skin color at ({sample_x}, {sample_y}): {skin_color}")
    
    # Setup Draw
    draw = ImageDraw.Draw(img)
    
    # Draw a patch to cover the open eye
    # Circle radius? Estimate from blob size or just fixed per 512px image
    # A 512px icon, eye is probably ~40-60px radius
    patch_radius = 45 
    
    draw.ellipse(
        (eye_cx - patch_radius, eye_cy - patch_radius, 
         eye_cx + patch_radius, eye_cy + patch_radius),
        fill=skin_color,
        outline=skin_color
    )
    
    # Draw the wink (arc)
    # A simple arc or thick line
    wink_color = (0, 0, 0, 255) # Black
    
    # Arc bounding box slightly wider than the patch
    arc_bbox = (
        eye_cx - patch_radius + 5, 
        eye_cy - patch_radius + 15, 
        eye_cx + patch_radius - 5, 
        eye_cy + patch_radius - 15
    )
    
    # Draw arc: start=0, end=180 is bottom half. We want a "U" shape or inverted "U"?
    # Happy wink is inverted U (convex up)? Or just a dash?
    # Usually a wink matches the curve of the bottom eyelid or is a caret ^
    # Let's do a thick line for a simple wink ;-)
    
    # Coordinates for a checkmark or curve
    # Let's do a happy closed eye (curve down)
    
    draw.arc(arc_bbox, start=10, end=170, fill=wink_color, width=8)
    
    img.save(output_path)
    print(f"Saved wink frame to {output_path}")

if __name__ == "__main__":
    # Install dependencies if needed: pip install Pillow numpy
    base_img = "asset/icons/logo-512.png"
    output_img = "asset/logo-wink.png"
    
    if os.path.exists(base_img):
        generate_wink_frame(base_img, output_img)
    else:
        print("Base image not found!")
