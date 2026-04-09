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
  // console.log(res);
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
  const res = await axios.get(`${API}/trips/accept-invite`, {
    params: { token },
    withCredentials: true
  });
  return res.data;
};

export const getMyTrips = async () => {
  const res = await axios.get(`${API}/read-trips/my-trips`, { withCredentials: true });
  return res.data;
};

export const getTripExpenses = async (tripId) => {
  const res = await axios.get(`${API}/expense-splitter/get-expenses/${tripId}`, { withCredentials: true });
  return res.data;
};

export const addExpense = async (tripId, payload) => {
  const res = await axios.post(
    `${API}/expense-splitter/add-expense/${tripId}`,
    payload,
    { withCredentials: true }
  );
  return res.data;
};

export const getSettlements = async (tripId) => {
  const res = await axios.get(`${API}/expense-splitter/get-settlement/${tripId}`, { withCredentials: true });
  return res.data;
};

export const settleExpense = async (tripId, payload) => {
  const res = await axios.post(
    `${API}/expense-splitter/settle-expense/${tripId}`,
    payload,
    { withCredentials: true }
  ).catch((e) => console.log(e));
  return res.data;
};

export const confirmSettlement = async (settlementId) => {
  const res = await axios.post(
    `${API}/expense-splitter/confirm-settlement/${settlementId}`,
    {},
    { withCredentials: true }
  );
  return res.data;
};

export const getUserBalance = async (tripId) => {
  const res = await axios.get(`${API}/expense-splitter/get-balance/${tripId}`, { withCredentials: true });
  return res.data;
};

export const getDocuments = async (tripId) => {
  const res = await axios.get(`${API}/docs/trips/${tripId}`, { withCredentials: true });
  return res.data;
};

export const getDocumentById = async (docId) => {
  const res = await axios.get(`${API}/docs/${docId}`, { withCredentials: true });
  return res.data;
};


export const uploadDocument = async (tripId, file, title, description) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  formData.append("description", description);
  const res = await axios.post(`${API}/docs/trips/${tripId}`, formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteDocument = async (docId) => {
  const res = await axios.delete(`${API}/docs/${docId}`, { withCredentials: true });
  return res.data;
};