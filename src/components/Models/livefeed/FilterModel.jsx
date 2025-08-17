"use client";
import React, { useState } from "react";
import { IoClose } from "react-icons/io5";

const FilterModal = ({ isOpen, onClose, onApplyFilters }) => {
  const [selectedDateRange, setSelectedDateRange] = useState("Last 30 Days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCustomRange, setShowCustomRange] = useState(false);

  const dateRanges = [
    "Last 7 Days",
    "Last 30 Days",
    "Last 3 Months",
    "Last 6 Months",
    "Last Year",
    "Custom Range",
  ];

  const handleDateRangeChange = (range) => {
    if (range === "Custom Range") {
      setShowCustomRange(true);
      setSelectedDateRange(range);
    } else {
      setShowCustomRange(false);
      setSelectedDateRange(range);
      // Reset custom dates when switching to predefined ranges
      setCustomStartDate("");
      setCustomEndDate("");
    }
  };

  const handleReset = () => {
    setSelectedDateRange("Last 30 Days");
    setCustomStartDate("");
    setCustomEndDate("");
    setShowCustomRange(false);
  };

  const handleSubmit = () => {
    // Validate custom date range if selected
    if (selectedDateRange === "Custom Range") {
      if (!customStartDate || !customEndDate) {
        alert("Please select both start and end dates for custom range");
        return;
      }

      if (new Date(customStartDate) > new Date(customEndDate)) {
        alert("Start date cannot be after end date");
        return;
      }
    }

    const filters = {
      dateRange: selectedDateRange,
      customStartDate: showCustomRange ? customStartDate : null,
      customEndDate: showCustomRange ? customEndDate : null,
    };
    onApplyFilters(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 overflow-y-auto max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#5940C8]">Filter By</h2>
          <button
            onClick={handleReset}
            className="text-orange-500 hover:text-orange-600 cursor-pointer transition-colors font-medium"
          >
            RESET
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* BY DATE Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">BY DATE</h3>
            <div className="space-y-3">
              {dateRanges.map((range) => (
                <div
                  key={range}
                  className="flex items-center justify-between py-3 px-4 rounded-lg transition-colors"
                  style={{
                    background: selectedDateRange === range ? "#F4F8FF" : "transparent",
                  }}
                >
                  <span className="text-sm font-medium text-gray-800">{range}</span>
                  <input
                    type="radio"
                    name="dateRange"
                    checked={selectedDateRange === range}
                    onChange={() => handleDateRangeChange(range)}
                    className="w-4 h-4 text-[#5940C8] cursor-pointer focus:ring-[#5940C8] border-gray-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          {showCustomRange && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">CUSTOM RANGE</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5940C8] focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5940C8] focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="text-center pt-4">
            <button
              onClick={handleSubmit}
              className="w-full px-8 py-3 bg-[#25A4E8] cursor-pointer text-white rounded-lg transition-colors font-medium text-sm"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;