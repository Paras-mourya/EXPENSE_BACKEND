import { Schema, model } from "mongoose";

const billSchema = new Schema(
  {
    vendor: { type: String, required: true }, 
    plan: { type: String },
    dueDate: { type: Date, required: true }, 
    amount: { type: Number, required: true, min: 0 }, 
    logoUrl: { type: String }, 
    lastChargeDate: { type: Date },

    
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Bill = model("Bill", billSchema);
export default Bill;
