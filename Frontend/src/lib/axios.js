import axios from "axios"

// Get API URL from environment variable or use defaults
const getBaseURL = () => {
  // If VITE_API_URL is set via environment variables, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL + "/api";
  }
  
  // Otherwise use defaults based on mode
  if (import.meta.env.MODE === "development") {
    return "http://localhost:5000/api";
  }
  
  return "/api";
};

export const axiosInstance = axios.create({
    baseURL: getBaseURL(),
    withCredentials:true,
});