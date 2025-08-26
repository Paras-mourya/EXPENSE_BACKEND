import { Router } from "express";
import {
  createGoals,
  deleteGoal,
  getGoals,
  getGoalsById,
  updateGoal,
} from "../controllers/goalController.js";

const router = Router();

router.get("/", getGoals);
router.post("/", createGoals);
router.get("/:id", getGoalsById);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;
