import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br bg-[#8ac9a0] relative overflow-hidden">
      {/* City Silhouette Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/30 to-transparent"></div>
        {/* Building silhouettes */}
        <div className="absolute bottom-0 left-0 w-full flex items-end justify-center opacity-40">
          <div className="flex items-end space-x-1">
            <div className="w-8 h-16 bg-white/20 rounded-t"></div>
            <div className="w-6 h-24 bg-white/20 rounded-t"></div>
            <div className="w-10 h-20 bg-white/20 rounded-t"></div>
            <div className="w-7 h-28 bg-white/20 rounded-t"></div>
            <div className="w-9 h-18 bg-white/20 rounded-t"></div>
            <div className="w-6 h-22 bg-white/20 rounded-t"></div>
            <div className="w-8 h-26 bg-white/20 rounded-t"></div>
          </div>
        </div>
      </div>

      {/* Login Form Container */}
      <div className="relative z-10 w-full max-w-md p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
