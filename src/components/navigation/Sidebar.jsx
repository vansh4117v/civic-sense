import React from "react";
import { Home, FileText, Users, Building2, Settings, Clock } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Role-based navigation
  const getNavigationItems = () => {
    const commonReports = [
      { name: "Pending Reports", href: "/reports/pending", icon: Clock },
      { name: "In Progress Reports", href: "/reports/in-progress", icon: FileText },
      { name: "Resolved Reports", href: "/reports/resolved", icon: FileText },
    ];

    const baseNavigation = {
      operator: [
        { name: "Assigned Reports", href: "/reports/assigned", icon: FileText },
        ...commonReports,
        { name: "Settings", href: "/settings", icon: Settings },
      ],
      departmentHead: [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        ...commonReports,
        { name: "Operators", href: "/operators", icon: Users },
        { name: "Settings", href: "/settings", icon: Settings },
      ],
      admin: [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        ...commonReports,
        { name: "Departments", href: "/departments", icon: Building2 },
        { name: "Settings", href: "/settings", icon: Settings },
      ],
    };

    return baseNavigation[user?.role] || [];
  };

  const navigation = getNavigationItems();

  return (
    <>
      {/* Background overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-4 md:pt-0">
          {/* Mobile header with close button */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 md:hidden">
            <div className="flex items-center space-x-2">
              <span className="text-green-600 text-xl font-bold">✻</span>
              <span className="text-xl font-bold">
                <span className="text-green-800">Civic</span>
                <span className="text-green-600">Sense</span>
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={() => setSidebarOpen(false)} // Close sidebar on mobile after navigation
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      location.pathname === item.href
                        ? "bg-gray-100 text-gray-900 border-r-2 border-green-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
