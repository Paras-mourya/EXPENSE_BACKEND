// passport.js - Fixed configuration
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/user.js";

dotenv.config();


passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === "production" 
        ? process.env.GOOGLE_CALLBACK_URL 
        : process.env.GOOGLE_CALLBACK_URL_LOCAL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("🔍 Google Profile:", profile);
        
        let user = await User.findOne({ email: profile.emails[0].value });
        
        if (!user) {
          console.log("🆕 Creating new Google user");
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            isGoogleUser: true,
            avatar: {
              secure_url: profile.photos[0]?.value || "",
            },
          });
        } else {
          console.log("👤 Existing user found");
          // Update avatar if user exists but avatar is empty
          if (!user.avatar?.secure_url && profile.photos[0]?.value) {
            user.avatar = {
              secure_url: profile.photos[0].value,
            };
            await user.save();
          }
        }

        return done(null, user);
      } catch (err) {
        console.error("❌ Google OAuth Error:", err);
        return done(err, null);
      }
    }
  )
);

export default passport;