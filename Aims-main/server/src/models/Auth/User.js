// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {type : String},
  email: { type: String, unique: true },
  role: { type: String, enum: ["student", "instructor", "faculty_advisor", "admin"], default: "student" },
  data: Object, // role-specific info
  isActive: { type: Boolean, default: true },
  roleHistory: [{
    role: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: mongoose.Schema.Types.ObjectId
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
