import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getDashboardStats,
  getDashboardChartData,
  getRecentActivity,
  getDepartmentReports,
  getDepartmentData,
  getDepartmentById,
  getReportDetails,
  updateReportStatus,
  exportReportData,
} from "../services/api";
import { useAuth } from "../hooks/useAuth";
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  Search,
  Mail,
  Phone,
  MapPin,
  Users,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import ReportDetailsModal from "../components/reports/ReportDetailsModal";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DashboardPage = () => {
  // General dashboard states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [departmentData, setDepartmentData] = useState(null);

  // Department head specific states
  const [department, setDepartment] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all");

  // Modal and loading states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState("");
  const [loadingReports, setLoadingReports] = useState({
    details: null, // report ID currently loading details
    export: null, // report ID currently exporting
    updateStatus: null, // report ID currently updating status
  });

  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (user?.role === "departmentHead") {
          // For department heads, load their department data and reports
          // Fetch full department details using the departmentId
          if (user.departmentId) {
            const [userDepartment, deptReports] = await Promise.all([
              getDepartmentById(user.departmentId),
              getDepartmentReports(user.departmentId),
            ]);
            setDepartment(userDepartment);
            setReports(deptReports);
          }
          setReportsLoading(false);
        } else {
          // For admin/operator, load general dashboard data
          const [stats, charts, activities, deptData] = await Promise.all([
            getDashboardStats(),
            getDashboardChartData(),
            getRecentActivity(),
            getDepartmentData(),
          ]);
          setDashboardStats(stats);
          setChartData(charts);
          setRecentActivities(activities);
          setDepartmentData(deptData);
        }

        setLoading(false);
      } catch {
        setError("Failed to load dashboard data");
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Helper functions for department head view
  const handleViewDetails = async (report) => {
    // Fetch full details from backend before opening modal
    setLoadingReports((prev) => ({ ...prev, details: report.id }));
    try {
      const full = await getReportDetails(report.id);
      setSelectedReport(full);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Failed to load report details:", error);
      toast.error("Failed to load report details");
    } finally {
      setLoadingReports((prev) => ({ ...prev, details: null }));
    }
  };

  const handleExport = async (report) => {
    setLoadingReports((prev) => ({ ...prev, export: report.id }));
    try {
      await exportReportData(report.id, "pdf");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    } finally {
      setLoadingReports((prev) => ({ ...prev, export: null }));
    }
  };

  const handleUpdateStatus = (report) => {
    setSelectedReport(report);
    setSelectedNewStatus("");
    setShowUpdateStatusModal(true);
  };

  const handleUpdateStatusSubmit = async () => {
    if (!selectedReport || !selectedNewStatus) return;

    setLoadingReports((prev) => ({ ...prev, updateStatus: selectedReport.id }));
    try {
      await updateReportStatus(selectedReport.id, selectedNewStatus);

      // Update the reports list with the new status
      setReports((prev) =>
        prev.map((report) =>
          report.id === selectedReport.id ? { ...report, status: selectedNewStatus } : report
        )
      );

      setShowUpdateStatusModal(false);
      setSelectedReport(null);
      setSelectedNewStatus("");
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("Failed to update report status");
    } finally {
      setLoadingReports((prev) => ({ ...prev, updateStatus: null }));
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "investigating":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "work scheduled":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "assigned":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "urgent repair":
        return "bg-red-100 text-red-800 border-red-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Computed filtered reports for department head
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      !searchTerm ||
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toString().toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority =
      selectedPriority === "all" ||
      report.priority?.toLowerCase() === selectedPriority.toLowerCase();

    return matchesSearch && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-md">
        {error}
      </div>
    );
  }

  // For department heads, show department-specific view
  if (user?.role === "departmentHead") {
    if (!department) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading department data...</p>
          </div>
        </div>
      );
    }

    // Department head view starts here...
    return (
      <div className="p-6">
        {/* Dashboard Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Department Dashboard</h1>
        </div>

        {/* Department Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{department.name}</h1>
              <p className="text-gray-600 mb-6">{department.description || "N/A"}</p>

              {/* Manager Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Department Manager</h3>
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {department.manager
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "NA"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {department.manager || "Not assigned"}
                    </p>
                    <div className="space-y-1 mt-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>
                          {department.email ||
                            `${department.manager?.toLowerCase().replace(" ", ".")}@civicflow.gov`}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{department.phone || "(555) 123-4567"}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{department.address || "City Hall, 100 Main St, Anytown, USA"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 ml-8">
              <div className="bg-blue-50 p-4 rounded-lg text-center min-w-[120px]">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {department.activeReports || reports.length}
                </p>
                <p className="text-sm text-gray-600">Active Reports</p>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {department.avgResolutionTime || "N/A"}
              </p>
              <p className="text-sm text-gray-600">Avg. Resolution Time</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {department.resolvedLast30Days || 0}
              </p>
              <p className="text-sm text-gray-600">Resolved Last 30 Days</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">✓</span>
              </div>
              <p className="text-sm text-gray-600">Operational</p>
            </div>
          </div>
        </div>

        {/* Assigned Reports Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Department Reports</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Filter reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Filter by Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {reportsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Reported
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {report.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={report.title}>
                          {report.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                            report.priority
                          )}`}
                        >
                          {report.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(report.dateReported)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(report)}
                            disabled={loadingReports.details === report.id}
                          >
                            {loadingReports.details === report.id ? "Loading..." : "View Details"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(report)}
                            disabled={loadingReports.updateStatus === report.id}
                          >
                            {loadingReports.updateStatus === report.id
                              ? "Updating..."
                              : "Update Status"}
                          </Button>
                          {report.status?.toLowerCase() === "resolved" && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleExport(report)}
                              disabled={loadingReports.export === report.id}
                            >
                              {loadingReports.export === report.id ? "Exporting..." : "Export"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredReports.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No reports found matching your criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>
        <ReportDetailsModal
          open={showDetailsModal}
          onOpenChange={setShowDetailsModal}
          report={selectedReport}
        />

        {/* Update Status Modal */}
        <Dialog open={showUpdateStatusModal} onOpenChange={setShowUpdateStatusModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Report Status</DialogTitle>
              <DialogDescription>
                Change the status for report: {selectedReport?.id}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">New Status</label>
                <Select value={selectedNewStatus} onValueChange={setSelectedNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowUpdateStatusModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateStatusSubmit}
                  disabled={
                    !selectedNewStatus || loadingReports.updateStatus === selectedReport?.id
                  }
                >
                  {loadingReports.updateStatus === selectedReport?.id
                    ? "Updating..."
                    : "Update Status"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Early return if data not loaded yet for admin/operator
  if (!dashboardStats || !chartData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Dashboard Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardStats.totalReports.value}
                </p>
                <p className="text-sm text-green-600 mt-1">{dashboardStats.totalReports.change}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardStats.pendingReports.value}
                </p>
                <p className="text-sm text-red-600 mt-1">{dashboardStats.pendingReports.change}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardStats.inProgress.value}
                </p>
                <p className="text-sm text-green-600 mt-1">{dashboardStats.inProgress.change}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardStats.resolved.value}</p>
                <p className="text-sm text-green-600 mt-1">{dashboardStats.resolved.change}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Reports by Status - Donut Chart */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Reports by Status</h2>
            <div className="flex flex-col lg:flex-row items-center">
              <div className="w-full lg:w-1/2 mb-4 lg:mb-0">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 ml-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Pending</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {chartData?.pieData?.find((p) => p.name?.toLowerCase() === "pending")
                        ?.value ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">In Progress</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {chartData?.pieData?.find((p) => p.name?.toLowerCase().includes("progress"))
                        ?.value ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-800 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Resolved</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {chartData?.pieData?.find((p) => p.name?.toLowerCase() === "resolved")
                        ?.value ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Over Time - Line Chart */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Reports Over Time</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData.lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#1F2937"
                  strokeWidth={2}
                  dot={{ fill: "#1F2937", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-800 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Resolved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Workload */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Department Workload</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Open Reports
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Resolution Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departmentData?.departmentWorkload?.length > 0 ? (
                    departmentData.departmentWorkload
                      .filter((dept) => dept.department) // Filter out null departments
                      .map((dept, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {dept.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                dept.active + dept.pending > 50
                                  ? "bg-red-100 text-red-800"
                                  : dept.active + dept.pending > 25
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {dept.active + dept.pending}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">N/A</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                        No department data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activity.color}`}
                    >
                      <span className="text-sm">{activity.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.text}</p>
                      <p className="text-xs text-gray-500 mt-1 text-right">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
