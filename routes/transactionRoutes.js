import express from "express";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getTransactionById,
} from "../controllers/transactionController.js";

const router = express.Router();

router.get("/", getTransactions);
router.get("/:id", getTransactionById);
router.post("/", createTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);
router.get("/summary", getSummary);

export default router;
