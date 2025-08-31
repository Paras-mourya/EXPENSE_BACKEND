import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import AppError from "../utils/error.utils.js";


const getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    res.status(200).json({
      success: true,
      accounts,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const getAccountById = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user._id });
    if (!account) return next(new AppError("Account not found", 404));

    const transactions = await Transaction.find({ account: account._id, user: req.user._id }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      account: { ...account.toObject(), transactions },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const addAccount = async (req, res, next) => {
  try {
    const { accountType, branchName, accountNumber, bankName, balance } = req.body;

    if (!accountType || !branchName || !accountNumber || !bankName || balance == null) {
      return next(new AppError("All fields are required", 400));
    }


    const existing = await Account.findOne({ accountNumber, user: req.user._id });
    if (existing) {
      return next(new AppError("Account with this number already exists", 400));
    }

    const account = await Account.create({
      accountType,
      branchName,
      accountNumber,
      bankName,
      balance,
      user: req.user._id,
    });


    req.io.emit("notification", {
      message: `New account created: ${bankName} (${accountType})`,
      time: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      account,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};


const updateAccount = async (req, res, next) => {
  try {
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!account) {
      return next(new AppError("Account not found", 404));
    }

    req.io.emit("notification", {
      message: `Account updated: ${account.bankName} (${account.accountType})`,
      time: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Account updated successfully",
      account,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};


const deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!account) {
      return next(new AppError("Account not found", 404));
    }

   
    req.io.emit("notification", {
      message: `Account deleted: ${account.bankName} (${account.accountType})`,
      time: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
      account,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export { getAccounts, getAccountById, addAccount, updateAccount, deleteAccount };
