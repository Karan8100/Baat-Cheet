import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { motion } from "framer-motion";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="p-3 border-b border-base-300 bg-base-100/50 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          
          {/* 👤 Avatar with Online Indicator */}
          <div className="relative">
            <div className="size-10 rounded-full overflow-hidden border border-base-300 shadow-sm">
              <img 
                src={selectedUser.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.fullName}`} 
                alt={selectedUser.fullName} 
                className="object-cover size-full"
              />
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 size-3 bg-success rounded-full ring-2 ring-base-100 animate-pulse" />
            )}
          </div>

          {/* 📝 User Info */}
          <div className="text-left">
            <h3 className="font-bold text-base tracking-tight">{selectedUser.fullName}</h3>
            <div className="flex items-center gap-1.5">
               {isOnline ? (
                 <span className="text-[11px] text-success font-semibold flex items-center gap-1">
                   <span className="size-1.5 bg-success rounded-full" /> Online
                 </span>
               ) : (
                 <span className="text-[11px] text-base-content/40 font-medium">Offline</span>
               )}
            </div>
          </div>
        </div>

        {/* ❌ Close Button - Styled as a circular action */}
        <button 
          onClick={() => setSelectedUser(null)}
          className="btn btn-sm btn-circle btn-ghost hover:bg-base-300 transition-colors"
        >
          <X className="size-5 text-base-content/70" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;