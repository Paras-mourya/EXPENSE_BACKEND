import { Router } from "express";
import { forgotPassword, getProfile, login, logout, register, resetPassword, updateProfile } from "../controllers/userController.js";
import { upload } from "../middleware/multer.middleware.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
const router =Router()


router.post('/register',register)
router.post('/login',login)
router.get('/logout',logout)
router.get('/me',isLoggedIn,getProfile)

router.put("/update",isLoggedIn, upload.single("avatar"), updateProfile);

router.post('/reset',forgotPassword)
router.post('/reset/:resetToken',resetPassword)


export default router