import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from 'crypto'
console.log("DEBUG >> JWT_SECRET AT MODEL LOAD:", process.env.JWT_SECRET);
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    public_id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
   forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
  phone: String,
},{
    timestamps:true,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.generateJWTToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY,
    }
  );
};

userSchema.methods.generatePasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 min

  return resetToken;
};

const User =  model("User", userSchema);
export default User
