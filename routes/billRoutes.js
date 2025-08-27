import { Router } from "express";
import {
  getBills,
  getBillById,
  createBill,
  updateBill,
  deleteBill,
} from "../controllers/billController.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", isLoggedIn, getBills);
router.post("/", isLoggedIn, createBill);
router.get("/:id", isLoggedIn, getBillById);
router.put("/:id", isLoggedIn, updateBill);
router.delete("/:id", isLoggedIn, deleteBill);

export default router;
