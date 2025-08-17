import React, { useEffect, useRef } from "react";
import moreDropdownList from "../../../components/Controller/listings/moreDropdownList";

const MoreDropdown = ({
  listingId,
  openDropdownIndex,
  onToggleDropdown,
  moreButtonRef,
  dropdownPos,
  isGridView = false,
  onActionSelect,
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openDropdownIndex === listingId &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(event.target)
      ) {
        onToggleDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownIndex, listingId, onToggleDropdown, moreButtonRef]);

  if (openDropdownIndex !== listingId) return null;

  const style = isGridView
    ? {
        position: "absolute",
        top: "12rem", // adjust as needed
        right: 4,
      }
    : {
        top: dropdownPos.top,
        left: dropdownPos.left,
      };

  return (
    <div
      ref={dropdownRef}
      className="absolute bg-white w-56 border border-gray-200 rounded-md shadow-lg z-[9999] cursor-pointer"
      style={style}
    >
      {moreDropdownList.map((item, index) => (
        <div
          key={index}
          onClick={() => {
            onToggleDropdown(null);
            onActionSelect(item.action, listingId);
          }}
          className="flex justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 border-b border-gray-200 hover:bg-gray-300 last:border-b-0"
        >
          <span>{item.label}</span>
          <img src={item.icon} alt={item.label} className="w-4 h-4" />
        </div>
      ))}
    </div>
  );
};

export default MoreDropdown;
