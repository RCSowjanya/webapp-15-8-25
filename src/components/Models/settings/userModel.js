"use server";
import api from "@/utils/apiService";
import { auth } from "@/app/(dashboard-screens)/auth";

// Fetch user details from the API
export const getUserDetails = async () => {
  const session = await auth();
  const token = session?.token || null;

  if (!token) {
    return {
      success: false,
      message: "No token. Please log in again.",
    };
  }

  try {
    const endpoint = "/user/details";
    const response = await api.get(endpoint, {
      authorizationHeader: `Bearer ${token}`,
      showErrorToast: false, // Let the caller handle toasts
    });
    return response;
  } catch (error) {
    return {
      success: false,
      error: error.message || "Network error",
      message: "Failed to load user details. Please try again.",
    };
  }
};

// Update user notification preferences
export const updateNotificationPreferences = async (
  notificationPreferences
) => {
  const session = await auth();
  const token = session?.token || null;

  if (!token) {
    return {
      success: false,
      message: "No token. Please log in again.",
    };
  }

  try {
    const endpoint = "/user/create";
    const response = await api.post(
      endpoint,
      {
        notificationPreference: notificationPreferences,
      },
      {
        authorizationHeader: `Bearer ${token}`,
        showErrorToast: false, // Let the caller handle toasts
      }
    );
    return response;
  } catch (error) {
    return {
      success: false,
      error: error.message || "Network error",
      message: "Failed to update notification preferences. Please try again.",
    };
  }
};
