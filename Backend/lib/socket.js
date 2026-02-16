import { Server } from "socket.io"; 
import http from "http"

import express from "express"

const app = express();
const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"], 
  },
});

// Online users track karne ke liye: { userId: socketId }
const userSocketMap = {};

// Helper function receiver ki socket ID nikalne ke liye
export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};


io.on("connection",(socket)=>{
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId != "undefined") userSocketMap[userId] = socket.id;
    

    // Saare users ko batao ki kaun kaun online hai
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // 1. Jab User A 'Call' button dabaye
  socket.on("call-user", ({ userToCall, signalData, from, name }) => {
    const receiverSocketId = getReceiverSocketId(userToCall);
    if (receiverSocketId) {
      // B ko batana ki call aa rahi hai aur A ka signal bhej dena
      io.to(receiverSocketId).emit("incoming-call", { 
        signal: signalData, // WebRTC Offer
        from,               // Caller ID
        name                // Caller Name
      });
    }
  });

  // 2. Jab User B 'Accept' button dabaye
  socket.on("answer-call", (data) => {
    const callerSocketId = getReceiverSocketId(data.to);
    if (callerSocketId) {
      // A ko batana ki call accept ho gayi aur B ka signal bhej dena
      io.to(callerSocketId).emit("call-accepted", data.signal); // WebRTC Answer
    }
  });

  // 3. Jab koi bhi call cut kare (Hang up)
  socket.on("end-call", ({ to }) => {
    const targetSocketId = getReceiverSocketId(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-ended");
    }
  });
    
    socket.on("disconnect", () => {
     console.log("User disconnected", socket.id);
     delete userSocketMap[userId];
     io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
    
})

export {io,app,server}