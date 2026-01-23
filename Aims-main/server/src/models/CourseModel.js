 
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true }, // e.g. CS305
    title: { type: String, required: true },

    dept: { type: String, required: true }, // e.g. CSE, EE
    year: { type: Number, required: true }, // 1, 2, 3, 4 - which year this course is for
    ltp: { type: String, required: true }, // e.g. "3-0-2"
    session: { type: String, required: true }, // e.g. "2024-25"

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING_APPROVAL", "OPEN", "REJECTED"],
      default: "PENDING_APPROVAL",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
