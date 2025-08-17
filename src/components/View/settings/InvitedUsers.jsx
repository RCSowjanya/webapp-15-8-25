"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { addInvitedUser, getInvitedUsers } from "../../Models/Login/InvitedUserModel";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaSearch, FaCheckCircle, FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const InvitedUsers = ({ onBack, userData }) => {
  const [view, setView] = useState("list"); // "list" or "add"
  const [isLoading, setIsLoading] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [pagination, setPagination] = useState({
    totalData: 0,
    totalPage: 0,
    currentPage: 1,
    pageSize: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Form states for adding new invited user
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+966",
    userType: "invited",
    permissions: {}
  });

  const [selectedCountry, setSelectedCountry] = useState({ 
    code: "+966", 
    label: "SA", 
    name: "Saudi Arabia" 
  });
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState("");

  const countryOptions = [
    { code: "+966", label: "SA", name: "Saudi Arabia" },
    { code: "+91", label: "IN", name: "India" },
    { code: "+1", label: "CA", name: "Canada" },
    { code: "+61", label: "AU", name: "Australia" },
    { code: "+44", label: "GB", name: "United Kingdom" },
  ];

  // Load invited users on component mount
  useEffect(() => {
    loadInvitedUsers();
  }, []);

  const loadInvitedUsers = async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const response = await getInvitedUsers({
        page,
        pageSize: 10,
        search
      });

      if (response.success) {
        setInvitedUsers(response.data);
        setPagination(response.pagination);
      } else {
        toast.error(response.message || "Failed to load invited users");
      }
    } catch (error) {
      console.error("Error loading invited users:", error);
      toast.error("Failed to load invited users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounce search
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      loadInvitedUsers(1, value);
    }, 500);
  };

  const searchTimeout = React.useRef(null);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.phone) {
        toast.error("Please fill in all required fields");
        return;
      }

      const userData = {
        ...formData,
        countryCode: selectedCountry.code,
        invitedBy: userData?.data?._id || userData?.data?.id,
        permissions: {
          canViewListings: true,
          canViewReservations: true,
          canViewPayments: false,
          canManageSettings: false
        }
      };

      const response = await addInvitedUser(userData);

      if (response.success) {
        toast.success("Invited user added successfully!");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          countryCode: "+966",
          userType: "invited",
          permissions: {}
        });
        setSelectedCountry({ code: "+966", label: "SA", name: "Saudi Arabia" });
        setView("list");
        loadInvitedUsers(); // Refresh the list
      } else {
        toast.error(response.message || "Failed to add invited user");
      }
    } catch (error) {
      console.error("Error adding invited user:", error);
      toast.error("Failed to add invited user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    setCountrySearchTerm("");
    setFormData(prev => ({ ...prev, countryCode: country.code }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, phone: value }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (view === "add") {
    return (
      <div className="bg-white h-full flex flex-col">
        <div className="flex-grow p-4 overflow-y-auto">
          <header className="py-2 flex items-center gap-4">
            <button
              onClick={() => setView("list")}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Add Invited User</h1>
          </header>

          <form onSubmit={handleAddUser} className="max-w-2xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C69E8]"
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C69E8]"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C69E8]"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="flex">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 border-r-0 rounded-l-md bg-gray-50"
                  >
                    <span>{selectedCountry.label}</span>
                    <span>{selectedCountry.code}</span>
                    <IoMdArrowDropdown />
                  </button>

                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-64 z-10">
                      <div className="p-2 border-b">
                        <div className="flex items-center gap-2">
                          <FaSearch className="text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search country"
                            value={countrySearchTerm}
                            onChange={(e) => setCountrySearchTerm(e.target.value)}
                            className="w-full text-sm focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {countryOptions
                          .filter(country => 
                            country.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
                            country.code.includes(countrySearchTerm)
                          )
                          .map((country, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleCountrySelect(country)}
                              className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-8 text-center">{country.code}</span>
                                <span className="text-sm">{country.name}</span>
                              </div>
                              {selectedCountry.code === country.code && (
                                <FaCheckCircle className="text-[#7C69E8]" />
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-[#7C69E8]"
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[#7C69E8] text-white py-2 px-4 rounded-md hover:bg-[#6B5BD4] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <AiOutlineLoading3Quarters className="animate-spin" />
                ) : (
                  <FaPlus />
                )}
                {isLoading ? "Adding..." : "Add Invited User"}
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-full flex flex-col">
      <div className="flex-grow p-4 overflow-y-auto">
        <header className="py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Invited Users</h1>
          </div>
          <button
            onClick={() => setView("add")}
            className="bg-[#7C69E8] text-white px-4 py-2 rounded-md hover:bg-[#6B5BD4] flex items-center gap-2"
          >
            <FaPlus />
            Add User
          </button>
        </header>

        <div className="mb-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search invited users..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C69E8]"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <AiOutlineLoading3Quarters className="animate-spin text-2xl text-[#7C69E8]" />
          </div>
        ) : invitedUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No invited users found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitedUsers.map((user, index) => (
              <div
                key={user._id || index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#7C69E8] rounded-full flex items-center justify-center text-white font-semibold">
                      {user.fname?.[0] || user.firstName?.[0] || "U"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {user.fname && user.lname 
                          ? `${user.fname} ${user.lname}`
                          : user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : "Unknown User"
                        }
                      </h3>
                      <p className="text-sm text-gray-500">
                        {user.email || "No email"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.countryCode} {user.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <FaEdit />
                    </button>
                    <button className="text-red-400 hover:text-red-600">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.totalPage > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => loadInvitedUsers(pagination.currentPage - 1, searchTerm)}
              disabled={pagination.currentPage <= 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPage}
            </span>
            <button
              onClick={() => loadInvitedUsers(pagination.currentPage + 1, searchTerm)}
              disabled={pagination.currentPage >= pagination.totalPage}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitedUsers; 