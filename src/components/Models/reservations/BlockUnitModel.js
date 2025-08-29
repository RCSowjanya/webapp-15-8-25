"use server";
import api from "@/utils/apiService";
import { auth } from "@/app/(dashboard-screens)/auth";
import { format } from "date-fns";

/**
 * Block unit dates for a property
 * @param {Object} params
 * @param {string} params.propertyId - The property ID
 * @param {string} params.ratePlanId - The rate plan ID
 * @param {Array<{fromDate: Date|string, toDate: Date|string, rate?: number, note?: string}>} params.update - Updates
 * @returns {Promise<Object>} API response
 */
export const blockUnitDates = async ({ propertyId, ratePlanId, update }) => {
  const session = await auth();
  const token = session?.token;

  if (!token) {
    return {
      success: false,
      message: "No token. Please log in again.",
    };
  }

  // Ensure date format YYYY-MM-DD for API
  const toApiDate = (value) => {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return value; // fallback if already string
    return format(date, "yyyy-MM-dd");
  };

  // Normalize update items
  const normalizedUpdates = (Array.isArray(update) ? update : []).map((u) => ({
    fromDate: toApiDate(u.fromDate),
    toDate: toApiDate(u.toDate),
    rate: typeof u.rate === "number" ? u.rate : undefined,
    note: u.note ?? "",
  }));

  try {
    const response = await api.post(
      "/property/availability/update",
      {
        propertyId,
        ratePlanId,
        update: normalizedUpdates,
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
