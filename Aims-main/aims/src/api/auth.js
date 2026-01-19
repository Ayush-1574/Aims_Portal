import api from "./axios";

export const sendOtp = (email) =>
  api.post("/auth/send-otp", { email }).then(res => res.data);

export const verifyOtp = (email, otp) =>
  api.post("/auth/verify-otp", { email, otp }).then(res => res.data);

export const signup = (payload) =>
  api.post("/auth/signup", payload).then(res => res.data);

export const getMe = () =>
  api.get("/auth/me").then(res => res.data);
export const logout = () =>
  api.post("/auth/logout").then(res => res.data);
