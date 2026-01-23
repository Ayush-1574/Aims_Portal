import client from "@/core/api/client";

export const sendOtp = async (email) => {
  const res = await client.post("/auth/send-otp", { email });
  return res.data;
};

export const verifyOtp = async (email, otp) => {
  const res = await client.post("/auth/verify-otp", { email, otp });
  return res.data; // Returns { token, user, role }
};

export const registerUser = async (payload) => {
  const res = await client.post("/auth/signup", payload);
  return res.data;
};

export const fetchCurrentUser = async () => {
  const res = await client.get("/auth/me");
  return res.data.user;
};