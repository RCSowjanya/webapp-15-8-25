"use server";
import api from "@/utils/apiService";
import { auth } from "@/app/(dashboard-screens)/auth";
import { format } from "date-fns";

/**
 * Block unit dates for a property
 * @param {Object} params
 * @param {string} params.propertyId - The property ID
 * @param {Array} params.update - Array of block objects with fromDate, toDate, note
 * @returns {Promise<Object>} API response
 */
export const blockUnitDates = async ({ propertyId, update }) => {
  const session = await auth();
  const token = session?.token;

  if (!token) {
    return {
      success: false,
      message: "No token. Please log in again.",
    };
  }

  try {
    const response = await api.post(
      "/property/availability/update",
      {
        propertyId,
        update,
      },
      {
        authorizationHeader: `Bearer ${token}`,
        showErrorToast: false,
        errorMessage: "Failed to block unit dates.",
      }
    );
    return response;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to block unit dates.",
    };
  }
};

export default blockUnitDates;
