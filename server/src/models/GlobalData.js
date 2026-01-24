import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true // e.g. "CSE", "2025-I", "Core", "A"
    },
    value: {
      type: mongoose.Schema.Types.Mixed, // display name or numeric value
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { _id: true }
);

const globalDataSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["DEPARTMENT", "SESSION", "GRADE_SCALE"],
      unique: true
    },

    items: [itemSchema]
  },
  { timestamps: true }
);

export default mongoose.model("GlobalData", globalDataSchema);
