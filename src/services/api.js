// Helper function to validate token (basic JWT validation)
const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    // Split JWT token to get payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    return payload.exp && payload.exp > currentTime;
  } catch {
    // If token is malformed, consider it invalid
    return false;
  }
};

// Helper function to get valid token with priority handling
const getValidToken = () => {
  const sessionToken = sessionStorage.getItem("civicflow_token");
  const localToken = localStorage.getItem("civicflow_token");
  
  // Priority 1: Valid session token (current session takes precedence)
  if (sessionToken && isTokenValid(sessionToken)) {
    return sessionToken;
  }
  
  // Priority 2: Valid local token (persistent login)
  if (localToken && isTokenValid(localToken)) {
    return localToken;
  }
  
  // If no valid tokens, clean up invalid ones
  if (sessionToken && !isTokenValid(sessionToken)) {
    sessionStorage.removeItem("civicflow_token");
    sessionStorage.removeItem("civicflow_user");
  }
  
  if (localToken && !isTokenValid(localToken)) {
    localStorage.removeItem("civicflow_token");
    localStorage.removeItem("civicflow_user");
  }
  
  return null;
};

// API helper function
const apiCall = async (endpoint, options = {}) => {
  const token = getValidToken();
  const response = await fetch(`https://civic-issue-backend-oju3.onrender.com${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 401) {
    // Clear both storages on unauthorized
    localStorage.removeItem("civicflow_token");
    localStorage.removeItem("civicflow_user");
    sessionStorage.removeItem("civicflow_token");
    sessionStorage.removeItem("civicflow_user");
    window.location.href = "/login";
    return;
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "API call failed");
  }
  return data;
};

// Helper function to map backend user data to frontend format
const mapBackendUser = (backendUser) => ({
  id: backendUser.id,
  name: backendUser.fullName,
  fullName: backendUser.fullName,
  email: backendUser.email,
  // Map backend roles to frontend expected roles
  role: mapBackendRole(backendUser.role),
  department: backendUser.department,
  departmentId: backendUser.departmentId,
  avatar: "/api/placeholder/32/32", // Default avatar since backend doesn't provide it
});

// Map backend role names to frontend expected role names
const mapBackendRole = (backendRole) => {
  const roleMap = {
    admin: "admin",
    SUPER_ADMIN: "admin",
    department_head: "departmentHead",
    DEPARTMENT_HEAD: "departmentHead",
    operator: "operator",
    OPERATOR: "operator",
    citizen: "citizen",
    CITIZEN: "citizen",
  };

  return roleMap[backendRole] || backendRole.toLowerCase();
};

// Helper function to map backend department data to frontend format
const mapBackendDepartment = (backendDept) => ({
  id: backendDept.id?.toString(), // Ensure ID is string
  name: backendDept.name,
  openReports: backendDept.openReports || 0,
  avgResolutionTime: backendDept.avgResolutionTime || "N/A",
  activeReports: backendDept.activeReports || 0,
  resolvedLast30Days: backendDept.resolvedLast30Days || 0,
  manager: backendDept.manager || backendDept.departmentHead,
  email: backendDept.email,
  phone: backendDept.phone,
  address: backendDept.address,
  description: backendDept.description,
});

// Helper function to map backend operator data to frontend format
const mapBackendOperator = (backendOp) => ({
  id: backendOp.id?.toString(), // Ensure ID is string
  name: backendOp.name || backendOp.operatorName,
  status: backendOp.status || "available",
  workload: backendOp.workload || 0,
  email: backendOp.email,
  phone: backendOp.phone || backendOp.phoneNumber,
  department: backendOp.department || backendOp.specialization,
  joinDate: backendOp.joinDate,
  completedReports: backendOp.completedReports || 0,
  avgResolutionTime: backendOp.avgResolutionTime || "N/A",
  description: backendOp.description || backendOp.specialization,
});

// Helper function to map backend report data
const mapBackendReport = (report) => ({
  id: report.id,
  title: report.title,
  description: report.description,
  address: report.address,
  latitude: report.latitude,
  longitude: report.longitude,
  photoUrl: report.photoUrl,
  voiceUrl: report.voiceUrl,
  createdAt: report.createdAt || report.dateReported || report.submittedDate,
  dateReported: report.createdAt || report.dateReported || report.submittedDate,
  dateSubmitted: report.submittedDate || report.createdAt || report.dateReported,
  assignedDate: report.assignedDate,
  priority: report.priority || "MEDIUM", // Convert to uppercase for consistency
  status: report.status || "PENDING", // Convert to uppercase for consistency
  dueDate: report.dueDate,
  assignedToDepartment: report.assignedToDepartment || report.department,
  departmentName: report.departmentName || report.department,
  departmentId: report.departmentId,
  department: report.department || report.assignedToDepartment || report.departmentName,
  assignedTo: report.assignedTo,
  timeline: report.timeline,
  dateResolved: report.resolvedAt,
  // Legacy fields for backward compatibility
  location: {
    latitude: report.latitude,
    longitude: report.longitude,
  },
});

// Helper function to map analytics chart data
const mapAnalyticsChartData = (data) => ({
  reportVolumeData: data.reportVolumeData || [],
  issueCategoriesData: data.issueCategoriesData || [],
  responseTimeData:
    data.responseTimeData?.map((item) => ({
      name: item.name || "Unknown",
      time: item.time || 0,
    })) || [],
});

// Helper function to map dashboard chart data
const mapDashboardChartData = (data) => ({
  pieData:
    data.pieData?.map((item) => ({
      ...item,
      name: item.name === "in-progress" ? "In Progress" : item.name,
    })) || [],
  lineData: data.lineData || [],
});

// Helper function to map settings data
const mapBackendSettings = (settings) => ({
  notifications: {
    newReportEmail: settings.notifications?.newReportEmail ?? true,
    statusUpdateEmail: settings.notifications?.statusUpdateEmail ?? true,
    deadlineReminders: settings.notifications?.deadlineReminders ?? true,
    emailAlerts: settings.notifications?.emailAlerts ?? true,
    smsAlerts: settings.notifications?.smsAlerts ?? false,
    pushNotifications: settings.notifications?.pushNotifications ?? true,
  },
  profile: {
    fullName: settings.profile?.fullName || "",
    jobTitle: settings.profile?.jobTitle || "",
    contactEmail: settings.profile?.contactEmail || settings.profile?.email || "",
    email: settings.profile?.contactEmail || settings.profile?.email || "",
    phoneNumber: settings.profile?.phoneNumber || "",
    address: settings.profile?.address || "",
  },
  preferences: {
    timezone: settings.preferences?.timezone || "UTC (Coordinated Universal Time)",
    language: settings.preferences?.language || "English (US)",
    darkMode: settings.preferences?.darkMode ?? false,
    clock24h: settings.preferences?.clock24h ?? false,
    theme: settings.preferences?.theme || (settings.preferences?.darkMode ? "dark" : "light"),
    showTips: settings.preferences?.showTips ?? true,
  },
  system: {
    auditLogs: settings.system?.auditLogs ?? true,
    userManagement: settings.system?.userManagement ?? true,
    defaultReportPriority: settings.system?.defaultReportPriority || "Medium",
  },
});

// Mock data for fallback when backend is not available (notifications only)
const mockData = {
  notifications: [
    {
      id: "N001",
      type: "high",
      title: "New High-Priority Report: Illegal Dumping",
      message:
        "A citizen reported illegal dumping of hazardous waste at Elm Street Park. Requires immediate attention.",
      time: "5 minutes ago",
      status: "new",
      category: "report",
    },
  ],
};

// ============ AUTHENTICATION FUNCTIONS ============

export const login = async (phoneNumber, password, rememberMe = false) => {
  try {
    const response = await fetch(`https://civic-issue-backend-oju3.onrender.com/auth/admin-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    const { token, user } = data;

    // Map backend user data to frontend format
    const mappedUser = mapBackendUser(user);

    // ALWAYS clear all existing tokens first to prevent conflicts
    localStorage.removeItem("civicflow_token");
    localStorage.removeItem("civicflow_user");
    sessionStorage.removeItem("civicflow_token");
    sessionStorage.removeItem("civicflow_user");

    // Store credentials based on rememberMe preference
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("civicflow_token", token);
    storage.setItem("civicflow_user", JSON.stringify(mappedUser));

    return { user: mappedUser, token };
  } catch (error) {
    console.error("Login error:", error);
    throw new Error(error.message || "Login failed");
  }
};

