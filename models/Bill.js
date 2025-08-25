import { Schema, model } from "mongoose";

const billSchema = new Schema(
  {
    vendor: { type: String, required: true }, 
    plan: { type: String },
    dueDate: { type: Date, required: true }, 
    amount: { type: Number, required: true }, 
    logoUrl: { type: String }, 
    lastChargeDate: { type: Date },
  },
  { timestamps: true }
);

const Bill = model("Bill",billSchema)
export default Bill