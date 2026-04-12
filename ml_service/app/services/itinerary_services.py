import requests

def get_places(city, activity):
    query = f"""
    [out:json];
    area[name="{city}"]->.searchArea;
    (
      node["tourism"="{activity}"](area.searchArea);
      node["amenity"="{activity}"](area.searchArea);
    );
    out;
    """

    url = "http://overpass-api.de/api/interpreter"
    response = requests.post(url, data=query)
    data = response.json()

    places = []
    for el in data["elements"][:8]:
        places.append({
            "name": el.get("tags", {}).get("name", "Unknown"),
            "lat": el["lat"],
            "lon": el["lon"]
        })

    return places

def get_distance_matrix(places):
    coords = ";".join([f"{p['lon']},{p['lat']}" for p in places])
    url = f"http://router.project-osrm.org/table/v1/driving/{coords}"

    res = requests.get(url).json()
    return res["durations"]