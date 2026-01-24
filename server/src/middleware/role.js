export const allowRoles = (...roles) => {
  return (req, res, next) => {
    // 1. Hierarchy Logic: Advisors are also Instructors
    if (roles.includes("instructor") && req.user?.role === "faculty_advisor") {
      return next();
    }

    // 2. Standard Check
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, msg: "Forbidden: Role not allowed" });
    }
    next();
  };
};