import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import {
  getResolvedReports,
  exportReportData,
  getDepartments,
  updateReportStatus,
} from "../../services/api";
import { formatDate } from "../../utils/date";
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

const ResolvedReports = () => {
  const { user } = useAuth();

  // Core data states
  const [reports, setReports] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("all");

  // Modal and loading states
  const [loading, setLoading] = useState(true);
  const [modals, setModals] = useState({
    details: { open: false, loading: false },
    export: { loading: false, reportId: null },
    updateStatus: { open: false },
  });
  const [loadingReports, setLoadingReports] = useState({
    details: null, // report ID currently loading details
    export: null, // report ID currently exporting
    updateStatus: null, // report ID currently updating status
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState("");

  useEffect(() => {
    fetchReports();
    // Only fetch departments if user is admin (needs department filter)
    if (user?.role === "admin") {
      loadDepartments();
    }
  }, [user?.role]);
  const fetchReports = async () => {
    try {
      const data = await getResolvedReports();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (report.resolutionSummary &&
        report.resolutionSummary.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDepartment =
      selectedDepartment === "all" || report.department === selectedDepartment;
    const matchesPriority = selectedPriority === "all" || report.priority === selectedPriority;

    let matchesDateRange = true;
    if (selectedDateRange !== "all") {
      const now = new Date();
      const reportDate = new Date(report.dateResolved);

      switch (selectedDateRange) {
        case "week": {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDateRange = reportDate >= weekAgo;
          break;
        }
        case "month": {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDateRange = reportDate >= monthAgo;
          break;
        }
        case "quarter": {
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          matchesDateRange = reportDate >= quarterAgo;
          break;
        }
        default:
          matchesDateRange = true;
      }
    }

    return matchesSearch && matchesDepartment && matchesPriority && matchesDateRange;
  });

  const handleViewDetails = async (report) => {
    setSelectedReport(report);
    setModals((prev) => ({ ...prev, details: { open: true, loading: false } }));
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

  const handleUpdateStatusClick = (report) => {
    setSelectedReport(report);
    setSelectedNewStatus("");
    setModals((prev) => ({ ...prev, updateStatus: { open: true } }));
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
      setModals((prev) => ({ ...prev, updateStatus: { open: false } }));
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("Failed to update report status");
    } finally {
      setLoadingReports((prev) => ({ ...prev, updateStatus: null }));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Resolved Reports</h1>
        <p className="text-gray-600">View completed and resolved reports</p>
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
                placeholder="Search reports by title, ID, description, or resolution..."
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

            <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredReports.length} of {reports.length} reports
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Mobile Card View */}
        <div className="block md:hidden">
          {filteredReports.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="text-4xl mb-4">✅</div>
              <p className="font-medium">No resolved reports</p>
              <p className="text-sm">No completed reports to display</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  {/* Header with ID and Success indicator */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white rounded-lg px-3 py-1 shadow-sm">
                          <span className="text-sm font-bold text-green-600">{report.id}</span>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          {report.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-semibold text-green-700">RESOLVED</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-base mb-3 leading-tight">
                      {report.title}
                    </h3>

                    {/* Resolution Summary */}
                    {report.resolutionSummary && (
                      <div className="bg-green-50 rounded-lg p-3 mb-4">
                        <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">
                          Resolution Summary
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {report.resolutionSummary}
                        </p>
                      </div>
                    )}

                    {/* Date Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Submitted
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {formatDate(report.dateSubmitted)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Resolved
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {formatDate(report.dateResolved)}
                        </p>
                      </div>
                    </div>

                    {/* Department info if admin */}
                    {user?.role === "admin" && report.department && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Department
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {report.department}
                        </p>
                      </div>
                    )}

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
                        onClick={() => handleExport(report)}
                        disabled={loadingReports.export === report.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 font-medium"
                      >
                        {loadingReports.export === report.id ? "⏳ Exporting..." : "📄 Export"}
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
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Resolved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                {user?.role === "admin" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {report.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate" title={report.title}>
                        {report.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(report.dateSubmitted)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(report.dateResolved)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          report.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : report.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {report.priority}
                      </span>
                    </td>
                    {user?.role === "admin" && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.department}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-1 sm:space-y-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(report)}
                          disabled={loadingReports.details === report.id}
                          className="text-xs px-2 py-1"
                        >
                          {loadingReports.details === report.id ? "Loading..." : "Details"}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleExport(report)}
                          disabled={loadingReports.export === report.id}
                          className="text-xs px-2 py-1"
                        >
                          {loadingReports.export === report.id ? "Exporting..." : "Export"}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleUpdateStatusClick(report)}
                          disabled={loadingReports.updateStatus === report.id}
                          className="text-xs px-2 py-1"
                        >
                          {loadingReports.updateStatus === report.id ? "Updating..." : "Update"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={user?.role === "admin" ? 7 : 6}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No resolved reports found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReportDetailsModal
        open={modals.details.open}
        onOpenChange={(open) =>
          setModals((prev) => ({ ...prev, details: { ...prev.details, open } }))
        }
        report={selectedReport}
      />

      {/* Update Status Modal */}
      <Dialog
        open={modals.updateStatus.open}
        onOpenChange={(open) => setModals((prev) => ({ ...prev, updateStatus: { open } }))}
      >
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
            <Button
              variant="outline"
              onClick={() => setModals((prev) => ({ ...prev, updateStatus: { open: false } }))}
            >
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

export default ResolvedReports;
