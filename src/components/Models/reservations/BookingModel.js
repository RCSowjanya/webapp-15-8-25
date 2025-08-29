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
  const token = session?.token || null;

  if (!token) {
    console.log("No token found");
    return {
      success: false,
      message: "No token. Please log in again.",
      data: null,
    };
  }

  try {
    // Validate required fields
    if (!bookingData.property?._id) {
      return {
        success: false,
        message: "Property ID is required",
        data: null,
      };
    }

    if (
      !bookingData.stayDetails?.checkIn ||
      !bookingData.stayDetails?.checkOut
    ) {
      return {
        success: false,
        message: "Check-in and check-out dates are required",
        data: null,
      };
    }

    // Parse and validate dates
    const checkInDate = new Date(bookingData.stayDetails.checkIn);
    const checkOutDate = new Date(bookingData.stayDetails.checkOut);

    if (isNaN(checkInDate.getTime())) {
      console.error(
        "❌ Invalid check-in date:",
        bookingData.stayDetails.checkIn
      );
      return {
        success: false,
        message: "Invalid check-in date format",
        data: null,
      };
    }

    if (isNaN(checkOutDate.getTime())) {
      console.error(
        "❌ Invalid check-out date:",
        bookingData.stayDetails.checkOut
      );
      return {
        success: false,
        message: "Invalid check-out date format",
        data: null,
      };
    }

    console.log("✅ Dates are valid");

    // Format dates to API expected format: "2024-12-14"
    const formatDateForAPI = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const formattedCheckIn = formatDateForAPI(checkInDate);
    const formattedCheckOut = formatDateForAPI(checkOutDate);

    console.log("📅 Formatted dates for API:");
    console.log("checkIn:", formattedCheckIn);
    console.log("checkOut:", formattedCheckOut);

    // Prepare the request body with the correct API parameters
    const requestBody = {
      propertyId: bookingData.property._id,
      startDate: formattedCheckIn,
      endDate: formattedCheckOut,
      adults: bookingData.guestDetails.adults || 1,
      child: bookingData.guestDetails.children || 0,
      fname: bookingData.guestDetails.firstName || "",
      lname: bookingData.guestDetails.lastName || "",
      phone: bookingData.guestDetails.mobileNumber || "",
      countryCode: bookingData.guestDetails.countryCode || "+966",
      stayingDurationNight: bookingData.stayDetails.nights || 1,
      reservedByOwner: true,
      isStayhubBooking: true,
      totalPrice: bookingData.pricing.total || 0,
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
                "An error occurred while creating the booking.";
            } catch {
              errorMessage =
                message || "An error occurred while creating the booking.";
            }
        }
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
