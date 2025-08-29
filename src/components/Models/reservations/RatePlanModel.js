"use server";

import api from "@/utils/apiService";
import { auth } from "@/app/(dashboard-screens)/auth";

/**
 * Fetch rate plan data for a property
 * @param {Object} params - Rate plan parameters
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @param {string} params.propertyId - Property ID
 * @returns {Promise<Object>} Rate plan data
 */
export const getRatePlan = async (params) => {
  const session = await auth();
  const token = session?.token || null;

  try {
    if (!token) {
      console.log("No token found for rate plan request");
      return {
        success: false,
        message: "No authentication token",
        data: null,
      };
    }

    // Validate required parameters
    if (!params.startDate || !params.endDate || !params.propertyId) {
      return {
        success: false,
        message: "startDate, endDate, and propertyId are required",
        data: null,
      };
    }

    console.log("Rate Plan Parameters received:", params);

    // Validate date formats
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return {
        success: false,
        message: "Invalid date format. Please use YYYY-MM-DD format",
        data: null,
      };
    }

    console.log("Fetching rate plan with params:", params);

    const requestBody = {
      startDate: params.startDate,
      endDate: params.endDate,
      propertyId: params.propertyId,
      isPmBooking: true,
    };

    console.log("Making API call to /property/rate with:", requestBody);

    const response = await api.post("/property/rate", requestBody, {
      authorizationHeader: `Bearer ${token}`,
      showErrorToast: false,
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
    if (response?.success && response?.data) {
      // Handle both response structures: direct data or nested data
      const rateData = response.data?.data || response.data;
      console.log("Rate Plan Data:", rateData);
      // Treat blocked/min-stay as failure so UI shows message immediately
      if (rateData?.isBlocked || rateData?.isMinStay) {
        const minStay = rateData?.minStay;
        const message =
          response?.data?.message ||
          rateData?.message ||
          (rateData?.isMinStay && typeof minStay === "number"
            ? `Minimum stay is ${minStay} night${minStay === 1 ? "" : "s"}.`
            : "Selected dates are not available. Please choose different dates.");
        return {
          success: false,
          message,
          data: null,
          errorType: "dates_unavailable",
        };
      }

      // Check if the response indicates dates are not available
      if (
        rateData?.message &&
        (rateData.message.includes("already booked") ||
          rateData.message.includes("not available") ||
          rateData.message.includes("unavailable"))
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

      // Check if we have the required rate data
      if (rateData?.totalRate || rateData?.totalPrice) {
        console.log("Rate plan data is valid");
        return {
          success: true,
          data: rateData,
          message: "Rate plan fetched successfully",
        };
      } else {
        console.log("Rate plan data is missing required fields");
        return {
          success: false,
          message: "Rate plan data is incomplete",
          data: null,
          errorType: "incomplete_data",
        };
      }
    } else {
      console.error("Rate Plan API Failed:", {
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
          "Failed to fetch rate plan. Please try again.",
        data: null,
      };
    }
  } catch (error) {
    console.error("Error in getRatePlan:", error);
    return {
      success: false,
      message: error.message || "An error occurred while fetching rate plan",
      data: null,
    };
  }
};

export default getRatePlan;
