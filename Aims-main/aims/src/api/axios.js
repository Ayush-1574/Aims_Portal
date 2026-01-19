import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, // <-- important for cookies
  //axios.defaults.withCredentials = true;
});

export default api;
