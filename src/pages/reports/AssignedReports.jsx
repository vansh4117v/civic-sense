import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { getAssignedReports, updateReportStatus } from "../../services/api";
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
import { toast } from "sonner";
import ReportDetailsModal from "../../components/reports/ReportDetailsModal";

const AssignedReports = () => {
  // Core data states
  const [reports, setReports] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modal and loading states
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [loadingReports, setLoadingReports] = useState({
    details: null, // report ID currently loading details
    updateStatus: null, // report ID currently updating status
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await getAssignedReports();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      !searchTerm ||
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPriority = selectedPriority === "all" || report.priority === selectedPriority;
    const matchesStatus = selectedStatus === "all" || report.status === selectedStatus;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleViewDetails = async (report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  const handleUpdateStatusClick = (report) => {
    setSelectedReport(report);
    setSelectedNewStatus("");
    setShowUpdateStatusModal(true);
  };

  const handleUpdateStatusSubmit = async () => {
    if (!selectedNewStatus || !selectedReport) {
      toast.warning("Please select a status");
      return;
    }

    setLoadingReports((prev) => ({ ...prev, updateStatus: selectedReport.id }));
    try {
      await updateReportStatus(selectedReport.id, selectedNewStatus);
      toast.success(`Report ${selectedReport.id} status updated to ${selectedNewStatus}`);

      // Refresh the reports list
      await fetchReports();

      // Close the modal
      setShowUpdateStatusModal(false);
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

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return 0;

    const today = new Date();
    const due = new Date(dueDate);

    if (isNaN(due.getTime())) return 0;

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
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
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Assigned Reports</h1>
        <p className="text-gray-600">View reports currently assigned to you and their status.</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search reports by ID, subject, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Mobile Card View */}
        <div className="block md:hidden">
          {filteredReports.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="text-4xl mb-4">📋</div>
              <p className="font-medium">No reports found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {filteredReports.map((report) => {
                const daysUntilDue = getDaysUntilDue(report.dueDate);
                return (
                  <div
                    key={report.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                  >
                    {/* Header with ID and Priority */}
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-white rounded-lg px-3 py-1 shadow-sm">
                            <span className="text-sm font-bold text-gray-900">{report.id}</span>
                          </div>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                              report.priority
                            )}`}
                          >
                            {report.priority.toUpperCase()}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
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

                      {report.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {report.description}
                        </p>
                      )}

                      {/* Date Information Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Assigned
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {formatDate(report.assignedDate)}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Due Date
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {formatDate(report.dueDate)}
                          </p>
                          {daysUntilDue <= 0 ? (
                            <p className="text-xs font-medium text-red-600 mt-1">OVERDUE</p>
                          ) : daysUntilDue <= 3 ? (
                            <p className="text-xs font-medium text-orange-600 mt-1">DUE SOON</p>
                          ) : (
                            <p className="text-xs text-gray-500 mt-1">{daysUntilDue} days left</p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(report)}
                          className="flex-1 font-medium"
                        >
                          📱 View Details
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleUpdateStatusClick(report)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 font-medium"
                        >
                          🔄 Update
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => {
                const daysUntilDue = getDaysUntilDue(report.dueDate);
                return (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
                      {formatDate(report.assignedDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col">
                        <span className="text-gray-900">{formatDate(report.dueDate)}</span>
                        {daysUntilDue <= 0 ? (
                          <span className="text-red-600 text-xs font-medium">Overdue</span>
                        ) : daysUntilDue <= 3 ? (
                          <span className="text-orange-600 text-xs font-medium">Due soon</span>
                        ) : (
                          <span className="text-gray-500 text-xs">{daysUntilDue} days left</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(report)}
                          disabled={loadingReports.details === report.id}
                        >
                          {loadingReports.details === report.id ? "Loading..." : "View Details"}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleUpdateStatusClick(report)}
                          disabled={loadingReports.updateStatus === report.id}
                        >
                          {loadingReports.updateStatus === report.id
                            ? "Updating..."
                            : "Update Status"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No assigned reports found matching your criteria.</p>
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

export default AssignedReports;
