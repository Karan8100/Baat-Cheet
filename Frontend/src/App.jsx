import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useCallStore } from "./store/useCallStore";

import NavBar from "./components/NavBar";
import CallModal from "./components/CallModal";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import Login from "./pages/Login";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgetPassword from "./pages/ForgetPassword";
import ResetOtpPassword from "./pages/ResetOtpPassword";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, socket } = useAuthStore();
  const { theme } = useThemeStore();
  const initializeSocketListeners = useCallStore((state) => state.initializeSocketListeners);
  const cleanupSocketListeners = useCallStore((state) => state.cleanupSocketListeners);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!socket || !authUser) return;

    initializeSocketListeners(socket);
    return () => cleanupSocketListeners(socket);
  }, [socket, authUser, initializeSocketListeners, cleanupSocketListeners]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-100">
        <Loader className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <NavBar />

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
        <Route path="/verify-email" element={!authUser ? <VerifyEmailPage /> : <Navigate to="/" />} />
        <Route path="/forget-password" element={!authUser ? <ForgetPassword /> : <Navigate to="/" />} />
        <Route path="/reset-otp" element={!authUser ? <ResetOtpPassword /> : <Navigate to="/" />} />
        <Route path="/reset-password" element={!authUser ? <ResetPasswordPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/settings" element={ <SettingsPage /> } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {authUser && <CallModal />}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default App;
