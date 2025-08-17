"use server";
import api from "@/utils/apiService";
import { auth } from "@/app/(dashboard-screens)/auth";

/**
 * Fetch user activity log from the backend
 * @returns {Promise<Object>} Response object with success status and data
 */
export const fetchUserActivity = async ({
  startDate,
  endDate,
  filter,
  pageSize = 50,
} = {}) => {
  const session = await auth();
  const token = session?.token || null;

  if (!token) {
    return {
      success: false,
      data: [],
      message: "No authentication token found. Please log in again.",
    };
  }

  try {
    const response = await api.get("/user/activity", {
      searchParams: { startDate, endDate, filter, pageSize },
      authorizationHeader: `Bearer ${token}`,
      showSuccessToast: false,
      showErrorToast: false,
    });

    if (response.success && response.data?.success) {
      return {
        success: true,
        data: response.data.data,
        message: "User activity fetched successfully",
      };
    } else {
      return {
        success: false,
        data: [],
        message:
          response.data?.message ||
          response.message ||
          "Failed to fetch user activity",
      };
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      message:
        error.message || "An error occurred while fetching user activity",
    };
  }
};