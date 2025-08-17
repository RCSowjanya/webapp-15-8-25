"use server";

import api from "@/utils/apiService";
import { auth } from "@/app/(dashboard-screens)/auth";

/**
 * Create a new booking
 * @param {Object} bookingData - Booking data
 * @param {Object} bookingData.property - Property object with _id
 * @param {Object} bookingData.guestDetails - Guest information
 * @param {string} bookingData.guestDetails.firstName - Guest first name
 * @param {string} bookingData.guestDetails.lastName - Guest last name
 * @param {string} bookingData.guestDetails.mobileNumber - Guest mobile number
 * @param {string} bookingData.guestDetails.countryCode - Country code for mobile
 * @param {number} bookingData.guestDetails.adults - Number of adults
 * @param {number} bookingData.guestDetails.children - Number of children
 * @param {number} bookingData.guestDetails.totalGuests - Total number of guests
 * @param {Object} bookingData.stayDetails - Stay information
 * @param {Date} bookingData.stayDetails.checkIn - Check-in date
 * @param {Date} bookingData.stayDetails.checkOut - Check-out date
 * @param {number} bookingData.stayDetails.nights - Number of nights
 * @param {Object} bookingData.pricing - Pricing information
 * @param {number} bookingData.pricing.total - Total amount
 * @param {string} bookingData.note - Additional notes
 * @param {string} bookingData.paymentMethod - Payment method ("pay_now" or "pay_later")
 * @returns {Promise<Object>} Booking response
 */
