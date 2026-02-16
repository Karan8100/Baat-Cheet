import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import AuthImagePattern from "../components/AuthImagePattern";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
  try {
    await login(formData);
    // Success hone par navigate ki zaroorat nahi, App.jsx handle kar lega
  } catch (error) {
    // 🚩 Agar user verified nahi hai, toh usey OTP page par bhejo
    if (error.response?.data?.notVerified) {
      navigate("/verify-email", { state: { email: formData.email } });
    }
  }
  };

  return (
    <div className="h-screen grid lg:grid-cols-2 bg-base-200">
      {/* Left Side - Form Area */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8 bg-base-100 p-8 rounded-2xl shadow-xl border border-white/5"
        >
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
              <p className="text-base-content/60">Sign in to your account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="relative">
                <Mail className="absolute left-2 top-2 size-6 z-10 text-base-content/40" />
                <input
                  type="email"
                  placeholder="Email address"
                  className="input input-bordered w-full pl-10 focus:input-primary transition-all"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

            <div className="relative">
                <Lock className="absolute left-2 top-2 size-6 z-10 text-base-content/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="input input-bordered w-full pl-10 pr-10 focus:input-primary transition-all"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>  

           

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full shadow-lg shadow-primary/20"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center">
            <p className="text-base-content/60">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="link link-primary font-medium">
                Create account
              </Link>
            </p>
            <p className="text-base-content/60">
             <Link to="/forget-password" className="link link-primary font-medium" >forgot password?</Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Branding/Visuals */}
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect, chat and build meaningful conversations."
      />
    </div>
  );
};

export default Login;