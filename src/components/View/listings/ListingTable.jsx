import React, { useRef, useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import moreDropdownList from "../../../components/Controller/listings/moreDropdownList";
import ListingGrid from "./ListingGrid";
import MoreDropdown from "./MoreDropdown";
// import MoreDropdownModel from "./MoreDropdownModel";
// import DeleteModel from "@/components/Models/listings/moreDropdownModels/DeleteModel";
// import UpdateRatePlan from "@/components/Models/listings/moreDropdownModels/UpdateRatePlan";
// import UpdateUnitModal from "@/components/Models/listings/moreDropdownModels/UpdateUnitModal";
// import DeactivateUnitModal from "@/components/Models/listings/moreDropdownModels/DeactivateUnitModal";
// import UpdateLicenseModal from "@/components/Models/listings/moreDropdownModels/UpdateLicenseModal";
// import { DisableReviewsModal } from "@/components/Models/listings/DisableReviewsModel";

const ListingTable = ({
  listing,
  viewMode,
  isSelectionMode,
  selectedListings,
  onToggleSelect,
  onToggleDropdown,
  openDropdownIndex,
}) => {
  const moreButtonRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  // const [activeModal, setActiveModal] = useState(null);
  // const [modalListing, setModalListing] = useState(null);

  // const handleDropdownAction = (action, listing) => {
  //   setActiveModal(action);
  //   setModalListing(listing);
  // };
  useEffect(() => {
    if (openDropdownIndex === listing.id && moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.right - 224, // dropdown width = 224px
      });
    }
  }, [openDropdownIndex, listing.id]);
  // Use grid view component if needed
  if (viewMode === "grid") {
    return (
      <ListingGrid
        listing={listing}
        onToggleDropdown={onToggleDropdown}
        openDropdownIndex={openDropdownIndex}
        isSelectionMode={isSelectionMode}
        selectedListings={selectedListings}
        onToggleSelect={onToggleSelect}
      />
    );
  }

  return (
    <div className="max-[1000px]:overflow-x-auto px-2 min-w-0 w-full">
      <table className="max-[1000px]:min-w-[768px] relative w-full text-sm">
        <tbody>
          <tr className="border-b border-gray-200">
            {/* Title */}
            <td className="w-1/6 px-2 py-2 text-sm font-semibold text-gray-900 break-all">
              <div className="flex items-center">{listing.title}</div>
            </td>

            {/* Room */}
            <td className="w-1/12 px-2 py-2 text-gray-500 break-all">
              <div className="flex items-center text-sm">
                <img src="/images/bed.svg" alt="bed" className="w-4 h-4 mr-1" />
                <span>{listing.rooms}</span>
              </div>
            </td>

            {/* Location */}
            <td className="w-1/6 px-2 py-2 text-gray-500 break-all">
              <div className="flex items-center text-sm">
                <img
                  src="/images/location.svg"
                  alt="location"
                  className="w-4 h-4 mr-1"
                />
                <span>{listing.location}</span>
              </div>
            </td>

            {/* Price */}
            <td className="w-1/12 px-2 py-2 text-sm font-bold text-gray-800 break-all">
              <span>{listing.price}</span>
            </td>

            {/* Rating and Review Status */}
            <td className="w-1/12 px-2 py-2 break-all">
              <div className="flex items-center text-yellow-500">
                <FaStar className="mr-1" />
                <span>{listing.rating}</span>
                <img
                  src={
                    listing.reviewEnabled
                      ? "/images/reviews.svg"
                      : "/images/reviews-disable.svg"
                  }
                  className="w-5 h-5 ml-2"
                  alt="review status"
                />
              </div>
            </td>

            {/* License */}
            <td className="w-1/6 px-2 py-2 break-all">
              {listing.license && (
                <div className="flex items-center justify-center bg-[#EF5A5C] text-white px-2 py-1 rounded text-xs">
                  <img
                    src="/images/licence.svg"
                    alt="License"
                    className="w-4 h-4 mr-1"
                  />
                  <p>Expiring License</p>
                </div>
              )}
            </td>

            {/* Icons */}
            <td className="w-1/6 px-2 py-2 relative">
              <div className="flex items-center justify-center space-x-3">
                <div className="relative w-8 h-8">
                  <img
                    src="/images/stayhub.svg"
                    alt="stayhub"
                    className="absolute w-8 h-8 max-[1000px]:w-5 max-[1000px]:h-5 z-10"
                  />
                  <img
                    src="/images/airbnb.svg"
                    alt="airbnb"
                    className="absolute left-5 w-8 h-8 max-[1000px]:w-5 max-[1000px]:h-5 z-20"
                  />
                </div>
                <div className="h-8 w-px bg-gray-400 ml-5" />

                <div className="">
                  <img
                    src="/images/smart-lock-1.svg"
                    alt="Smart Lock"
                    className="w-8 h-8 max-[1000px]:w-6 max-[1000px]:h-6"
                  />
                </div>
              </div>
            </td>

            <td className="w-1/12 px-2 py-2 relative">
              <div
                ref={moreButtonRef}
                onClick={() => onToggleDropdown(listing.id)}
                className="cursor-pointer"
              >
                <img src="/images/more.svg" alt="More" />
              </div>
            </td>
            {/* Checkbox on the rightmost side */}
            {isSelectionMode ? (
              <td className="w-1/12 px-2 py-2 text-right">
                <input
                  type="checkbox"
                  checked={selectedListings.includes(listing.id)}
                  onChange={() => onToggleSelect(listing.id)}
                  className="w-5 h-5 rounded border-gray-300 text-white bg-[#137FB9] focus:ring-[#137FB9]"
                />
              </td>
            ) : (
              <td className="w-1/12 px-2 py-2"></td>
            )}
          </tr>
        </tbody>
      </table>

      {/* Dropdown */}
      <MoreDropdown
        listingId={listing.id}
        openDropdownIndex={openDropdownIndex}
        onToggleDropdown={onToggleDropdown}
        moreButtonRef={moreButtonRef}
        dropdownPos={dropdownPos}
      />
      {/* 🧩 Modal Block 
      {activeModal && modalListing && (
        <MoreDropdownModel onClose={() => setActiveModal(null)}>
          {activeModal === "delete" && (
            <DeleteModel
              listing={modalListing}
              onClose={() => setActiveModal(null)}
              onConfirm={() => {
                console.log("Deleting", modalListing.id);
                setActiveModal(null);
              }}
            />
          )}

          {activeModal === "updateRatePlan" && (
            <UpdateRatePlan
              listing={modalListing}
              onClose={() => setActiveModal(null)}
              onSave={(data) => {
                console.log("Rate plan updated", data);
                setActiveModal(null);
              }}
            />
          )}

          {activeModal === "updateUnit" && (
            <UpdateUnitModal
              listing={modalListing}
              onClose={() => setActiveModal(null)}
              onSave={(data) => {
                console.log("Unit updated", data);
                setActiveModal(null);
              }}
            />
          )}
          {activeModal === "deactivateUnits" && (
            <DeactivateUnitModal
              listing={modalListing}
              onClose={() => setActiveModal(null)}
              onSave={(data) => {
                console.log("Unit updated", data);
                setActiveModal(null);
              }}
            />
          )}
          {activeModal === "disableReviews" && (
            <DisableReviewsModal
              listing={modalListing}
              onClose={() => setActiveModal(null)}
              onSave={(data) => {
                console.log("Unit updated", data);
                setActiveModal(null);
              }}
            />
          )}
          {activeModal === "updateLicense" && (
            <UpdateLicenseModal
              listing={modalListing}
              onClose={() => setActiveModal(null)}
              onSave={(data) => {
                console.log("Unit updated", data);
                setActiveModal(null);
              }}
            />
          )}
        </MoreDropdownModel>
      )}*/}
    </div>
  );
};

export default ListingTable;