export const createBooking = async (bookingData) => {
  const session = await auth();
  const token = session?.token;

  console.log("Session object:", session);
  console.log("Token from session:", token);

  if (!token) {
    console.log("No token found for booking request");
    return {
      success: false,
      message: "No token. Please log in again.",
      data: null,
    };
  }

  // Validate required parameters
  console.log("Booking data received:", bookingData);

  const requiredFields = [
    "property._id",
    "guestDetails.firstName",
    "guestDetails.lastName",
    "guestDetails.mobileNumber",
    "guestDetails.countryCode",
    "guestDetails.adults",
    "guestDetails.totalGuests",
    "stayDetails.checkIn",
    "stayDetails.checkOut",
    "stayDetails.nights",
    "pricing.total",
  ];

  const missingFields = [];
  for (const field of requiredFields) {
    const value = field
      .split(".")
      .reduce((obj, key) => obj?.[key], bookingData);
    if (!value) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    console.error("Missing required fields:", missingFields);
    return {
      success: false,
      message: `Missing required fields: ${missingFields.join(", ")}`,
      data: null,
    };
  }

  try {
    console.log("Creating booking with data:", bookingData);
    console.log("📅 Date debugging:");
    console.log("checkIn type:", typeof bookingData.stayDetails.checkIn);
    console.log("checkIn value:", bookingData.stayDetails.checkIn);
    console.log("checkOut type:", typeof bookingData.stayDetails.checkOut);
    console.log("checkOut value:", bookingData.stayDetails.checkOut);

    // Validate and convert dates
    const checkInDate = new Date(bookingData.stayDetails.checkIn);
    const checkOutDate = new Date(bookingData.stayDetails.checkOut);
    
    console.log("Converted checkInDate:", checkInDate);
    console.log("Converted checkOutDate:", checkOutDate);
    
    // Check if dates are valid
    if (isNaN(checkInDate.getTime())) {
      console.error("❌ Invalid check-in date:", bookingData.stayDetails.checkIn);
      return {
        success: false,
        message: "Invalid check-in date format",
        data: null,
      };
    }
    
    if (isNaN(checkOutDate.getTime())) {
      console.error("❌ Invalid check-out date:", bookingData.stayDetails.checkOut);
      return {
        success: false,
        message: "Invalid check-out date format",
        data: null,
      };
    }

    console.log("✅ Dates are valid");

    // Format dates to API expected format: "2025-06-11T00:00:00.000+00:00"
    const formatDateForAPI = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}T00:00:00.000+00:00`;
    };

    const formattedCheckIn = formatDateForAPI(checkInDate);
    const formattedCheckOut = formatDateForAPI(checkOutDate);
    
    console.log("📅 Formatted dates for API:");
    console.log("checkIn:", formattedCheckIn);
    console.log("checkOut:", formattedCheckOut);

    // Prepare the request body for the API
    const requestBody = {
      propertyId: bookingData.property._id,
      guestDetails: {
        firstName: bookingData.guestDetails.firstName,
        lastName: bookingData.guestDetails.lastName,
        mobileNumber: bookingData.guestDetails.mobileNumber,
        countryCode: bookingData.guestDetails.countryCode,
        adults: bookingData.guestDetails.adults,
        children: bookingData.guestDetails.children,
        totalGuests: bookingData.guestDetails.totalGuests,
      },
      stayDetails: {
        checkIn: formattedCheckIn,
        checkOut: formattedCheckOut,
        nights: bookingData.stayDetails.nights,
      },
      pricing: {
        total: bookingData.pricing.total,
        subtotal: bookingData.pricing.subtotal || 0,
        discount: bookingData.pricing.discount || 0,
        platformFee: bookingData.pricing.platformFee || 0,
        vat: bookingData.pricing.vat || 0,
        totalRate: bookingData.pricing.totalRate || 0,
        discountedRate: bookingData.pricing.discountedRate || 0,
        stayingDurationPrice: bookingData.pricing.stayingDurationPrice || 0,
        breakDownWithOtaCommission:
          bookingData.pricing.breakDownWithOtaCommission || 0,
        discountDetails: bookingData.pricing.discountDetails || {},
        dateWiseRates: bookingData.pricing.dateWiseRates || [],
      },
      note: bookingData.note || "",
      paymentMethod: bookingData.paymentMethod || "pay_later",
      isPmBooking: true,
    };

    console.log("API Request Body:", requestBody);

    const response = await api.post("/property/book", requestBody, {
      authorizationHeader: `Bearer ${token}`,
      showErrorToast: false, // Handle toast in the component
      errorMessage: "Failed to create booking.",
    });

    console.log("Create Booking API Response:", response);

    // Check for successful response - handle different response structures
    if (response?.success) {
      // Check if response has nested success structure
      if (response?.data?.success) {
        const bookingResult = response.data.data;
        console.log(
          "Booking created successfully (nested structure):",
          bookingResult
        );

        return {
          success: true,
          data: bookingResult,
          message: response.data.message || "Booking created successfully",
        };
      } else if (response?.data) {
        // Direct data structure
        const bookingResult = response.data;
        console.log(
          "Booking created successfully (direct structure):",
          bookingResult
        );

        return {
          success: true,
          data: bookingResult,
          message: response.message || "Booking created successfully",
        };
      }
    }

    // Handle error response
    console.error("Create Booking API Failed:", {
      responseSuccess: response?.success,
      responseData: response?.data,
      responseMessage: response?.message,
      nestedSuccess: response?.data?.success,
      nestedMessage: response?.data?.message,
    });

    return {
      success: false,
      message:
        response?.data?.message ||
        response?.message ||
        "Failed to create booking. Please try again.",
      data: null,
    };
  } catch (error) {
    console.error("Create Booking Error:", error);

    // Handle specific error cases
    let errorMessage = "An error occurred while creating the booking.";

    if (error.message) {
      const match = error.message.match(/(\d+):\s*(.*)/);
      if (match) {
        const [, statusCode, message] = match;
        switch (statusCode) {
          case "400":
            errorMessage =
              "Invalid booking data. Please check your information and try again.";
            break;
          case "401":
            errorMessage = "Please login to create a booking.";
            break;
          case "404":
            errorMessage = "Property not found.";
            break;
          case "409":
            errorMessage = "Property is not available for the selected dates.";
            break;
          case "422":
            errorMessage =
              "Invalid booking information. Please check your details.";
            break;
          case "500":
            errorMessage = "Unable to create booking. Please try again.";
            break;
          default:
            try {
              const errorData = JSON.parse(message);
              errorMessage =
                errorData.message ||
                "Unable to create booking. Please try again.";
            } catch (e) {
              errorMessage =
                message || "Unable to create booking. Please try again.";
            }
        }
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};

export default createBooking;
