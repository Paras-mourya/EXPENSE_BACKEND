import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cloudinary from "cloudinary";
import passport from "passport";
import session from "express-session";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

import "./config/passport.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";

import errorMiddleware from "./middleware/error.middleware.js";

connectDB();

const app = express();

// ✅ Create HTTP server for Socket.io
const server = http.createServer(app);

// ✅ Setup Socket.io with explicit path & methods
const io = new Server(server, {
  path: "/socket.io/",
  cors: {
    origin: [
      process.env.FRONTEND_URL,
      process.env.FRONTEND_URL_LOCAL,
      "http://localhost:3000",
      "https://expense-frontend-e4v6.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 🔹 Socket.io Events
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  setTimeout(() => {
    socket.emit("notification", {
      message: "Welcome! to FINEBANK.IO",
      time: new Date().toISOString(),
    });
  }, 3000);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_LOCAL,
  "http://localhost:3000",
  "https://expense-frontend-e4v6.vercel.app",
];

const vercelRegex = /^https:\/\/.*\.vercel\.app$/;

app.use((req, res, next) => {
  console.log("📝 Incoming request:");
  console.log("   Origin:", req.headers.origin);
  console.log("   Path:", req.path);
  next();
});

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        (origin && vercelRegex.test(origin))
      ) {
        return callback(null, true);
      }
      console.log("🚫 Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.options("*", cors());

// ✅ Basic middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// ✅ Session middleware (MUST be after cookieParser and before passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key-12345',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  }
}));

// ✅ Passport middleware (MUST be after session)
app.use(passport.initialize());
app.use(passport.session());

// ✅ Attach io instance to every request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ Additional headers for compatibility
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

// ✅ Test route for debugging
app.get("/api/test", (req, res) => {
  res.json({
    message: "Server is working!",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log("✅ FRONTEND_URL:", process.env.FRONTEND_URL);
  console.log("✅ FRONTEND_URL_LOCAL:", process.env.FRONTEND_URL_LOCAL);
  console.log("🔐 Google Client ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing");
  console.log("🔐 Google Client Secret:", process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Missing");
  console.log("🔐 JWT Secret:", process.env.JWT_SECRET ? "✅ Set" : "❌ Missing");
});