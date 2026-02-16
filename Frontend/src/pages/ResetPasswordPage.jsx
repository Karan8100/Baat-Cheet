import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { resetPassword, isResettingPassword } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // OTP page se pass kiya hua data nikal rahe hain
  const { email, otp } = location.state || {};

  // Security check: Agar koi direct is page par aaye bina OTP verify kiye
  if (!email || !otp) {
    navigate("/forgot-password");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    try {
      await resetPassword({ email, otp, newPassword: password });
      // Success toast store ke andar se hi aa jayega
      navigate("/login");
    } catch (error) {
      console.log("Error resetting password:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-base-100 p-8 rounded-2xl shadow-xl border border-white/5"
      >
        <div className="text-center mb-8">
          <div className="size-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="size-6 text-success" />
          </div>
          <h1 className="text-2xl font-bold">New Password</h1>
          <p className="text-base-content/60">Please enter your new secure password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password Input */}
          <div className="form-control">
            <div className="relative">
              <Lock className="absolute left-3 top-3 size-5 text-base-content/40" />
              <input
                type={showPassword ? "text" : "password"}
                className="input input-bordered w-full pl-10 pr-10 focus:input-primary transition-all"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="size-5 text-base-content/40" />
                ) : (
                  <Eye className="size-5 text-base-content/40" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="form-control">
            <div className="relative">
              <Lock className="absolute left-3 top-3 size-5 text-base-content/40" />
              <input
                type={showPassword ? "text" : "password"}
                className="input input-bordered w-full pl-10 focus:input-primary transition-all"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full shadow-lg shadow-primary/20"
            disabled={isResettingPassword}
          >
            {isResettingPassword ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Updating...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;