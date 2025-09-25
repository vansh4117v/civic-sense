import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar";
import TopNavbar from "../components/navigation/TopNavbar";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-background">
      {/* Top Navbar - Fixed */}
      <TopNavbar setSidebarOpen={setSidebarOpen} />

      {/* Main Layout - Account for fixed header */}
      <div className="flex h-full pt-16">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {/* Page Content */}
          <main className="h-full overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
