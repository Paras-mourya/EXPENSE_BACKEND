import express from "express";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getTransactionById,
} from "../controllers/transactionController.js";
import { isLoggedIn } from "../middleware/auth.middleware.js"; 

const router = express.Router();


router.get("/summary", isLoggedIn, getSummary);

router.get("/", isLoggedIn, getTransactions);
router.post("/", isLoggedIn, createTransaction);
router.get("/:id", isLoggedIn, getTransactionById);
router.put("/:id", isLoggedIn, updateTransaction);

router.delete("/:id", isLoggedIn, deleteTransaction);

export default router;
