import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  getPendingReports,
  assignReport,
  getDepartments,
  updateReportStatus,
  getDepartmentOperators,
} from "../../services/api";
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

const PendingReports = () => {
  const { user } = useAuth();

  // Core data states
  const [reports, setReports] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [operators, setOperators] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  // Modal and loading states
  const [loading, setLoading] = useState(true);
  const [modals, setModals] = useState({
    assign: { open: false, loading: false },
    details: { open: false },
    updateStatus: { open: false },
  });
  const [loadingReports, setLoadingReports] = useState({
    assign: null, // report ID currently being assigned
    details: null, // report ID currently loading details
    updateStatus: null, // report ID currently updating status
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState("");
  const [selectedOperator, setSelectedOperator] = useState(null);

  useEffect(() => {
    fetchReports();
    // Only fetch departments if user is admin (needs department filter)
    if (user?.role === "admin") {
      fetchDepartments();
    }
  }, [user?.role]);

  const fetchReports = async () => {
    try {
      const data = await getPendingReports();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDepartment =
      selectedDepartment === "all" || report.department === selectedDepartment;
    const matchesPriority = selectedPriority === "all" || report.priority === selectedPriority;

    return matchesSearch && matchesDepartment && matchesPriority;
  });

  const handleAssignClick = async (report) => {
    setSelectedReport(report);
    setSelectedOperator(null);
    setModals((prev) => ({ ...prev, assign: { open: true } }));

    // Fetch operators for the report's department
    try {
      if (user?.departmentId) {
        const operatorsData = await getDepartmentOperators(user.departmentId);
        setOperators(operatorsData);
      }
    } catch (error) {
      console.error("Error fetching operators:", error);
    }
  };

  const handleAssignSubmit = async () => {
    if (!selectedOperator) {
      alert("Please select an operator");
      return;
    }

    setLoadingReports((prev) => ({ ...prev, assign: selectedReport.id }));
    try {
      // Use user.departmentId since that's what we know exists from the operator fetching
      const departmentId = user?.departmentId || selectedReport.departmentId;

      if (!departmentId) {
        throw new Error("Department ID not found");
      }

      await assignReport(selectedReport.id, departmentId, selectedOperator.id);
      alert(`Report ${selectedReport.id} assigned successfully to ${selectedOperator.name}`);

      // Refresh the reports list
      await fetchReports();

      // Close the modal
      setModals((prev) => ({ ...prev, assign: { open: false } }));
    } catch (error) {
      console.error("Error assigning report:", error);
      alert(`Failed to assign report: ${error.message}`);
    } finally {
      setLoadingReports((prev) => ({ ...prev, assign: null }));
    }
  };

  const handleViewClick = async (report) => {
    setSelectedReport(report);
    setModals((prev) => ({ ...prev, details: { open: true } }));
  };

  const handleUpdateStatusClick = (report) => {
    setSelectedReport(report);
    setSelectedNewStatus("");
    setModals((prev) => ({ ...prev, updateStatus: { open: true } }));
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
      await fetchReports();

      // Close the modal
      setModals((prev) => ({ ...prev, updateStatus: { open: false } }));
    } catch (error) {
      console.error("Error updating report status:", error);
      alert("Failed to update report status");
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Reports</h1>
          <p className="text-gray-600 mt-1">Reports waiting for assignment or action.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {user?.role === "admin" && (
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.name}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-[160px]">
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

      {/* Reports Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Mobile Card View */}
        <div className="block md:hidden">
          {filteredReports.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="text-4xl mb-4">⏳</div>
              <p className="font-medium">No pending reports</p>
              <p className="text-sm">All reports have been processed</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  {/* Header with ID and Priority */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white rounded-lg px-3 py-1 shadow-sm">
                          <span className="text-sm font-bold text-orange-600">{report.id}</span>
                        </div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            report.priority === "high"
                              ? "bg-red-100 text-red-800"
                              : report.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {report.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-xs font-semibold text-orange-700">PENDING</span>
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
                          Submitted Date
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {report.dateSubmitted}
                        </p>
                      </div>

                      {user?.role === "admin" && report.department && (
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
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <p className="text-xs font-medium text-green-600 uppercase tracking-wide">
                            Assigned To
                          </p>
                          <p className="text-sm font-semibold text-green-800 mt-1">
                            ✓ {report.assignedTo}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewClick(report)}
                        disabled={loadingReports.details === report.id}
                        className="flex-1 font-medium"
                      >
                        {loadingReports.details === report.id ? "⏳ Loading..." : "📱 View Details"}
                      </Button>
                      {!report.assignedTo && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAssignClick(report)}
                          disabled={loadingReports.assign === report.id}
                          className="flex-1 bg-orange-600 hover:bg-orange-700 font-medium"
                        >
                          {loadingReports.assign === report.id ? "⏳ Assigning..." : "📋 Assign"}
                        </Button>
                      )}
                      {report.assignedTo && (
                        <div className="flex-1 bg-green-50 border border-green-200 rounded-md px-3 py-2 text-center">
                          <span className="text-xs font-medium text-green-700">
                            ✓ Assigned to {report.assignedTo}
                          </span>
                        </div>
                      )}
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
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                {user?.role === "admin" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                )}
                {user?.role === "admin" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.dateSubmitted}
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
                    {user?.role === "admin" && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.assignedTo ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ {report.assignedTo}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        {user?.role === "departmentHead" && !report.assignedTo && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAssignClick(report)}
                            disabled={loadingReports.assign === report.id}
                          >
                            {loadingReports.assign === report.id ? "Loading..." : "Assign"}
                          </Button>
                        )}
                        {report.assignedTo && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Assigned to {report.assignedTo}
                          </span>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewClick(report)}
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
                ))
              ) : (
                <tr>
                  <td
                    colSpan={user?.role === "admin" ? 7 : 5}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No pending reports found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      <Dialog
        open={modals.assign.open}
        onOpenChange={(open) => setModals((prev) => ({ ...prev, assign: { open } }))}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Assign Report: {selectedReport?.id}</DialogTitle>
            <DialogDescription>
              Select an operator from your department to assign this report.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
            {operators.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">👥</div>
                <p className="text-gray-500 font-medium">Loading operators...</p>
              </div>
            ) : (
              <div className="space-y-3 pr-2">
                {operators.map((operator) => (
                  <div
                    key={operator.id}
                    onClick={() => setSelectedOperator(operator)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedOperator?.id === operator.id
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {operator?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{operator.name}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600">{operator.email}</span>
                            {operator.phone && (
                              <span className="text-sm text-gray-600">📞 {operator.phone}</span>
                            )}
                          </div>
                          {operator.department && (
                            <div className="flex items-center mt-1">
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                {operator.department}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              operator.status === "available"
                                ? "bg-green-100 text-green-800"
                                : operator.status === "busy"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {operator.status || "available"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Workload: {operator.workload || 0} reports
                        </div>
                        {operator.completedReports && (
                          <div className="text-xs text-gray-500">
                            Completed: {operator.completedReports}
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedOperator?.id === operator.id && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center text-blue-700">
                          <span className="text-sm font-medium">✓ Selected for assignment</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4 flex-shrink-0 bg-white">
            <Button
              variant="outline"
              onClick={() => setModals((prev) => ({ ...prev, assign: { open: false } }))}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignSubmit}
              disabled={loadingReports.assign === selectedReport?.id || !selectedOperator}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loadingReports.assign === selectedReport?.id
                ? "Assigning..."
                : `Assign to ${selectedOperator?.name || "Operator"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReportDetailsModal
        open={modals.details.open}
        onOpenChange={(open) => setModals((prev) => ({ ...prev, details: { open } }))}
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

export default PendingReports;
