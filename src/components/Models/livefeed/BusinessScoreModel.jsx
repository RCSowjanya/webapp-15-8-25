"use server";
import api from "@/utils/apiService";
import { auth } from "@/app/(dashboard-screens)/auth";

/**
 * Fetch business score and repeat guest data from the backend
 * @param {Object} params - Parameters
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @param {Array} params.propertyIds - Optional array of property IDs
 * @returns {Promise<Object>} Response object with success status and data
 */
export const fetchBusinessScoreData = async (params) => {
  const session = await auth();
  const token = session?.token || null;

  if (!token) {
    return {
      success: false,
      data: null,
      message: "No authentication token found. Please log in again.",
    };
  }

  const { startDate, endDate, propertyIds = [] } = params;

  if (!startDate || !endDate) {
    return {
      success: false,
      data: null,
      message: "startDate and endDate are required",
    };
  }

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
    const payload = {
      startDate,
      endDate,
      ...(propertyIds.length > 0 && { propertyIds }),
    };

    const response = await api.post("/feed/business/score", payload, {
      authorizationHeader: `Bearer ${token}`,
      showErrorToast: false,
      errorMessage: "Failed to fetch business score data",
    });

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: "Business score data fetched successfully",
      };
    } else {
      return {
        success: false,
        data: null,
        message: response.error || "Failed to fetch business score data",
      };
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      message:
        error.message || "An error occurred while fetching business score data",
    };
  }
};