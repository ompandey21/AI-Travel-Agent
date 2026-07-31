from groq import Groq
import os
import json


def create_plan(city, activity, places, matrix):
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    prompt = f"""
            You are an expert Travel Planner AI.

            Your task is to generate an optimized one-day itinerary for visitors.

            INPUT

            City:
            {city}

            Activity Type:
            {activity}

            Available Places:
            {places}

            Distance Matrix:
            {matrix}

            INSTRUCTIONS

            1. Use ONLY the places provided in the Available Places list.
            2. Use the Distance Matrix to arrange places in an efficient route with minimal travel time.
            3. Avoid revisiting the same place.
            4. Create a realistic itinerary from 9:00 AM to 9:00 PM.
            5. Include travel considerations when deciding the order of places.
            6. Include:
            - Lunch between 12:00 PM and 2:00 PM
            - Dinner between 7:00 PM and 9:00 PM
            7. Assign realistic visit durations.
            8. Prioritize popular and relevant places for the selected activity type.
            9. If fewer places are available, still generate the best possible itinerary using all available places.
            10. Ensure chronological order of events.

            OUTPUT FORMAT

            Return ONLY valid JSON.

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

            VALIDATION CHECKS

            - Output must be valid JSON.
            - Do not return markdown.
            - Do not return code fences.
            - Do not return explanations.
            - Do not return notes.
            - Do not return any text before or after the JSON.
            - The response must start with '{{' and end with '}}'.

            Generate the itinerary now.
            ONLY RETURN JSON.
            """

    response = client.chat.completions.create(
        model = "llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content



def extract_json(text):
    try:
        start = text.find("{")
        end = text.rfind("}") + 1
        clean_text = text[start:end]
        return json.loads(clean_text)
    except Exception as e:
        return {"error": f"JSON Parse Error: {str(e)}", "raw": text}