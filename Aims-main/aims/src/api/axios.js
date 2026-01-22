import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  // withCredentials: false - we use Authorization header instead, not cookies
});

// Add token from sessionStorage to every request as Authorization header
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
