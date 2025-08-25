import { Schema, model } from "mongoose";

const expenseSchema = new Schema(
  {
   title: { type: String, required: true },      
    category: { type: String, required: true },   
    amount: { type: Number, required: true },     
    date: { type: Date, required: true },   
  },
  { timestamps: true }
);

const Expense = model("Expense", expenseSchema);

export default Expense;
