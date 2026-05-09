from PIL import Image

# Load the source image
src_path = "/Users/hattymallick/.gemini/antigravity/brain/b0d924f6-b813-438e-81cc-29ebc603a736/media__1776914362752.png"
img = Image.open(src_path).convert("L") # Convert to grayscale for alpha map

width, height = img.size

# Create White version
white_img = Image.new("RGBA", (width, height))
white_data = []

# SS Plumbing Orange: #F24C27 (242, 76, 39)
orange_img = Image.new("RGBA", (width, height))
orange_data = []

for y in range(height):
    for x in range(width):
        alpha = img.getpixel((x, y))
        white_data.append((255, 255, 255, alpha))
        orange_data.append((242, 76, 39, alpha))

white_img.putdata(white_data)
orange_img.putdata(orange_data)

# Ensure assets dir exists
import os
os.makedirs("assets", exist_ok=True)

# Save the original ss_white.png and ss_org.png (overwriting them or naming them new)
white_img.save("assets/ss_white_new.png")
orange_img.save("assets/ss_org_new.png")
print("Logos processed successfully.")
