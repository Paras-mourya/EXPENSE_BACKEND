// ----------------- Load env first -----------------
import dotenv from "dotenv";
dotenv.config();

// ----------------- Core modules -----------------
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cloudinary from "cloudinary";
import passport from "passport";

// ----------------- DB -----------------
import connectDB from "./config/db.js";

// ----------------- Passport Config -----------------
import "./config/passport.js";   // 👈 Google strategy load ho jaayegi

// ----------------- Routes -----------------
import transactionRoutes from "./routes/transactionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";

// ----------------- Middleware -----------------
import errorMiddleware from "./middleware/error.middleware.js";

// ----------------- Connect DB -----------------
connectDB();

const app = express();

/* ----------------- CORS Config ----------------- */
const allowedOrigins = [
  process.env.FRONTEND_URL,        // deployed frontend (env)
  process.env.FRONTEND_URL_LOCAL,  // local frontend (env)
  "http://localhost:3000",         // fallback local
  "https://expense-frontend-e4v6.vercel.app", // fallback vercel
];

const vercelRegex = /^https:\/\/.*\.vercel\.app$/;

// ✅ Debug incoming request origin
app.use((req, res, next) => {
  console.log("👉 Incoming request:");
  console.log("   Origin:", req.headers.origin);
  console.log("   Path:", req.path);
  next();
});

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin || // Postman / server-to-server
        allowedOrigins.includes(origin) ||
        (origin && vercelRegex.test(origin))
      ) {
        return callback(null, true);
      }
      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ✅ Preflight request allow karo
app.options("*", cors());

// ✅ Force CORS headers (backup)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

/* ----------------- Common middleware ----------------- */
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(passport.initialize());  // ✅ initialize after strategy import

/* ----------------- Cloudinary ----------------- */
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ----------------- Routes ----------------- */
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/expenses", expenseRoutes);

/* ----------------- Error middleware (last) ----------------- */
app.use(errorMiddleware);

/* ----------------- Server ----------------- */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log("✅ FRONTEND_URL:", process.env.FRONTEND_URL);
  console.log("✅ FRONTEND_URL_LOCAL:", process.env.FRONTEND_URL_LOCAL);
  console.log("✅ Vercel subdomains allowed via:", vercelRegex);
});
