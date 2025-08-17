"use server";
import api from "@/utils/apiService";
import { auth } from "@/app/(dashboard-screens)/auth";

/**
 * Fetch subscription data from the backend
 * @returns {Promise<Object>} Response object with success status and data
 */
export const fetchSubscriptionData = async () => {
  try {
    const session = await auth();
    
    const token = session?.token || null;

    if (!token) {
      return {
        data: null,
        message: "No authentication token found. Please log in again.",
      };
    }

    // Use POST method with empty body or minimal body as required
    const response = await api.post("/pm/billing/property", {}, {
      authorizationHeader: `Bearer ${token}`,
      showErrorToast: false,
      errorMessage: "Failed to fetch subscription data",
    });

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: "Subscription data fetched successfully",
      };
    } else {
      return {
        success: false,
        data: null,
        message: response.error || "Failed to fetch subscription data",
      };
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      message: `API Error: ${error.message || "An error occurred while fetching subscription data"}`,
    };
  }
};

// Fetch property details by property ID
export const fetchPropertyDetails = async (propertyId) => {
  try {
    const session = await auth();
    const token = session?.token;

    if (!token) {
      return {
        success: false,
        message: "No authentication token found",
        data: null
      };
    }

    const response = await api.get(`/property/details/${propertyId}`, {
      authorizationHeader: `Bearer ${token}`
    });

    if (response.success) {
      // Debug: Log the actual data structure
      console.log('Raw API response data:', JSON.stringify(response.data, null, 2));
      console.log('Subscription ID data:', response.data?.subscriptionId);
      
      // Format dates on the server side for consistency
      const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleDateString('en-GB', { month: 'short' });
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      // Format the data with consistent dates
      const formattedData = {
        ...response.data,
        formattedDates: {
          renewalDate: formatDate(response.data?.subscriptionId?.nextBillingDate),
          nextPaymentDate: formatDate(response.data?.subscriptionId?.nextBillingDate), // Use nextBillingDate for both
          billingEndDate: formatDate(response.data?.subscriptionId?.nextBillingDate)
        }
      };

      console.log('Formatted dates:', formattedData.formattedDates);

      return {
        success: true,
        message: "Property details fetched successfully",
        data: formattedData
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to fetch property details",
        data: null
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "An error occurred",
      data: null
    };
  }
}; 