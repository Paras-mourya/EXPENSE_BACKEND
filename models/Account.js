import { Schema, model } from "mongoose";

const accountSchema = new Schema(
  {
    accountType: {
      type: String,
      enum: ["credit", "checking", "savings", "investment", "loan"],
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    branchName: {
      type: String,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Account = model("Account",accountSchema)
export default Account
