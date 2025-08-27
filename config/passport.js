import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/user.js";


dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? process.env.GOOGLE_CALLBACK_URL
          : process.env.GOOGLE_CALLBACK_URL_LOCAL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
       
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
       
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: "google-oauth", 
            isGoogleUser: true,       
            avatar: {
              secure_url: profile.photos[0]?.value,
            },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
