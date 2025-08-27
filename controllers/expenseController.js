import Expense from "../models/Expense.js";
import AppError from "../utils/error.utils.js";


export const getExpensesComparison = async (req, res, next) => {
  try {
    const thisYear = new Date().getFullYear();
    const expenses = await Expense.aggregate([
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

    console.log(" Aggregated Expenses:", expenses);

    
    const result = Array.from({ length: 12 }, (_, i) => {
      const thisMonth = expenses.find(
        (e) => Number(e._id.month) === i + 1 && Number(e._id.year) === thisYear
      );
      const lastMonth = expenses.find(
        (e) => Number(e._id.month) === i + 1 && Number(e._id.year) === thisYear - 1
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


export const getExpensesBreakdown = async (req, res, next) => {
  try {
    const current = await Expense.aggregate([
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const categories = await Expense.distinct("category");

    const breakdown = await Promise.all(
      categories.map(async (cat) => {
        const catTotal = current.find((c) => c._id === cat)?.total || 0;
        const items = await Expense.find({ category: cat });

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
