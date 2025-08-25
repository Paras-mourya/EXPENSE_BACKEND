import { Router } from "express";
import { getExpensesBreakdown, getExpensesComparison } from "../controllers/expenseController.js";
const router = Router()



router.get("/comparison", getExpensesComparison);
router.get("/breakdown", getExpensesBreakdown);

export default router