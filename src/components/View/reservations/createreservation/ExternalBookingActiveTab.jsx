import React, { useState, useEffect } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import Select from "react-select";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { getRatePlan } from "../../../Models/reservations/RatePlanModel";
import { createBooking } from "../../../Models/reservations/BookingModel";
import { toast } from "react-toastify";

const ExternalBookingActiveTab = ({
  property,
  bookingData,
  onBookingDataChange,
  onBookingSuccess,
}) => {
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [source, setSource] = useState("Airbnb");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDateRange, setTempDateRange] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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
  const [customSource, setCustomSource] = useState("");
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const countryOptions = [
    { code: "+966", label: "SA", name: "Saudi Arabia" },
    { code: "+91", label: "IN", name: "India" },
    { code: "+1", label: "CA", name: "Canada" },
    { code: "+61", label: "AU", name: "Australia" },
    { code: "+44", label: "GB", name: "United Kingdom" },
  ];

  const externalBookingSources = [
    { value: "Airbnb", label: "Airbnb" },
    { value: "Booking.com", label: "Booking.com" },
    { value: "Expedia", label: "Expedia" },
    { value: "Agoda", label: "Agoda" },
    { value: "Hotels.com", label: "Hotels.com" },
    { value: "Other", label: "Other" },
  ];

  const sources = [
    { name: "Airbnb", img: "/images/airbnb.svg" },
    { name: "Gathern", img: "/images/gathern-new.svg" },
    { name: "Almosafer", img: "/images/almosafer-new.svg" },
    { name: "Dorent", img: "/images/dorent-new.svg" },
  ];

  const [showModal, setShowModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState(sources[0]);

  // Initialize with booking data
  useEffect(() => {
    if (bookingData) {
      console.log(
        "Populating ExternalBookingActiveTab with booking data:",
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

  // Handle apply button click
  const handleApplyDates = async () => {
    if (tempDateRange) {
      await handleDateRangeChange({ selection: tempDateRange });
      setShowDatePicker(false);
    }
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
      const ratePlanParams = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        propertyId: property._id,
      };

      console.log("Rate Plan Parameters:", ratePlanParams);

      const response = await getRatePlan(ratePlanParams);

      console.log("Rate Plan Response:", response);

      // Check if response is successful
      if (response.success && response.data) {
        if (response.isBlocked) {
          toast.error(
            "These dates are blocked due to some reason, please select another date."
          );
          resetDateRange();
          setIsLoading(false);
          return;
        }
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
              nights: rateData.stayingDurationNight,
            },
            pricing: {
              totalRate: rateData.totalRate,
              vat: rateData.vat,
              serviceFee: rateData.serviceFee,
              discountedRate: rateData.discountedRate,
              stayingDurationPrice: rateData.stayingDurationPrice,
              breakDownWithOtaCommission: rateData.breakDownWithOtaCommission,
              discountDetails: rateData.discountDetails,
              dateWiseRates: rateData.rates,
            },
          };
          onBookingDataChange(updatedBookingData);
        }
      } else {
        console.error("Rate plan fetch failed:", response.message);

        // Handle specific error types
        if (response.errorType === "dates_unavailable") {
          toast.error(
            "Selected dates are not available. This property is already booked for the chosen dates. Please select different dates."
          );
          resetDateRange();
          setRateData(null); // Clear rate data
        } else {
          toast.error(
            response.message || "Failed to fetch pricing. Please try again."
          );
          resetDateRange();
        }
      }
    } catch (error) {
      console.error("Error fetching rate plan:", error);

      // Handle specific error messages
      if (error.message && error.message.includes("unavailable")) {
        toast.error(
          "Selected dates are not available. This property is already booked for the chosen dates. Please select different dates."
        );
        resetDateRange();
        setRateData(null); // Clear rate data
      } else {
        toast.error("Failed to fetch pricing. Please try again.");
        resetDateRange();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset date range to previous state
  const resetDateRange = () => {
    if (bookingData?.stayDetails) {
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
  };

  // Calculate pricing based on rate data
  const calculatePricing = () => {
    if (!rateData) {
      return {
        total: 0,
        subtotal: 0,
        discount: 0,
        platformFee: 0,
        vat: 0,
        nights: calculateNights(),
        totalRate: 0,
        discountedRate: 0,
        stayingDurationPrice: 0,
        breakDownWithOtaCommission: 0,
        discountDetails: {},
        dateWiseRates: [],
      };
    }

    return {
      total: rateData.totalRate || 0,
      subtotal: rateData.stayingDurationPrice || 0,
      discount:
        (rateData.stayingDurationPrice || 0) - (rateData.discountedRate || 0),
      platformFee: rateData.serviceFee || 0,
      vat: rateData.vat || 0,
      nights: rateData.stayingDurationNight || calculateNights(),
      totalRate: rateData.totalRate || 0,
      discountedRate: rateData.discountedRate || 0,
      stayingDurationPrice: rateData.stayingDurationPrice || 0,
      breakDownWithOtaCommission: rateData.breakDownWithOtaCommission || 0,
      discountDetails: rateData.discountDetails || {},
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

  const filteredCountries = countryOptions.filter(
    (country) =>
      country.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.includes(searchTerm)
  );

  const pricing = calculatePricing();

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

    setIsBookingLoading(true);

    try {
      // Prepare booking data
      const selected = sources.find((src) => src.name === selectedSource.name);
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
          nights: pricing.nights,
        },
        pricing: {
          total: pricing.total,
          subtotal: pricing.subtotal,
          discount: pricing.discount,
          platformFee: pricing.platformFee,
          vat: pricing.vat,
          totalRate: pricing.totalRate,
          discountedRate: pricing.discountedRate,
          stayingDurationPrice: pricing.stayingDurationPrice,
          breakDownWithOtaCommission: pricing.breakDownWithOtaCommission,
          discountDetails: pricing.discountDetails,
          dateWiseRates: pricing.dateWiseRates,
        },
        note: formData.note.trim(),
        paymentMethod: paymentMethod,
        channel: selectedSource.name,
        bookingSource: selectedSource.name.toLowerCase(), // for extra compatibility
      };

      console.log("Submitting external booking with data:", bookingData);

      const response = await createBooking(bookingData);
      console.log("External Booking API response:", response);

      if (response.success) {
        // Create a more descriptive success message with dates
        const checkInDate = format(dateRange.startDate, "MMM dd, yyyy");
        const checkOutDate = format(dateRange.endDate, "MMM dd, yyyy");
        const successMessage = `You have successfully created an external reservation for ${checkInDate} to ${checkOutDate} via ${selectedSource.name}! Redirecting to reservations...`;

        toast.success(successMessage);

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

        // Store a flag in localStorage to indicate new external booking was created
        try {
          const bookingId =
            response.data?.bookingId || response.data?._id || response.data?.id;
          console.log("Extracted external booking ID:", bookingId);

          if (bookingId) {
            localStorage.setItem("newBookingCreated", "true");
            localStorage.setItem(
              "newExternalBookingData",
              JSON.stringify({
                bookingId: bookingId,
                checkIn: format(dateRange.startDate, "yyyy-MM-dd"),
                checkOut: format(dateRange.endDate, "yyyy-MM-dd"),
                guestName: `${formData.firstName} ${formData.lastName}`,
                propertyTitle: property?.title || "Property",
                unitNo: property?.unitNo || "Unit #",
                channel: selectedSource.name,
                createdAt: new Date().toISOString(),
              })
            );
            console.log("✅ Stored new external booking flag in localStorage");
          } else {
            console.warn(
              "⚠️ No external booking ID found in response, cannot store flag"
            );
          }
        } catch (error) {
          console.error("Failed to store external booking flag:", error);
        }

        // Navigate back to reservations with refresh flag to load persisted data from server
        setTimeout(() => {
          try {
            console.log("Redirecting to reservations with refresh flag...");
            // Add a timestamp to force a fresh load
            const timestamp = Date.now();
            window.location.href = `/reservations?refresh=true&t=${timestamp}`;
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
        toast.error(
          response.message ||
            "Failed to create external booking. Please try again."
        );
      }
    } catch (error) {
      console.error("External booking submission error:", error);
      toast.error(
        "An error occurred while creating the external booking. Please try again."
      );
    } finally {
      setIsBookingLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
      {/* Left Column */}
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
              className="border border-gray-200 text-sm p-2 bg-[#F2F3F3] rounded"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, firstName: e.target.value }))
              }
            />
            <input
              className="border border-gray-200 p-2 text-sm bg-[#F2F3F3] rounded"
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
                  className="flex items-center gap-1 text-md font-500 text-[#000113] focus:outline-none"
                >
                  <span className="mr-1">{selectedCountry.label}</span>
                  <span>{selectedCountry.code}</span>
                  <IoMdArrowDropdown className="text-gray-600 text-md cursor-pointer" />
                </button>
                {showDropdown && (
                  <div className="absolute z-10 mt-3 w-48 bg-white border border-gray-300 rounded shadow-lg overflow-y-auto max-h-[200px]">
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
                className="border border-gray-200 p-2 text-sm rounded flex-1"
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

      {/* Right Column */}
      <div className="mt-7">
        {/* Pricing Details */}
        <div className="flex flex-col justify-between h-full bg-[#FAFAFA] p-4 rounded-md">
          <div>
            <div className="mb-2">
              <p className="font-semibold text-sm mb-2">Pricing Details</p>
              <div className="bg-white rounded-md shadow-md p-2">
                <div className="flex justify-between items-center border border-gray-200 bg-[#FAFAFA] rounded p-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-400">
                      Total amount per reservation
                    </span>
                    <span className="font-semibold text-sm">
                      SAR {pricing.total.toFixed(2)}
                    </span>
                  </div>
                  <button
                    className="text-[#25A4E8] font-500 text-sm"
                    onClick={() => {
                      setRateData(null);
                      resetDateRange();
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Total */}
            <div>
              <h2 className="font-semibold text-sm mb-1">Total</h2>
              <div className="border border-gray-200 bg-white p-2 rounded-lg shadow-md mb-2">
                {rateData ? (
                  <>
                    <div className="border-b border-gray-200 py-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-400">
                          Staying Duration
                        </span>
                        <span className="text-sm font-semibold">
                          SAR {pricing.stayingDurationPrice?.toFixed(2) || 0}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mb-1">
                        {pricing.nights} nights
                      </div>
                    </div>
                    {pricing.discount > 0 && (
                      <div className="border-b border-gray-200 py-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-400 text-green-600">
                            Discount
                          </span>
                          <span className="text-sm font-semibold text-green-600">
                            -SAR {pricing.discount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                    {pricing.vat > 0 && (
                      <div className="border-b border-gray-200 py-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-400">VAT</span>
                          <span className="text-sm font-semibold">
                            SAR {pricing.vat.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                    {pricing.platformFee > 0 && (
                      <div className="border-b border-gray-200 py-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-400">Service Fee</span>
                          <span className="text-sm font-semibold">
                            SAR {pricing.platformFee.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold mt-2">
                      <span className="text-sm font-400">Total Paid</span>
                      <span className="text-sm font-semibold">
                        SAR {pricing.total.toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="border-b border-gray-200 py-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-400">
                          Number of nights
                        </span>
                        <span className="text-sm font-semibold">
                          SAR {pricing.subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mb-1">
                        {pricing.nights} x SAR {property?.price || 122}
                      </div>
                    </div>
                    <div className="flex justify-between font-semibold mt-2">
                      <span className="text-sm font-400">Total Paid</span>
                      <span className="text-sm font-semibold">
                        SAR {pricing.total.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Booking Details */}
            <div className="p-2">
              <h2 className="font-semibold text-sm mb-2">Booking Details</h2>
              <div className="bg-white shadow-md rounded-md p-2">
                <label className="block mb-1 text-xs font-medium">
                  Select Source
                </label>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {selectedSource.img ? (
                      <img
                        src={selectedSource.img}
                        alt={selectedSource.name}
                        className="w-6 h-6"
                      />
                    ) : null}
                    <span>{selectedSource.name}</span>
                  </div>
                  <button
                    className="ml-2 text-gray-900 "
                    onClick={() => setShowModal(true)}
                  >
                    <IoMdArrowDropdown className="w-6 h-6 cursor-pointer" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleBookingSubmit("pay_now")}
              disabled={isBookingLoading || isLoading}
              className="w-full cursor-pointer bg-[#2694D0] text-white text-sm font-medium rounded-md py-2 hover:bg-[#1f7bb8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBookingLoading || isLoading ? "Processing..." : "Pay Now"}
            </button>
            <button
              onClick={() => handleBookingSubmit("pay_later")}
              disabled={isBookingLoading || isLoading}
              className="w-full cursor-pointer bg-white border border-[#2694D0] text-[#2694D0] text-sm font-medium rounded-md py-2 hover:bg-[#f0f8ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBookingLoading || isLoading ? "Processing..." : "Pay Later"}
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl w-[350px] max-w-full p-4 relative">
            <button
              className="absolute top-3 right-4 text-2xl cursor-pointer"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
            <h2 className="text-center font-bold text-lg mb-4">
              Select Source
            </h2>
            <div className="flex flex-col gap-2">
              {sources.map((src) => (
                <button
                  key={src.name}
                  className="flex items-center justify-between w-full px-4 py-3 rounded hover:bg-gray-100"
                  onClick={() => {
                    setSelectedSource(src);
                    setIsOtherSelected(false);
                  }}
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    {src.img ? (
                      <img src={src.img} alt={src.name} className="w-6 h-6" />
                    ) : null}
                    <span>{src.name}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={
                      selectedSource.name === src.name && !isOtherSelected
                    }
                    readOnly
                    className="accent-[#7C69E8] w-5 h-5"
                  />
                </button>
              ))}
              {/* Other Option */}
              <button
                className="flex items-center justify-between w-full px-4 py-3 rounded hover:bg-gray-100"
                onClick={() => {
                  setSelectedSource({ name: customSource || "Other", img: "" });
                  setIsOtherSelected(true);
                }}
                type="button"
              >
                <div className="flex items-center gap-2">
                  <span>Other</span>
                  {isOtherSelected && (
                    <input
                      type="text"
                      className="ml-2 border rounded px-2 py-1 text-sm"
                      placeholder="Enter source"
                      value={customSource}
                      onChange={(e) => {
                        setCustomSource(e.target.value);
                        setSelectedSource({ name: e.target.value, img: "" });
                      }}
                    />
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={isOtherSelected}
                  readOnly
                  className="accent-[#7C69E8] cursor-pointer w-5 h-5"
                />
              </button>
            </div>
            <button
              className="w-full mt-6 bg-[#7C69E8] text-white py-2 rounded-lg text-lg font-semibold"
              onClick={() => setShowModal(false)}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalBookingActiveTab;
