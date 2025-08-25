import User from "../models/user.js";
import AppError from "../utils/error.utils.js";
import path from "path";
import cloudinary from "cloudinary";
import fs from "fs";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

const cookieOption = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
};

const register = async (req,res,next) => {
    const {name,email,password}=req.body


    if(!name || !email || !password){
        return next(new AppError("All fields are required", 400))
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(new AppError("User already exists", 400));
    }

    const user = await User.create({
        name,
        email,
        password
    })
    console.log("new user created :",user._id);

    user.password=undefined

    const token = await user.generateJWTToken()
    console.log("JWT token generated :",token);

res.cookie("token", token, cookieOption);
  res.status(200).json({
    success: true,
    message: "Account Created Successfully",
    user,
  });
}

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
    return next(new AppError("All fields are required", 400));
  }

  const user = await User.findOne({ email }).select("+password");
if (!user || !(await bcrypt.compare(password, user.password))) {
      console.warn(" Invalid credentials");
      return next(new AppError("email or password does not match"));
    }

  

  const token = await user.generateJWTToken();
  console.log("JWT token generated :", token);
user.password=undefined
  res.cookie("token", token, cookieOption);
  res.status(200).json({
    success: true,
    message: " user Login Successful",
    user,
  });
  } catch (error) {
    console.log("Error occurred during login:", error);
    return next(new AppError(error.message, 500));
  }
};

const logout = async (req, res, next) => {
  console.log("incoming login request");

  try {
    const cookieOption = {
      maxAge: 0,
      httpOnly: true
    };
    res.cookie("token", null, cookieOption);  // token delete
    console.log("user logged out");
    res.status(200).json({
      success: true,
      message: "user logged out successfully"
    });
  } catch (error) {
    console.error(" Logout error:", error);
    return next(new AppError(error.message, 400));
  }
};

const getProfile = async (req, res, next) => {
  console.log("Incoming getProfile request");
  const userId = req.user.id;   // token se user.id aa rha hai
  console.log("User ID from token:", userId);

  try {
    const user = await User.findById(userId);
    console.log("Profile found:", !!user);

    return res.status(200).json({
      success: true,
      message: "user profile",
      user,
    });
  } catch (error) {
    console.error(" Get profile error:", error);
    return next(new AppError(error.message, 400));
  }
};


const forgotPassword = async (req, res, next) => {
  console.log(" Incoming forgotPassword request");
  console.log(" Body received:", req.body);

  const { email } = req.body;
  if (!email) {
    console.warn(" Email missing");
    return next(new AppError("email is required", 400));
  }

  const user = await User.findOne({ email });
  console.log("User found for reset:", !!user);

  if (!user) {
    return next(new AppError("email not registered", 400));
  }

  const resetToken = await user.generatePasswordResetToken();
  await user.save();
  console.log(" Password reset token generated:", resetToken);

  const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  console.log(" Reset URL:", resetPasswordURL);

  const message = `Click the link to reset your password: ${resetPasswordURL}`;
  const subject = "Reset Your Password";

  try {
    await sendEmail(email, subject, message);
    console.log("Reset email sent to:", email);

    res.status(200).json({
      success: true,
      message: `Reset password token has been sent to ${email} successfully`,
    });
  } catch (error) {
    console.error(" Forgot password error:", error);
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    await user.save();
    return next(new AppError(error.message), 500);
  }
};
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; 
    const { name } = req.body;

    let updateData = {};

    if (name) updateData.name = name;

   
    if (req.file) {
      const filePath = path.resolve(req.file.path).replace(/\\/g, "/");
      console.log(" Uploading new avatar to Cloudinary:", filePath);

      const result = await cloudinary.v2.uploader.upload(filePath, {
        folder: "udemyProject",
        width: 250,
        height: 250,
        gravity: "faces",
        crop: "fill",
        resource_type: "auto",
        timeout: 120000, // 2 minutes
      });

      console.log(" Cloudinary upload success:", result.secure_url);

      updateData.avatar = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };

      // local temp file delete
      await fs.promises.rm(req.file.path);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    updatedUser.password = undefined;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(" Update profile error:", error);
    return next(new AppError(error.message, 500));
  }
};

const resetPassword = async (req, res, next) => {
  console.log(" Incoming resetPassword request");
  console.log(" Params:", req.params);
  console.log(" Body:", req.body);

  const { resetToken } = req.params;
  const { password } = req.body;

  const forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log(" Hashed reset token:", forgotPasswordToken);

  const user = await User.findOne({
    forgotPasswordToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  console.log(" User found for password reset:", !!user);

  if (!user) {
    return next(new AppError("Token is invalid", 400));
  }

  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();
  console.log(" Password changed for user:", user._id);

  res.status(200).json({
    success: true,
    messgae: "Password changed successfully",
  });
};


export { register, login, logout, getProfile, forgotPassword , updateProfile, resetPassword };