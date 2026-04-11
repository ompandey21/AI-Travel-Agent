import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const CHAT_API = `${API_BASE}/api/chat`;

export const getChatHistory = async (tripId, recipientId) => {
  const res = await axios.get(`${CHAT_API}/${tripId}/history`, {
    params: recipientId ? { recipientId } : undefined,
    withCredentials: true,
  });
  return res.data;
};
