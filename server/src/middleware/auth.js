import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  console.log("[Auth Middleware] Checking cookie-based auth...");

  const token = req.cookies?.token;

  if (!token) {
    console.log("[Auth Middleware] ❌ No token found in cookies");
    return res.status(401).json({ msg: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    console.log(
      "[Auth Middleware] ✓ Authenticated:",
      decoded.email,
      "| Role:",
      decoded.role
    );

    next();
  } catch (err) {
    console.log("[Auth Middleware] ❌ Invalid token:", err.message);
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
}
