import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Search, ArrowLeft, Mail, Phone, MapPin, Users } from "lucide-react";
import {
  getDepartmentById,
  getDepartmentReports,
  exportReportData,
  updateReportStatus,
} from "../services/api";
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

const SingleDepartmentPage = () => {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Core data states
  const [department, setDepartment] = useState(location.state?.department || null);
  const [reports, setReports] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all");

  // Modal and loading states
  const [loading, setLoading] = useState(!department);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [loadingReports, setLoadingReports] = useState({
    details: null, // report ID currently loading details
    export: null, // report ID currently exporting
    updateStatus: null, // report ID currently updating status
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!department) {
          setLoading(true);
          const deptData = await getDepartmentById(departmentId);
          setDepartment(deptData);
          setLoading(false);
        }

        setReportsLoading(true);
        const reportsData = await getDepartmentReports(departmentId);
        console.log("🚀 ~ fetchData ~ reportsData:", reportsData)
        setReports(reportsData);
      } catch (error) {
        console.error("Error fetching department data:", error);
      } finally {
        setLoading(false);
        setReportsLoading(false);
      }
    };

    fetchData();
  }, [departmentId, department]);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      !searchTerm ||
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPriority = selectedPriority === "all" || report.priority === selectedPriority;

    return matchesSearch && matchesPriority;
  });

  const handleViewDetails = async (report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  const handleExport = async (report) => {
    setLoadingReports((prev) => ({ ...prev, export: report.id }));
    try {
      await exportReportData(report.id, "pdf");
    } catch (error) {
      console.error("Error exporting report:", error);
      alert("Failed to export report");
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
      alert("Failed to update report status");
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Department not found</h3>
          <p className="text-gray-500">The requested department could not be found.</p>
          <Button variant="outline" onClick={() => navigate("/departments")} className="mt-4">
            Back to Departments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/departments")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Departments</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>
      </div>

      {/* Department Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-6 lg:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{department.name}</h1>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              {department.description || "N/A"}
            </p>

            {/* Manager Information */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                Department Manager
              </h3>
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                  {department.manager
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "NA"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">
                    {department.manager || "Not assigned"}
                  </p>
                  <div className="space-y-1 mt-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{department.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{department.phone || "N/A"}</span>
                    </div>
                    <div className="flex items-start text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="break-words">{department.address || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards - Mobile: Single Column, Desktop: Single Column on Right */}
          <div className="w-full lg:w-auto lg:ml-8">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{department.activeReports || 0}</p>
              <p className="text-sm text-gray-600">Active Reports</p>
            </div>
          </div>
        </div>

        {/* Additional Stats - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {department.avgResolutionTime || "N/A"}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Avg. Resolution Time</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {department.resolvedLast30Days || 0}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Resolved Last 30 Days</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-bold text-green-600">✓</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Operational</p>
          </div>
        </div>
      </div>

      {/* Assigned Reports Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900">Assigned Reports</h2>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Filter reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden">
              {filteredReports.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="font-medium">No reports assigned</p>
                  <p className="text-sm">No reports have been assigned to this department yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                    >
                      {/* Header with ID and Status */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-white rounded-lg px-3 py-1 shadow-sm">
                              <span className="text-sm font-bold text-blue-600">{report.id}</span>
                            </div>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                                report.priority
                              )}`}
                            >
                              {report.priority.toUpperCase()}
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              report.status
                            )}`}
                          >
                            {report.status}
                          </span>
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 text-base mb-3 leading-tight">
                          {report.title}
                        </h3>

                        {/* Date Info */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Reported
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {formatDate(report.dateReported)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(report)}
                            disabled={loadingReports.details === report.id}
                            className="w-full font-medium"
                          >
                            {loadingReports.details === report.id
                              ? "⏳ Loading..."
                              : "📱 View Details"}
                          </Button>
                          <div className="flex space-x-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleUpdateStatus(report)}
                              disabled={loadingReports.updateStatus === report.id}
                              className="flex-1 font-medium"
                            >
                              {loadingReports.updateStatus === report.id
                                ? "⏳ Updating..."
                                : "🔄 Update Status"}
                            </Button>
                            {report.status?.toLowerCase() === "resolved" && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleExport(report)}
                                disabled={loadingReports.export === report.id}
                                className="flex-1 font-medium"
                              >
                                {loadingReports.export === report.id
                                  ? "⏳ Exporting..."
                                  : "📄 Export"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
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
          </>
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
                disabled={!selectedNewStatus || loadingReports.updateStatus === selectedReport?.id}
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
};

export default SingleDepartmentPage;
