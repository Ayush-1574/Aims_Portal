// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  role: { type: String, enum: ["student", "instructor", "faculty_advisor", "admin"], default: "student" },
  
  // Student specific fields
  entry_no: { type: String }, // enrollment number
  department: { type: String }, // e.g., "CSE", "EE"
  year: { type: Number }, // 1, 2, 3, 4
  semester: { type: Number }, // 1-8
  
  // Faculty Advisor specific fields
  advisor_department: { type: String }, // department they advise
  advisor_year: { type: Number , default : 1 }, // which year they advise
  advisor_batch : {type : String },
  // Generic field for any role-specific data
  data: Object,
  
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
