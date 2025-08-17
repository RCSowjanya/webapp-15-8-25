import React, { useRef, useState, useEffect } from "react";
import moreDropdownList from "../../../components/Controller/listings/moreDropdownList";
import MoreDropdown from "./MoreDropdown";

const ListingGrid = ({
  listing,
  onToggleDropdown,
  openDropdownIndex,
  isSelectionMode,
  selectedListings,
  onToggleSelect,
}) => {
  const moreButtonRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (openDropdownIndex === listing.id && moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.right - 224, // dropdown width = 224px
      });
    }
  }, [openDropdownIndex, listing.id]);
  if (!listing) return null;

  return (
    <div className="bg-white rounded-2xl mx-2 overflow-visible shadow-md relative">
      {/* Image and Overlays */}
      <div className="relative rounded-2xl ">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-[250px] object-cover rounded-2xl"
        />
        {/* Add checkbox for selection mode */}
        {isSelectionMode && (
          <div className="select absolute top-16 right-4 z-50 text-white cursor-pointer">
            <input
              type="checkbox"
              checked={selectedListings.includes(listing.id)}
              onChange={() => onToggleSelect(listing.id)}
              className="w-5 h-5 rounded border-blue-800 bg-blue-900 text-white cursor-pointer"
            />
          </div>
        )}
        {/* Room count tag */}
        <div className="absolute top-4 left-0 bg-black/70 text-white text-xs px-3 py-2 rounded-r-full rounded flex items-center gap-1  max-w-[1100px]:top-2 max-w-[1100px]:left-2">
          <img src="/images/bed-white.svg" alt="bed icon" className="w-4 h-4" />
          {listing.rooms}
        </div>

        <div className="absolute top-4 right-0 bg-black/70 text-white text-xs px-3 py-2 rounded-l-full flex items-center justify-between gap-2 min-w-[3.6rem]   max-w-[1100px]:top-14 max-w-[1100px]:right-2">
          {/* Rating icon + value */}
          <div className="flex items-center gap-1">
            <img
              src="/images/rate-star.svg"
              alt="rate-star"
              className="w-4 h-4"
            />
            <span>{listing.rating}</span>
          </div>

          {/* Review icon */}
          <img
            src={
              listing.reviewEnabled
                ? "/images/reviews.svg"
                : "/images/reviews-disable.svg"
            }
            alt="reviews"
            className="w-4 h-4 filter brightness-0 invert"
          />
        </div>
      </div>

      {/* Content Box */}
      <div className="relative pt-0 max-[1100px]:pt-[3rem]">
        <div className="w-full px-2 md:absolute md:bottom-4 md:left-1/2 md:transform md:-translate-x-1/2 md:w-[95%] bg-white rounded-lg shadow-lg p-2 relative">
          {/* Expiring License - Now positioned at the top of content box */}
          {listing.license && (
            <div className="absolute -top-3 left-4 md:left-0 transform -translate-y-1/2 bg-[#EF5A5C] text-white shadow-lg px-3 py-1 flex items-center rounded-xl rounded-b-none z-10 gap-2 max-w-[calc(100%-1rem)]">
              <img src="/images/licence.svg" alt="licence" className="w-6" />
              <p className="text-[12px]">Expiring License</p>
            </div>
          )}

          <div className="flex justify-between">
            <h3 className="text-sm font-semibold text-gray-800">
              {listing.title}
            </h3>

            {/* City badge */}
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <img
                src="/images/location.svg"
                alt="location"
                className="w-2 h-2"
              />
              {listing.location}
            </div>
          </div>

          {/* Price and platforms */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2">
              <span className="text-lg font-bold text-gray-900">
                {listing.price}
              </span>
              <div className="flex gap-2">
                <div className="pr-2 border-r border-gray-200">
                  <img
                    src="/images/smartlock-red.svg"
                    alt="platform"
                    className="w-7 h-7"
                  />
                </div>
                <div className="flex relative">
                  <img
                    src="/images/stayhub.svg"
                    alt="booking"
                    className="w-7 h-7"
                  />
                  <img
                    src="/images/airbnb.svg"
                    alt="airbnb"
                    className="w-7 h-7 absolute left-5 top-[2px]"
                  />
                </div>
              </div>
            </div>

            {/* Bottom right action */}
            <div className="p-1">
              <img
                src="/images/more.svg"
                alt="more-icon"
                ref={moreButtonRef}
                onClick={() => onToggleDropdown(listing.id)}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      <MoreDropdown
        listingId={listing.id}
        openDropdownIndex={openDropdownIndex}
        onToggleDropdown={onToggleDropdown}
        moreButtonRef={moreButtonRef}
        dropdownPos={dropdownPos}
        isGridView={true}
        // onActionSelect={handleDropdownAction}
      />
    </div>
  );
};

export default ListingGrid;