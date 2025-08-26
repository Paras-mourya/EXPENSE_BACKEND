import { Router } from "express";
import {
  addAccount,
  deleteAccount,
  getAccountById,
  getAccounts,
  updateAccount,
} from "../controllers/accountController.js";

const router = Router();

router.get("/", getAccounts);
router.post("/", addAccount);
router.get("/:id", getAccountById);
router.put("/:id", updateAccount);
router.delete("/:id", deleteAccount);

export default router;
