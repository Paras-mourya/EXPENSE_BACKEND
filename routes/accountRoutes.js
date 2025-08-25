import { Router } from "express";
import { addAccount, deleteAccount, getAccountById, getAccounts, updateAccount } from "../controllers/accountController.js";
const router = Router()

router.get("/",getAccounts)
router.get("/:id",getAccountById)
router.post("/",addAccount)
router.put("/:id",updateAccount)
router.delete("/:id",deleteAccount)

export default router
