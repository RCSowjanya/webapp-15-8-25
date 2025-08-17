import React from "react";
import { IoClose } from "react-icons/io5";

const DisableReviewsModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedListings = [],
  listings = [],
  isLoading = false,
  reviewsActionType = "disable", // "enable" or "disable"
  title,
  message,
}) => {
  if (!isOpen) return null;

  const selectedUnits =
    listings?.filter((listing) => selectedListings.includes(listing.id)) || [];

  const isSingle = selectedUnits.length === 1;
  const isEnable = reviewsActionType === "enable";

  const handleConfirm = () => {
    if (selectedUnits.length > 0) {
      onConfirm(selectedUnits, reviewsActionType);
    }
  };

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

        <h3 className="text-xl font-semibold mb-2 text-gray-800">
          {title || `${isEnable ? "Enable" : "Disable"} Reviews`}
        </h3>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            {message ||
              (isSingle
                ? `Are you sure you want to ${
                    isEnable ? "enable" : "disable"
                  } reviews for this unit?`
                : `Are you sure you want to ${
                    isEnable ? "enable" : "disable"
                  } reviews for these units?`)}
          </p>

          <div className="max-h-[200px] overflow-y-auto bg-gray-50 rounded-lg space-y-2 p-3">
            {selectedUnits.map((unit) => (
              <div
                key={unit.id}
                className="flex items-center gap-3 p-1 hover:bg-gray-100 border border-gray-300 bg-white shadow-lg rounded-md"
              >
                <img
                  src={unit.image}
                  alt="apartment"
                  className="w-11 h-11 rounded-md object-cover"
                  onError={(e) => {
                    e.target.src = "/images/default-property.jpg";
                  }}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">
                    {unit.title}
                  </span>
                  <p className="text-xs text-gray-500">{unit.unitNo}</p>
                </div>
                <img
                  src={
                    isEnable
                      ? "/images/reviews.svg"
                      : "/images/reviews-disable.svg"
                  }
                  alt="review status"
                  className="w-5 h-5"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || selectedUnits.length === 0}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isEnable
                ? "bg-[#25A4E8] hover:bg-[#1f8cc7]"
                : "bg-[#25A4E8] hover:bg-[#1f8cc7]"
            }`}
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Processing...
              </>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export { DisableReviewsModal };
