import { Router } from "express";
import {
  createGoals,
  deleteGoal,
  getGoals,
  getGoalsById,
  updateGoal,
} from "../controllers/goalController.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

const router = Router();


router.get("/", isLoggedIn, getGoals);
router.post("/", isLoggedIn, createGoals);
router.get("/:id", isLoggedIn, getGoalsById);
router.put("/:id", isLoggedIn, updateGoal);
router.delete("/:id", isLoggedIn, deleteGoal);

export default router;
