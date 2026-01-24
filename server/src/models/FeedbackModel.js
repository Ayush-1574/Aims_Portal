import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  session: String,

  rating: Number,
  teachingQuality: Number,
  workload: Number,
  comments: String,

  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Feedback", feedbackSchema);