import React, { useState, useEffect } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { blockUnitDates } from "../../../Models/reservations/BlockUnitModel";
import { toast } from "react-toastify";

function toBackendDateString(date) {
  return date.toISOString().replace("Z", "+00:00");
}

const BlockUnitActiveTab = ({ property, bookingData, onBookingDataChange }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const [formData, setFormData] = useState({
    note: "",
  });
  const [isBlocking, setIsBlocking] = useState(false);

  // Initialize with booking data
  useEffect(() => {
    if (bookingData) {
      console.log(
        "Populating BlockUnitActiveTab with booking data:",
        bookingData
      );

      // Set date range
      if (bookingData.stayDetails) {
        const checkIn =
          bookingData.stayDetails.checkIn instanceof Date
            ? bookingData.stayDetails.checkIn
            : new Date(bookingData.stayDetails.checkIn);
        const checkOut =
          bookingData.stayDetails.checkOut instanceof Date
            ? bookingData.stayDetails.checkOut
            : new Date(bookingData.stayDetails.checkOut);

        setDateRange({
          startDate: checkIn,
          endDate: checkOut,
          key: "selection",
        });
      }
    }
  }, [bookingData]);

  // Calculate nights
  const calculateNights = () => {
    const timeDiff =
      dateRange.endDate.getTime() - dateRange.startDate.getTime();
    return Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  };

  // Format date range
  const formatDateRange = () => {
    const start = format(dateRange.startDate, "dd");
    const end = format(dateRange.endDate, "dd MMM");
    return `${start}–${end}`;
  };

  // Handle date range change
  const handleDateRangeChange = (ranges) => {
    const newRange = ranges.selection;
    setDateRange(newRange);

    // Update booking data in parent
    if (onBookingDataChange && bookingData) {
      const updatedBookingData = {
        ...bookingData,
        stayDetails: {
          ...bookingData.stayDetails,
          checkIn: newRange.startDate,
          checkOut: newRange.endDate,
          nights: Math.max(
            1,
            Math.ceil(
              (newRange.endDate.getTime() - newRange.startDate.getTime()) /
                (1000 * 3600 * 24)
            )
          ),
        },
      };
      onBookingDataChange(updatedBookingData);
    }
  };

  const nights = calculateNights();

  const handleBlockUnit = async () => {
    console.log("Block Unit button clicked");
    if (!property?._id) {
      console.log("No property selected, returning early");
      toast.error("No property selected.");
      return;
    }
    if (!formData.note.trim()) {
      console.log("No note entered, returning early");
      toast.error("Please enter a note for blocking.");
      return;
    }
    setIsBlocking(true);
    try {
      console.log("About to call blockUnitDates");
      const response = await blockUnitDates({
        propertyId: property._id,
        update: [
          {
            fromDate: toBackendDateString(dateRange.startDate),
            toDate: toBackendDateString(dateRange.endDate),
            note: formData.note.trim(),
          },
        ],
      });
      console.log("After API call");
      console.log("Block unit API response:", response);
      if (response.success) {
        toast.success(
          "You have successfully blocked the selected dates for this unit."
        );
      } else {
        toast.error(response.message || "Failed to block unit.");
      }
    } catch (error) {
      console.log("Block unit API error:", error);
      toast.error("Error blocking unit.");
    } finally {
      setIsBlocking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selected Dates */}
        <div>
          <h2 className="font-semibold mb-2 text-sm">Booking Details</h2>

          {/* Date and Calendar Icon Row */}
          <div className="border border-gray-200 p-2 rounded-lg shadow-sm">
            <div
              className="flex justify-between items-start p-2 cursor-pointer"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              {/* Left: Date info */}
              <div>
                <h6 className="text-xs font-400 text-gray-700 mb-1">Date</h6>
                <p className="text-sm font-semibold text-gray-800">
                  {formatDateRange()}
                </p>
              </div>

              {/* Right: Calendar Icon */}
              <FaCalendarAlt className="text-[#25A4E8] mt-1 w-5 h-5" />
            </div>

            {/* Date Picker */}
            {showDatePicker && (
              <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                <DateRange
                  editableDateInputs={true}
                  onChange={handleDateRangeChange}
                  moveRangeOnFirstSelection={false}
                  ranges={[dateRange]}
                  rangeColors={["#25A4E8"]}
                  showDateDisplay={false}
                  months={1}
                  direction="horizontal"
                  minDate={new Date()}
                />
                <div className="p-3 border-t border-gray-200">
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="w-full bg-[#25A4E8] text-white py-2 px-4 rounded-md hover:bg-[#25A4E8] transition-colors"
                  >
                    Apply Dates
                  </button>
                </div>
              </div>
            )}

            {/* Full-width bottom border */}
            <div className="border-t border-gray-200" />

            {/* Number of nights */}
            <div className="p-2">
              <p className="text-sm text-gray-600 font-400">
                Number of nights: <strong>{nights} nights</strong>
              </p>
            </div>
          </div>

          {/* Property Information */}
          {/* {property && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Property Details</h3>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-blue-700">Unit:</span>
                  <span className="text-gray-700">{property.unitNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Type:</span>
                  <span className="text-gray-700">{property.propertyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Location:</span>
                  <span className="text-gray-700">{property.address?.city || "N/A"}</span>
                </div>
                {property.price && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Rate per night:</span>
                    <span className="text-gray-700">SAR {property.price}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-blue-700">Lost revenue:</span>
                  <span className="text-red-600 font-semibold">SAR {property.price ? (property.price * nights).toFixed(2) : '0.00'}</span>
                </div>
              </div>
            </div>
          )} */}
        </div>

        {/* Add Note */}
        <div className="">
          <h2 className="font-semibold mb-2 text-sm">Add Note</h2>
          <textarea
            className="w-full border border-gray-200 bg-[#F6F6F6] p-2 rounded-md"
            rows={4}
            maxLength={500}
            value={formData.note}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, note: e.target.value }))
            }
          />
          <div className="text-xs text-gray-500 text-right mt-1">
            {formData.note.length}/500 characters
          </div>

          {/* Booking Summary from Filter */}
          {/* {bookingData && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">Selected Filter Details</h3>
              <div className="text-xs space-y-1">
                {bookingData.guestDetails && (
                  <div className="flex justify-between">
                    <span className="text-yellow-700">Guests:</span>
                    <span className="text-gray-700">
                      {bookingData.guestDetails.totalGuests} ({bookingData.guestDetails.adults} adults, {bookingData.guestDetails.children} children)
                    </span>
                  </div>
                )}
                {bookingData.stayDetails?.rooms && (
                  <div className="flex justify-between">
                    <span className="text-yellow-700">Rooms:</span>
                    <span className="text-gray-700">{bookingData.stayDetails.rooms}</span>
                  </div>
                )}
                {bookingData.searchCriteria?.city && (
                  <div className="flex justify-between">
                    <span className="text-yellow-700">Search City:</span>
                    <span className="text-gray-700">{bookingData.searchCriteria.city}</span>
                  </div>
                )}
                {bookingData.searchCriteria?.neighbourhood && bookingData.searchCriteria.neighbourhood.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-yellow-700">Neighbourhood:</span>
                    <span className="text-gray-700">{bookingData.searchCriteria.neighbourhood.join(", ")}</span>
                  </div>
                )}
                {bookingData.searchCriteria?.propertyType && bookingData.searchCriteria.propertyType.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-yellow-700">Property Type:</span>
                    <span className="text-gray-700">{bookingData.searchCriteria.propertyType.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          )} */}

          {/* Warning Notice */}
          {/* <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <span className="text-red-500 text-lg mr-2">⚠️</span>
              <div>
                <h4 className="text-sm font-semibold text-red-800">Blocking Notice</h4>
                <p className="text-xs text-red-700 mt-1">
                  Blocking this unit will prevent new bookings for the selected dates. 
                  Lost revenue: <strong>SAR {property?.price ? (property.price * nights).toFixed(2) : '0.00'}</strong>
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-4 mt-4">
        <button className="border border-[#25A4E8] cursor-pointer text-[#25A4E8] px-6 py-2 rounded hover:bg-blue-50 transition-colors">
          Cancel
        </button>
        <button
          className="bg-[#25A4E8] text-white px-6 py-2 rounded hover:bg-[#25A4E8] cursor-pointer transition-colors disabled:opacity-50"
          onClick={handleBlockUnit}
          disabled={isBlocking}
        >
          {isBlocking ? "Blocking..." : "Block Unit"}
        </button>
      </div>
    </div>
  );
};

export default BlockUnitActiveTab;
