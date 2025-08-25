import { Router } from "express";
import { forgotPassword, getProfile, login, logout, register, resetPassword, updateProfile } from "../controllers/userController.js";
import { upload } from "../middleware/multer.middleware.js";
import passport from "passport";
import { isLoggedIn } from "../middleware/auth.middleware.js";
const router =Router()


router.post('/register',register)
router.post('/login',login)
router.get('/logout',logout)
router.get('/me',isLoggedIn,getProfile)

router.put("/update",isLoggedIn, upload.single("avatar"), updateProfile);

router.post('/reset',forgotPassword)
router.post('/reset/:resetToken',resetPassword)



// Google Login start
// Google Login start
// google login
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  async (req, res) => {
    const token = req.user.generateJWTToken();

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ✅ Google login ke baad frontend dashboard pe bhej do
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);



export default router