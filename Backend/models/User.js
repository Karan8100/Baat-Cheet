import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    isVerified: { type: Boolean, default: false },

    otp: { type: String },

    otpExpires: { type: Date },
    // Fields for Password Reset (Ye naye add karne hain)
     resetPasswordOTP: { type: String },
     resetPasswordOTPExpires: { type: Date },
  },
  { timestamps: true }
);

const User  = mongoose.model("User",UserSchema);
export default User;