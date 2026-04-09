from fastapi import APIRouter

router = APIRouter()


@router.get('/')
async def fun():
    return {'message' : 'Itinerary Route Executed'}