export const logout = async () => {
  try {
    await apiCall("/auth/logout", { method: "POST" });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear both localStorage and sessionStorage
    localStorage.removeItem("civicflow_user");
    localStorage.removeItem("civicflow_token");
    sessionStorage.removeItem("civicflow_user");
    sessionStorage.removeItem("civicflow_token");
  }
};

export const getCurrentUser = () => {
  const validToken = getValidToken();
  if (!validToken) return null;
  
  // Get user data from the same storage that has the valid token
  const sessionUser = sessionStorage.getItem("civicflow_user");
  const localUser = localStorage.getItem("civicflow_user");
  
  // Check session storage first (current session priority)
  if (sessionStorage.getItem("civicflow_token") === validToken && sessionUser) {
    return JSON.parse(sessionUser);
  }
  
  // Check local storage
  if (localStorage.getItem("civicflow_token") === validToken && localUser) {
    return JSON.parse(localUser);
  }
  
  return null;
};

export const isAuthenticated = () => {
  return !!getValidToken();
};

// ============ DASHBOARD FUNCTIONS ============

export const getDashboardData = async () => {
  try {
    return await apiCall("/admin/dashboard");
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw new Error("Failed to fetch dashboard data");
  }
};

export const getDashboardStats = async () => {
  try {
    return await apiCall("/admin/dashboard/stats");
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
};

export const getDashboardChartData = async () => {
  try {
    const data = await apiCall("/admin/dashboard/chart-data");
    return mapDashboardChartData(data);
  } catch (error) {
    console.error("Error fetching dashboard chart data:", error);
    throw new Error("Failed to fetch dashboard chart data");
  }
};

export const getRecentActivity = async () => {
  try {
    return await apiCall("/admin/dashboard/recent-activity");
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw new Error("Failed to fetch recent activity");
  }
};

// ============ DEPARTMENT FUNCTIONS ============

export const getDepartments = async () => {
  try {
    const departments = await apiCall("/admin/departments/list");
    return departments.map(mapBackendDepartment);
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw new Error("Failed to fetch departments");
  }
};

export const getDepartmentById = async (departmentId) => {
  try {
    const department = await apiCall(`/admin/departments/${departmentId}`);
    return mapBackendDepartment(department);
  } catch (error) {
    console.error("Error fetching department:", error);
    throw new Error("Failed to fetch department");
  }
};

export const getDepartmentData = async () => {
  try {
    const data = await apiCall("/admin/departments/data");
    // Map departmentWorkload array to ensure consistent data format
    return {
      ...data,
      departmentWorkload:
        data.departmentWorkload?.map((item) => ({
          department: item.department || "Unknown Department",
          active: item.active || 0,
          pending: item.pending || 0,
          resolved: item.resolved || 0,
        })) || [],
    };
  } catch (error) {
    console.error("Error fetching department data:", error);
    throw new Error("Failed to fetch department data");
  }
};

export const getDepartmentReports = async (departmentId) => {
  try {
    const reports = await apiCall(`/admin/reports/department/${departmentId}`);
    return reports.map(mapBackendReport);
  } catch (error) {
    console.error("Error fetching department reports:", error);
    throw new Error("Failed to fetch department reports");
  }
};

export const createDepartment = async (departmentData) => {
  try {
    // Map frontend field names to backend expected field names
    const backendDepartmentData = {
      name: departmentData.name,
      description: departmentData.description,
      address: departmentData.address,
      departmentHead: departmentData.manager || departmentData.departmentHead,
      email: departmentData.email,
      phone: departmentData.phone,
      password: departmentData.password,
    };

    return await apiCall("/admin/departments/create", {
      method: "POST",
      body: JSON.stringify(backendDepartmentData),
    });
  } catch (error) {
    console.error("Error creating department:", error);
    throw new Error("Failed to create department");
  }
};

// ============ OPERATOR FUNCTIONS ============

export const getDepartmentOperators = async (departmentId) => {
  console.log("🚀 ~ getDepartmentOperators ~ departmentId:", departmentId);
  try {
    const operators = await apiCall(`/admin/departments/${departmentId}/operators`);
    return operators.map(mapBackendOperator);
  } catch (error) {
    console.error("Error fetching department operators:", error);
    throw new Error("Failed to fetch department operators");
  }
};

export const getOperatorById = async (operatorId) => {
  try {
    const operator = await apiCall(`/admin/departments/operators/${operatorId}`);
    return mapBackendOperator(operator);
  } catch (error) {
    console.error("Error fetching operator:", error);
    throw new Error("Failed to fetch operator");
  }
};

export const getOperatorReports = async (operatorId) => {
  try {
    const reports = await apiCall(`/admin/departments/operators/${operatorId}/reports`);
    return reports.map(mapBackendReport);
  } catch (error) {
    console.error("Error fetching operator reports:", error);
    throw new Error("Failed to fetch operator reports");
  }
};

export const createOperator = async (operatorData) => {
  console.log("🚀 ~ createOperator ~ operatorData:", operatorData);
  try {
    // Map frontend field names to backend expected field names
    const backendOperatorData = {
      operatorName: operatorData.name || operatorData.operatorName,
      phoneNumber: operatorData.phoneNumber || operatorData.phone,
      password: operatorData.password,
      email: operatorData.email,
      specialization: operatorData.department || operatorData.specialization,
    };

    return await apiCall("/department/operators/create", {
      method: "POST",
      body: JSON.stringify(backendOperatorData),
    });
  } catch (error) {
    console.error("Error creating operator:", error);
    throw new Error("Failed to create operator");
  }
};

// Convenience function to get assignable users (operators and department heads)
export const getAssignableUsers = async (departmentId) => {
  try {
    // For now, this is the same as getDepartmentOperators
    // In the future, this could include department heads too
    return await getDepartmentOperators(departmentId);
  } catch (error) {
    console.error("Error fetching assignable users:", error);
    throw new Error("Failed to fetch assignable users");
  }
};

// ============ ANALYTICS FUNCTIONS ============

export const getAnalyticsChartData = async () => {
  try {
    const data = await apiCall("/api/analytics/chart-data");
    return mapAnalyticsChartData(data);
  } catch (error) {
    console.error("Error fetching analytics chart data:", error);
    throw new Error("Failed to fetch analytics chart data");
  }
};

export const getReportHotspots = async () => {
  try {
    const hotspots = await apiCall("/api/analytics/report-hotspots");
    // Ensure each hotspot has consistent structure
    return hotspots.map((hotspot) => ({
      reports: hotspot.reports || 0,
      color: hotspot.color || "#10b981",
      name: hotspot.name || "Unknown Location",
      location: hotspot.location || hotspot.name || "Unknown Location",
    }));
  } catch (error) {
    console.error("Error fetching report hotspots:", error);
    throw new Error("Failed to fetch report hotspots");
  }
};

export const getAnalyticsStats = async () => {
  try {
    return await apiCall("/api/analytics/stats");
  } catch (error) {
    console.error("Error fetching analytics stats:", error);
    throw new Error("Failed to fetch analytics stats");
  }
};

export const exportAnalyticsData = async () => {
  try {
    return await apiCall("/api/exports/analytics");
  } catch (error) {
    console.error("Error exporting analytics data:", error);
    throw new Error("Failed to export analytics data");
  }
};

// ============ SETTINGS FUNCTIONS ============

export const getSettings = async () => {
  try {
    const settings = await apiCall("/api/settings");
    return mapBackendSettings(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw new Error("Failed to fetch settings");
  }
};

export const updateSettings = async (settingsData) => {
  try {
    // Map frontend settings structure to backend expected format
    const backendSettingsData = {
      profile: {
        fullName: settingsData.profile?.fullName,
        email: settingsData.profile?.email || settingsData.profile?.contactEmail,
        phoneNumber: settingsData.profile?.phoneNumber,
        address: settingsData.profile?.address,
      },
      preferences: {
        theme: settingsData.preferences?.theme,
        language: settingsData.preferences?.language,
        showTips: settingsData.preferences?.showTips,
        darkMode: settingsData.preferences?.darkMode,
        timezone: settingsData.preferences?.timezone,
        clock24h: settingsData.preferences?.clock24h,
      },
      notifications: {
        emailAlerts: settingsData.notifications?.emailAlerts,
        smsAlerts: settingsData.notifications?.smsAlerts,
        pushNotifications: settingsData.notifications?.pushNotifications,
        newReportEmail: settingsData.notifications?.newReportEmail,
        statusUpdateEmail: settingsData.notifications?.statusUpdateEmail,
        deadlineReminders: settingsData.notifications?.deadlineReminders,
      },
    };

    const response = await apiCall("/api/settings", {
      method: "PUT",
      body: JSON.stringify(backendSettingsData),
    });

    // Return mapped response if it contains updated settings
    if (response.updatedSettings) {
      return {
        ...response,
        updatedSettings: mapBackendSettings(response.updatedSettings),
      };
    }

    return response;
  } catch (error) {
    console.error("Error updating settings:", error);
    throw new Error("Failed to update settings");
  }
};

// Helper function to get the correct reports endpoint based on user role
const getReportsEndpoint = () => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  switch (user.role) {
    case "admin":
      return "/reports/admin";
    case "departmentHead":
      return "/reports/department";
    case "operator":
      return "/reports/operator";
    default:
      throw new Error("Invalid user role for accessing reports");
  }
};

// ============ REPORT FUNCTIONS ============

export const getPendingReports = async () => {
  try {
    const endpoint = getReportsEndpoint();
    const reports = await apiCall(`${endpoint}?status=PENDING`);
    return reports.map(mapBackendReport);
  } catch (error) {
    console.error("Error fetching pending reports:", error);
    throw new Error("Failed to fetch pending reports");
  }
};

export const getInProgressReports = async () => {
  try {
    const endpoint = getReportsEndpoint();
    const reports = await apiCall(`${endpoint}?status=IN_PROGRESS`);
    return reports.map(mapBackendReport);
  } catch (error) {
    console.error("Error fetching in-progress reports:", error);
    throw new Error("Failed to fetch in-progress reports");
  }
};

export const getResolvedReports = async () => {
  try {
    const endpoint = getReportsEndpoint();
    const reports = await apiCall(`${endpoint}?status=RESOLVED`);
    return reports.map(mapBackendReport);
  } catch (error) {
    console.error("Error fetching resolved reports:", error);
    throw new Error("Failed to fetch resolved reports");
  }
};

export const getAssignedReports = async () => {
  try {
    const reports = await apiCall("/api/complaints/assigned-reports");
    return reports.map(mapBackendReport);
  } catch (error) {
    console.error("Error fetching assigned reports:", error);
    throw new Error("Failed to fetch assigned reports");
  }
};

export const updateReportStatus = async (reportId, newStatus) => {
  try {
    if (!reportId || !newStatus) {
      throw new Error("Report ID and new status are required");
    }

    // Remove 'R' prefix if present in reportId for backend compatibility
    const cleanReportId = reportId.toString().replace(/^R/, "");

    // Map frontend status values to backend enum values
    const statusMap = {
      pending: "PENDING",
      "in-progress": "IN_PROGRESS",
      resolved: "RESOLVED",
      rejected: "REJECTED",
    };

    const backendStatus = statusMap[newStatus.toLowerCase()] || newStatus.toUpperCase();

    // Call backend API with PUT method and query parameter
    const response = await apiCall(
      `/api/complaints/${cleanReportId}/status?status=${backendStatus}`,
      {
        method: "PUT",
      }
    );

    return {
      success: true,
      message: `Report ${reportId} status updated to ${newStatus}`,
      reportId: reportId,
      newStatus: newStatus,
      updatedComplaint: response,
    };
  } catch (error) {
    console.error("Error updating report status:", error);
    throw new Error(error.message || "Failed to update report status");
  }
};

export const assignReport = async (reportId, departmentId, assignedTo = null) => {
  try {
    if (!reportId || !departmentId || !assignedTo) {
      throw new Error("Report ID, Department ID, and Assignee are required");
    }

    // Remove 'R' prefix if present in reportId for backend compatibility
    const cleanReportId = reportId.toString().replace(/^R/, "");

    const requestBody = {
      reportId: cleanReportId,
      departmentId: departmentId.toString(),
      assignedTo: assignedTo.toString(),
    };

    const response = await apiCall("/api/complaints/assign", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    return {
      success: true,
      message: `Report assigned successfully to ${response.assignedTo}`,
      reportId: response.id,
      departmentId: departmentId,
      assignedTo: response.assignedTo,
      assignedAt: response.assignedAt,
      status: response.status,
    };
  } catch (error) {
    console.error("Error assigning report:", error);
    throw new Error(error.message || "Failed to assign report");
  }
};

// Removed getReportDetails() function - unnecessary since report lists already contain all needed details

export const exportReportData = async (reportId, format = "pdf") => {
  try {
    if (!reportId) {
      throw new Error("Report ID is required");
    }

    // Remove 'R' prefix if present in reportId for backend compatibility
    const cleanReportId = reportId.toString().replace(/^R/, "");

    // Step 1: Generate the export file
    const exportResponse = await apiCall(`/api/exports/reports/${cleanReportId}?format=${format}`, {
      method: "POST",
    });

    if (!exportResponse.success || !exportResponse.downloadUrl) {
      throw new Error(exportResponse.message || "Failed to generate export file");
    }

    // Step 2: Create download link and trigger automatic download
    const downloadUrl = `https://civic-issue-backend-oju3.onrender.com${exportResponse.downloadUrl}`;
    const token = getValidToken();
    
    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = exportResponse.fileName;
    
    // Add authorization header by fetching the file and creating blob URL
    const response = await fetch(downloadUrl, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to download file");
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    link.href = blobUrl;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);

    return {
      success: true,
      fileName: exportResponse.fileName,
      message: `Report exported successfully as ${format.toUpperCase()}`,
      downloadUrl: exportResponse.downloadUrl,
    };
    
  } catch (error) {
    console.error("Error exporting report:", error);
    throw new Error(error.message || `Failed to export report as ${format.toUpperCase()}`);
  }
};

// Fetch full report details from backend
export const getReportDetails = async (reportId) => {
  try {
    if (!reportId) throw new Error("reportId is required");

    // Remove 'R' prefix if present
    const cleanReportId = reportId.toString().replace(/^R/, "");

    const data = await apiCall(`/api/complaints/${cleanReportId}`);

    // Extract photo and voice URLs from attachments array for backward compatibility
    let photoUrl = null;
    let voiceUrl = null;
    if (data.attachments && Array.isArray(data.attachments)) {
      const photoAttachment = data.attachments.find(att => att.type === 'image');
      const voiceAttachment = data.attachments.find(att => att.type === 'audio');
      photoUrl = photoAttachment?.url || null;
      voiceUrl = voiceAttachment?.url || null;
    }

    // Map backend response into frontend-friendly shape expected by ReportDetailsModal
    return {
      id: data.id || `R${cleanReportId}`,
      title: data.title,
      description: data.description,
      address: data.location || data.address || null,
      location: data.location || data.address || null,
      latitude: data.coordinates?.lat || data.latitude || null,
      longitude: data.coordinates?.lng || data.longitude || null,
      coordinates: data.coordinates || null,
      photoUrl: photoUrl || data.photoUrl || null,
      voiceUrl: voiceUrl || data.voiceUrl || null,
      attachments: data.attachments || [],
      createdAt: data.createdAt || data.submittedDate || null,
      dateSubmitted: data.submittedDate || data.createdAt || null,
      dueDate: data.estimatedResolution || data.dueDate || null,
      estimatedResolution: data.estimatedResolution || data.dueDate || null,
      priority: (data.priority || "").toUpperCase(),
      status: (data.status || "").toUpperCase(),
      assignedTo: data.assignedTo || null,
      assignedToDepartment:
        data.assignedToDepartment || data.department || data.departmentName || null,
      departmentName: data.department || data.departmentName || null,
      department: data.department || data.departmentName || null,
      timeline: data.timeline || null,
      // keep original payload for debugging/edge cases
      __raw: data,
    };
  } catch (error) {
    console.error("Error fetching report details:", error);
    throw new Error(error.message || "Failed to fetch report details");
  }
};

// ============ NOTIFICATION FUNCTIONS (USING MOCK DATA - NO BACKEND SUPPORT) ============

export const getNotifications = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData.notifications);
    }, 300);
  });
};
