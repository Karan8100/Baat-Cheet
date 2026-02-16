import User from "../models/User.js"
import bcrypt from "bcryptjs"
import { sendEmail,sendResetEmail } from "../lib/sendEmail.js";
import { generateToken } from "../lib/utils.js";

import cloudinary from "../lib/cloudinary.js";
export const signup = async(req,res)=>{
    const { fullName, email, password } = req.body;

    try{
     if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
     }

     if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Agar user pehle se hai aur verified hai
      if (existingUser.isVerified) {
        return res.status(400).json({ message: "Email already exists" });
      } 
      // Agar user hai par verified nahi hai, toh purana record delete karke naya bana sakte hain
      // Ya phir isi user ka OTP update kar sakte hain
      await User.deleteOne({ email }); 
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    // 3. Generate 6-Digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    const newUser = new User({
        email,
        fullName,
        password:hashedPassword,
        otp,
        otpExpires,
        
    })

     
        await newUser.save();

       // 2. Mailtrap sendEmail call
    try {
      await sendEmail(email, "Verify your Account", otp);
      res.status(201).json({
        success: true,
        message: "OTP sent to your email!",
        email: newUser.email,
      });
    } catch (emailError) {
      await User.deleteOne({ email: newUser.email });
      return res.status(500).json({ message: "Error sending email" });
    }


      
    
    

    }catch(error){
      console.log("Error in signup controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
}

export const verifyEmail = async (req, res) => {
  const { email ,otp } = req.body;
  try {
    const user = await User.findOne({ 
      email,
      otp, 
      otpExpires: { $gt: Date.now() } // Check if OTP is not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined; // Clear OTP fields
    user.otpExpires = undefined;
    await user.save();

    // AB GENERATE KARO TOKEN
    generateToken(user._id, res);

    res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        isVerified: user.isVerified
      });
  } catch (error) {
    res.status(500).json({ message: "error while verifying otp" });
  }
};

export const login = async(req,res)=>{
    const { email, password } = req.body;
    try{
      if (!email || !password) {
         return res.status(400).json({ message: "All fields are required" });
       }
       const user = await User.findOne({ email });

       if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
       }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(401).json({ message: "Invalid credentials" })
        }

        if(!user.isVerified){
          return res.status(400).json({ 
          message: "Your email is not verified. Please verify it first.",
          notVerified: true // Frontend ko hint dene ke liye
         });
        }

        generateToken(user._id, res);

      res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      });
    }catch(error){
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Save OTP and Expiry in DB
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 15 * 60 * 1000; // 15 mins expiry
    await user.save();

    // 3. Send Email using your Resend utility
    try {
      await sendResetEmail(email, "Password Reset OTP", otp);
      return res.json({ success: true, message: "OTP sent to your email" });
    } catch (mailError) {
      return res.json({ success: false, message: "Error sending email" });
    }

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Step 2: OTP Verify karne ke liye
export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() }, // Expiry check
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Agar sab sahi hai
    res.status(200).json({ success: true, message: "OTP verified successfully. Proceed to reset password." });

  } catch (error) {
    console.log("Error in verifyResetOtp:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



export const resetPassword = async (req,res) =>{
    const {email,otp,newPassword} = req.body;
    try{
      

    if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() }, // Expiry check
    })

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // 2. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);


    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    return res.json({ success: true, message: "Password reset successful! You can now login." });
  
    }catch(error){
      
      res.json({ success: false, message: error.message });
    }
} 




export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    // req.user protectRoute middleware se aata hai
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    // 1. Pehle current user ka data nikaalo purani photo check karne ke liye
    const currentUser = await User.findById(userId);
    
    // 2. Agar purani photo hai, toh use Cloudinary se delete karo
    // (Taaki storage waste na ho)
    if (currentUser.profilePic) {
      try {
        // secure_url se public_id nikalna padta hai delete karne ke liye
        const publicId = currentUser.profilePic.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (delError) {
        console.log("Old image delete failed (Optional):", delError.message);
      }
    }

    // 3. Nayi image upload karo
    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      folder: "chat_avatars", // Images ko organize karne ke liye folder
    });

    // 4. DB update karo
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    ).select("-password"); // Password ko response mein mat bhejo (Security!)

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};