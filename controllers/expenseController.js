import Expense from "../models/Expense.js";
import AppError from "../utils/error.utils.js";


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

export const getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.status(200).json({ success: true, expenses });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) return next(new AppError("Expense not found", 404));

    res.status(200).json({ success: true, expense });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};


export const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!expense) return next(new AppError("Expense not found", 404));


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


export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return next(new AppError("Expense not found", 404));

   
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


export const getExpensesComparison = async (req, res, next) => {
  try {
    const filter = req.query.filter || "monthly"; // daily, weekly, monthly, yearly
    const expenses = await Expense.find({ user: req.user._id });

    let result = [];

    if (filter === "daily") {
      // last 30 days
      const today = new Date();
      const past = new Date();
      past.setDate(today.getDate() - 29);

      const dailyMap = {};
      expenses.forEach((e) => {
        if (e.date >= past && e.date <= today) {
          const key = e.date.toISOString().split("T")[0]; 
          dailyMap[key] = (dailyMap[key] || 0) + e.amount;
        }
      });

      result = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(past);
        date.setDate(past.getDate() + i);
        const key = date.toISOString().split("T")[0];
        return { label: key, total: dailyMap[key] || 0 };
      });

    } else if (filter === "weekly") {
      
      const weekMap = {};
      expenses.forEach((e) => {
        const week = getWeekNumber(e.date);
        weekMap[week] = (weekMap[week] || 0) + e.amount;
      });

      result = Object.keys(weekMap)
        .sort((a, b) => a - b)
        .map((w) => ({ label: `Week ${w}`, total: weekMap[w] }));

    } else if (filter === "monthly") {
      // current year
      const thisYear = new Date().getFullYear();
      const monthlyMap = {};
      expenses.forEach((e) => {
        if (e.date.getFullYear() === thisYear) {
          const month = e.date.getMonth(); 
          monthlyMap[month] = (monthlyMap[month] || 0) + e.amount;
        }
      });

      result = Array.from({ length: 12 }, (_, i) => ({
        label: new Date(0, i).toLocaleString("en", { month: "short" }),
        total: monthlyMap[i] || 0,
      }));

    } else if (filter === "yearly") {
      // last 5 years
      const currentYear = new Date().getFullYear();
      const yearlyMap = {};
      expenses.forEach((e) => {
        const year = e.date.getFullYear();
        if (year >= currentYear - 4) {
          yearlyMap[year] = (yearlyMap[year] || 0) + e.amount;
        }
      });

      result = Array.from({ length: 5 }, (_, i) => {
        const y = currentYear - 4 + i;
        return { label: y.toString(), total: yearlyMap[y] || 0 };
      });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};


function getWeekNumber(d) {
  const date = new Date(d);
  const start = new Date(date.getFullYear(), 0, 1);
  const diff =
    (date - start + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000) /
    (1000 * 60 * 60 * 24);
  return Math.ceil((diff + start.getDay() + 1) / 7);
}



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
          changePercent: 0, 
          items,
        };
      })
    );

    res.status(200).json({ success: true, data: breakdown });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
