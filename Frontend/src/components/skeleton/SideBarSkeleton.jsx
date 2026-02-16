import { Users } from "lucide-react";
import { motion } from "framer-motion";

const SidebarSkeleton = () => {
  // 8 items loading state dikhane ke liye
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside className="h-full w-20 lg:w-80 border-r border-base-300 flex flex-col transition-all duration-200 bg-base-100">
      
      {/* 🛠️ Header Skeleton */}
      <div className="border-b border-base-300 w-full p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-base-200 rounded-lg">
            <Users className="size-6 text-base-content/20" />
          </div>
          <div className="skeleton h-6 w-24 hidden lg:block" />
        </div>

        {/* Filter Area Skeleton */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="skeleton size-4 rounded" />
            <div className="skeleton h-3 w-20" />
          </div>
          <div className="skeleton h-4 w-12 rounded-full" />
        </div>
      </div>

      {/* 👥 Skeleton Contacts List */}
      <div className="overflow-y-auto w-full py-2">
        {skeletonContacts.map((_, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.05 }} // Ek-ek karke appear honge
            className="w-full p-4 flex items-center gap-4"
          >
            {/* Avatar skeleton - Sidebar se matched rounded-2xl */}
            <div className="relative mx-auto lg:mx-0">
              <div className="skeleton size-12 rounded-2xl" />
            </div>

            {/* User info skeleton - Desktop only */}
            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="skeleton h-4 w-32 mb-2.5" />
              <div className="skeleton h-3 w-16" />
            </div>
          </motion.div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;