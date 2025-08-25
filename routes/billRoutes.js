import { Router } from "express";
import { getBills } from "../controllers/billController.js";
const router = Router()


router.get("/",getBills)


export default router