import sys
from PIL import Image, ImageDraw

def remove_background(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    
    unique_color = (255, 0, 255, 255) # Magenta
    
    # Flood fill from the 4 corners
    ImageDraw.floodfill(img, xy=(0, 0), value=unique_color, thresh=50)
    ImageDraw.floodfill(img, xy=(img.width-1, 0), value=unique_color, thresh=50)
    ImageDraw.floodfill(img, xy=(0, img.height-1), value=unique_color, thresh=50)
    ImageDraw.floodfill(img, xy=(img.width-1, img.height-1), value=unique_color, thresh=50)
    
    data = img.getdata()
    new_data = []
    for item in data:
        if item == unique_color:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    
    img.putdata(new_data)
    img.save(output_path, "PNG")

try:
    in_path = r"C:\Users\Asus\.gemini\antigravity\brain\339bdc2d-3beb-4d85-a964-c7a95e1b7ee4\media__1787251446638.png"
    out_path = r"c:\Users\Asus\Downloads\chilliensnftlandingpage\assets\logo.png"
    remove_background(in_path, out_path)
    print("Done")
except Exception as e:
    print(f"Error: {e}")
