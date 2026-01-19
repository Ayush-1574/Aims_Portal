// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {type : String},
  email: { type: String, unique: true },
  role: { type: String, enum: ["student", "instructor", "advisor"] },
  data: Object, // role-specific info
});

export default mongoose.model("User", userSchema);
