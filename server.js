import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import cloudinary from "cloudinary";
import errorMiddleware from "./middleware/error.middleware.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";

// 👇 ADD THESE 2 IMPORTS
import passport from "passport";
import "./config/passport.js"; // ✅ yahan se strategy load hogi

dotenv.config();
connectDB();

const app = express();

// ✅ Allowed origins list
const allowedOrigins = [
  process.env.FRONTEND_URL,        // deployed frontend
  process.env.FRONTEND_URL_LOCAL,  // local frontend
];

// ✅ CORS setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// ✅ Initialize passport
app.use(passport.initialize());

// ✅ Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Routes
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/expenses", expenseRoutes);

// ✅ Error middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
