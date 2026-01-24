import axios from "axios";

// Create the axios instance
const client = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, // ✅ REQUIRED to send cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: Handle 401 (Unauthorized) globally
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized – user logged out or session expired");
      // Optional redirect
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default client;
