import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based redirections for root path
  if (location.pathname === "/" || location.pathname === "/dashboard") {
    if (user?.role === "operator") {
      return <Navigate to="/reports/assigned" replace />;
    }
    // admin and departmentHead can access dashboard
  }

  // Role-based access control
  const isAccessAllowed = (path) => {
    const role = user?.role;

    // Define role-based access rules
    const accessRules = {
      operator: [
        "/reports/assigned",
        "/reports/pending",
        "/reports/in-progress",
        "/reports/resolved",
        "/settings",
      ],
      departmentHead: [
        "/dashboard",
        "/reports/pending",
        "/reports/in-progress",
        "/reports/resolved",
        "/departments",
        "/operators",
        "/settings",
      ],
      admin: [
        "/dashboard",
        "/reports/pending",
        "/reports/in-progress",
        "/reports/resolved",
        "/departments",
        "/operators",
        "/settings",
      ],
    };

    const allowedPaths = accessRules[role] || [];

    // Check exact path match first
    if (allowedPaths.includes(path)) {
      return true;
    }

    // Check for dynamic route patterns
    if (path.startsWith("/departments/") && allowedPaths.includes("/departments")) {
      return true;
    }

    if (path.startsWith("/operators/") && allowedPaths.includes("/operators")) {
      return true;
    }

    return false;
  };

  // Check if current path is allowed for user's role
  if (!isAccessAllowed(location.pathname)) {
    // Redirect to appropriate default page based on role
    const defaultPaths = {
      operator: "/reports/assigned",
      departmentHead: "/dashboard",
      admin: "/dashboard",
    };

    return <Navigate to={defaultPaths[user?.role] || "/login"} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
