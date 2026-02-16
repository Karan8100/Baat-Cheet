import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const { forgotPassword, isSendingResetOtp } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword( email );
      // Email ko state mein bhej rahe hain taaki OTP page ko pata ho kahan verify karna hai
      navigate("/reset-otp", { state: { email } });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-base-200 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-base-100 p-8 rounded-2xl shadow-xl border border-white/5"
      >
        <div className="text-center mb-8">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Forgot Password?</h1>
          <p className="text-base-content/60">Enter your email to receive a reset code</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control">
            <div className="relative">
              <Mail className="absolute left-3 top-3 size-5 text-base-content/40" />
              <input
                type="email"
                className="input input-bordered w-full pl-10 focus:input-primary transition-all"
                placeholder="nirmal@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button className="btn btn-primary w-full" disabled={isSendingResetOtp}>
            {isSendingResetOtp ? <Loader2 className="animate-spin" /> : "Get OTP"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm link link-primary inline-flex items-center gap-2">
            <ArrowLeft className="size-4" /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgetPassword;