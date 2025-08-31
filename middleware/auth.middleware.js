import jwt from "jsonwebtoken";
import AppError from "../utils/error.utils.js";
import User from "../models/user.js";
 
const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    console.log("DEBUG >> Incoming token:", token);

    if (!token) {
      return next(new AppError("Please login to continue", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DEBUG >> Decoded token:", decoded);

   
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    req.user = user; 
    next();
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
};

export { isLoggedIn };
