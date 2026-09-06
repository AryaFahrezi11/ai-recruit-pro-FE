from PIL import Image
import numpy as np

def convert_white_to_transparent(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # Extract RGB channels
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # White background mask (near pure white pixels)
    white_mask = (r > 235) & (g > 235) & (b > 235)
    
    # Set alpha of white background to 0 (transparent)
    data[:, :, 3][white_mask] = 0
    
    result = Image.fromarray(data)
    result.save(output_path, "PNG")
    print(f"Successfully saved transparent PNG to {output_path}")

if __name__ == "__main__":
    convert_white_to_transparent("c:/ai-recruit-pro-FE/public/feature_model.jpg", "c:/ai-recruit-pro-FE/public/feature_model.png")
