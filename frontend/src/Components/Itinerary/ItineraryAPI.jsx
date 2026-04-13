import axios from "axios";

const API = "http://localhost:8080/api";


export const getItinerary = async (tripId) => {
    const res = await axios.get(`${API}/read-itinerary/trip/${tripId}`, { withCredentials : true });
    // console.log("Itinerary ",res);
    return res.data;  
}
export const getDays = async (itineraryId) => {
    const res = await axios.get(`${API}/read-itinerary/itinerary/${itineraryId}/days`, { withCredentials : true });
    // console.log("Days", res);
    return res.data;  
}
export const getPendingSlots = async (itineraryId) => {
    const res = await axios.get(`${API}/read-itinerary/itinerary/${itineraryId}/pending-slots`, { withCredentials : true });
    // console.log(res);
    return res.data;  
}
export const createItineraryFun = async (tripId, payload) => {
    const res = await axios.post(`${API}/itinerary/create-itinerary/${tripId}`, 
        payload,
        { withCredentials : true });
    // console.log(res);
    return res.data;  
}
export const createSlotFun = async (dayId, payload) => {
    const res = await axios.post(`${API}/itinerary/create-slot/${dayId}`, 
        payload,
        { withCredentials : true });
    // console.log(res);
    return res.data;  
}
export const finalizeItineraryFun = async (itineraryId) => {
    const res = await axios.post(`${API}/itinerary/finalize-itinerary/${itineraryId}`, 
        {},
        { withCredentials : true });
    // console.log(res);
    return res.data;  
}
export const approveSlotFun = async (slotId) => {
    const res = await axios.post(`${API}/itinerary/approve-slot/${slotId}`, 
        {},
        { withCredentials : true });
    // console.log(res);
    return res.data;  
}
export const rejectSlotFun = async (slotId) => {
    const res = await axios.post(`${API}/itinerary/reject-slot/${slotId}`, 
        {},
        { withCredentials : true });
    // console.log(res);
    return res.data;  
}
export const updateSlotFun = async (slotId, payload) => {
    const res = await axios.post(`${API}/itinerary/update-slot/${slotId}`, 
        payload,
        { withCredentials : true });
    // console.log(res);
    return res.data;  
}
export const deleteSlotFun = async (slotId) => {
    const res = await axios.delete(`${API}/itinerary/delete-slot/${slotId}`, 
        {},
        { withCredentials : true });
    // console.log(res);
    return res.data;  
}

export const createPlanAI = async (dayId, payload) => {
    const res = await axios.post(`${API}/itinerary/create-slot-ai/${dayId}`,
        payload,
        { withCredentials : true });
    return res.data;
}