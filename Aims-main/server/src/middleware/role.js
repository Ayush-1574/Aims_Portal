export const allowRoles = (...roles) => {
  return (req, res, next) => {
    console.log("ROLE CHECK:", req.user.role, "ALLOWED:", roles);
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, msg: "Forbidden: Role not allowed" });
    }
    next();
  };
};
