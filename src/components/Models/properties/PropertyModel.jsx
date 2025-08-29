"use server";
import api from "@/utils/apiService";
import { auth } from "@/app/(dashboard-screens)/auth";
/**
 * Fetch all active properties
 * @returns {Promise<Object>} Response object with success status and data
 */
export const fetchActiveProperties = async () => {
  const session = await auth();
  const token = session?.token || null;

  try {
    if (!token) {
      return {
        success: false,
        data: [],
        message: "No authentication token",
      };
    }

    console.log("Session keys:", Object.keys(session || {}));
    console.log("Token:", token);
    console.log("Token type:", typeof token);

    const response = await api.get("/property/list", {
      searchParams: { isActive: true },
      authorizationHeader: `Bearer ${token}`,
      showSuccessToast: false,
      showErrorToast: false, // Handle errors manually
    });

    console.log("Full API Response:", response);
    console.log("Response structure:", {
      responseSuccess: response.success,
      responseData: response.data,
      responseDataSuccess: response.data?.success,
      responseDataData: response.data?.data,
      responseDataDataData: response.data?.data?.data,
    });

    if (response.success && response.data) {
      // Your API returns { success: true, message: string, data: [...] }
      // But support both array at data and nested data.data
      const payload = response.data?.data;
      const allProperties = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : [];

      console.log("All properties from API (normalized):", allProperties);

      return {
        success: true,
        data: allProperties,
        message: "Properties fetched successfully",
      };
    } else {
      console.error("API returned unsuccessful response:", response);
      return {
        success: false,
        data: [],
        message:
          response.data?.message ||
          response.message ||
          "Failed to fetch properties",
      };
    }
  } catch (error) {
    console.error("Error in fetchActiveProperties:", error);
    return {
      success: false,
      data: [],
      message: error.message || "An error occurred while fetching properties",
    };
  }
};

/**
 * Fetch property by ID
 * @param {string} propertyId - The property ID to fetch
 * @returns {Promise<Object>} Response object with success status and data
 */
export const fetchPropertyById = async (propertyId) => {
  const session = await auth();
  const token = session?.token || null;

  try {
    if (!propertyId) {
      return {
        success: false,
        data: null,
        message: "Property ID is required",
      };
    }

    console.log(`Fetching property with ID: ${propertyId}`);

    const response = await api.get(`/property/${propertyId}`, {
      authorizationHeader: `Bearer ${token}`,
      showSuccessToast: false,
      showErrorToast: false,
    });

    if (response.success && response.data?.success) {
      console.log("Property fetched successfully:", response.data.data);

      return {
        success: true,
        data: response.data.data,
        message: "Property fetched successfully",
      };
    } else {
      console.error("API returned unsuccessful response:", response);
      return {
        success: false,
        data: null,
        message:
          response.data?.message ||
          response.message ||
          "Failed to fetch property",
      };
    }
  } catch (error) {
    console.error("Error in fetchPropertyById:", error);
    return {
      success: false,
      data: null,
      message: error.message || "An error occurred while fetching property",
    };
  }
};

/**
 * Search properties with filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} Response object with success status and data
 */
export const searchProperties = async (filters = {}) => {
  const session = await auth();
  const token = session?.token || null;

  try {
    console.log("Searching properties with filters:", filters);

    // Build search parameters
    const searchParams = {};

    // Add filters to search params
    if (filters.city) searchParams.city = filters.city;
    if (filters.neighbourhood && filters.neighbourhood.length > 0) {
      searchParams.neighbourhood = filters.neighbourhood;
    }
    if (filters.propertyType && filters.propertyType.length > 0) {
      searchParams.propertyType = filters.propertyType;
    }
    if (filters.checkIn) searchParams.checkIn = filters.checkIn.toISOString();
    if (filters.checkOut)
      searchParams.checkOut = filters.checkOut.toISOString();
    if (filters.adults) searchParams.adults = filters.adults;
    if (filters.children) searchParams.children = filters.children;
    if (filters.rooms) searchParams.rooms = filters.rooms;

    // Always filter for active properties
    searchParams.isActive = true;

    const response = await api.get("/property/search", {
      searchParams,
      authorizationHeader: `Bearer ${token}`,
      showSuccessToast: false,
      showErrorToast: false,
    });

    if (response.success && response.data?.success) {
      const properties = response.data.data.data || [];
      console.log(`Found ${properties.length} properties matching filters`);

      return {
        success: true,
        data: properties,
        message: "Properties searched successfully",
      };
    } else {
      console.error("API returned unsuccessful response:", response);
      return {
        success: false,
        data: [],
        message:
          response.data?.message ||
          response.message ||
          "Failed to search properties",
      };
    }
  } catch (error) {
    console.error("Error in searchProperties:", error);
    return {
      success: false,
      data: [],
      message: error.message || "An error occurred while searching properties",
    };
  }
};

/**
 * Create a new property
 * @param {Object} propertyData - Property data to create
 * @returns {Promise<Object>} Response object with success status and data
 */
export const createProperty = async (propertyData) => {
  const session = await auth();
  const token = session?.token || null;

  try {
    console.log("Creating new property...");

    const response = await api.post("/property", propertyData, {
      authorizationHeader: `Bearer ${token}`,
      showSuccessToast: false,
      showErrorToast: false,
    });

    if (response.success && response.data?.success) {
      console.log("Property created successfully:", response.data.data);

      return {
        success: true,
        data: response.data.data,
        message: "Property created successfully",
      };
    } else {
      console.error("API returned unsuccessful response:", response);
      return {
        success: false,
        data: null,
        message:
          response.data?.message ||
          response.message ||
          "Failed to create property",
      };
    }
  } catch (error) {
    console.error("Error in createProperty:", error);
    return {
      success: false,
      data: null,
      message: error.message || "An error occurred while creating property",
    };
  }
};

