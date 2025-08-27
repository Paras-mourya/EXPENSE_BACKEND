import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
import AppError from "../utils/error.utils.js";

// ✅ Get all transactions
export const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });
    res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// ✅ Create new transaction
export const createTransaction = async (req, res, next) => {
  try {
    const newTransaction = new Transaction({
      ...req.body,
      user: req.user.id,
    });
    await newTransaction.save();

    // 🔔 Emit notification
    req.io.emit("notification", {
      message: `New transaction created: ${newTransaction.type} - ₹${newTransaction.amount}`,
      time: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      newTransaction,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// ✅ Get transaction by ID
export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return next(new AppError("Transaction not found", 404));
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// ✅ Update transaction
export const updateTransaction = async (req, res, next) => {
  try {
    const updated = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!updated) {
      return next(new AppError("Transaction not found or not authorized", 404));
    }

    // 🔔 Emit notification
    req.io.emit("notification", {
      message: `Transaction updated: ${updated.type} - ₹${updated.amount}`,
      time: new Date(),
    });

    res.json({
      success: true,
      message: "Transaction updated successfully",
      updated,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// ✅ Delete transaction
export const deleteTransaction = async (req, res, next) => {
  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deleted) {
      return next(new AppError("Transaction not found or not authorized", 404));
    }

    // 🔔 Emit notification
    req.io.emit("notification", {
      message: `Transaction deleted: ${deleted.type} - ₹${deleted.amount}`,
      time: new Date(),
    });

    res.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// ✅ Get summary
export const getSummary = async (req, res, next) => {
  try {
    const accounts = await Account.find({ user: req.user.id });
    const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

    const transactions = await Transaction.find({ user: req.user.id });

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    const revenues = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    res.json({
      success: true,
      totalBalance,
      revenues,
      expenses,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
