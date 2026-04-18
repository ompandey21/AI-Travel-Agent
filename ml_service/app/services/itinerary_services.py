import requests
import os

def get_places(city, activity):
    try :
        query = f"""
        [out:json];
        area[name="{city}"]->.searchArea;
        (
        node["tourism"="{activity}"](area.searchArea);
        node["amenity"="{activity}"](area.searchArea);
        );
        out;
        """

        url = os.getenv("OVERPASS_API_URL")
        response = requests.post(url, data=query)
        if not response.text:
            print("Error: API returned an empty response")
            return []
        data = response.json()

        places = []
        for el in data["elements"][:8]:
            places.append({
                "name": el.get("tags", {}).get("name", "Unknown"),
                "lat": el["lat"],
                "lon": el["lon"]
            })

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