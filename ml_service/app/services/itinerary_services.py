import requests
import os

def get_places(city, activity, exclude_places=None):
    try :
        if activity == "not_sure":
            tag_filter = 'node["tourism"](area.searchArea);'
        else:
            tag_filter = f'node["tourism"="{activity}"](area.searchArea);\n        node["amenity"="{activity}"](area.searchArea);'

        query = f"""
        [out:json];
        area[name="{city}"]->.searchArea;
        (
        {tag_filter}
        );
        out;
        """

        url = os.getenv("OVERPASS_API_URL")
        response = requests.post(url, data=query)
        if not response.text:
            print("Error: API returned an empty response")
            return []
        data = response.json()

        excluded = {p.strip().lower() for p in (exclude_places or []) if p and p.strip()}

        places = []
        for el in data["elements"]:
            name = el.get("tags", {}).get("name", "Unknown")
            if name.strip().lower() in excluded:
                continue
            places.append({
                "name": name,
                "lat": el["lat"],
                "lon": el["lon"]
            })
            if len(places) >= 8:
                break

        return places
    except Exception as e :
        print("error", e)
        return []

def get_distance_matrix(places):
    if len(places) < 2:
        print("Not enough places to calculate distance matrix")
        return []
    try :
        coords = ";".join([f"{p['lon']},{p['lat']}" for p in places])
        url = f'{os.getenv("DISTANCE_MATRIX_API")}{coords}'

        res = requests.get(url).json()

        if "durations" not in res:
            raise Exception(f"OSRM error: {res}")
        # print(res)
        return res["durations"]
    except Exception as e:
        print("Error", e)