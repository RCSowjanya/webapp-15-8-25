import React from "react";
import { IoClose } from "react-icons/io5";
const DeactivateUnitsModel = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  selectedListings = [], // Add default value
  listings = [], // Add default value
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
}) => {
  if (!isOpen) return null;

  // Get the selected listing details with null check
  const selectedUnits =
    listings?.filter((listing) => selectedListings?.includes(listing._id)) ||
    [];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[999]">
      <div className="relative bg-white p-6 rounded-xl w-[400px] shadow-2xl transform transition-all">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <IoClose className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">{message}</p>

          {/* Selected Units List */}
          <div className="max-h-[200px] overflow-y-auto bg-gray-50 rounded-lg space-y-2 p-3">
            {selectedUnits.map((unit) => (
              <div
                key={unit.id}
                className="flex items-center gap-3 p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-md"
              >
                <img
                  src={unit.image}
                  alt="apartment"
                  className="w-11 h-11 rounded-md"
                />
                <span className="text-sm text-gray-700">{unit.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium bg-[#25A4E8] text-white rounded-lg hover:bg-[#1f8cc7] transition-colors"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeactivateUnitsModel;