import { motion } from "framer-motion";

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex relative items-center justify-center overflow-hidden bg-linear-to-br from-base-200 via-base-100 to-base-200 p-12">

      {/* floating gradient blobs */}
      <div className="absolute w-72 h-72 bg-primary/20 rounded-full blur-3xl top-10 left-10" />
      <div className="absolute w-72 h-72 bg-secondary/20 rounded-full blur-3xl bottom-10 right-10" />

      <div className="relative max-w-md text-center backdrop-blur-xl bg-base-100/60 border border-base-content/10 rounded-3xl p-10 shadow-2xl">
        
        {/* animated grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.4, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: i * 0.05,
                repeat: Infinity,
                repeatType: "mirror",
                repeatDelay: 1.5,
              }}
              className="aspect-square rounded-2xl bg-primary/20"
            />
          ))}
        </div>

        <h2 className="text-3xl font-bold mb-3">{title}</h2>
        <p className="text-base-content/60 leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;