import { Router } from "express";
import {
  addAccount,
  deleteAccount,
  getAccountById,
  getAccounts,
  updateAccount,
} from "../controllers/accountController.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

const router = Router();


router.get("/", isLoggedIn, getAccounts);
router.post("/", isLoggedIn, addAccount);
router.get("/:id", isLoggedIn, getAccountById);
router.put("/:id", isLoggedIn, updateAccount);
router.delete("/:id", isLoggedIn, deleteAccount);

export default router;
