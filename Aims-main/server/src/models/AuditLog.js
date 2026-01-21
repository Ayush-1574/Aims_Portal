import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  action: {
    type: String,
    enum: [
      "create_user",
      "change_role",
      "delete_user",
      "deactivate_user",
      "activate_user",
      "edit_user",
      "bulk_role_change"
    ],
    required: true
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  reason: String,
  ipAddress: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("AuditLog", auditLogSchema);
