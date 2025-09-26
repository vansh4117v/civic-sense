import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Calendar, MapPin, Building, User, Clock, AlertTriangle } from "lucide-react";

const ReportDetailsModal = ({ open, onOpenChange, report }) => {

  if (!report) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>Loading...</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      // Handle both full datetime strings and date-only strings
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if parsing fails
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString || "N/A";
    }
  };

  // Format priority for display
  const formatPriority = (priority) => {
    if (!priority) return "N/A";
    return priority.toLowerCase().replace(/_/g, " ");
  };

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return "N/A";
    return status.toLowerCase().replace(/_/g, " ");
  };

  // Get priority color and icon
  const getPriorityStyle = (priority) => {
    const normalizedPriority = priority?.toUpperCase();
    switch (normalizedPriority) {
      case "HIGH":
        return {
          bg: "bg-red-50 border-red-200",
          text: "text-red-700",
          badge: "bg-red-100 text-red-800",
          icon: "text-red-500",
        };
      case "MEDIUM":
        return {
          bg: "bg-yellow-50 border-yellow-200",
          text: "text-yellow-700",
          badge: "bg-yellow-100 text-yellow-800",
          icon: "text-yellow-500",
        };
      case "LOW":
      default:
        return {
          bg: "bg-green-50 border-green-200",
          text: "text-green-700",
          badge: "bg-green-100 text-green-800",
          icon: "text-green-500",
        };
    }
  };

  // Get status style
  const getStatusStyle = (status) => {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case "PENDING":
        return { badge: "bg-gray-100 text-gray-800", dot: "bg-gray-400" };
      case "IN_PROGRESS":
        return { badge: "bg-blue-100 text-blue-800", dot: "bg-blue-400" };
      case "RESOLVED":
        return { badge: "bg-green-100 text-green-800", dot: "bg-green-400" };
      default:
        return { badge: "bg-gray-100 text-gray-800", dot: "bg-gray-400" };
    }
  };

  const priorityStyle = getPriorityStyle(report.priority);
  const statusStyle = getStatusStyle(report.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden">
        {/* Header */}
        <div className={`${priorityStyle.bg} border-b ${priorityStyle.text} p-6`}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white/80`}>
                  <AlertTriangle className={`h-5 w-5 ${priorityStyle.icon}`} />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    Report #{report.id}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 mt-1">
                    {report.title}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${priorityStyle.badge}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${priorityStyle.icon.replace("text-", "bg-")}`}
                  ></div>
                  {formatPriority(report.priority)} Priority
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusStyle.badge}`}
                >
                  <div className={`w-2 h-2 rounded-full ${statusStyle.dot}`}></div>
                  {formatStatus(report.status)}
                </span>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Description Section */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {report.description || "No description provided"}
              </p>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dates */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <h4 className="font-medium text-gray-900">Timeline</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Submitted</p>
                    <p className="font-medium text-gray-900">{formatDate(report.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(report.dueDate || report.estimatedResolution)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <h4 className="font-medium text-gray-900">Location</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900 text-sm leading-relaxed">
                      {report.address || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Coordinates</p>
                    <p className="font-medium text-gray-900 font-mono text-sm">
                      {report.coordinates?.lat && report.coordinates?.lng
                        ? `${report.coordinates.lat}, ${report.coordinates.lng}`
                        : report.latitude && report.longitude
                        ? `${report.latitude}, ${report.longitude}`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assignment */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building className="h-4 w-4 text-purple-500" />
                  <h4 className="font-medium text-gray-900">Assignment</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium text-gray-900">
                      {report.department ||
                        report.assignedToDepartment ||
                        report.departmentName ||
                        "Not assigned"}
                    </p>
                  </div>
                  {report.assignedTo && (
                    <div>
                      <p className="text-sm text-gray-500">Assigned To</p>
                      <p className="font-medium text-gray-900">{report.assignedTo}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              {report.timeline && Array.isArray(report.timeline) && report.timeline.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 md:col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <h4 className="font-medium text-gray-900">Timeline</h4>
                  </div>
                  <div className="space-y-3">
                    {report.timeline.map((event, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0"
                      >
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{event.action}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span>{formatDate(event.date)}</span>
                            {event.by && (
                              <>
                                <span>•</span>
                                <span>by {event.by}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Media Attachments */}
            {((report.attachments && report.attachments.length > 0) ||
              report.photoUrl ||
              report.voiceUrl) && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Attachments</h3>
                <div className="grid grid-cols-1 gap-4">
                  {/* Handle new attachments array format */}
                  {report.attachments &&
                    report.attachments.length > 0 &&
                    report.attachments.map((attachment, index) => {
                      if (attachment.type === "image") {
                        return (
                          <div
                            key={attachment.id || index}
                            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                          >
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                              <h5 className="text-sm font-medium text-gray-900">
                                {attachment.name || "Photo Evidence"}
                              </h5>
                            </div>
                            <div className="p-4">
                              <img
                                src={attachment.url}
                                alt={`Attachment ${attachment.name || index + 1}`}
                                className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                              <div className="hidden items-center justify-center h-48 bg-gray-100 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-500">Unable to load image</p>
                              </div>
                            </div>
                          </div>
                        );
                      } else if (attachment.type === "audio") {
                        return (
                          <div
                            key={attachment.id || index}
                            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                          >
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                              <h5 className="text-sm font-medium text-gray-900">
                                {attachment.name || "Voice Recording"}
                              </h5>
                            </div>
                            <div className="p-4">
                              <audio controls className="w-full">
                                <source src={attachment.url} type="audio/mpeg" />
                                <source src={attachment.url} type="audio/wav" />
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}

                  {/* Fallback to old format for backward compatibility */}
                  {(!report.attachments || report.attachments.length === 0) && report.photoUrl && (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h5 className="text-sm font-medium text-gray-900">Photo Evidence</h5>
                      </div>
                      <div className="p-4">
                        <img
                          src={report.photoUrl}
                          alt="Report photo"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div className="hidden items-center justify-center h-48 bg-gray-100 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-500">Unable to load image</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(!report.attachments || report.attachments.length === 0) && report.voiceUrl && (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h5 className="text-sm font-medium text-gray-900">Voice Recording</h5>
                      </div>
                      <div className="p-4">
                        <audio controls className="w-full">
                          <source src={report.voiceUrl} type="audio/mpeg" />
                          <source src={report.voiceUrl} type="audio/wav" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="px-8">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDetailsModal;
