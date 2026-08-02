import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'
axios.defaults.withCredentials = true

let isRefreshing = false
let refreshPromise = null

const refreshAccessToken = async () => {
  if (isRefreshing) return refreshPromise

  isRefreshing = true
  refreshPromise = axios.post(`${API_BASE}/api/auth/refresh`, {}, { withCredentials: true })
    .then(() => true)
    .catch(() => false)
    .finally(() => {
      isRefreshing = false
      refreshPromise = null
    })

  return refreshPromise
}

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true
      const refreshed = await refreshAccessToken()

      if (refreshed) {
        return axios(originalRequest)
      }
    }

    return Promise.reject(error)
  }
)

export async function verifyResetToken(token){
  return axios.get(`${API_BASE}/api/auth/verifyreset/${token}`)
}

export async function login(payload){
  return axios.post(`${API_BASE}/api/auth/login`, payload, { withCredentials: true })
}

export async function signup(payload){
  return axios.post(`${API_BASE}/api/auth/signup`, payload, { withCredentials: true })
}

export async function forgetPassword(payload){
  return axios.post(`${API_BASE}/api/auth/forgetpassword`, payload, { withCredentials: true })
}

export async function createPassword(payload){
  return axios.post(`${API_BASE}/api/auth/createpassword`, payload, { withCredentials: true })
}
export async function getMe() {
  const res =  await axios.get(`${API_BASE}/api/auth/me`, { withCredentials: true });
  return res.data;
}