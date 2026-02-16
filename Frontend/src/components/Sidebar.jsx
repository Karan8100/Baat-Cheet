import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeleton/SideBarSkeleton";
import { Users, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const {onlineUsers} = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-80 border-r border-base-300 flex flex-col transition-all duration-300 bg-base-100">
      {/* 🛠️ Header Section */}
      <div className="border-b border-base-300 w-full p-5 space-y-4">
        <div className="flex items-center gap-3 text-primary">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="size-6" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden lg:block text-base-content">
            Contacts
          </span>
        </div>

        {/* 🔍 Filter & Search Area */}
        <div className="hidden lg:flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="cursor-pointer flex items-center gap-3 group">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-primary checkbox-sm transition-all"
              />
              <span className="text-sm font-medium text-base-content/70 group-hover:text-base-content transition-colors">
                Online Only
              </span>
            </label>
            <span className="text-[10px] font-bold px-2 py-1 bg-base-200 rounded-full text-zinc-500 uppercase tracking-wider">
              {Math.max(0, onlineUsers.length - 1)} Live
            </span>
          </div>
        </div>
      </div>

      {/* 👥 Users List Container */}
      <div className="overflow-y-auto w-full py-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredUsers.map((user) => (
            <motion.button
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full p-4 flex items-center gap-4
                transition-all duration-200 relative group
                ${selectedUser?._id === user._id 
                  ? "bg-primary/10 border-r-4 border-primary shadow-sm" 
                  : "hover:bg-base-200/50"}
              `}
            >
              {/* Avatar Section */}
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
                  alt={user.fullName}
                  className={`size-12 object-cover rounded-2xl transition-all duration-300
                    ${selectedUser?._id === user._id ? "scale-110 shadow-md" : "group-hover:scale-105"}
                  `}
                />
                
                {onlineUsers.includes(user._id) && (
                  <span className="absolute -bottom-0.5 -right-0.5 size-3.5 bg-green-500 rounded-full ring-4 ring-base-100 animate-pulse shadow-sm" />
                )}
              </div>

              {/* User info - Desktop Only */}
              <div className="hidden lg:block text-left min-w-0 flex-1">
                <div className="font-bold truncate text-base-content/90">
                  {user.fullName}
                </div>
                <div className="text-xs font-medium flex items-center gap-1.5 mt-0.5">
                  {onlineUsers.includes(user._id) ? (
                    <span className="text-success flex items-center gap-1">
                      <span className="size-1.5 bg-success rounded-full" /> Online
                    </span>
                  ) : (
                    <span className="text-base-content/40">Offline</span>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>

        {filteredUsers.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center text-base-content/40 py-10 flex flex-col items-center gap-2"
          >
            <div className="size-12 bg-base-200 rounded-full flex items-center justify-center opacity-50">
              <Users className="size-6" />
            </div>
            <p className="text-sm font-medium">No one's here yet</p>
          </motion.div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;