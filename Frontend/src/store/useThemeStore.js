import { create } from "zustand";

export const useThemeStore = create((set) => ({
  // LocalStorage se theme uthao, varna default "coffee" ya "dark" rakho
  theme: localStorage.getItem("chat-theme") || "dark",
  
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },
}));