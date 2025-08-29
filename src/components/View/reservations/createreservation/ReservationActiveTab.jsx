import React, { useState, useEffect } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { createBooking } from "../../../Models/reservations/BookingModel";
import { toast } from "react-toastify";
import { checkRatePlanAction } from "@/app/(dashboard-screens)/actions/ratePlanActions";
import { useActionState } from "react";

const ReservationActiveTab = ({
  property,
  bookingData,
  onBookingDataChange,
  onBookingSuccess,
}) => {
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDateRange, setTempDateRange] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState({
    code: "+966",
    label: "SA",
    name: "Saudi Arabia",
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    note: "",
  });
  const [rateData, setRateData] = useState(null);

  const countryOptions = [
    { code: "+966", label: "SA", name: "Saudi Arabia" },
    { code: "+91", label: "IN", name: "India" },
    { code: "+1", label: "CA", name: "Canada" },
    { code: "+61", label: "AU", name: "Australia" },
    { code: "+44", label: "GB", name: "United Kingdom" },
  ];

  // Initialize with booking data
  useEffect(() => {
    if (bookingData) {
      console.log(
        "Populating ReservationActiveTab with booking data:",
        bookingData
      );

      // Set guest counts
      setAdults(bookingData.guestDetails?.adults || 1);
      setChildren(bookingData.guestDetails?.children || 0);

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

  // Add useEffect for handling outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      const datePickerElement = document.getElementById(
        "date-picker-container"
      );
      if (datePickerElement && !datePickerElement.contains(event.target)) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle date range change in calendar
  const handleCalendarDateChange = (ranges) => {
    setTempDateRange(ranges.selection);
  };

  // Server action state for rate plan
  const [rateState, formAction] = useActionState(checkRatePlanAction, null);

  // Handle apply button click via server action form submit
  const handleApplyDates = async () => {
    if (!tempDateRange) return;
    setIsLoading(true);

    const startDate = new Date(tempDateRange.startDate);
    const endDate = new Date(tempDateRange.endDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const formatDateForAPI = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    const fd = new FormData();
    fd.set("startDate", formatDateForAPI(startDate));
    fd.set("endDate", formatDateForAPI(endDate));
    fd.set("propertyId", property?._id || "");

    const result = await checkRatePlanAction(null, fd);
    // Robust blocked/min-stay detection and message extraction
    const hasBlockedFlagApply = (resp) => {
      if (!resp) return false;
      const d = resp.data;
      const payload = Array.isArray(d) ? d : d?.data ?? d;
      return Boolean(
        resp.isBlocked ||
          d?.isBlocked ||
          payload?.isBlocked ||
          payload?.isMinStay ||
          (d && d.success === false)
      );
    };
    const extractBlockMessageApply = (resp) => {
      const d = resp?.data;
      const payload = Array.isArray(d) ? d : d?.data ?? d;
      const minStay = payload?.minStay;
      return (
        resp?.message ||
        d?.message ||
        (payload?.isMinStay && typeof minStay === "number"
          ? `Minimum stay is ${minStay} night${minStay === 1 ? "" : "s"}.`
          : null) ||
        "Selected dates are not available. Please choose different dates."
      );
    };

    if (hasBlockedFlagApply(result)) {
      toast.error(extractBlockMessageApply(result));
      resetDateRange();
      setRateData(null);
      setIsLoading(false);
      return;
    }
    if (result?.success && result?.data) {
      setRateData(result.data);
      setDateRange(tempDateRange);
      setShowDatePicker(false);
      if (onBookingDataChange && bookingData) {
        onBookingDataChange({
          ...bookingData,
          stayDetails: {
            ...bookingData.stayDetails,
            checkIn: startDate,
            checkOut: endDate,
            nights: result.data.stayingDurationNight,
          },
        });
      }
    } else {
      toast.error(result?.message || "Selected dates are not available.");
    }

    setIsLoading(false);
  };

  // Calculate nights
  const calculateNights = () => {
    const timeDiff =
      dateRange.endDate.getTime() - dateRange.startDate.getTime();
    return Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  };

  // Handle date range change
  const handleDateRangeChange = async (ranges) => {
    const newRange = ranges.selection;
    setDateRange(newRange);
    setIsLoading(true);

    // Format dates to match API requirements
    const startDate = new Date(newRange.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(newRange.endDate);
    endDate.setHours(0, 0, 0, 0);

    console.log("Selected dates:", {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    console.log("Property object:", property);
    console.log("Property ID:", property?._id);

    // Validate property ID
    if (!property?._id) {
      console.error("Property ID is missing:", property);
      toast.error("Property information is missing. Please refresh the page.");
      setIsLoading(false);
      return;
    }

    try {
      // Format dates to API expected format: "2025-06-11" (simpler format)
      const formatDateForAPI = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const ratePlanParams = {
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
        propertyId: property._id?.toString() || property._id,
      };

      console.log("Rate Plan Parameters:", ratePlanParams);

      const fd = new FormData();
      fd.set("startDate", ratePlanParams.startDate);
      fd.set("endDate", ratePlanParams.endDate);
      fd.set("propertyId", ratePlanParams.propertyId);
      const response = await checkRatePlanAction(null, fd);

      if (!response || typeof response !== "object") {
        toast.error("Unable to fetch rates. Please try again.");
        setIsLoading(false);
        return;
      }

      // Helper function to check for isBlocked anywhere in the response
      function hasBlockedFlag(resp) {
        if (!resp) return false;
        if (resp.isBlocked) return true;
        if (resp.data && resp.data.isBlocked) return true;
        // If your API ever returns an array, check that too:
        if (Array.isArray(resp.data)) {
          return resp.data.some((item) => item.isBlocked);
        }
        return false;
      }

      if (hasBlockedFlag(response)) {
        toast.error(
          response.message ||
            "Those dates are blocked due to some reason, please select another date."
        );
        resetDateRange();
        setIsLoading(false);
        return;
      }

      // Check if response is successful
      if (response.success && response.data) {
        const rateData = response.data;
        console.log("Rate Data:", rateData);
        setRateData(rateData);

        // Update booking data in parent
        if (onBookingDataChange && bookingData) {
          const updatedBookingData = {
            ...bookingData,
            stayDetails: {
              ...bookingData.stayDetails,
              checkIn: startDate,
              checkOut: endDate,
              nights: rateData.stayingDurationNight || calculateNights(),
            },
            pricing: {
              totalRate: rateData.totalRate || 0,
              vat: rateData.vat || 0,
              serviceFee: rateData.serviceFee || 0,
              discountedRate: rateData.discountedRate || 0,
              stayingDurationPrice: rateData.stayingDurationPrice || 0,
              breakDownWithOtaCommission:
                rateData.breakDownWithOtaCommission || 0,
              discountDetails: rateData.discountDetails || {},
              dateWiseRates: rateData.rates || [],
            },
          };
          onBookingDataChange(updatedBookingData);
        }
      } else {
        const errorMessage =
          "The selected dates are unavailable, Please choose another unit or different dates.";
        toast.error(errorMessage);

        // If dates are not available, reset the date range to prevent booking submission
        if (true) {
          resetDateRange();
        }
        // Keep current selection so user can adjust without losing input
      }
    } catch (error) {
      console.error("Rate Plan Error:", error);
      toast.error(
        error?.message ||
          "An error occurred while fetching rates. Please try again."
      );
      // Keep current selection so user can adjust without losing input
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to reset date range
  const resetDateRange = () => {
    setDateRange({
      startDate: bookingData?.stayDetails?.checkIn || new Date(),
      endDate: bookingData?.stayDetails?.checkOut || new Date(),
      key: "selection",
    });
  };

  // Calculate pricing
  const calculatePricing = () => {
    if (!rateData) {
      return {
        nights: calculateNights(),
        pricePerNight: property?.price || 0,
        subtotal: 0,
        discount: 0,
        discountPercent: 0,
        platformFee: 0,
        vat: 0,
        total: 0,
        breakDownWithOtaCommission: 0,
        totalRate: 0,
        dateWiseRates: [],
      };
    }

    // Safely calculate average price per night from date-wise rates
    let totalRate = 0;
    let avgPricePerNight = 0;

    if (
      rateData.rates &&
      Array.isArray(rateData.rates) &&
      rateData.rates.length > 0
    ) {
      totalRate = rateData.rates.reduce(
        (sum, rate) => sum + (rate?.rate || 0),
        0
      );
      avgPricePerNight = totalRate / rateData.rates.length;
    } else {
      // Fallback to other pricing data if rates array is not available
      totalRate = rateData.totalRate || 0;
      avgPricePerNight = rateData.stayingDurationPrice
        ? rateData.stayingDurationPrice / (rateData.stayingDurationNight || 1)
        : property?.price || 0;
    }

    return {
      nights: rateData.stayingDurationNight || calculateNights(),
      pricePerNight: avgPricePerNight,
      subtotal: rateData.stayingDurationPrice || 0,
      discount: rateData.discountDetails?.totalDiscount || 0,
      discountPercent: rateData.discountDetails?.discount || 0,
      platformFee: rateData.serviceFee || 0,
      vat: rateData.vat || 0,
      total: parseFloat(rateData.discountedRate || 0),
      breakDownWithOtaCommission: parseFloat(
        rateData.breakDownWithOtaCommission || 0
      ),
      totalRate: rateData.totalRate || 0,
      dateWiseRates: rateData.rates || [],
    };
  };

  // Format date range
  const formatDateRange = () => {
    const start = format(dateRange.startDate, "dd");
    const end = format(dateRange.endDate, "dd MMM");
    return `${start}–${end}`;
  };

  // Handle guest count changes
  const handleGuestChange = (type, value) => {
    const newValue = Math.max(0, value);
    if (type === "adults") {
      // Limit adults to 1-5 range
      const limitedValue = Math.max(1, Math.min(5, newValue));
      setAdults(limitedValue);
    } else {
      setChildren(newValue);
    }

    // Update booking data in parent
    if (onBookingDataChange && bookingData) {
      const updatedBookingData = {
        ...bookingData,
        guestDetails: {
          ...bookingData.guestDetails,
          adults:
            type === "adults" ? Math.max(1, Math.min(5, newValue)) : adults,
          children: type === "children" ? newValue : children,
          totalGuests:
            (type === "adults" ? Math.max(1, Math.min(5, newValue)) : adults) +
            (type === "children" ? newValue : children),
        },
      };
      onBookingDataChange(updatedBookingData);
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowDropdown(false);
    setSearchTerm("");
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option) => {
    console.log("Selected:", option);
    setIsOpen(false);
  };

  // Handle booking submission
  const handleBookingSubmit = async (paymentMethod) => {
    // Validate required fields
    if (!formData.firstName.trim()) {
      toast.error("Please enter your first name");
      return;
    }
    if (!formData.lastName.trim()) {
      toast.error("Please enter your last name");
      return;
    }
    if (!formData.mobileNumber.trim()) {
      toast.error("Please enter your mobile number");
      return;
    }
    if (!rateData) {
      toast.error("Please select dates first to get pricing");
      return;
    }

    // Additional validation: check if the selected dates are still valid
    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error("Please select valid dates for your stay");
      return;
    }

    // Check if dates are in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateRange.startDate < today) {
      toast.error("Check-in date cannot be in the past");
      return;
    }

    if (dateRange.endDate <= dateRange.startDate) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    setIsBookingLoading(true);

    try {
      // Prepare booking data
      const bookingData = {
        property: property,
        guestDetails: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          mobileNumber: formData.mobileNumber.trim(),
          countryCode: selectedCountry.code,
          adults: adults,
          children: children,
          totalGuests: adults + children,
        },
        stayDetails: {
          checkIn: format(dateRange.startDate, "yyyy-MM-dd"),
          checkOut: format(dateRange.endDate, "yyyy-MM-dd"),
          nights: rateData.stayingDurationNight || 1,
        },
        pricing: {
          total: rateData.totalRate || 0,
          subtotal: rateData.totalRate || 0,
          discount: rateData.discountedRate || 0,
          platformFee: rateData.serviceFee || 0,
          vat: rateData.vat || 0,
          totalRate: rateData.totalRate || 0,
          discountedRate: rateData.discountedRate || 0,
          stayingDurationPrice: rateData.stayingDurationPrice || 0,
          breakDownWithOtaCommission: rateData.breakDownWithOtaCommission || 0,
          discountDetails: rateData.discountDetails || {},
          dateWiseRates: rateData.rates || [],
        },
        note: formData.note.trim(),
        paymentMethod: paymentMethod,
        isStayhubBooking: true,
        isPmBooking: true,
      };

      console.log("Submitting booking with data:", bookingData);

      const response = await createBooking(bookingData);
      console.log("Booking API response:", response);
      console.log("Response structure:", {
        success: response?.success,
        data: response?.data,
        message: response?.message,
        hasData: !!response?.data,
        dataKeys: response?.data ? Object.keys(response.data) : [],
      });

      if (response.success) {
        const isPaid = selectedPaymentMethod === "pay_now";
        const paidMsg =
          "Booking created, the guest has been invited to make payment within 30 mins...";
        const unpaidMsg =
          "Booking created, the guest has been invited to verify identity...";
        toast.success(isPaid ? paidMsg : unpaidMsg);

        // Update booking data in parent component
        if (onBookingDataChange && bookingData) {
          const updatedBookingData = {
            ...bookingData,
            bookingId: response.data?.bookingId || response.data?._id,
            status: "confirmed",
            createdAt: new Date().toISOString(),
          };
          onBookingDataChange(updatedBookingData);
        }

        // Call the refresh callback to update reservations list
        if (onBookingSuccess) {
          onBookingSuccess(response.data);
        }

        // Store a flag in localStorage to indicate new booking was created
        try {
          const bookingId =
            response.data?.bookingId || response.data?._id || response.data?.id;
          console.log("Extracted booking ID:", bookingId);

          if (bookingId) {
            localStorage.setItem("newBookingCreated", "true");
            localStorage.setItem(
              "newBookingData",
              JSON.stringify({
                bookingId: bookingId,
                checkIn: format(dateRange.startDate, "yyyy-MM-dd"),
                checkOut: format(dateRange.endDate, "yyyy-MM-dd"),
                guestName: `${formData.firstName} ${formData.lastName}`,
                propertyTitle: property?.title || "Property",
                unitNo: property?.unitNo || "Unit #",
                createdAt: new Date().toISOString(),
              })
            );
            console.log("✅ Stored new booking flag in localStorage");
          } else {
            console.warn(
              "⚠️ No booking ID found in response, cannot store flag"
            );
          }
        } catch (error) {
          console.error("Failed to store booking flag:", error);
        }

        // Navigate back to reservations with refresh flag to load persisted data from server
        setTimeout(() => {
          try {
            console.log("Redirecting to reservations with refresh flag...");
            // Add a timestamp to force a fresh load
            const timestamp = Date.now();
            window.location.href = `/reservations?refresh=true&new=1&t=${timestamp}`;
          } catch (error) {
            console.error("Navigation error:", error);
            // Fallback: try to navigate without refresh flag
            try {
              window.location.href = "/reservations";
            } catch (fallbackError) {
              console.error("Fallback navigation also failed:", fallbackError);
            }
          }
        }, 1500); // Give user time to see the success message
      } else {
        // Handle specific error cases
        if (response.errorType === "dates_unavailable") {
          toast.error(response.message);
          // Reset date range for unavailable dates
          resetDateRange();
          setRateData(null); // Clear rate data so user can't submit
        } else {
          toast.error(
            response.message || "Failed to create booking. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Booking submission error:", error);
      toast.error(
        "An error occurred while creating the booking. Please try again."
      );
    } finally {
      setIsBookingLoading(false);
    }
  };

  const filteredCountries = countryOptions.filter(
    (country) =>
      country.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.includes(searchTerm)
  );

  const pricing = calculatePricing();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 px-2">
      {/* Left Section */}
      <div className="lg:col-span-2 space-y-1">
        {/* Booking Details */}
        <div>
          <h2 className="font-semibold mb-2 text-sm">Booking Details</h2>

          {/* Date and Calendar Icon Row */}
          <div className="border border-gray-200 p-2 rounded-lg shadow-sm">
            <div
              className="flex justify-between items-start p-2 cursor-pointer"
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                setTempDateRange(dateRange);
              }}
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
              <div
                id="date-picker-container"
                className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
              >
                <DateRange
                  editableDateInputs={true}
                  onChange={handleCalendarDateChange}
                  moveRangeOnFirstSelection={false}
                  ranges={[tempDateRange || dateRange]}
                  rangeColors={["#25A4E8"]}
                  showDateDisplay={false}
                  months={1}
                  direction="horizontal"
                  disabled={isLoading}
                  minDate={new Date()}
                />
                {isLoading && (
                  <div className="p-3 text-center">
                    <span className="text-sm text-gray-500">
                      Checking availability...
                    </span>
                  </div>
                )}
                <div className="p-3 border-t border-gray-200">
                  <button
                    onClick={handleApplyDates}
                    className="w-full bg-[#25A4E8] cursor-pointer text-white py-2 px-4 rounded-md hover:bg-[#25A4E8] transition-colors"
                    disabled={isLoading}
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
                Number of nights: <strong>{pricing.nights} nights</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Guest Details */}
        <div className="">
          <h2 className="font-semibold text-sm mb-2">Guest Details</h2>
          <div className="grid grid-cols-2 gap-4 border border-gray-200 p-2 rounded-lg shadow-sm">
            <input
              className="border border-gray-200 text-sm p-2 bg-[#F2F3F3] rounded focus:outline-black focus:ring-0"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, firstName: e.target.value }))
              }
            />
            <input
              className="border border-gray-200 p-2 text-sm bg-[#F2F3F3] rounded focus:outline-black focus:ring-0"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lastName: e.target.value }))
              }
            />
            <div className="w-[60%] flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-1 text-md font-500 text-[#000113] bg-[#F2F3F3] p-2 rounded-md focus:outline-none"
                >
                  <span className="mr-1">{selectedCountry.label}</span>
                  <span>{selectedCountry.code}</span>
                  <IoMdArrowDropdown className="text-gray-600 text-md cursor-pointer" />
                </button>
                {showDropdown && (
                  <div className="absolute z-10 mt-3 w-48 bg-white border border-gray-300 rounded shadow-lg overflow-y-auto ">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full p-2 border-b border-gray-200 bg-gray-200 focus:outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <ul>
                      {filteredCountries.map((country) => (
                        <li
                          key={country.code}
                          onClick={() => handleCountrySelect(country)}
                          className="p-2 hover:bg-gray-100 text-sm cursor-pointer"
                        >
                          {country.label} ({country.code}) - {country.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <input
                className="border border-gray-200 p-2 text-sm rounded bg-[#F2F3F3] flex-1 focus:outline-black focus:ring-0"
                placeholder="Mobile Number"
                value={formData.mobileNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    mobileNumber: e.target.value,
                  }))
                }
              />
            </div>

            <div className="col-span-2">
              {/* Adults */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-500">Adults</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGuestChange("adults", adults - 1)}
                    disabled={adults <= 1}
                    className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded-full text-lg text-gray-500 disabled:opacity-50"
                  >
                    −
                  </button>
                  <span className="text-base font-medium text-gray-500">
                    {adults}
                  </span>
                  <button
                    onClick={() => handleGuestChange("adults", adults + 1)}
                    disabled={adults >= 5}
                    className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-full text-lg text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Children</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGuestChange("children", children - 1)}
                    disabled={children <= 0}
                    className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-full text-lg text-gray-500 disabled:opacity-50"
                  >
                    −
                  </button>
                  <span className="text-base font-medium text-gray-500">
                    {children}
                  </span>
                  <button
                    onClick={() => handleGuestChange("children", children + 1)}
                    className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-full text-lg text-gray-500"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Note */}
        <div className="">
          <h2 className="font-semibold mb-2 text-sm">Add Note</h2>
          <textarea
            className="w-full border border-gray-200 bg-[#F6F6F6] p-2 rounded"
            rows={3}
            placeholder="Note"
            maxLength={100}
            value={formData.note}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, note: e.target.value }))
            }
          />
          <div className="text-xs text-gray-500 text-right mt-1">
            {formData.note.length}/100 characters
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full space-y-1 bg-[#FAFAFA] rounded-lg border border-gray-200 p-2">
        {/* Pricing Details */}
        <div className="space-y-1">
          <h2 className="font-semibold text-sm">Pricing Details</h2>
          <div className=" space-y-2 p-2">
            <div className="border border-gray-200 bg-[#FAFAFA] rounded-md p-2">
              <p className="text-xs text-gray-500">Amount per night</p>
              <p className="font-semibold text-sm">
                SAR {pricing.pricePerNight}
              </p>
            </div>

            <div className="border border-gray-200 bg-[#FAFAFA] rounded-md p-2 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Add Discount</p>
                <p className="font-semibold text-sm">
                  SAR {pricing.discount.toFixed(2)}
                </p>
              </div>
              <div className="relative inline-block text-left">
                <button
                  onClick={toggleDropdown}
                  className="text-sm text-gray-500 px-2 py-2 rounded-md font-700 cursor-pointer"
                >
                  Amount ▾
                </button>

                {isOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                    <button
                      onClick={() => handleOptionClick("Amount")}
                      className="block w-full px-4 py-2 text-sm text-gray-700 border-b border-gray-300 hover:bg-gray-100"
                    >
                      Amount
                    </button>
                    <button
                      onClick={() => handleOptionClick("Percentage")}
                      className="block w-full px-4 py-2 text-sm text-gray-700 border-b border-gray-300 hover:bg-gray-100"
                    >
                      Percentage
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Total Breakdown */}
        <div className="space-y-2">
          <h2 className="font-semibold text-sm">Total</h2>

          <div className="bg-white border border-gray-200 rounded-md p-4 space-y-2 text-sm">
            {/* Number of nights with sublabel */}
            <div>
              <div className="border-b border-gray-200 py-1">
                <div className="flex justify-between">
                  <span>Number of nights</span>
                  <span className="font-semibold">
                    SAR {pricing.subtotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 font-semibold">
                  {pricing.nights} x SAR {pricing.pricePerNight}
                </p>
              </div>
            </div>

            {/* Discount */}
            <div className="flex justify-between">
              <span className="text-gray-500">
                Discount applied ({pricing.discountPercent}%)
              </span>
              <span className="text-green-600">
                -SAR {pricing.discount.toFixed(2)}
              </span>
            </div>

            {/* Platform Fee */}
            <div className="flex justify-between">
              <span className="text-gray-500">Platform fee</span>
              <span>SAR {pricing.platformFee.toFixed(2)}</span>
            </div>

            {/* VAT */}
            <div className="flex justify-between">
              <span className="text-gray-500">VAT</span>
              <span>SAR {pricing.vat.toFixed(2)}</span>
            </div>

            {/* Total Payable */}
            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-black text-sm">
              <span className="text-sm font-[400]">Total Payable</span>
              <span className="font-semibold">
                SAR {pricing.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="space-y-2 mt-3">
          <h2 className="font-semibold text-sm">Payment Details</h2>

          <div className="bg-white border border-gray-200 rounded-md p-2 flex gap-2">
            <button
              onClick={() => setSelectedPaymentMethod("pay_now")}
              disabled={isBookingLoading || !rateData}
              className={`w-full cursor-pointer text-sm font-medium rounded-md py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedPaymentMethod === "pay_now"
                  ? "bg-[#1f7bb8] text-white"
                  : "bg-[#2694D0] text-white hover:bg-[#1f7bb8]"
              }`}
            >
              Pay Now
            </button>
            <button
              onClick={() => setSelectedPaymentMethod("pay_later")}
              disabled={isBookingLoading || !rateData}
              className={`w-full cursor-pointer text-sm font-medium rounded-md py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedPaymentMethod === "pay_later"
                  ? "bg-[#1f7bb8] text-white border-[#1f7bb8]"
                  : "bg-white border border-[#2694D0] text-[#2694D0] hover:bg-[#f0f8ff]"
              }`}
            >
              Pay Later
            </button>
          </div>

          {/* Create Reservation Button */}
          <div className="bg-white border border-gray-200 rounded-md p-2">
            <button
              onClick={() => handleBookingSubmit(selectedPaymentMethod)}
              disabled={isBookingLoading || !rateData || !selectedPaymentMethod}
              className={`w-full cursor-pointer text-sm font-medium rounded-md py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedPaymentMethod
                  ? "bg-[#25A4E8] text-white hover:bg-[#1f8bc8]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {!selectedPaymentMethod
                ? "Select Payment Method First"
                : isBookingLoading
                ? "Creating Reservation..."
                : `Create Reservation (${
                    selectedPaymentMethod === "pay_now"
                      ? "Pay Now"
                      : "Pay Later"
                  })`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationActiveTab;
