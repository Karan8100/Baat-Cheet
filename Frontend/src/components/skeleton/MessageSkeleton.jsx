import { motion } from "framer-motion";

const MessageSkeleton = () => {
  // 6 dummy messages loading state ke liye
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-base-100/50">
      {skeletonMessages.map((_, idx) => {
        const isAlignEnd = idx % 2 !== 0; // Alternating start and end

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`chat ${isAlignEnd ? "chat-end" : "chat-start"}`}
          >
            {/* 👤 Avatar Skeleton */}
            <div className="chat-image avatar">
              <div className="size-10 rounded-full">
                <div className="skeleton w-full h-full rounded-full" />
              </div>
            </div>

            {/* 🕒 Time/Header Skeleton */}
            <div className="chat-header mb-1">
              <div className="skeleton h-3 w-12 opacity-50" />
            </div>

            {/* 💬 Bubble Skeleton */}
            <div className="chat-bubble bg-transparent p-0 shadow-none">
              <div 
                className={`skeleton h-12 rounded-2xl 
                  ${isAlignEnd ? "rounded-tr-none" : "rounded-tl-none"}
                `}
                style={{ 
                  // Varying widths for a realistic chat look
                  width: idx % 3 === 0 ? "250px" : idx % 3 === 1 ? "180px" : "120px" 
                }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MessageSkeleton;