import Expense from "../models/Expense.js";
import AppError from "../utils/error.utils.js";

// ✅ Create Expense
export const createExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date, account } = req.body;

    if (!title || !amount || !category) {
      return next(new AppError("All fields are required", 400));
    }

    const expense = await Expense.create({
      title,
      amount,
      category,
      date,
      account,
      user: req.user._id,
    });

    // 🔔 Emit notification
    req.io.emit("notification", {
      message: `New expense added: ${title} - ₹${amount}`,
      time: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      expense,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// ✅ Get All Expenses
export const getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.status(200).json({ success: true, expenses });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// ✅ Get Expense by ID
export const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) return next(new AppError("Expense not found", 404));

    res.status(200).json({ success: true, expense });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// ✅ Update Expense
export const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!expense) return next(new AppError("Expense not found", 404));

    // 🔔 Emit notification
    req.io.emit("notification", {
      message: `Expense updated: ${expense.title} - ₹${expense.amount}`,
      time: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// ✅ Delete Expense
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return next(new AppError("Expense not found", 404));

    // 🔔 Emit notification
    req.io.emit("notification", {
      message: `Expense deleted: ${expense.title} - ₹${expense.amount}`,
      time: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
      expense,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// ✅ Expense Comparison (Month-wise this year vs last year)
export const getExpensesComparison = async (req, res, next) => {
  try {
    const thisYear = new Date().getFullYear();
    const expenses = await Expense.aggregate([
      { $match: { user: req.user._id } },
      {
        $project: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          amount: 1,
        },
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          total: { $sum: "$amount" },
        },
      },
    ]);

    const result = Array.from({ length: 12 }, (_, i) => {
      const thisMonth = expenses.find(
        (e) => e._id.month === i + 1 && e._id.year === thisYear
      );
      const lastMonth = expenses.find(
        (e) => e._id.month === i + 1 && e._id.year === thisYear - 1
      );

      return {
        month: new Date(0, i).toLocaleString("en", { month: "short" }),
        thisMonth: thisMonth ? thisMonth.total : 0,
        lastMonth: lastMonth ? lastMonth.total : 0,
      };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// ✅ Expense Breakdown by Category
export const getExpensesBreakdown = async (req, res, next) => {
  try {
    const current = await Expense.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const categories = await Expense.distinct("category", { user: req.user._id });

    const breakdown = await Promise.all(
      categories.map(async (cat) => {
        const catTotal = current.find((c) => c._id === cat)?.total || 0;
        const items = await Expense.find({ category: cat, user: req.user._id });

        return {
          category: cat,
          total: catTotal,
          changePercent: 0, // Future: add month-on-month % change
          items,
        };
      })
    );

    res.status(200).json({ success: true, data: breakdown });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
