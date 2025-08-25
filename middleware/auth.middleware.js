import jwt from "jsonwebtoken";
import AppError from "../utils/error.utils.js";

const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    console.log("DEBUG >> Incoming token:", token);

    if (!token) {
      return next(new AppError("Please login to continue", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DEBUG >> Decoded token:", decoded);

    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
};

export {isLoggedIn}