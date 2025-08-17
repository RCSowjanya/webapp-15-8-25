"use server";
import api from "@/utils/apiService";
import { auth } from "@/app/(dashboard-screens)/auth";
export const updatePropertyStatus = async (propertyIds, action) => {
  const session = await auth();
  const token = session?.token || null;

  try {
    // Validate action parameter
    if (!["activate", "inactivate"].includes(action)) {
      throw new Error('Invalid action. Must be "activate" or "inactivate"');
    }

    // Validate propertyIds
    if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
      throw new Error("Property IDs must be a non-empty array");
    }

    const apiCall = () =>
      api.post(
        `/property/action/${action}`,
        {
          properties: propertyIds,
        },
        {
          authorizationHeader: `Bearer ${token}`,
        }
      );

    const response = await apiCall();
    //console.log(`${action} properties response:`, response);
    return response;
  } catch (error) {
    //console.error(`Property ${action} Error:`, error);
    // Return a structured error response instead of throwing
    return {
      success: false,
      error: error.message || "Network error",
      message: `Failed to ${action} properties. Please check your connection and try again.`,
    };
  }
};

export const updateReviewsStatus = async (
  propertyIds,
  reviewEnabled = false
) => {
  const session = await auth();
  const token = session?.token || null;

  try {
    // Validate propertyIds
    if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
      throw new Error("Property IDs must be a non-empty array");
    }

    // console.log("Making API call with:", {
    //   propertyIds,
    //   reviewEnabled,
    //   token: token ? "Token exists" : "No token",
    // });

    const apiCall = () =>
      api.post(
        `/property/review/${reviewEnabled? "activate" : "deactivate"}`,
        {
          properties: propertyIds
        },
        {
          authorizationHeader: `Bearer ${token}`,
          showErrorToast: false, // Disable automatic toast
          errorMessage: `Failed to ${
            reviewEnabled ? "enable" : "disable"
          } reviews. Please try again.`,
        }
      );

    const response = await apiCall();
    //console.log("Raw API Response:", response);

    // Handle empty response
    if (!response || Object.keys(response).length === 0) {
      throw new Error("Empty response received from server");
    }

    // Handle response without data
    if (!response.data) {
      throw new Error("Invalid response format: missing data");
    }

    // Handle error response
    if (response.data.success === false) {
      throw new Error(response.data.message || "Operation failed");
    }

    // If we get here, the operation was successful
   // console.log("Successfully updated reviews status");
    return {
      success: true,
      data: response.data,
      message: `Successfully ${reviewEnabled ? "enabled" : "disabled"} reviews`,
    };
  } catch (error) {
    console.error("Update Reviews Status Error:", {
      error,
      message: error.message,
      stack: error.stack,
    });

    // Return a structured error response
    return {
      success: false,
      error: error.message || "Network error",
      message: `Failed to ${
        reviewEnabled ? "enable" : "disable"
      } reviews. Please try again.`,
    };
  }
};