export const allowRoles = (...roles) => {
  return (req, res, next) => {
    console.log("ROLE CHECK - User role:", req.user?.role, "Type:", typeof req.user?.role, "Allowed:", roles);
    console.log("Full user object:", req.user);
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, msg: "Forbidden: Role not allowed" });
    }
    next();
  };
};
