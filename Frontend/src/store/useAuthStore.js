// src/store/useAuthStore.js
import { create } from "zustand";
import  { axiosInstance } from "../lib/axios.js"; // Axios instance with baseURL

import toast from "react-hot-toast";
import { io } from "socket.io-client";

// Get BASE_URL from environment variable or use defaults
const getBaseURL = () => {
  // If VITE_API_URL is set, use it for socket connection
  if (import.meta.env.VITE_API_URL) {
    console.log("✅ Using VITE_API_URL:", import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Development fallback
  if (import.meta.env.MODE === "development") {
    console.log("✅ Using development localhost");
    return "http://localhost:5000";
  }
  
  // Production fallback (same domain)
  return window.location.origin;
};

const BASE_URL = getBaseURL();

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,
  isUpdatingProfile: false,
  isVerifyingEmail: false,
  isSendingResetOtp: false,
  isVerifyingResetOtp: false, 
  isResettingPassword: false,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
       console.log("Error in checkAuth:", error);
       set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      throw error;
    } finally {
      set({ isSigningUp: false });
    }
  },
 
  // 5. Password Reset Step 2: Verify Reset OTP (Naya Function)
  verifyResetOtp: async (data) => {
    set({ isVerifyingResetOtp: true });
    try {
      const res = await axiosInstance.post("/auth/verify-reset-otp", data);
      toast.success("OTP Verified! Set your new password.");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP");
      throw error;
    } finally {
      set({ isVerifyingResetOtp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully!");
      get().connectSocket();
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      get().disconnectSocket();
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  verifyEmail: async (data) => {
    set({ isVerifyingEmail: true });
    try {
      const res = await axiosInstance.post("/auth/verify-email", data);
      set({ authUser: res.data });
      get().connectSocket();
      toast.success("Email verified successfully!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
      throw error;
    } finally {
      set({ isVerifyingEmail: false });
    }
  },

  forgotPassword: async (email) => {
    set({ isSendingResetOtp: true });
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      toast.success("OTP sent to your email");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
      throw error;
    } finally {
      set({ isSendingResetOtp: false });
    }
  },

  resetPassword: async (data) => {
    set({ isResettingPassword: true });
    try {
      const res = await axiosInstance.post("/auth/reset-password", data);
      toast.success("Password reset successfully!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
      throw error;
    } finally {
      set({ isResettingPassword: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser) return;
    
    const existingSocket = get().socket;
    // Only return if socket already exists and is properly connected
    if (existingSocket) {
      if (existingSocket.connected) return;
      // If socket exists but disconnected, disconnect it first
      existingSocket.disconnect();
    }

    console.log(" Connecting to socket at:", BASE_URL);
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },

      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Set up listener BEFORE connecting
    socket.on("getOnlineUsers", (userIds) => {
      console.log("Online users updated:", userIds);
      set({ onlineUsers: userIds });
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("reconnect", () => {
      console.log("✅ Socket reconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) socket.disconnect();
    set({ socket: null });
  },
}));

