import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
import AppError from "../utils/error.utils.js";

// GET all transactions
export const getTransactions = async (req, res,next) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json({
      success:true,
      transactions,
    });
  } catch (error) {
   return next (new AppError(error.message,500))
  }
};

// POST create transaction
export const createTransaction = async (req, res,next) => {
  try {
    const newTransaction = new Transaction(req.body);
    await newTransaction.save();
    res.status(201).json({
        success:true,
        message:"transaction created successfully",
        newTransaction,
    });
  } catch (error) {
     return next (new AppError(error.message,500))
  }
};

export  const getTransactionById = async (req,res,next) => {
  try {
  const transactionGet = await Transaction.findById(req.params.id)
  if(!transaction){
    return next (new AppError("transaction not found",400))
  }
  res.status(200).json({
    success:true,
    transactionGet
    
  })
  } catch (error) {
    return next (new AppError(error.message,500))
  }
}

// PUT update transaction
export const updateTransaction = async (req, res,next) => {
  try {
    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
   return next (new AppError(error.message,500))
  }
};

// DELETE transaction
export const deleteTransaction = async (req, res,next) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    return next (new AppError(error.message,500))
  }
};

// GET summary


// GET summary
export const getSummary = async (req, res) => {
  try {
    const accounts = await Account.find();
    const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

    const transactions = await Transaction.find();
    const expenses = transactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
    const revenues = transactions
      .filter(t => t.type === "revenue")
      .reduce((acc, t) => acc + t.amount, 0);

    res.json({
      totalBalance,
      revenues,
      expenses,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
