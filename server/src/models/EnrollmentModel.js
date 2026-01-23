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

    // Faculty advisor who approves (mapped by student's year + department)
    faculty_advisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    // NEW — unified state machine for workflow
    status: {
      type: String,
      enum: [
        "REQUESTED",
        "PENDING_INSTRUCTOR",
        "PENDING_ADVISOR",
        "ENROLLED",
        "REJECTED"
      ],
      default: "PENDING_INSTRUCTOR" // student initiates → instructor first
    },

    // For Record view
    semester: { type: Number, default: 1 },
    category: { type: String, default: "Core" }, // Elective/HSS/etc.
    grade: { type: String, default: "-" },
    attendance: { type: String, default: "-" }
  },
  { timestamps: true }
);

export default mongoose.model("Enrollment", enrollmentSchema);
