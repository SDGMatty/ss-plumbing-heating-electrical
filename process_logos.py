from PIL import Image
import glob
import math

def process_image(filepath):
    img = Image.open(filepath).convert("RGBA")
    data = img.getdata()
    new_data = []
    
    for item in data:
        r, g, b, a = item
        dist_from_white = math.sqrt((255-r)**2 + (255-g)**2 + (255-b)**2)
        
        if dist_from_white < 15:
            new_data.append((255, 255, 255, 0)) # Pure transparent background
        else:
            if dist_from_white > 80:
                alpha = 255
            else:
                alpha = int(((dist_from_white - 15) / 65) * 255)
            new_data.append((255, 255, 255, alpha))

    img.putdata(new_data)
    img.save(filepath)

for file in glob.glob("assets/brand-*.png"):
    print("Processing", file)
    process_image(file)
