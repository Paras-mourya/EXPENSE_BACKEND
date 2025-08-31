import { Router } from "express";
import {
  getBills,
  getBillById,
  createBill,
  updateBill,
  deleteBill,
} from "../controllers/billController.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.get("/", isLoggedIn, getBills);
router.get("/:id", isLoggedIn, getBillById);

router.post("/", isLoggedIn, upload.single("logo"), createBill);
router.put("/:id", isLoggedIn, upload.single("logo"), updateBill);

router.delete("/:id", isLoggedIn, deleteBill);

export default router;
