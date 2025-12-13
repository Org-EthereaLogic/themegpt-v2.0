from PIL import Image
import os

def create_wink_gif(base_path, wink_path, output_path, open_duration=2800, wink_duration=200):
    try:
        # Load images
        if not os.path.exists(base_path):
            print(f"Error: Base image not found at {base_path}")
            return
        
        base_img = Image.open(base_path)
        
        if os.path.exists(wink_path):
            wink_img = Image.open(wink_path)
        else:
            print(f"Warning: Wink image not found at {wink_path}. Using base image for both frames (no animation).")
            wink_img = base_img

        # Ensure same size and mode
        if base_img.size != wink_img.size:
            wink_img = wink_img.resize(base_img.size)
        
        if base_img.mode != wink_img.mode:
            wink_img = wink_img.convert(base_img.mode)

        # Create frames
        # Frame 1: Open eyes (long duration)
        # Frame 2: Closed eye (short duration)
        frames = [base_img, wink_img]
        duration = [open_duration, wink_duration]

        # Save as GIF
        base_img.save(
            output_path,
            save_all=True,
            append_images=[wink_img],
            duration=duration,
            loop=0,
            disposal=2  # Restore to background color
        )
        print(f"Successfully created GIF at {output_path}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    BASE_IMG = "asset/icons/logo-512.png"
    WINK_IMG = "asset/logo-wink.png"  # This file needs to be provided or generated
    OUTPUT_GIF = "asset/logo-animated.gif"
    
    # Run from project root or ensure paths are correct
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(script_dir)
    
    # Adjust paths if running from asset dir vs root
    if os.getcwd().endswith("asset"):
        BASE_IMG = "icons/logo-512.png"
        WINK_IMG = "logo-wink.png"
        OUTPUT_GIF = "logo-animated.gif"

    create_wink_gif(BASE_IMG, WINK_IMG, OUTPUT_GIF)
