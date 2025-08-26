"use server";

import api from "@/utils/apiService";
import { auth } from "@/app/(dashboard-screens)/auth";

/**
 * Fetch rate plan data for a property
 * @param {Object} params - Rate plan parameters
 * @param {string} params.startDate - Check-in date (ISO string)
 * @param {string} params.endDate - Check-out date (ISO string)
 * @param {string} params.propertyId - Property ID
 * @returns {Promise<Object>} Rate plan data
 */
export const getRatePlan = async (params) => {
  const session = await auth();
  const token = session?.token;

  console.log("Session object:", session);
  console.log("Token from session:", token);

  if (!token) {
    console.log("No token found for rate plan request");
    return {
      success: false,
      message: "No token. Please log in again.",
      data: null,
    };
  }

  // Validate required parameters
  console.log("Rate Plan Parameters received:", params);
  console.log("Parameter validation:", {
    startDate: params.startDate,
    endDate: params.endDate,
    propertyId: params.propertyId,
    hasStartDate: !!params.startDate,
    hasEndDate: !!params.endDate,
    hasPropertyId: !!params.propertyId,
  });

  if (!params.startDate || !params.endDate || !params.propertyId) {
    console.error("Missing required parameters:", {
      startDate: params.startDate,
      endDate: params.endDate,
      propertyId: params.propertyId,
    });
    return {
      success: false,
      message:
        "Missing required parameters: startDate, endDate, and propertyId are required.",
      data: null,
    };
  }

  try {
    console.log("Fetching rate plan with params:", params);

    const requestBody = {
      startDate: params.startDate,
      endDate: params.endDate,
      propertyId: params.propertyId,
      isPmBooking: true,
    };

    const response = await api.post("/property/rate", requestBody, {
      authorizationHeader: `Bearer ${token}`,
      showErrorToast: false, // Handle toast in the component
      errorMessage: "Failed to fetch rate plan.",
    });

    console.log("Rate Plan API Response:", response);
    console.log("Rate Plan API Response Structure:", {
      success: response?.success,
      data: response?.data,
      dataSuccess: response?.data?.success,
      dataData: response?.data?.data,
      message: response?.data?.message || response?.message,
    });

    // Check for successful response
    if (response?.success && response?.data?.success) {
      const rateData = response.data.data;
      console.log("Rate Plan Data:", rateData);

      // Check if the unit is blocked
      if (rateData?.isBlocked) {
        console.log("Unit is blocked, but allowing booking to proceed");
        return {
          success: true,
          data: rateData,
          message:
            "Rate plan fetched successfully (Unit is blocked but booking allowed)",
          isBlocked: true,
        };
      }

      // Check if the response indicates dates are not available
      if (
        rateData?.message &&
        (rateData.message.includes("already booked") ||
          rateData.message.includes("not available"))
      ) {
        console.log(
          "Rate plan indicates dates are not available:",
          rateData.message
        );
        return {
          success: false,
          message: rateData.message,
          data: null,
          errorType: "dates_unavailable",
        };
      }

      return {
        success: true,
        data: rateData,
        message: "Rate plan fetched successfully",
        isBlocked: false,
      };
    } else {
      console.error(
        "Rate Plan API Failed:",
        response?.data?.message || response?.message
      );

      // Check for specific error cases
      const errorMessage =
        response?.data?.message ||
        response?.message ||
        "Failed to fetch rate plan. Please try again.";

      if (
        errorMessage.includes("already booked") ||
        errorMessage.includes("not available")
      ) {
        return {
          success: false,
          message:
            "Selected dates are not available. This property is already booked for the chosen dates. Please select different dates.",
          data: null,
          errorType: "dates_unavailable",
        };
      }

      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  } catch (error) {
    console.error("Rate Plan Error:", error);

    // Handle specific error cases
    let errorMessage = "An error occurred while fetching rate plan.";

    if (error.message) {
      const match = error.message.match(/(\d+):\s*(.*)/);
      if (match) {
        const [, statusCode, message] = match;
        switch (statusCode) {
          case "400":
            errorMessage =
              "Invalid date selection. Please choose different dates.";
            break;
          case "401":
            errorMessage = "Please login to check room availability.";
            break;
          case "404":
            errorMessage = "Property not found.";
            break;
          case "409":
            errorMessage =
              "Selected dates are already booked. Please choose different dates.";
            break;
          case "500":
            errorMessage = "Unable to fetch rates. Please try again.";
            break;
          default:
            try {
              const errorData = JSON.parse(message);
              errorMessage =
                errorData.message ||
                "Unable to fetch rates for selected dates.";
            } catch (e) {
              errorMessage =
                message || "Unable to fetch rates for selected dates.";
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

export default getRatePlan;
