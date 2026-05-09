import urllib.request, json

url = "https://nominatim.openstreetmap.org/search?state=Manitoba&country=Canada&format=json&polygon_geojson=1"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        if data and 'geojson' in data[0]:
            coords = data[0]['geojson']['coordinates'][0] # usually a Polygon
            if data[0]['geojson']['type'] == 'MultiPolygon':
                # find biggest polygon
                largest = max(data[0]['geojson']['coordinates'], key=lambda x: len(x[0]))
                coords = largest[0]
            
            # coords are [lon, lat]
            # Manitoba is roughly: lon -102 to -89, lat 49 to 60
            
            # Map them to a 24x24 box for Path2D standard
            lons = [c[0] for c in coords]
            lats = [c[1] for c in coords]
            min_lon, max_lon = min(lons), max(lons)
            min_lat, max_lat = min(lats), max(lats)
            
            w = max_lon - min_lon
            h = max_lat - min_lat
            
            # We want to fit it in 0..24
            path = []
            for i, c in enumerate(coords):
                # SVG y is inverted from lat
                # scale to max 24
                scaleX = 24 / w
                scaleY = 24 / h
                scale = min(scaleX, scaleY)
                
                # Center it
                x = (c[0] - min_lon) * scale
                y = (max_lat - c[1]) * scale # invert y
                
                # Offset to center it inside 0..24
                offsetX = (24 - w*scale) / 2
                offsetY = (24 - h*scale) / 2
                x += offsetX
                y += offsetY
                
                if i == 0:
                    path.append(f"M {x:.2f} {y:.2f}")
                else:
                    path.append(f"L {x:.2f} {y:.2f}")
            path.append("Z")
            print("Path2D data:")
            print(" ".join(path))
except Exception as e:
    print(f"Error: {e}")
