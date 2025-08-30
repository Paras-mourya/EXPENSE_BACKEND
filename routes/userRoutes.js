import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  getProfile,
  login,
  logout,
  register,
  resetPassword,
  updateProfile,
} from "../controllers/userController.js";
import { upload } from "../middleware/multer.middleware.js";
import passport from "passport";
import { isLoggedIn } from "../middleware/auth.middleware.js";

const router = Router();

// Auth & Profile
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", isLoggedIn, getProfile);

router.put("/update", isLoggedIn, upload.single("avatar"), updateProfile);
router.put("/change-password", isLoggedIn, changePassword);

router.post("/reset", forgotPassword);
router.post("/reset/:resetToken", resetPassword);

// ✅ Google OAuth Routes
router.get(
  "/auth/google",
  (req, res, next) => {
    console.log("🚀 Starting Google OAuth flow");
    next();
  },
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    accessType: 'offline',
    prompt: 'select_account'
  })
);

router.get(
  "/auth/google/callback",
  (req, res, next) => {
    console.log("📞 Google callback received");
    console.log("Query params:", req.query);
    next();
  },
  passport.authenticate("google", { 
    session: false, 
    failureRedirect: `${process.env.FRONTEND_URL}/auth/login?error=google_auth_failed`
  }),
  async (req, res) => {
    try {
      console.log("✅ Google authentication successful");
      console.log("👤 User from Google:", req.user?.email);

      if (!req.user) {
        console.error("❌ No user object returned from Google auth");
        return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=no_user_object`);
      }

      // ✅ IMPORTANT: await the JWT token generation
      const token = await req.user.generateJWTToken();
      console.log("🔑 JWT Token generated:", token ? "✅ Success" : "❌ Failed");

      if (!token) {
        console.error("❌ JWT token generation failed");
        return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=jwt_generation_failed`);
      }

      // ✅ Use same cookie options as your other controllers
      const cookieOption = {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production" ? true : false,
      };

      res.cookie("token", token, cookieOption);
      console.log("🍪 Cookie set with options:", cookieOption);

      // ✅ Success redirect
      console.log("🎯 Redirecting to dashboard");
      res.redirect(`${process.env.FRONTEND_URL}/dashboard/overview`);
      
    } catch (error) {
      console.error("❌ Google OAuth callback error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        user: req.user?.email || "No user"
      });
      
      return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=callback_exception&details=${encodeURIComponent(error.message)}`);
    }
  }
);

// ✅ Debug route to test Google auth flow
router.get("/auth/debug", (req, res) => {
  res.json({
    message: "Google Auth Debug Info",
    environment: process.env.NODE_ENV,
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "SET" : "MISSING",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "SET" : "MISSING",
    callbackUrl: process.env.NODE_ENV === "production" 
      ? process.env.GOOGLE_CALLBACK_URL 
      : process.env.GOOGLE_CALLBACK_URL_LOCAL,
    frontendUrl: process.env.FRONTEND_URL,
    timestamp: new Date().toISOString()
  });
});

export default router;