import  { useEffect } from 'react';
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Store & Components
import { useAuthStore } from './store/useAuthStore';
import NavBar from './components/NavBar';

// Pages
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import Login from './pages/Login';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgetPassword from './pages/ForgetPassword';
import ResetOtpPassword from './pages/ResetOtpPassword';
import ResetPasswordPage from './pages/ResetPasswordPage'; // Ise import karna mat bhulna
import ProfilePage from './pages/ProfilePage';
import { useThemeStore } from './store/useThemeStore';
import SettingsPage from './pages/SettingsPage';
//import ProfilePage from './pages/ProfilePage'; // Agar banaya hai toh

const App = () => {
  const { authUser, checkAuth, isCheckingAuth ,onlineUsers} = useAuthStore();
  const location = useLocation();
  const {theme} = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Loading State: Jab tak backend se confirm na ho jaye ki user login hai ya nahi
  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-100">
        <Loader className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div data-theme={theme}> {/* Ya jo bhi tera default theme ho */}
      <NavBar />

      <Routes>
        {/* 🏠 Main Route: Agar login hai toh Home, varna Login par dhakka do */}
        <Route 
          path="/" 
          element={authUser ? <HomePage /> : <Navigate to="/login" />} 
        />

        {/* 🔐 Auth Routes: Agar user pehle se login hai, toh wo yahan nahi aa sakta */}
        <Route 
          path="/signup" 
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/login" 
          element={!authUser ? <Login /> : <Navigate to="/" />} 
        />

        {/* 📧 Verification & Password Reset: Sirf un-authenticated users ke liye */}
        <Route 
          path="/verify-email" 
          element={!authUser ? <VerifyEmailPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/forget-password" 
          element={!authUser ? <ForgetPassword /> : <Navigate to="/" />} 
        />
        <Route 
          path="/reset-otp" 
          element={!authUser ? <ResetOtpPassword /> : <Navigate to="/" />} 
        />
        <Route 
          path="/reset-password" 
          element={!authUser ? <ResetPasswordPage /> : <Navigate to="/" />} 
        />

        {/* 👤 Profile Route: Protected */}
        {/* <Route 
          path="/profile" 
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />} 
        /> */}

        <Route path="/profile" element={<ProfilePage/>}/>

        

        {/* 404 handler: Kuch bhi galat ho toh redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage/>} />
      </Routes>

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default App;