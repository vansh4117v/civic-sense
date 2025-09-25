import React from "react";
import { LogOut, User, Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/button";

const TopNavbar = ({ setSidebarOpen }) => {
  const { logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 w-full fixed top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu & Logo */}
        <div className="flex items-center space-x-3">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            {/* <span className="text-green-600 text-xl sm:text-2xl font-bold">✻</span> */}
            <span className="text-xl sm:text-2xl font-bold">
              <span className="text-green-800">Civic</span>
              <span className="text-green-600">Sense</span>
            </span>
          </div>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button
            variant="ghost"
            className="flex items-center gap-1 sm:gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-2 sm:px-4 text-sm"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>

          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
