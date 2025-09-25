import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, Plus } from "lucide-react";
import { getDepartments, createDepartment } from "../services/api";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    departmentHead: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const navigate = useNavigate();

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
      description: "",
      departmentHead: "",
      email: "",
      phone: "",
      address: "",
      password: "",
    });
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Department name is required");
      return;
    }

    setIsCreating(true);
    try {
      const newDepartment = await createDepartment(formData);
      setDepartments((prev) => [...prev, newDepartment]);
      setShowAddModal(false);
      resetForm();
      alert("Department created successfully!");
    } catch (error) {
      console.error("Error creating department:", error);
      alert("Failed to create department. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    resetForm();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDepartments();
        setDepartments(data);
      } catch (err) {
        console.error("Failed to load departments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredDepartments = departments.filter(
    (dept) =>
      dept?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDepartmentClick = (department) => {
    navigate(`/departments/${department.id}`, { state: { department } });
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Municipal Departments</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Overview of all departments and their responsibilities.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button
            variant="default"
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((department) => (
          <div
            key={department.id}
            onClick={() => handleDepartmentClick(department)}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
              <div className="bg-blue-50 p-2 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {department.description || "No description available."}
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Active Reports:</span>
                <span className="font-medium text-gray-900">{department.activeReports || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Department Head:</span>
                <span className="font-medium text-gray-900">
                  {department.manager || "Not assigned"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Try adjusting your search criteria."
              : "No departments have been created yet."}
          </p>
        </div>
      )}

      {/* Add Department Modal */}
      <Dialog open={showAddModal} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-md mx-4 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Add New Department</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Create a new department with basic information and contact details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateDepartment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Department Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Public Safety"
                className="h-11 text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of department responsibilities"
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="departmentHead" className="text-sm font-medium">
                Department Head Name
              </Label>
              <Input
                id="departmentHead"
                name="departmentHead"
                value={formData.departmentHead}
                onChange={handleInputChange}
                placeholder="Department head name"
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Department Head Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password for department head login"
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
                placeholder="department.email@civicsense.gov"
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                Address
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Department office address"
                className="h-11 text-base"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleModalClose}
                disabled={isCreating}
                className="h-11 text-base font-medium w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || !formData.name.trim()}
                className="h-11 text-base font-medium w-full sm:w-auto"
              >
                {isCreating ? "Creating..." : "Create Department"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentsPage;
