"use server";
import api from "@/utils/apiService";
import { auth } from "@/app/(dashboard-screens)/auth";

/**
 * Cancel subscription for a specific property
 * @param {string} propertyId - The ID of the property to cancel subscription for
 * @returns {Promise<Object>} Response object with success status and data
 */
export const cancelSubscription = async (propertyId) => {
  try {
    const session = await auth();
    const token = session?.token || null;

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please log in again.",
        data: null
      };
    }

    // Use the correct endpoint as specified
    const response = await api.get(`/property/subscription/cancel/${propertyId}`, {
      authorizationHeader: `Bearer ${token}`,
      showErrorToast: false,
      errorMessage: "Failed to cancel subscription",
    });

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.data?.message || "Subscription cancelled successfully!",
      };
    } else {
      return {
        success: false,
        data: null,
        message: response.error || "Failed to cancel subscription",
      };
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      data: null,
      message: `Unexpected Error: ${error.message || "An error occurred while cancelling the subscription"}`,
    };
  }
};

/**
 * Get subscription cancellation details for a specific property
 * @param {string} propertyId - The ID of the property to get cancellation details for
 * @returns {Promise<Object>} Response object with success status and data
 */
export const getSubscriptionCancellationDetails = async (propertyId) => {
  try {
    const session = await auth();
    const token = session?.token || null;

    if (!token) {
      return {
        success: false,
        message: "No authentication token found. Please log in again.",
        data: null
      };
    }

    // Call external API directly
    const response = await api.get(`/property/subscription/cancel/${propertyId}/details`, {
      authorizationHeader: `Bearer ${token}`,
      showErrorToast: false,
      errorMessage: "Failed to fetch cancellation details",
    });

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: "Cancellation details fetched successfully",
      };
    } else {
      return {
        success: false,
        data: null,
        message: response.error || "Failed to fetch cancellation details",
      };
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      message: `API Error: ${error.message || "An error occurred while fetching cancellation details"}`,
    };
  }
}; 