import React, { useState, useEffect } from "react";
import { FaThLarge, FaList, FaSearch } from "react-icons/fa";
import { BsFillFilterSquareFill } from "react-icons/bs";
import { IoMdArrowDropdown } from "react-icons/io";

const ListingView = ({
  listingslist,
  activeTab,
  setActiveTab,
  listings,
  inactiveListings,
  viewMode,
  setViewMode,
  searchTerm,
  setSearchTerm,
  isSelectionMode,
  setIsSelectionMode,
  selectedListings,
  setSelectedListings,
  showConfirmModal,
  setShowConfirmModal,
  showDisableReviewsModal,
  setShowDisableReviewsModal,
  showFilterDropdown,
  setShowFilterDropdown,
  showExpiringOnly,
  setShowExpiringOnly,
  showReviewsEnabled,
  setShowReviewsEnabled,
  showReviewsDisabled,
  setShowReviewsDisabled,
  isUpdatingStatus,
  isUpdatingReviews,
  handleOpenToggleReviewsModal,
}) => {
  // Calculate counts directly from listingslist
  const activeCount = React.useMemo(
    () => listingslist?.data?.data.filter((item) => item.isActive)?.length || 0,
    [listingslist]
  );

  const inactiveCount = React.useMemo(
    () =>
      listingslist?.data?.data.filter((item) => !item.isActive)?.length || 0,
    [listingslist]
  );

  // Get selected data from the current tab's listings
  const selectedData = React.useMemo(() => {
    const currentListings =
      activeTab === "active" ? listings : inactiveListings;
    return (currentListings || []).filter((item) =>
      selectedListings.includes(item.id)
    );
  }, [activeTab, listings, inactiveListings, selectedListings]);

  const allSelectedAreActive = selectedData?.every((item) => item.isActive);
  const allSelectedAreInactive = selectedData?.every((item) => !item.isActive);
  const allSelectedHaveReviews =
    selectedData.length > 0 && selectedData.every((item) => item.reviewEnabled);
  const allSelectedHaveReviewsDisabled =
    selectedData.length > 0 &&
    selectedData.every((item) => !item.reviewEnabled);

  // Update the action status label based on the current tab
  const actionStatusLabel = React.useMemo(() => {
    if (selectedData.length === 0) {
      return activeTab === "active" ? "Deactivate Units" : "Activate Units";
    }

    // If we're in the active tab, show "Inactivate Units"
    if (activeTab === "active") {
      return "Inactivate Units";
    }

    // If we're in the inactive tab, show "Activate Units"
    return "Activate Units";
  }, [activeTab, selectedData]);

  // Update the review action label based on the selected items' review status
  const reviewActionLabel = React.useMemo(() => {
    if (selectedData.length === 0) {
      return "Disable Reviews";
    }

    // Check if all selected items have reviews enabled
    const allEnabled = selectedData.every((item) => item.reviewEnabled);
    const allDisabled = selectedData.every((item) => !item.reviewEnabled);

    // If all selected items have reviews enabled, show "Disable Reviews"
    if (allEnabled) {
      return "Disable Reviews";
    }

    // If all selected items have reviews disabled, show "Enable Reviews"
    if (allDisabled) {
      return "Enable Reviews";
    }

    // If mixed status, show based on majority
    const enabledCount = selectedData.filter(
      (item) => item.reviewEnabled
    ).length;
    return enabledCount > selectedData.length / 2
      ? "Disable Reviews"
      : "Enable Reviews";
  }, [selectedData]);

  const handleStatusChange = async () => {
    if (selectedListings.length === 0) return;
    setIsUpdatingStatus(true);
    const action = activeTab === "active" ? "inactivate" : "activate";
    // ... API call and state updates
  };

  return (
    <div className="flex-1 min-h-0 ">
      <div className="">
        {/* Listings Header (filters, toggles, etc.) */}
        <div className="flex-shrink-0">
          <div className="sticky top-0 bg-white rounded-lg z-30">
            {/* Top Toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pl-4 pr-4 py-2 border-b border-gray-200">
              <h1 className="text-xl font-semibold text-[#7C69E8]">Listings</h1>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                {/* Tab Toggle */}
                <div className="relative flex bg-[#F3F2F7] rounded-full p-1 min-w-[280px]">
                  <button
                    onClick={() => setActiveTab("active")}
                    className={`flex-1 px-5 py-1 text-sm font-medium cursor-pointer rounded-full transition-colors duration-200 ${
                      activeTab === "active"
                        ? "bg-[#654EE4] text-white"
                        : "text-gray-700 bg-[#E4E0FA]"
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <span>Active</span>
                      <span className="font-semibold ml-2 px-2 text-[12px] bg-[#EFEEFC] rounded-full text-[#6650E4]">
                        {activeCount}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("inactive")}
                    className={`flex-1 px-5 py-1 text-sm font-medium cursor-pointer rounded-full transition-colors duration-200 ${
                      activeTab === "inactive"
                        ? "bg-[#654EE4] text-white"
                        : "text-gray-700 bg-[#E4E0FA]"
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <span>Inactive</span>
                      <span className="font-semibold ml-2 px-2 text-[12px] bg-[#FCFCFE] rounded-full text-[#000]">
                        {inactiveCount}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Grid/List Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors duration-200 ${
                      viewMode === "grid"
                        ? "bg-[#654EE4] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <FaThLarge className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors duration-200 ${
                      viewMode === "list"
                        ? "bg-[#654EE4] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <FaList className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Search / Select / Filters */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mt-2 px-3 pb-2 border-b border-gray-200">
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search here"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 bg-[#F2F3F3] rounded-xl text-sm w-full min-[1000px]:w-[18rem] focus:outline-none focus:ring-2 focus:ring-[#654EE4] focus:border-transparent"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
                {!isSelectionMode ? (
                  <button
                    onClick={() => {
                      setIsSelectionMode(true);
                      setSelectedListings([]);
                    }}
                    className="px-3 py-2 text-sm bg-[#25A4E81F] cursor-pointer border border-[#25A4E8] text-[#25A4E8] rounded-md hover:bg-[#25A4E82F] transition-colors"
                  >
                    Select
                  </button>
                ) : (
                  <div className="flex flex-row gap-2 items-center flex-wrap">
                    <button
                      onClick={() => {
                        setIsSelectionMode(false);
                        setSelectedListings([]);
                      }}
                      className="px-3 py-2 text-red-500 cursor-pointer text-sm border border-red-500 mr-2 rounded hover:bg-red-50 transition-colors"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() => setShowConfirmModal(true)}
                      disabled={
                        selectedListings.length === 0 || isUpdatingStatus
                      }
                      className="px-3 py-2 border-[#25A4E8] text-[#25A4E8] border mr-2 cursor-pointer text-sm rounded hover:bg-[#25A4E8] hover:text-white transition-colors"
                    >
                      {isUpdatingStatus ? (
                        <>
                          <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-[#25A4E8] mr-2"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          {actionStatusLabel}
                          {selectedListings.length > 0 &&
                            ` (${selectedListings.length})`}
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleOpenToggleReviewsModal}
                      disabled={
                        selectedListings.length === 0 || isUpdatingReviews
                      }
                      className="px-3 py-2 bg-[#25A4E8] text-white text-sm cursor-pointer rounded shadow hover:bg-[#1f8cc7] transition-colors flex items-center gap-2"
                    >
                      {isUpdatingReviews ? (
                        <>
                          <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          {reviewActionLabel}
                          {selectedListings.length > 0 &&
                            ` (${selectedListings.length})`}
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Filters */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="px-3 py-2 text-sm bg-[#25A4E81F] cursor-pointer border border-[#25A4E8] text-[#25A4E8] rounded-md flex items-center gap-2 hover:bg-[#25A4E82F] transition-colors"
                  >
                    <BsFillFilterSquareFill />
                    <span>Filters</span>
                    <IoMdArrowDropdown className="w-5 h-5" />
                  </button>

                  {showFilterDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <div
                        onClick={() => {
                          setShowFilterDropdown(false);
                          setShowExpiringOnly(!showExpiringOnly);
                        }}
                        className="flex justify-between items-center px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        <span>Expiring License</span>
                        <img
                          src="/images/expiring-licence.svg"
                          alt=""
                          className="w-4 h-4"
                        />
                      </div>
                      <div
                        onClick={() => {
                          setShowFilterDropdown(false);
                          setShowReviewsEnabled(!showReviewsEnabled);
                          setShowReviewsDisabled(false);
                        }}
                        className="flex justify-between items-center px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        <span>Reviews Enable</span>
                        <img
                          src="/images/reviews-enable.svg"
                          alt=""
                          className="w-4 h-4"
                        />
                      </div>
                      <div
                        onClick={() => {
                          setShowFilterDropdown(false);
                          setShowReviewsDisabled(!showReviewsDisabled);
                          setShowReviewsEnabled(false);
                        }}
                        className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <span>Reviews Disable</span>
                        <img
                          src="/images/reviews-disable.svg"
                          alt=""
                          className="w-4 h-4"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Table/content area */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* ...table or listings content goes here... */}
        </div>
      </div>
    </div>
  );
};

export default ListingView;
