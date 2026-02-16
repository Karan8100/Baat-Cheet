import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email");
    if (!formData.password) return toast.error("Password required");
    if (formData.password.length < 6) return toast.error("Min 6 characters");

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = validateForm();

    if (success) {
      try{
       const res = await signup(formData);
       if (res?.success || res?.email) {
        toast.success("OTP sent to your email!");
        navigate("/verify-email", { state: { email: formData.email } });
      }
      }catch(error){
        toast.error(error.message || "Signup failed");
      }  
      
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-linear-to-br from-base-200 via-base-100 to-base-200">
      {/* LEFT */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="backdrop-blur-xl bg-base-100/60 border border-base-content/10 shadow-2xl rounded-3xl p-8 space-y-6">
            
            {/* LOGO */}
            <div className="text-center space-y-2">
              <div className="mx-auto size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="text-primary size-7" />
              </div>
              <h1 className="text-3xl font-bold">Create Account</h1>
              <p className="text-base-content/60">Start chatting in seconds 🚀</p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* NAME */}
              <div className="relative">
                <User className="absolute z-10 size-6 left-2 top-2 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="input input-bordered w-full pl-10 focus:input-primary transition-all"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>

              {/* EMAIL */}
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

              {/* PASSWORD */}
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

              {/* BUTTON */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                type="submit"
                className="btn btn-primary w-full text-base"
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <>
                    <Loader2 className="animate-spin size-5" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </motion.button>
            </form>

            {/* LOGIN */}
            <p className="text-center text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* RIGHT */}
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect, chat and build meaningful conversations."
      />
    </div>
  );
};

export default SignUpPage;