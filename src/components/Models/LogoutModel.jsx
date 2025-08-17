"use client";
import React from "react";
import { signOut } from "next-auth/react";

const LogoutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      // Call NextAuth signOut to handle session cleanup
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Logout error:", error);
      // Still proceed with signOut even if there's an error
      await signOut({ callbackUrl: "/login" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Are you sure,
            <br />
            you want to Logout ?
          </h3>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 cursor-pointer rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            No
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 py-2 px-4 bg-[#25A4E8] cursor-pointer text-white rounded-lg font-medium hover:bg-[#25A4E8]/80 transition-colors"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal; 