/**
 * Update an existing property
 * @param {string} propertyId - Property ID to update
 * @param {Object} propertyData - Updated property data
 * @returns {Promise<Object>} Response object with success status and data
 */
export const updateProperty = async (propertyId, propertyData) => {
  const session = await auth();
  const token = session?.token || null;

  try {
    if (!propertyId) {
      return {
        success: false,
        data: null,
        message: "Property ID is required",
      };
    }

    console.log(`Updating property with ID: ${propertyId}`);

    const response = await api.put(`/property/${propertyId}`, propertyData, {
      authorizationHeader: `Bearer ${token}`,
      showSuccessToast: false,
      showErrorToast: false,
    });

    if (response.success && response.data?.success) {
      console.log("Property updated successfully:", response.data.data);

      return {
        success: true,
        data: response.data.data,
        message: "Property updated successfully",
      };
    } else {
      console.error("API returned unsuccessful response:", response);
      return {
        success: false,
        data: null,
        message:
          response.data?.message ||
          response.message ||
          "Failed to update property",
      };
    }
  } catch (error) {
    console.error("Error in updateProperty:", error);
    return {
      success: false,
      data: null,
      message: error.message || "An error occurred while updating property",
    };
  }
};

/**
 * Delete a property
 * @param {string} propertyId - Property ID to delete
 * @returns {Promise<Object>} Response object with success status and data
 */
export const deleteProperty = async (propertyId) => {
  const session = await auth();
  const token = session?.token || null;

  try {
    if (!propertyId) {
      return {
        success: false,
        data: null,
        message: "Property ID is required",
      };
    }

    console.log(`Deleting property with ID: ${propertyId}`);

    const response = await api.delete(`/property/${propertyId}`, {
      authorizationHeader: `Bearer ${token}`,
      showSuccessToast: false,
      showErrorToast: false,
    });

    if (response.success && response.data?.success) {
      console.log("Property deleted successfully");

      return {
        success: true,
        data: response.data.data,
        message: "Property deleted successfully",
      };
    } else {
      console.error("API returned unsuccessful response:", response);
      return {
        success: false,
        data: null,
        message:
          response.data?.message ||
          response.message ||
          "Failed to delete property",
      };
    }
  } catch (error) {
    console.error("Error in deleteProperty:", error);
    return {
      success: false,
      data: null,
      message: error.message || "An error occurred while deleting property",
    };
  }
};

/**
 * Upload property images
 * @param {string} propertyId - Property ID
 * @param {File|File[]} files - Image file(s) to upload
 * @returns {Promise<Object>} Response object with success status and data
 */
export const uploadPropertyImages = async (propertyId, files) => {
  const session = await auth();
  const token = session?.token || null;

  try {
    if (!propertyId) {
      return {
        success: false,
        data: null,
        message: "Property ID is required",
      };
    }

    if (!files) {
      return {
        success: false,
        data: null,
        message: "Files are required",
      };
    }

    console.log(`Uploading images for property: ${propertyId}`);

    const response = await api.upload(
      `/property/${propertyId}/images`,
      files,
      {
        propertyId,
      },
      {
        authorizationHeader: `Bearer ${token}`,
        showSuccessToast: false,
        showErrorToast: false,
      }
    );

    if (response.success && response.data?.success) {
      console.log("Images uploaded successfully:", response.data.data);

      return {
        success: true,
        data: response.data.data,
        message: "Images uploaded successfully",
      };
    } else {
      console.error("API returned unsuccessful response:", response);
      return {
        success: false,
        data: null,
        message:
          response.data?.message ||
          response.message ||
          "Failed to upload images",
      };
    }
  } catch (error) {
    console.error("Error in uploadPropertyImages:", error);
    return {
      success: false,
      data: null,
      message: error.message || "An error occurred while uploading images",
    };
  }
};

/**
 * Update property status (activate/inactivate)
 * @param {Array} propertyIds - Array of property IDs
 * @param {string} action - "activate" or "inactivate"
 * @returns {Promise<Object>} Response object with success status and data
 */
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

    const response = await api.post(
      `/property/action/${action}`,
      {
        properties: propertyIds,
      },
      {
        authorizationHeader: `Bearer ${token}`,
        showSuccessToast: false,
        showErrorToast: false,
      }
    );

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: `Successfully ${action}d ${propertyIds.length} property(ies)`,
      };
    } else {
      return {
        success: false,
        error: response.error || response.message,
        message: `Failed to ${action} properties. ${
          response.message || "Please try again."
        }`,
      };
    }
  } catch (error) {
    console.error(`Property ${action} Error:`, error);
    return {
      success: false,
      error: error.message || "Network error",
      message: `Failed to ${action} properties. Please check your connection and try again.`,
    };
  }
};

/**
 * Update reviews status for properties
 * @param {Array} propertyIds - Array of property IDs
 * @param {boolean} reviewEnabled - Enable or disable reviews
 * @returns {Promise<Object>} Response object with success status and data
 */
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

    const response = await api.post(
      `/property/reviews/toggle`,
      {
        properties: propertyIds,
        reviewEnabled: reviewEnabled,
      },
      {
        authorizationHeader: `Bearer ${token}`,
        showSuccessToast: false,
        showErrorToast: false,
      }
    );

    // Handle empty response
    if (!response || Object.keys(response).length === 0) {
      throw new Error("Empty response received from server");
    }

    // Handle error response
    if (!response.success) {
      throw new Error(response.message || "Operation failed");
    }

    // If we get here, the operation was successful
    return {
      success: true,
      data: response.data || response,
      message: `Successfully ${
        reviewEnabled ? "enabled" : "disabled"
      } reviews for ${propertyIds.length} property(ies)`,
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
