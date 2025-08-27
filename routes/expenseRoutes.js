import { Router } from "express";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpensesComparison,
  getExpensesBreakdown,
} from "../controllers/expenseController.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", isLoggedIn, createExpense);
router.get("/", isLoggedIn, getExpenses);
router.get("/:id", isLoggedIn, getExpenseById);
router.put("/:id", isLoggedIn, updateExpense);
router.delete("/:id", isLoggedIn, deleteExpense);

router.get("/analytics/comparison", isLoggedIn, getExpensesComparison);
router.get("/analytics/breakdown", isLoggedIn, getExpensesBreakdown);

export default router;
