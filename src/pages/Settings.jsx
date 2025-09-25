import React, { useState } from "react";
import { getSettings } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";

const SettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUserJobTitle = React.useCallback(() => {
    switch (user?.role) {
      case "admin":
        return "System Administrator";
      case "departmentHead":
        return `Department Head - ${user.department}`;
      case "operator":
        return `Field Operator - ${user.department}`;
      default:
        return "User";
    }
  }, [user?.role, user?.department]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getSettings();
        const userSettings = {
          ...data,
          profile: {
            fullName: user?.name || data.profile.fullName,
            jobTitle: getUserJobTitle(),
            contactEmail: user?.email || data.profile.contactEmail,
          },
        };
        setSettings(userSettings);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load settings:", err);
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, getUserJobTitle]);

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleInputChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Manage your CivicSense profile, preferences, and system configurations.
        </p>
      </div>

      {/* Account Profile Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Account Profile</h2>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          Update your personal details and account information.
        </p>

        {/* User Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-xl flex-shrink-0">
            {getUserInitials()}
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-gray-900">{user?.name || "User"}</h3>
            <p className="text-gray-600">{user?.email || "No email"}</p>
            <div className="flex flex-col sm:flex-row items-center sm:items-start mt-2 space-y-2 sm:space-y-0 sm:space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                {user?.role === "admin"
                  ? "Administrator"
                  : user?.role === "departmentHead"
                  ? "Department Head"
                  : user?.role === "operator"
                  ? "Operator"
                  : "User"}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 border-green-200 hover:bg-green-50 w-full sm:w-auto"
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-2 block">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              value={settings?.profile?.fullName || ""}
              onChange={(e) => handleInputChange("profile", "fullName", e.target.value)}
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="jobTitle" className="text-sm font-medium text-gray-700 mb-2 block">
              Job Title
            </Label>
            <Input
              id="jobTitle"
              type="text"
              value={settings?.profile?.jobTitle || ""}
              onChange={(e) => handleInputChange("profile", "jobTitle", e.target.value)}
              className="bg-gray-50"
            />
          </div>
        </div>

        <div className="mt-6">
          <Label htmlFor="contactEmail" className="text-sm font-medium text-gray-700 mb-2 block">
            Contact Email
          </Label>
          <Input
            id="contactEmail"
            type="email"
            value={settings?.profile?.contactEmail || ""}
            onChange={(e) => handleInputChange("profile", "contactEmail", e.target.value)}
            className="bg-gray-50 max-w-md"
          />
        </div>
      </div>

      {/* Application Preferences Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Application Preferences</h2>
        <p className="text-gray-600 mb-6">Configure how CivicSense looks and behaves for you.</p>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <div className="mr-4">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a8.97 8.97 0 008.354-5.646z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Dark Mode</h3>
              <p className="text-sm text-gray-600">Toggle between light and dark themes.</p>
            </div>
          </div>
          <Switch
            checked={settings?.preferences?.darkMode || false}
            onCheckedChange={(checked) => handleInputChange("preferences", "darkMode", checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
