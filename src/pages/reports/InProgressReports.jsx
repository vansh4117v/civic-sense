import React, { useState, useEffect } from "react";
import { Search, Filter, MoreVertical } from "lucide-react";
import { getInProgressReports, updateReportStatus, getDepartments } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import ReportDetailsModal from "../../components/reports/ReportDetailsModal";

const InProgressReports = () => {
  // Core data states
  const [reports, setReports] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  // Modal and loading states
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState("");
  const [loadingReports, setLoadingReports] = useState({
    details: null, // report ID currently loading details
    updateStatus: null, // report ID currently updating status
  });

  const { user } = useAuth();

  // Computed filtered reports instead of separate state
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      !searchTerm ||
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      selectedDepartment === "all" || report.department === selectedDepartment;
    const matchesPriority = selectedPriority === "all" || report.priority === selectedPriority;

    return matchesSearch && matchesDepartment && matchesPriority;
  });

  useEffect(() => {
    loadReports();
    // Only fetch departments if user is admin (needs department filter)
    if (user?.role === "admin") {
      loadDepartments();
    }
  }, [user?.role]);

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  };

  const handleViewDetails = async (report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = (report) => {
    setSelectedReport(report);
    setSelectedNewStatus("");
    setShowUpdateStatusModal(true);
  };

  const handleUpdateStatusSubmit = async () => {
    if (!selectedNewStatus || !selectedReport) {
      alert("Please select a status");
      return;
    }

    setLoadingReports((prev) => ({ ...prev, updateStatus: selectedReport.id }));
    try {
      await updateReportStatus(selectedReport.id, selectedNewStatus);
      alert(`Report ${selectedReport.id} status updated to ${selectedNewStatus}`);

      // Refresh the reports list
      await loadReports();

      // Close the modal
      setShowUpdateStatusModal(false);
    } catch (error) {
      console.error("Error updating report status:", error);
      alert("Failed to update report status");
    } finally {
      setLoadingReports((prev) => ({ ...prev, updateStatus: null }));
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await getInProgressReports();
      setReports(data);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-orange-500 text-white";
      case "low":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Reports In Progress</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Track issues currently under active investigation or resolution within CivicSense.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search reports by title, ID, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            {user?.role === "admin" && (
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.name} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Priorities" />
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

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredReports.length} of {reports.length} reports
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Mobile Card View */}
        <div className="block md:hidden">
          {filteredReports.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="text-4xl mb-4">🔄</div>
              <p className="font-medium">No in-progress reports</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  {/* Header with ID and Status */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white rounded-lg px-3 py-1 shadow-sm">
                          <span className="text-sm font-bold text-blue-600">{report.id}</span>
                        </div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                            report.priority
                          )}`}
                        >
                          {report.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold text-blue-700">IN PROGRESS</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-base mb-3 leading-tight">
                      {report.title}
                    </h3>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Reported Date
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {formatDate(report.createdAt)}
                        </p>
                      </div>

                      {user?.role === "admin" && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Department
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {report.department}
                          </p>
                        </div>
                      )}

                      {report.assignedTo && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Assigned To
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {report.assignedTo}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(report)}
                        disabled={loadingReports.details === report.id}
                        className="flex-1 font-medium"
                      >
                        {loadingReports.details === report.id ? "⏳ Loading..." : "📱 View Details"}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleUpdateStatus(report)}
                        disabled={loadingReports.updateStatus === report.id}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 font-medium"
                      >
                        {loadingReports.updateStatus === report.id ? "⏳ Updating..." : "🔄 Update"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Reported
                </th>
                {user?.role === "admin" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-green-600">{report.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="truncate">{report.title}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(report.createdAt)}
                  </td>
                  {user?.role === "admin" && (
                    <td className="px-6 py-4 text-sm text-gray-900">{report.department}</td>
                  )}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded min-w-[60px] ${getPriorityColor(
                        report.priority
                      )}`}
                    >
                      {report.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-full min-w-[90px] whitespace-nowrap ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(report)}
                        disabled={loadingReports.details === report.id}
                        className="text-xs px-2.5 py-1.5 h-7 whitespace-nowrap"
                      >
                        {loadingReports.details === report.id ? "Loading..." : "View Details"}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleUpdateStatus(report)}
                        disabled={loadingReports.updateStatus === report.id}
                        className="text-xs px-2.5 py-1.5 h-7 whitespace-nowrap"
                      >
                        {loadingReports.updateStatus === report.id
                          ? "Updating..."
                          : "Update Status"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </div>

      <ReportDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        report={selectedReport}
      />

      {/* Update Status Modal */}
      <Dialog open={showUpdateStatusModal} onOpenChange={setShowUpdateStatusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status: {selectedReport?.id}</DialogTitle>
            <DialogDescription>Change the status of this report.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
              <Select value={selectedNewStatus} onValueChange={setSelectedNewStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateStatusModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatusSubmit}
              disabled={loadingReports.updateStatus === selectedReport?.id}
            >
              {loadingReports.updateStatus === selectedReport?.id ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InProgressReports;
