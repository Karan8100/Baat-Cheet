import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeleton/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { motion } from "framer-motion";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Scroll to bottom logic fix: Sirf messages change hone par bottom par jao
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto bg-base-100">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-base-100">
      <ChatHeader />

      {/* 💬 Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((message) => {
          const isMe = message.senderId === authUser._id;
          
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              key={message._id}
              className={`chat ${isMe ? "chat-end" : "chat-start"}`}
            >
              {/* Avatar */}
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border border-base-300 shadow-sm">
                  <img
                    src={
                      isMe
                        ? authUser.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.fullName}`
                        : selectedUser.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.fullName}`
                    }
                    alt="profile pic"
                  />
                </div>
              </div>

              {/* Timestamp */}
              <div className="chat-header mb-1">
                <time className="text-[10px] opacity-50 ml-1 font-medium">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              {/* Message Bubble */}
              <div 
                className={`chat-bubble flex flex-col gap-2 shadow-sm max-w-[85%] sm:max-w-[70%] 
                  ${isMe ? "bg-primary text-primary-content" : "bg-base-200 text-base-content"}`}
              >
                {message.image && (
                  <div className="relative group">
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="rounded-lg max-h-60 w-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                    />
                  </div>
                )}
                {message.text && <p className="text-sm sm:text-base leading-relaxed">{message.text}</p>}
              </div>
            </motion.div>
          );
        })}
        {/* Scroll Anchor: Isse hamesha niche scroll hoga */}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;