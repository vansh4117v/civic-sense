import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, Mail, Phone, Plus } from "lucide-react";
import { getDepartmentOperators, createOperator } from "../services/api";
import { useAuth } from "../hooks/useAuth";
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
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const OperatorsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Core data states
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    password: "",
  });

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        setLoading(true);
        // console.log("🚀 ~ fetchOperators ~ user:", user)
        if (user?.role === "departmentHead" && user?.departmentId) {
          const operatorsData = await getDepartmentOperators(user.departmentId);
          setOperators(operatorsData);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading operators:", error);
        setError("Failed to load operators");
        setLoading(false);
      }
    };

    if (user) {
      fetchOperators();
    }
  }, [user]);

  // Computed filtered operators
  const filteredOperators = operators.filter((operator) => {
    const matchesSearch =
      !searchTerm ||
      operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operator.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || operator.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleOperatorClick = (operator) => {
    navigate(`/operators/${operator.id}`, {
      state: { operator },
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "busy":
        return "bg-red-100 text-red-800 border-red-200";
      case "offline":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getWorkloadColor = (workload) => {
    if (workload <= 3) return "text-green-600";
    if (workload <= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialization: "",
      password: "",
    });
    setSubmitError("");
    setSubmitSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const operatorData = {
        ...formData,
        department: user?.department,
      };

      await createOperator(operatorData);
      setSubmitSuccess("Operator added successfully!");

      // Refresh operators list
      const operatorsData = await getDepartmentOperators(user.departmentId);
      setOperators(operatorsData);

      // Reset and close modal after delay
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
      }, 2000);
    } catch (error) {
      console.error("Error creating operator:", error);
      setSubmitError(error.message || "Failed to create operator. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Operators</h1>
          <p className="text-gray-600">Manage operators in your department - {user?.department}</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Operator
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] mx-4 max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Add New Operator</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Add a new operator to your department. This will create their login credentials.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter operator's full name"
                  className="h-11 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
                  className="h-11 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter phone number"
                  className="h-11 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization" className="text-sm font-medium">
                  Specialization
                </Label>
                <Input
                  id="specialization"
                  name="specialization"
                  type="text"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Road maintenance, Electrical systems"
                  className="h-11 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Create password for operator"
                  className="h-11 text-base"
                />
              </div>

              {submitError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
                  {submitSuccess}
                </div>
              )}

              <div className="flex flex-col space-y-2 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 text-base font-medium bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? "Adding..." : "Add Operator"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="w-full h-11 text-base font-medium"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search operators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Operators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOperators.map((operator) => (
          <div
            key={operator.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleOperatorClick(operator)}
          >
            {/* Operator Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {operator.name && operator.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{operator.name}</h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                      operator.status
                    )}`}
                  >
                    {operator.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <span className="truncate">{operator.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <span>{operator.phone}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className={`text-2xl font-bold ${getWorkloadColor(operator.workload)}`}>
                  {operator.workload}
                </p>
                <p className="text-sm text-gray-600">Active Reports</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{operator.completedReports || 0}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>

            {/* Action */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOperatorClick(operator);
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOperators.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No operators found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedStatus !== "all"
              ? "Try adjusting your search or filter criteria."
              : "No operators available in your department."}
          </p>
        </div>
      )}
    </div>
  );
};

export default OperatorsPage;
