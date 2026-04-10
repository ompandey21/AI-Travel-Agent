from groq import Groq
import os
import json


def create_plan(places, matrix):
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    prompt = f"""
            You are a travel planner AI.

            Create a full-day itinerary (9 AM - 9 PM).

            Places:
            {places}

            Distance Matrix:    
            {matrix}

            STRICT RULES:
            - Return ONLY valid JSON
            - No explanation
            - No code
            - No text outside JSON
            - Use this format:

            {{
            "day_plan": [
                {{
                "time": "9:00 AM",
                "place": "Place name",
                "activity": "type",
                "duration": "1 hour"
                }}
            ]
            }}

            - Ensure logical order (min travel time)
            - Include lunch and dinner

            ONLY RETURN JSON.
            """

    response = client.chat.completions.create(
        model = "llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content



def extract_json(text):
    try:
        start = text.find("{")
        end = text.rfind("}") + 1
        clean_text = text[start:end]
        return json.loads(clean_text)
    except Exception:
        return {"error": "Failed to parse", "raw": text}