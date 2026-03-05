import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'
axios.defaults.withCredentials = true

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
