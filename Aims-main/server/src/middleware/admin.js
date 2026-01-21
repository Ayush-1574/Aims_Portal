export const checkAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      msg: "Admin access required"
    });
  }
  next();
};

export const logAudit = async (adminId, action, targetUserId, changes, reason, req) => {
  const AuditLog = (await import("../models/AuditLog.js")).default;
  
  try {
    await AuditLog.create({
      adminId,
      action,
      targetUserId,
      changes,
      reason,
      ipAddress: req.ip || req.connection.remoteAddress
    });
  } catch (err) {
    console.error("Failed to log audit:", err);
  }
};
