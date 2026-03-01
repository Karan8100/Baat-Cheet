import { Server } from "socket.io";
import http from "http"
import dotenv from "dotenv";
import express from "express"
dotenv.config();

const app = express();
const server = http.createServer(app);

// Get allowed origins from environment variable or use defaults
const getAllowedOrigins = () => {
  const nodeEnv = process.env.NODE_ENV || "development";
  
  if (nodeEnv === "production" && process.env.ClientUrl) {
    return process.env.ClientUrl.split(",").map(url => url.trim());
  }
  
  // Development defaults
  return ["http://localhost:5173"];
};

const io = new Server(server, {
  cors: {
    origin: getAllowedOrigins(),
    credentials: true,
  },
});

// Online users track karne ke liye: { userId: socketId }
const userSocketMap = {};
// Active call track karne ke liye: { callId: { callerId, calleeId, callType } }
const activeCalls = {};

// Helper function receiver ki socket ID nikalne ke liye
export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};


io.on("connection",(socket)=>{
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId && userId !== "undefined") {
      userSocketMap[userId] = socket.id;
      console.log("User map updated:", Object.keys(userSocketMap));
    }
    
    // Broadcast online users to ALL clients including the new user
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    
    // Also send to the connecting socket directly
    socket.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Caller se initial call request aati hai (voice/video)
    socket.on("call:initiate", ({ callId, fromUserId, toUserId, callType }) => {
      const calleeSocketId = getReceiverSocketId(toUserId);

      if (!calleeSocketId) {
        io.to(socket.id).emit("call:unavailable", {
          callId,
          toUserId,
          reason: "offline",
        });
        return;
      }

      activeCalls[callId] = {
        callerId: fromUserId,
        calleeId: toUserId,
        callType,
      };

      io.to(calleeSocketId).emit("call:incoming", {
        callId,
        fromUserId,
        callType,
      });
    });

    // WebRTC offer forward karo caller -> callee
    socket.on("call:offer", ({ callId, fromUserId, toUserId, sdp }) => {
      const calleeSocketId = getReceiverSocketId(toUserId);
      if (!calleeSocketId) return;

      io.to(calleeSocketId).emit("call:offer", {
        callId,
        fromUserId,
        sdp,
      });
    });

    // WebRTC answer forward karo callee -> caller
    socket.on("call:answer", ({ callId, fromUserId, toUserId, sdp }) => {
      const callerSocketId = getReceiverSocketId(toUserId);
      if (!callerSocketId) return;

      io.to(callerSocketId).emit("call:answer", {
        callId,
        fromUserId,
        sdp,
      });
    });

    // ICE candidates dono peers ke beech relay karo
    socket.on("call:ice-candidate", ({ callId, fromUserId, toUserId, candidate }) => {
      const targetSocketId = getReceiverSocketId(toUserId);
      if (!targetSocketId) return;

      io.to(targetSocketId).emit("call:ice-candidate", {
        callId,
        fromUserId,
        candidate,
      });
    });

    socket.on("call:reject", ({ callId, fromUserId, toUserId }) => {
      const callerSocketId = getReceiverSocketId(toUserId);
      if (callerSocketId) {
        io.to(callerSocketId).emit("call:reject", {
          callId,
          fromUserId,
        });
      }
      delete activeCalls[callId];
    });

    socket.on("call:busy", ({ callId, fromUserId, toUserId }) => {
      const callerSocketId = getReceiverSocketId(toUserId);
      if (callerSocketId) {
        io.to(callerSocketId).emit("call:busy", {
          callId,
          fromUserId,
        });
      }
      delete activeCalls[callId];
    });

    socket.on("call:end", ({ callId, fromUserId, toUserId, reason = "ended" }) => {
      const targetSocketId = getReceiverSocketId(toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call:end", {
          callId,
          fromUserId,
          reason,
        });
      }
      delete activeCalls[callId];
    });
    
    socket.on("disconnect", () => {
     console.log("User disconnected", socket.id);

     // Agar disconnect hone wala user kisi active call me tha to dusre peer ko notify karo
     Object.entries(activeCalls).forEach(([callId, callData]) => {
      const { callerId, calleeId } = callData;
      const isCaller = callerId === userId;
      const isCallee = calleeId === userId;
      if (!isCaller && !isCallee) return;

      const peerUserId = isCaller ? calleeId : callerId;
      const peerSocketId = getReceiverSocketId(peerUserId);
      if (peerSocketId) {
        io.to(peerSocketId).emit("call:end", {
          callId,
          fromUserId: userId,
          reason: "disconnected",
        });
      }
      delete activeCalls[callId];
     });

     if (userId && userId !== "undefined") {
      delete userSocketMap[userId];
     }
     io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
    
})

export {io,app,server}
