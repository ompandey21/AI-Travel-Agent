import axios from "axios";

const API = "http://localhost:8080/api";

export const getTripById = async (id) => {
  const res = await axios.get(`${API}/read-trips/my-trip/${id}`, { withCredentials: true });
  return res.data;
};

export const getUserById = async (id) => {
  const res = await axios.get(`${API}/auth/get-user/${id}`, { withCredentials: true });
  return res.data;
};

export const sendInvite = async (tripId, email) => {
  const res = await axios.post(
    `${API}/trips/invite-user/${tripId}`,
    { email },
    { withCredentials: true }
  );
  return res.data;
};

export const getMembers = async (tripId) => {
  const res = await axios.get(`${API}/trips/${tripId}/members`, { withCredentials: true });
  return res.data;
};

export const checkItineraryExists = async (tripId) => {
  try {
    await axios.get(`${API}/read-itinerary/trip/${tripId}`, { withCredentials: true });
    return true;
  } catch (err) {
    if (err?.response?.status === 404) return false;
    throw err;
  }
};

export const acceptRequest = async (token) => {
  try{
    const res = await axios.get(`${API}/trips/accept-invite`, { params: { token }, withCredentials: true })
    return res.data;
  } catch (err) {
    throw err;
  }
}