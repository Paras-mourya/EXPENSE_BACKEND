import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    title: { type: String },
    shop: { type: String },
    date: { type: Date },
    method: {
      type: String,
      enum: ["Credit Card", "Debit Card", "Cash", "Bank Transfer"],
    },
    type: { type: String, enum: ["income", "expense"] },
    category: { type: String },
    amount: { type: Number },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true, // har transaction ke liye account mandatory
    },
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
