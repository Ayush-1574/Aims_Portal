import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    faculty_advisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    status: {
      type: String,
      enum: [
        "REQUESTED",
        "PENDING_INSTRUCTOR",
        "PENDING_ADVISOR",
        "ENROLLED",
        "REJECTED"
      ],
      default: "PENDING_INSTRUCTOR"
    },

    // ✅ NEW — academic term like "2025-I"
    session: {
      type: String,
      required: true
    },

    semester: { type: Number, default: 1 },
    category: { type: String, default: "Core" },
    grade: { type: String, default: "-" },
    attendance: { type: String, default: "-" }
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1, session: 1 }, { unique: true });

export default mongoose.model("Enrollment", enrollmentSchema);
