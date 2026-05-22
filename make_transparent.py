import os
from PIL import Image

def make_background_transparent(image_path, output_path):
    if not os.path.exists(image_path):
        print(f"File not found: {image_path}")
        return
        
    img = Image.open(image_path).convert("RGBA")
    data = img.load()
    width, height = img.size
    
    visited = set()
    queue = []
    
    # Add all edge pixels as seeds for flood fill
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))
        
    def is_white(color):
        r, g, b, a = color
        # Matches pixels that are very close to pure white (background)
        return r > 240 and g > 240 and b > 240
        
    # BFS Flood fill
    while queue:
        x, y = queue.pop(0)
        if (x, y) in visited:
            continue
        if 0 <= x < width and 0 <= y < height:
            color = data[x, y]
            if is_white(color):
                visited.add((x, y))
                # Set pixel to fully transparent
                data[x, y] = (color[0], color[1], color[2], 0)
                
                # Check 4-connected neighbors
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                        # Only push if it fits white criteria
                        neighbor_color = data[nx, ny]
                        if is_white(neighbor_color):
                            queue.append((nx, ny))
                            
    img.save(output_path, "PNG")
    print(f"Successfully processed {image_path} -> {output_path}")

if __name__ == "__main__":
    make_background_transparent("src/assets/mascot.png", "src/assets/mascot.png")
    make_background_transparent("src/assets/mascot_thumbsup.png", "src/assets/mascot_thumbsup.png")
