from fastapi import APIRouter
from app.services.itinerary_services import get_places, get_distance_matrix
from app.services.itinerary_planner import create_plan, extract_json
from pydantic import BaseModel

router = APIRouter()

class SlotRequest(BaseModel):
    city: str
    activity: str


@router.post('/create-slots')
async def create_slots(req: SlotRequest):
    try:
        places = get_places(req.city, req.activity)
        matrix = get_distance_matrix(places)
        plan = create_plan(places, matrix)
        parsed_plan = extract_json(plan)
        return {
            "status": "success",
            "data": parsed_plan
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }