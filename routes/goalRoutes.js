import { Router } from "express";
import { createGoals, deleteGoal, getGoals, getGoalsById, updateGoal } from "../controllers/goalController.js";


const router = Router()



router.get("/", getGoals);
router.get("/:id", getGoalsById);
router.post("/", createGoals);
router.put("/:id",updateGoal);
router.delete("/:id", deleteGoal);


export default router