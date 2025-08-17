"use client";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FiFilter } from "react-icons/fi";

import { BsCalendar2Plus } from "react-icons/bs";
import { IoMdArrowDropdown } from "react-icons/io";
import React, { useState, useEffect } from "react";
import { fetchUserActivity } from "../../Models/livefeed/ActivityModel";
import { getDateRange } from "../../../utils/DateUtils";

const filterIdToApiValue = {
  account: "Account",
  listings: "Listing",
  channel: "Channel",
  reservation: "Reservation",
  subscriptions: "Subscription",
  smartlock: "Smartlock",
  rateplan: "Rateplan",
  payout: "Payout",
};

const ActivityLog = ({ dateRange, customDateRange }) => {
  console.log("ActivityLog mounted", { dateRange, customDateRange });
  const [selectedFilterId, setSelectedFilterId] = useState(""); // "" means no filter
  const [appliedFilterId, setAppliedFilterId] = useState(""); // The filter that's actually applied
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Reset activities and page when date range or filter changes
  useEffect(() => {
    setActivities([]);
    setPage(1);
    setTotalPages(1);
    setHasMore(false);
  }, [dateRange, customDateRange, appliedFilterId]);

  // Fetch activities whenever filter or date range changes
  useEffect(() => {
    console.log("ActivityLog useEffect triggered", {
      dateRange,
      customDateRange,
    });
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      // Use getDateRange utility for consistent date calculation
      const { startDate, endDate } = getDateRange(dateRange, customDateRange);
      if (!startDate || !endDate) {
        setError("Please select a valid date range.");
        setLoading(false);
        return;
      }
      try {
        const apiFilter = filterIdToApiValue[appliedFilterId] || undefined;
        const result = await fetchUserActivity({
          startDate,
          endDate,
          filter: apiFilter,
          pageSize: 10,
          page,
        });
        if (result.success) {
          const newActivities = Array.isArray(result.data?.data)
            ? result.data.data
            : [];
          setActivities((prev) =>
            page === 1 ? newActivities : [...prev, ...newActivities]
          );
          setTotalPages(result.data?.total_page || 1);
          setHasMore((result.data?.page || 1) < (result.data?.total_page || 1));
        } else {
          setError(result.message || "Failed to fetch activity log");
          setHasMore(false);
        }
      } catch (err) {
        setError("Failed to fetch activity log");
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [appliedFilterId, dateRange, customDateRange, page]);

  // Handler for filter change
  const handleFilterChange = (id) => {
    setSelectedFilterId(id);
  };

  // Handler for date range preset change
  const handleDateRangePresetChange = (preset) => {
    setDateRangePreset(preset);
  };

  // Handler for custom date range change
  const handleCustomRangeChange = (start, end) => {
    setCustomRange({ startDate: start, endDate: end });
    setDateRangePreset("custom");
  };

  // Handler for reset filter
  const handleResetFilter = () => {
    setSelectedFilterId("");
  };

  const filterOptions = [
    // Add this at the top
    { id: "account", name: "Account activity", img: "/images/accounts.svg" },
    { id: "listings", name: "Listings", img:"/images/listing.svg" },
    { id: "channel", name: "Channel", img:"/images/channels.svg" },
    { id: "reservation", name: "Reservation", img:"/images/reservation.svg" },
    {
      id: "subscriptions",
      name: "Subscriptions and Billing",
      img:"/images/subscription-1.svg",
    },
    { id: "smartlock", name: "Smart Lock", img:"/images/smartlock-3.svg"},
    { id: "rateplan", name: "RatePlan", img:"/images/rateplan.svg" },
    {
      id: "payout",
      name: "Payout(Withdraw earnings)",
      img:"/images/payout.svg",
    },
  ];

  const handleFilterToggle = (filterId) => {
    setSelectedFilterId(filterId === selectedFilterId ? "" : filterId);
  };

  const handleReset = () => {
    setSelectedFilterId("");
    setAppliedFilterId("");
    setIsFilterModalOpen(false);
  };

  const handleSubmit = () => {
    // Apply the selected filter - this will trigger the useEffect to fetch filtered data
    setAppliedFilterId(selectedFilterId);
    console.log("Applied filters:", selectedFilterId);
    setIsFilterModalOpen(false);
    // Reset page to 1 when applying new filters
    setPage(1);
    setActivities([]);
  };

  // ...existing render code, update filter and date range UI to use these handlers...

  return (
    <div className="bg-[#F4F3EF] min-h-screen p-4">
      {/* Activity Log Card */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-lg font-bold text-[#654EE4]">Activity Log</div>
            <div className="text-sm text-gray-700">Recent Actions</div>
          </div>
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700"
          >
            <span>Filters</span>
            <IoMdArrowDropdown className="w-4 h-4 text-gray-600 cursor-pointer" />
          </button>
        </div>

        {/* Activity Content */}
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : Array.isArray(activities) && activities.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No activity found.
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {Array.isArray(activities) &&
                activities.map((item, idx) => {
                  console.log("item.activityBy:", item.activityBy);
                  return (
                    <div
                      key={idx}
                      className="flex justify-between p-2 rounded-lg border border-gray-100"
                    >
                      {/* Left side: Icon and content - more space */}
                      <div className="flex items-start gap-3 flex-1 mr-4">
                        {/* Icon in circle */}
                        <div className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-purple-200 bg-white">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt=""
                              className="w-5 h-5 object-contain"
                            />
                          ) : (
                            <MdOutlineSync className="w-5 h-5 text-purple-600" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 items-start">
                          <div className="font-medium text-xs whitespace-no-wrap text-gray-600 mb-2">
                            {item.activity}
                          </div>
                          {item.subtitle && (
                            <div className="text-xs text-gray-400">
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right side: Time and By - less space */}
                      <div className="flex flex-col items-end text-xs text-gray-600">
                        <div className="mb-1">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString("en-US", {
                                month: "short",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : ""}
                        </div>
                        {item.activityBy && (
                          <div>By {item.activityBy?.fname || "Stayhub"}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
            {hasMore && !loading && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-4 py-2 bg-[#654EE4] cursor-pointer text-white rounded-lg shadow hover:bg-[#4b39b3]"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter By Modal */}
      {isFilterModalOpen && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setIsFilterModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="text-lg font-bold text-gray-800">Filter By</div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleReset}
                  className="text-orange-500 font-medium"
                >
                  RESET
                </button>
              </div>
            </div>

            {/* Filter Options */}
            <div className="p-6">
              <div className="space-y-4">
                {filterOptions.map((option) => {
                  const isSelected = selectedFilterId === option.id;

                  return (
                    <div
                      key={option.id}
                      onClick={() => handleFilterToggle(option.id)}
                      className="flex items-center justify-between gap-3 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50"
                    >
                      {/* Left: Icon and Label */}
                      <div className="flex items-center gap-3">
                        {option.img && (
                          <img
                            src={option.img}
                            alt={option.name}
                            className="w-7 h-7 object-contain"
                          />
                        )}
                        <span className="text-sm font-medium text-gray-800">{option.name}</span>
                      </div>
                      {/* Right: Checkbox */}
                      <div
                        className={`w-5 h-5 flex items-center justify-center border-2 rounded-full ${
                          isSelected ? 'bg-[#25A4E8] border-[#25A4E8]' : 'border-gray-100 bg-white'
                        }`}
                        style={{ minWidth: 20 }}
                      >
                        {isSelected && (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4 8.5L7 11.5L12 5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="p-2 border-t border-gray-200 text-center">
              <button
                onClick={handleSubmit}
                className="w-[90%] text-center cursor-pointer  bg-[#25A4E8] text-white py-3 my-3 rounded-lg font-medium disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;