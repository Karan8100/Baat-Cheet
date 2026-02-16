import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md text-center space-y-6"
      >
        {/* ✨ Icon Display with Glow Effect */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0] 
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center relative z-10"
            >
              <MessageSquare className="w-10 h-10 text-primary " />
            </motion.div>
            
            {/* Background Glow */}
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full -z-10 animate-pulse" />
          </div>
        </div>

        {/* 📝 Welcome Text */}
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Welcome to <span className="text-primary">Baat-Cheet!</span>
          </h2>
          <p className="text-base-content/60 text-lg">
            Bhai, sidebar se koi conversation select kar aur gupshup shuru kar! 🚀
          </p>
        </div>

        {/* 💡 Feature Tip (Optional but cool) */}
        <div className="pt-8 border-t border-base-content/5">
          <p className="text-xs uppercase tracking-widest text-base-content/40 font-bold">
            Real-time • Secure • Fast
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default NoChatSelected;