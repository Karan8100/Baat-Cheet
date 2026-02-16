import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import { motion } from "framer-motion";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4 pt-20">
      {/* 🚀 Main Outer Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-7xl h-[calc(100vh-120px)] border border-base-content/5 overflow-hidden"
      >
        <div className="flex h-full">
          
          {/* 📱 LEFT: SIDEBAR (Users List) */}
          <aside className={`
            h-full border-r border-base-content/5 transition-all duration-300
            ${selectedUser ? "hidden md:flex w-80 lg:w-96" : "flex w-full md:w-80 lg:w-96"}
          `}>
            <Sidebar />
          </aside>

          {/* 💬 RIGHT: CHAT AREA */}
          <main className={`
            flex-1 flex flex-col h-full overflow-hidden transition-all duration-300
            ${!selectedUser ? "hidden md:flex" : "flex"}
          `}>
            {!selectedUser ? (
              <NoChatSelected />
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="h-full flex flex-col"
              >
                <ChatContainer />
              </motion.div>
            )}
          </main>

        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;