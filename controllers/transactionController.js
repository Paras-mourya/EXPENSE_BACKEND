import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
import AppError from "../utils/error.utils.js";

// ✅ Get all transactions
export const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).populate("account");
    res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("❌ Get Transactions Error:", error);
    return next(new AppError(error.message, 500));
  }
};

// ✅ Create new transaction (with account balance update)
export const createTransaction = async (req, res, next) => {
  try {
    const { account: accountId, type, amount } = req.body;

    if (!accountId) {
      return next(new AppError("Account ID is required", 400));
    }

    // 🏦 Check if account exists and belongs to user
    const account = await Account.findOne({ _id: accountId, user: req.user.id });
    if (!account) {
      return next(new AppError("Account not found or not authorized", 404));
    }

    // 💾 Save transaction
    const newTransaction = new Transaction({
      ...req.body,
      user: req.user.id,
      account: accountId,
    });
    await newTransaction.save();

    // 💰 Update account balance
    if (type === "expense") {
      account.balance -= amount;
    } else if (type === "income") {
      account.balance += amount;
    }
    await account.save();

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
    console.error("❌ Transaction Create Error:", error);
    return next(new AppError(error.message, 500));
  }
};

// ✅ Get transaction by ID
export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("account");

    if (!transaction) {
      return next(new AppError("Transaction not found", 404));
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error(" Get Transaction By ID Error:", error);
    return next(new AppError(error.message, 500));
  }
};

// ✅ Update transaction (with balance adjustment)
export const updateTransaction = async (req, res, next) => {
  try {
    const oldTransaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!oldTransaction) {
      return next(new AppError("Transaction not found or not authorized", 404));
    }

    // 🏦 Get account
    const account = await Account.findOne({ _id: oldTransaction.account, user: req.user.id });
    if (!account) {
      return next(new AppError("Account not found or not authorized", 404));
    }

    // 🔄 Revert old transaction effect
    if (oldTransaction.type === "expense") {
      account.balance += oldTransaction.amount;
    } else if (oldTransaction.type === "income") {
      account.balance -= oldTransaction.amount;
    }

    // ✅ Update with new values
    const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // 💰 Apply new transaction effect
    if (updated.type === "expense") {
      account.balance -= updated.amount;
    } else if (updated.type === "income") {
      account.balance += updated.amount;
    }
    await account.save();

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
    console.error("❌ Update Transaction Error:", error);
    return next(new AppError(error.message, 500));
  }
};


// ✅ Delete transaction (with balance rollback)
export const deleteTransaction = async (req, res, next) => {
  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deleted) {
      return next(new AppError("Transaction not found or not authorized", 404));
    }

    // 🏦 Get account
    const account = await Account.findOne({ _id: deleted.account, user: req.user.id });
    if (account) {
      // 🔄 Revert transaction effect
      if (deleted.type === "expense") {
        account.balance += deleted.amount;
      } else if (deleted.type === "income") {
        account.balance -= deleted.amount;
      }
      await account.save();
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
    console.error("❌ Delete Transaction Error:", error);
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
    console.error("❌ Get Summary Error:", error);
    return next(new AppError(error.message, 500));
  }
};
