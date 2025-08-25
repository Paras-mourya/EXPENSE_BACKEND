import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    shop: { type: String },
    date: { type: Date, required: true },
    method: {
      type: String,
      enum: ["Credit Card", "Debit Card", "Cash", "Bank Transfer"],
      required: true,
    },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Complete"],
      default: "Complete",
    },
    receipt: { type: String },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
