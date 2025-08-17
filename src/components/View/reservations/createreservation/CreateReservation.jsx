"use client";

import React, { useState, useEffect } from "react";
import { IoArrowBack } from "react-icons/io5";
import ReservationActiveTab from "./ReservationActiveTab";
import ExternalBookingActiveTab from "./ExternalBookingActiveTab";
import BlockUnitActiveTab from "./BlockUnitActiveTab";
import { useRouter } from "next/navigation";

const CreateReservation = ({ initialPropertyId }) => {
  const [activeTab, setActiveTab] = useState("Reservation");
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const loadPropertyAndBookingData = () => {
      try {
        setLoading(true);

        // Get booking data from sessionStorage
        const storedBookingData = sessionStorage.getItem(
          "selectedPropertyBookingData"
        );

        if (storedBookingData) {
          const parsedBookingData = JSON.parse(storedBookingData);
          console.log(
            "Loaded booking data from sessionStorage:",
            parsedBookingData
          );

          // Validate that the property ID matches
          if (parsedBookingData.property._id === initialPropertyId) {
            setProperty(parsedBookingData.property);

            // Convert date strings back to Date objects
            const processedBookingData = {
              ...parsedBookingData,
              stayDetails: {
                ...parsedBookingData.stayDetails,
                checkIn: new Date(parsedBookingData.stayDetails.checkIn),
                checkOut: new Date(parsedBookingData.stayDetails.checkOut),
              },
            };

            // Set booking data (excluding property to avoid duplication)
            const { property: _, ...bookingDetails } = processedBookingData;
            setBookingData(bookingDetails);

            // Validate property compatibility with booking requirements
            const propertyCapacity =
              parsedBookingData.property.propertyDetails?.guest || 0;
            const propertyBedrooms =
              parsedBookingData.property.propertyDetails?.bedroom || 0;

            if (propertyCapacity < parsedBookingData.guestDetails.totalGuests) {
              console.warn(
                `Property capacity (${propertyCapacity}) is less than required guests (${parsedBookingData.guestDetails.totalGuests})`
              );
            }

            if (propertyBedrooms < parsedBookingData.stayDetails.rooms) {
              console.warn(
                `Property bedrooms (${propertyBedrooms}) is less than required rooms (${parsedBookingData.stayDetails.rooms})`
              );
            }

            setLoading(false);
          } else {
            setError("Property ID mismatch. Please select the property again.");
            setLoading(false);
          }
        } else {
          setError("No property data found. Please select a property first.");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading property data:", error);
        setError("Failed to load property data. Please try again.");
        setLoading(false);
      }
    };

    if (initialPropertyId) {
      loadPropertyAndBookingData();
    } else {
      setError("No property ID provided");
      setLoading(false);
    }
  }, [initialPropertyId]);

  const handleBack = () => {
    // Clear the stored booking data when going back
    sessionStorage.removeItem("selectedPropertyBookingData");
    router.back();
  };

  // Update booking data
  const handleBookingDataChange = (newBookingData) => {
    // Ensure dates are Date objects
    const processedData = {
      ...newBookingData,
      stayDetails: {
        ...newBookingData.stayDetails,
        checkIn:
          newBookingData.stayDetails?.checkIn instanceof Date
            ? newBookingData.stayDetails.checkIn
            : new Date(newBookingData.stayDetails?.checkIn || new Date()),
        checkOut:
          newBookingData.stayDetails?.checkOut instanceof Date
            ? newBookingData.stayDetails.checkOut
            : new Date(newBookingData.stayDetails?.checkOut || new Date()),
      },
    };

    setBookingData(processedData);

    // Update sessionStorage with new booking data
    const updatedData = {
      property,
      ...processedData,
    };
    sessionStorage.setItem(
      "selectedPropertyBookingData",
      JSON.stringify(updatedData)
    );
  };

  // Handle successful booking creation
  const handleBookingSuccess = (bookingResult) => {
    console.log("Booking created successfully:", bookingResult);
    
    // Clear sessionStorage after successful booking
    sessionStorage.removeItem("selectedPropertyBookingData");
    
    // Set a flag to indicate that a new booking was created
    sessionStorage.setItem("refreshReservations", "true");
    
    // Navigate back to reservations page
    router.push("/reservations");
  };

  // Calculate number of nights
  const calculateNights = () => {
    if (!bookingData?.stayDetails) return 0;

    // Ensure dates are Date objects
    const checkIn =
      bookingData.stayDetails.checkIn instanceof Date
        ? bookingData.stayDetails.checkIn
        : new Date(bookingData.stayDetails.checkIn);
    const checkOut =
      bookingData.stayDetails.checkOut instanceof Date
        ? bookingData.stayDetails.checkOut
        : new Date(bookingData.stayDetails.checkOut);

    const timeDiff = checkOut.getTime() - checkIn.getTime();
    return Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  };

  // Helper function to format date
  const formatDate = (date) => {
    // Ensure date is a Date object
    const dateObj = date instanceof Date ? date : new Date(date);

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }

    return dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to get property stats
  const getPropertyStats = () => {
    if (!property) return null;
    const details = property.propertyDetails || {};
    return {
      guests: details.guest || 0,
      bedrooms: details.bedroom || 0,
      bathrooms: details.bathroom || 0,
      beds: details.beds || 0,
    };
  };

  // Helper function to get property image
  const getPropertyImage = () => {
    if (property?.photos && property.photos.length > 0) {
      return property.photos[0];
    }
    if (property?.coverPhoto) {
      return property.coverPhoto;
    }
    return "/images/apartment.png";
  };

  const renderTabContent = () => {
    const tabProps = {
      property,
      bookingData,
      onBookingDataChange: handleBookingDataChange,
      onBookingSuccess: handleBookingSuccess,
    };

    switch (activeTab) {
      case "Reservation":
        return <ReservationActiveTab {...tabProps} />;
      case "External Booking":
        return <ExternalBookingActiveTab {...tabProps} />;
      case "Block Unit":
        return <BlockUnitActiveTab {...tabProps} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="px-3 py-2 bg-white  shadow-md rounded-lg  flex items-center justify-center">
        <p className="text-gray-500">Loading property details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 py-2 bg-white  shadow-md rounded-lg  flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="px-3 py-2 bg-white shadow-md rounded-lg  flex items-center justify-center">
        <p className="text-gray-500">No property selected</p>
      </div>
    );
  }

  const stats = getPropertyStats();
  const nights = calculateNights();

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="flex justify-between flex-wrap sticky top-0 z-10 bg-white pb-4">
        <div className="flex gap-2 items-center pl-3 pt-3 ">
          <button onClick={handleBack} className="flex items-center">
            <IoArrowBack className="text-gray-900 w-5 h-5 cursor-pointer" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-[#7C69E8] relative">
            Create Reservation
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-5 pr-1 sm:pr-2">
        {/* Property Info */}
        <div className="flex flex-col sm:flex-row gap-2 items-center bg-[#F7F5FE] rounded-xl p-2 w-full mb-4">
          <div className="relative">
            <img
              src={getPropertyImage()}
              alt="Unit"
              className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xl sm:mr-4"
              onError={(e) => {
                e.target.src = "/images/apartment.png";
              }}
            />
          </div>

          <div className="flex flex-wrap gap-1 sm:gap-2 justify-center sm:justify-start text-center sm:text-left flex-1">
            <div className="font-semibold text-xs sm:text-sm text-gray-700">
              {property.unitNo} /
            </div>
            <div className="font-semibold text-xs sm:text-sm text-gray-700">
              {property.propertyDetails?.stayDetails?.title ||
                property.title ||
                "Untitled Property"}{" "}
              /
            </div>
            <div className="text-xs sm:text-sm text-gray-700 flex items-center gap-1">
              <img
                src="/images/location.svg"
                alt="location"
                className="w-3 h-3 sm:w-4 sm:h-4"
              />
              {property.address?.city || "Location not specified"}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mt-3 sm:mt-4 pl-3">
          <button
            onClick={() => setActiveTab("Reservation")}
            className={`px-3 sm:px-4 py-1.5 cursor-pointer sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              activeTab === "Reservation"
                ? "bg-[#7C69E8] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Reservation
          </button>
          <button
            onClick={() => setActiveTab("External Booking")}
            className={`px-3 sm:px-4 py-1.5 cursor-pointer sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              activeTab === "External Booking"
                ? "bg-[#7C69E8] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            External Booking
          </button>
          <button
            onClick={() => setActiveTab("Block Unit")}
            className={`px-3 sm:px-4 py-1.5 cursor-pointer sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              activeTab === "Block Unit"
                ? "bg-[#7C69E8] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Block Unit
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-3 sm:mt-4 pl-3">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default CreateReservation;
