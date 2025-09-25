import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";
import DashboardPage from "./pages/Dashboard";
import LoginPage from "./pages/Login";
import PendingReportsPage from "./pages/reports/PendingReports";
import InProgressReportsPage from "./pages/reports/InProgressReports";
import ResolvedReportsPage from "./pages/reports/ResolvedReports";
import AssignedReportsPage from "./pages/reports/AssignedReports";
import DepartmentsPage from "./pages/Departments";
import SingleDepartmentPage from "./pages/SingleDepartment";
import OperatorsPage from "./pages/Operators";
import SingleOperatorPage from "./pages/SingleOperator";
import SettingsPage from "./pages/Settings";
import NotificationsPage from "./pages/Notifications";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { isAuthenticated, loading } = useAuth();

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

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />
        </Route>

        {/* Dashboard Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reports/pending" element={<PendingReportsPage />} />
          <Route path="/reports/in-progress" element={<InProgressReportsPage />} />
          <Route path="/reports/resolved" element={<ResolvedReportsPage />} />
          <Route path="/reports/assigned" element={<AssignedReportsPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/departments/:departmentId" element={<SingleDepartmentPage />} />
          <Route path="/operators" element={<OperatorsPage />} />
          <Route path="/operators/:operatorId" element={<SingleOperatorPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
