import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  console.log("[Auth Middleware] Checking authorization...");
  
  // PRIMARY: Try Authorization header first (sessionStorage tokens)
  let token = null;
  if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
      console.log("[Auth Middleware] Token from Authorization header");
    }
  }
  
  // FALLBACK: Try cookie if no Authorization header
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
    console.log("[Auth Middleware] Token from cookie (fallback)");
  }

  if (!token) {
    console.log("[Auth Middleware] ❌ No token provided (no auth header, no cookie)");
    return res.status(401).json({ msg: "No token provided" });
  }

  try {
    console.log("[Auth Middleware] Token found, verifying...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("[Auth Middleware] ✓ Token verified - User:", decoded.email, "Role:", decoded.role);
    next();
  } catch (err) {
    console.log("[Auth Middleware] ❌ Invalid token:", err.message);
    return res.status(401).json({ msg: "Invalid token" });
  }
}
