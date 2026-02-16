import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const ResetOtpPassword = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Forgot Password page se aaya hua email
  const email = location.state?.email || ""; 

  // useAuthStore se password reset wale functions nikal rahe hain
  const { verifyResetOtp, isVerifyingResetOtp } = useAuthStore();

  const handleChange = (index, value) => {
    const newCode = [...code];
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);
      const lastIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastIndex < 5 ? lastIndex + 1 : 5;
      inputRefs.current[focusIndex].focus();
    } else {
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const verificationCode = code.join("");

    try {
      // Step 2: OTP verify karo backend se
      await verifyResetOtp({ email, otp: verificationCode });
      
      toast.success("Code verified! Now set your new password.");
      
      // Verification ke BAAD user ko Reset Password page par bhejo
      // Saath mein email aur otp bhi bhej rahe hain taaki Final Reset API call ho sake
      navigate("/reset-password", { state: { email, otp: verificationCode } }); 
      
    } catch (error) {
      toast.error(error.message || "Verification failed");
    }
  };

  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit();
    }
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-base-100 p-8 rounded-2xl shadow-xl border border-white/5 text-center"
      >
        {/* Text updated for Reset Context */}
        <h2 className="text-3xl font-bold mb-2">Password Reset</h2>
        <p className="text-base-content/60 mb-8">
          Enter the reset code sent to <br />
          <span className="font-semibold text-primary">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-between gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-2xl font-bold text-center bg-base-200 border-2 border-base-300 rounded-lg focus:border-primary focus:outline-none transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isVerifyingResetOtp || code.some((digit) => !digit)}
            className="btn btn-primary w-full shadow-lg shadow-primary/20"
          >
            {isVerifyingResetOtp ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Verify & Continue"
            )}
          </button>
        </form>

        <div className="mt-6">
          <button className="text-sm link link-primary no-underline hover:underline">
            Resend Reset Code
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetOtpPassword;