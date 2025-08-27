import { Schema, model } from "mongoose";

const goalSchema = new Schema(
  {
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    deadline: { type: Date },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ✅ user reference
  },
  {
    timestamps: true,
  }
);

const Goal = model("Goal", goalSchema);

export default Goal;
