"use client";
import React, { useState, useEffect, useMemo } from "react";
import { DisableReviewsModal } from "@/components/Models/listings/DisableReviewsModel";
import DeactivateUnitsModel from "@/components/Models/listings/DeactivateUnitsModel";
import ListingView from "./ListingView";
import ListingTable from "./ListingTable";
import {
  updatePropertyStatus,
  updateReviewsStatus,
} from "@/components/Models/listings/actions";
import { useToast } from "@/components/UI/toast";

const ListingScreenLayout = ({ listingslist, onRefresh }) => {
  const [viewMode, setViewMode] = useState("list");
  const [activeTab, setActiveTab] = useState("active");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedListings, setSelectedListings] = useState([]);
  const [showExpiringOnly, setShowExpiringOnly] = useState(false);
  const [showReviewsEnabled, setShowReviewsEnabled] = useState(false);
  const [showReviewsDisabled, setShowReviewsDisabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDisableReviewsModal, setShowDisableReviewsModal] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingReviews, setIsUpdatingReviews] = useState(false);
  const [listingsToUpdate, setListingsToUpdate] = useState([]);
  const [reviewsActionType, setReviewsActionType] = useState(null); // "enable" or "disable"
  const [localListings, setLocalListings] = useState([]);

  const { showToast, ToastComponent } = useToast();

  const transformedListings = useMemo(() => {
    return (listingslist?.data?.data || []).map((listing) => ({
      id: listing._id,
      title:
        listing.propertyDetails?.stayDetails?.title ||
        listing.unitNo ||
        "Untitled Property",
      price: `$${listing.price || 0}`,
      rooms: `${listing.propertyDetails?.bedroom || 0} Bed${
        listing.propertyDetails?.bedroom !== 1 ? "s" : ""
      }`,
      location: `${listing.address?.city || ""}, ${
        listing.address?.country || ""
      }`,
      rating: listing.totalRating || 0,
      reviewEnabled: listing.isReviewEnabled || false,
      license: !!listing.license,
      image:
        listing.coverPhoto ||
        listing.photos?.[0] ||
        "/images/default-property.jpg",
      isActive: listing.isActive,
      totalReviews: listing.totalReview || 0,
      propertyType: listing.propertyType,
      unitNo: listing.unitNo,
    }));
  }, [listingslist]);

  // Update local listings when transformed listings change
  useEffect(() => {
    setLocalListings(transformedListings);
  }, [transformedListings]);

  const handleStatusChange = async () => {
    if (selectedListings.length === 0) return;

    setIsUpdatingStatus(true);
    const action = activeTab === "active" ? "inactivate" : "activate";

    try {
      const response = await updatePropertyStatus(selectedListings, action);

      if (response.data?.success !== false) {
        // Update the local listings immediately
        const updatedListings = localListings.map((listing) => {
          if (selectedListings.includes(listing.id)) {
            return {
              ...listing,
              isActive: action === "activate",
            };
          }
          return listing;
        });

        showToast(
          `${selectedListings.length} properties ${action}d successfully`,
          "success"
        );

        // Switch to the appropriate tab based on the action
        setActiveTab(action === "activate" ? "active" : "inactive");

        // Clear selection and exit selection mode
        setSelectedListings([]);
        setIsSelectionMode(false);

        // Update the local listings data
        setLocalListings(updatedListings);
        window.location.reload();
        // Refresh the data in the background to ensure server sync
        if (onRefresh) {
          onRefresh().catch((error) => {
            console.error("Error refreshing data:", error);
          });
        }
      } else {
        showToast(
          response.data?.message || `Failed to ${action} properties`,
          "error"
        );
      }
    } catch (error) {
      console.error(`Error ${action}ing properties:`, error);
      showToast(`An error occurred while ${action}ing properties`, "error");
    } finally {
      setIsUpdatingStatus(false);
      setShowConfirmModal(false);
    }
  };

  const activeListings = useMemo(
    () => localListings.filter((listing) => listing.isActive),
    [localListings]
  );

  const inactiveListings = useMemo(
    () => localListings.filter((listing) => !listing.isActive),
    [localListings]
  );

  const currentListings =
    activeTab === "active" ? activeListings : inactiveListings;

  const filteredListings = currentListings.filter((listing) => {
    const expiringFilter = !showExpiringOnly || listing.license;
    const reviewFilter =
      (showReviewsEnabled && listing.reviewEnabled === true) ||
      (showReviewsDisabled && listing.reviewEnabled === false) ||
      (!showReviewsEnabled && !showReviewsDisabled);
    const searchFilter =
      !searchTerm ||
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.price.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase());

    return expiringFilter && reviewFilter && searchFilter;
  });

  const handleToggleDropdown = (id) => {
    setOpenDropdownIndex(openDropdownIndex === id ? null : id);
  };

  const handleToggleSelect = (id) => {
    setSelectedListings((prev) =>
      prev.includes(id)
        ? prev.filter((listingId) => listingId !== id)
        : [...prev, id]
    );
  };

  const handleOpenToggleReviewsModal = () => {
    console.log("Selected Listings IDs:", selectedListings);
    console.log("Local Listings data:", localListings);

    const selectedUnits = selectedListings
      .map((id) => localListings.find((listing) => listing.id === id))
      .filter((listing) => listing !== undefined && listing !== null);

    if (selectedUnits.length === 0) {
      showToast("No units selected", "info");
      return;
    }

    // Check if all selected units have the same review status
    const allEnabled = selectedUnits.every(
      (unit) => unit.reviewEnabled === true
    );
    const allDisabled = selectedUnits.every(
      (unit) => unit.reviewEnabled === false
    );

    // Determine the action based on current status
    let action;
    if (allEnabled) {
      action = "disable"; // If all are enabled, we'll disable them
    } else if (allDisabled) {
      action = "enable"; // If all are disabled, we'll enable them
    } else {
      // If mixed status, we'll enable the disabled ones
      action = "enable";
    }

    // Filter units that need to be updated
    const toUpdate = selectedUnits.filter((unit) => {
      if (action === "enable") {
        return unit.reviewEnabled === false; // Only update disabled units
      } else {
        return unit.reviewEnabled === true; // Only update enabled units
      }
    });

    if (toUpdate.length === 0) {
      showToast(
        `No units need to be ${action === "enable" ? "enabled" : "disabled"}`,
        "info"
      );
      return;
    }

    setReviewsActionType(action);
    setListingsToUpdate(toUpdate);
    setShowDisableReviewsModal(true);
  };

  const confirmToggleReviews = async () => {
    if (listingsToUpdate.length === 0) return;

    setIsUpdatingReviews(true);

    try {
      console.log("Sending update request with:", {
        listingsToUpdate: listingsToUpdate.map((l) => l.id),
        reviewsActionType,
      });

      const response = await updateReviewsStatus(
        listingsToUpdate.map((l) => l.id),
        reviewsActionType === "enable"
      );

      console.log("Received response:", response);

      // Check if response is empty
      if (!response || Object.keys(response).length === 0) {
        throw new Error("Empty response received from server");
      }

      if (response.success) {
        // Update the local listings immediately
        // const updatedListings = localListings.map((listing) => {
        //   if (listingsToUpdate.some((l) => l.id === listing.id)) {
        //     return {
        //       ...listing,
        //       reviewEnabled: reviewsActionType === "enable",
        //     };
        //   }
        //   return listing;
        // });

        // // Update the local listings data
        // setLocalListings(localListings);

        // Update the reviews filter based on the action
        if (reviewsActionType === "enable") {
          setShowReviewsEnabled(true);
          setShowReviewsDisabled(false);
        } else {
          setShowReviewsEnabled(false);
          setShowReviewsDisabled(true);
        }

        showToast(
          `Successfully ${
            reviewsActionType === "enable" ? "enabled" : "disabled"
          } reviews for ${listingsToUpdate.length} properties`,
          "success"
        );

        // Clear selection and exit selection mode
        setSelectedListings([]);
        setIsSelectionMode(false);
        window.location.reload();
        // Refresh the data in the background to ensure server sync
        if (onRefresh) {
          onRefresh().catch((error) => {
            console.error("Error refreshing data:", error);
          });
        }
      } else {
        console.error("Failed to update reviews:", response);
        showToast(
          response.message || "Failed to update reviews. Please try again.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error toggling reviews:", error);
      showToast(
        error.message ||
          "An error occurred while updating reviews. Please try again.",
        "error"
      );
    } finally {
      setIsUpdatingReviews(false);
      setShowDisableReviewsModal(false);
      setListingsToUpdate([]);
      setReviewsActionType(null);
    }
  };

  return (
    <div className="w-full h-full">
      <div className=" flex flex-col h-full">
        {/* ListingsView and Modals */}
        <div className="flex-shrink-0">
          <ListingView
            listingslist={listingslist}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            listings={activeListings}
            inactiveListings={inactiveListings}
            viewMode={viewMode}
            setViewMode={setViewMode}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isSelectionMode={isSelectionMode}
            setIsSelectionMode={setIsSelectionMode}
            selectedListings={selectedListings}
            setSelectedListings={setSelectedListings}
            showConfirmModal={showConfirmModal}
            setShowConfirmModal={setShowConfirmModal}
            showDisableReviewsModal={showDisableReviewsModal}
            setShowDisableReviewsModal={setShowDisableReviewsModal}
            showFilterDropdown={showFilterDropdown}
            setShowFilterDropdown={setShowFilterDropdown}
            showExpiringOnly={showExpiringOnly}
            setShowExpiringOnly={setShowExpiringOnly}
            showReviewsEnabled={showReviewsEnabled}
            setShowReviewsEnabled={setShowReviewsEnabled}
            showReviewsDisabled={showReviewsDisabled}
            setShowReviewsDisabled={setShowReviewsDisabled}
            isUpdatingStatus={isUpdatingStatus}
            isUpdatingReviews={isUpdatingReviews}
            setIsUpdatingStatus={setIsUpdatingStatus}
            handleOpenToggleReviewsModal={handleOpenToggleReviewsModal}
            handleStatusChange={handleStatusChange}
          />
        </div>
        <div className="flex-1 min-h-0">
          <div className="h-full overflow-y-auto">
            <div
              className={
                viewMode === "list"
                  ? "divide-y divide-gray-200"
                  : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              }
            >
              {filteredListings.map((listing) => (
                <ListingTable
                  key={listing.id}
                  listing={listing}
                  viewMode={viewMode}
                  isSelectionMode={isSelectionMode}
                  selectedListings={selectedListings}
                  onToggleSelect={handleToggleSelect}
                  onToggleDropdown={handleToggleDropdown}
                  openDropdownIndex={openDropdownIndex}
                />
              ))}
            </div>

            {filteredListings.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No listings found</p>
              </div>
            )}
          </div>
        </div>
        <DeactivateUnitsModel
          isOpen={showConfirmModal}
          onClose={() => !isUpdatingStatus && setShowConfirmModal(false)}
          onConfirm={handleStatusChange}
          title={`${activeTab === "active" ? "Deactivate" : "Activate"} Units?`}
          message={`Are you sure you want to ${
            activeTab === "active" ? "deactivate" : "activate"
          } the selected units?`}
          selectedListings={selectedListings}
          listings={currentListings}
          isLoading={isUpdatingStatus}
        />
        <DisableReviewsModal
          isOpen={showDisableReviewsModal}
          onClose={() =>
            !isUpdatingReviews && setShowDisableReviewsModal(false)
          }
          onConfirm={confirmToggleReviews}
          selectedListings={listingsToUpdate.map((l) => l.id)}
          listings={listingsToUpdate}
          isLoading={isUpdatingReviews}
          reviewsActionType={reviewsActionType}
          title={`$${
            reviewsActionType === "enable" ? "Enable" : "Disable"
          } Reviews?`}
          message={`Are you sure you want to $${
            reviewsActionType === "enable" ? "enable" : "disable"
          } reviews for the selected listings?`}
        />
        <ToastComponent />
      </div>
    </div>
  );
};

export default ListingScreenLayout;
