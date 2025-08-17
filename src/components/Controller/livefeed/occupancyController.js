"use server";
import api from "@/utils/apiService";
import { auth } from "@/app/(dashboard-screens)/auth";

/**
 * Fetch occupancy data from the backend (shared for rate, source, and trend)
 * @param {Object} params - Occupancy parameters
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @param {Array} params.propertyIds - Optional array of property IDs
 * @returns {Promise<Object>} Response object with success status and data
 */
export const fetchOccupancyData = async (params) => {
  console.log("fetchOccupancyData called with params:", params);

  const session = await auth();
  const token = session?.token || null;

  console.log("Session token:", token ? "Present" : "Missing");

  if (!token) {
    return {
      success: false,
      data: null,
      message: "No authentication token found. Please log in again.",
    };
  }

  // Validate required parameters
  const { startDate, endDate, propertyIds = [] } = params;

  if (!startDate || !endDate) {
    return {
      success: false,
      data: null,
      message: "startDate and endDate are required",
    };
  }

  // Validate date format
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
    return {
      success: false,
      data: null,
      message: "Invalid date format. Use YYYY-MM-DD",
    };
  }

  if (startDateObj > endDateObj) {
    return {
      success: false,
      data: null,
      message: "Start date cannot be after end date",
    };
  }

  try {
    // Prepare the payload for the external API
    const payload = {
      startDate,
      endDate,
      ...(propertyIds.length > 0 && { propertyIds }),
    };

    console.log("Occupancy API Request:", {
      endpoint: "/feed/occupancy",
      payload: payload,
      token: token ? "Bearer [REDACTED]" : "No token",
    });

    const response = await api.post("/feed/occupancy", payload, {
      authorizationHeader: `Bearer ${token}`,
      showErrorToast: false, // Let the caller handle toasts
      errorMessage: "Failed to fetch occupancy data",
    });

    console.log("Occupancy API Response:", {
      success: response.success,
      status: response.status,
      hasData: !!response.data,
      data: response.data,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: "Occupancy data fetched successfully",
      };
    } else {
      return {
        success: false,
        data: null,
        message: response.error || "Failed to fetch occupancy data",
      };
    }
  } catch (error) {
    console.error("Occupancy API Error:", error);
    return {
      success: false,
      data: null,
      message: error.message || "An error occurred while fetching occupancy data",
    };
  }
}; 