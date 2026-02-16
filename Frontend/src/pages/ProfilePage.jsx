import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Camera, Mail, User } from "lucide-react";
import { motion } from "framer-motion";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  // Random avatar logic based on name
  const avatarPlaceholder = `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser?.fullName || 'user'}`;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    // min-h-screen use kiya hai taaki scroll issue khatam ho jaye
    <div className="min-h-screen pt-20 pb-10 bg-base-200">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-base-100 rounded-2xl p-6 space-y-8 shadow-xl border border-base-300"
        >
          <div className="text-center">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="mt-1 text-base-content/60 text-sm">Manage your account information</p>
          </div>

          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || avatarPlaceholder}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 border-primary/20 shadow-inner"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-primary hover:bg-primary-focus
                  p-2.5 rounded-full cursor-pointer 
                  transition-all duration-200
                  shadow-lg border-2 border-base-100
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-primary-content" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-xs text-base-content/50 font-medium">
              {isUpdatingProfile ? "Uploading your new look..." : "Click the icon to change your photo"}
            </p>
          </div>

          {/* Info Section */}
          <div className="grid gap-6">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-base-content/40 uppercase tracking-wider flex items-center gap-2 px-1">
                <User className="w-3.5 h-3.5" />
                Full Name
              </div>
              <div className="px-4 py-3 bg-base-200 rounded-xl border border-base-300 font-medium text-base-content/80">
                {authUser?.fullName}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-base-content/40 uppercase tracking-wider flex items-center gap-2 px-1">
                <Mail className="w-3.5 h-3.5" />
                Email Address
              </div>
              <div className="px-4 py-3 bg-base-200 rounded-xl border border-base-300 font-medium text-base-content/80">
                {authUser?.email}
              </div>
            </div>
          </div>

          {/* Account Details Card */}
          <div className="bg-base-200 rounded-xl p-5 border border-base-300">
            <h2 className="text-sm font-bold uppercase tracking-widest text-base-content/50 mb-4">Account Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm py-2 border-b border-base-content/5">
                <span className="text-base-content/70">Joined On</span>
                <span className="font-mono">{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between text-sm py-2">
                <span className="text-base-content/70">Account Status</span>
                <span className="flex items-center gap-1.5 font-bold text-success">
                  <span className="size-2 bg-success rounded-full animate-pulse" />
                  Verified & Active
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ProfilePage;