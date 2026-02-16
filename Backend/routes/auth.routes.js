import express from "express"
import { signup, verifyEmail ,login,checkAuth,logout,forgotPassword,resetPassword,updateProfile, verifyResetOtp} from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js";
const authRouter = express.Router()

authRouter.post("/signup",signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);

authRouter.post("/verify-email",verifyEmail); 
authRouter.post("/forgot-password",forgotPassword);
authRouter.post("/verify-reset-otp",verifyResetOtp);

authRouter.post("/reset-password",resetPassword);


authRouter.put("/update-profile",protectRoute, updateProfile)
authRouter.get("/check", protectRoute, checkAuth);




export default authRouter;
