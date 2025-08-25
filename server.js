import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import accountRoutes from "./routes/accountRoutes.js"
import billRoutes from "./routes/billRoutes.js"
import goalRoutes from "./routes/goalRoutes.js"
import expenseRoutes from "./routes/expenseRoutes.js"
import cloudinary from "cloudinary"
import errorMiddleware from "./middleware/error.middleware.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";
dotenv.config();
connectDB();

const app = express();


app.use(express.json());

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  })
);
app.use(cookieParser());

app.use(morgan("dev"));


cloudinary.v2.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET,

})
app.use(errorMiddleware);


app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/accounts",accountRoutes)
app.use("/api/bills",billRoutes)
app.use("/api/goals",goalRoutes)
app.use("/api/expenses", expenseRoutes)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
