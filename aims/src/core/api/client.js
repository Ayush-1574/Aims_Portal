import axios from "axios";

// Create the axios instance
const client = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: Add Token to every request
client.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Handle 401 (Unauthorized) globally
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("token");
      // Optional: Redirect to login if needed
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default client;