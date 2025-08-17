"use server";

import api from "../../../utils/apiService";
import { auth } from "../../../app/(dashboard-screens)/auth";

/**
 * Add an invited user
 * @param {Object} userData - Invited user data
 * @param {string} userData.phone - User phone number
 * @param {string} userData.countryCode - Country code for phone
 * @param {string} userData.firstName - User first name
 * @param {string} userData.lastName - User last name
 * @param {string} userData.email - User email (optional)
 * @param {string} userData.userType - User type (e.g., "invited")
 * @param {string} userData.invitedBy - ID of the user who is inviting
 * @param {Object} userData.permissions - User permissions (optional)
 * @returns {Promise<Object>} API response
 */
export const addInvitedUser = async (userData) => {
  const session = await auth();
  const token = session?.token;

  console.log("Session object:", session);
  console.log("Token from session:", token);

  if (!token) {
    console.log("No token found for invited user request");
    return {
      success: false,
      message: "No token. Please log in again.",
      data: null,
    };
  }

  // Validate required parameters
  console.log("Invited user data received:", userData);
  
  const requiredFields = [
    'phone',
    'countryCode',
    'firstName',
    'lastName',
    'userType',
    'invitedBy'
  ];

  const missingFields = [];
  for (const field of requiredFields) {
    const value = userData[field];
    if (!value) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    console.error("Missing required fields:", missingFields);
    return {
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`,
      data: null,
    };
  }

  try {
    console.log("Adding invited user with data:", userData);
    
    // Prepare the request body for the API
    const requestBody = {
      phone: userData.phone,
      countryCode: userData.countryCode,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email || "",
      userType: userData.userType,
      invitedBy: userData.invitedBy,
      permissions: userData.permissions || {},
      isInvitedUser: true
    };

    console.log("API Request Body:", requestBody);

    const response = await api.post(
      "/user/manage/add",
      requestBody,
      {
        authorizationHeader: `Bearer ${token}`,
        showErrorToast: false, // Handle toast in the component
        errorMessage: "Failed to add invited user.",
      }
    );

    console.log("Add Invited User API Response:", response);

    // Check for successful response - handle different response structures
    if (response?.success) {
      // Check if response has nested success structure
      if (response?.data?.success) {
        const userResult = response.data.data;
        console.log("Invited user added successfully (nested structure):", userResult);
        
        return {
          success: true,
          data: userResult,
          message: response.data.message || "Invited user added successfully",
        };
      } else if (response?.data) {
        // Direct data structure
        const userResult = response.data;
        console.log("Invited user added successfully (direct structure):", userResult);
        
        return {
          success: true,
          data: userResult,
          message: response.message || "Invited user added successfully",
        };
      }
    }
    
    // Handle error response
    console.error("Add Invited User API Failed:", {
      responseSuccess: response?.success,
      responseData: response?.data,
      responseMessage: response?.message,
      nestedSuccess: response?.data?.success,
      nestedMessage: response?.data?.message
    });
    
    return {
      success: false,
      message: response?.data?.message || response?.message || "Failed to add invited user. Please try again.",
      data: null,
    };
  } catch (error) {
    console.error("Add Invited User Error:", error);
    
    // Handle specific error cases
    let errorMessage = "An error occurred while adding the invited user.";
    
    if (error.message) {
      const match = error.message.match(/(\d+):\s*(.*)/);
      if (match) {
        const [, statusCode, message] = match;
        switch (statusCode) {
          case "400":
            errorMessage = "Invalid user data. Please check the information and try again.";
            break;
          case "401":
            errorMessage = "Please login to add invited users.";
            break;
          case "403":
            errorMessage = "You do not have permission to add invited users.";
            break;
          case "409":
            errorMessage = "A user with this phone number already exists.";
            break;
          case "422":
            errorMessage = "Invalid user information. Please check your details.";
            break;
          case "500":
            errorMessage = "Unable to add invited user. Please try again.";
            break;
          default:
            try {
              const errorData = JSON.parse(message);
              errorMessage = errorData.message || "Unable to add invited user. Please try again.";
            } catch (e) {
              errorMessage = message || "Unable to add invited user. Please try again.";
            }
        }
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};

/**
 * Get list of invited users
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.pageSize - Items per page (default: 10)
 * @param {string} params.search - Search term (optional)
 * @returns {Promise<Object>} API response
 */
export const getInvitedUsers = async (params = {}) => {
  const session = await auth();
  const token = session?.token;

  if (!token) {
    console.log("No token found for invited users request");
    return {
      success: false,
      message: "No token. Please log in again.",
      data: [],
      pagination: {
        totalData: 0,
        totalPage: 0,
        currentPage: params.page || 1,
        pageSize: params.pageSize || 10,
      },
    };
  }

  try {
    console.log("Fetching invited users with params:", params);
    
    const searchParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    };

    if (params.search) {
      searchParams.search = params.search;
    }

    const response = await api.get(
      "/user/manage/invited-users",
      {
        searchParams,
        authorizationHeader: `Bearer ${token}`,
        showErrorToast: false,
        errorMessage: "Failed to fetch invited users.",
      }
    );

    console.log("Get Invited Users API Response:", response);

    // Check for successful response
    if (response?.success && response?.data?.success) {
      const usersData = response.data.data;
      console.log("Invited users fetched successfully:", usersData);
      
      return {
        success: true,
        data: usersData.data || usersData,
        pagination: {
          totalData: usersData.total_data || usersData.length,
          totalPage: usersData.total_page || 1,
          currentPage: usersData.page || params.page || 1,
          pageSize: usersData.pageSize || params.pageSize || 10,
        },
        message: "Invited users fetched successfully",
      };
    } else {
      console.error("Get Invited Users API Failed:", response?.data?.message || response?.message);
      return {
        success: false,
        message: response?.data?.message || response?.message || "Failed to fetch invited users. Please try again.",
        data: [],
        pagination: {
          totalData: 0,
          totalPage: 0,
          currentPage: params.page || 1,
          pageSize: params.pageSize || 10,
        },
      };
    }
  } catch (error) {
    console.error("Get Invited Users Error:", error);
    
    let errorMessage = "An error occurred while fetching invited users.";
    
    if (error.message) {
      const match = error.message.match(/(\d+):\s*(.*)/);
      if (match) {
        const [, statusCode, message] = match;
        switch (statusCode) {
          case "401":
            errorMessage = "Please login to view invited users.";
            break;
          case "403":
            errorMessage = "You do not have permission to view invited users.";
            break;
          case "500":
            errorMessage = "Unable to fetch invited users. Please try again.";
            break;
          default:
            try {
              const errorData = JSON.parse(message);
              errorMessage = errorData.message || "Unable to fetch invited users. Please try again.";
            } catch (e) {
              errorMessage = message || "Unable to fetch invited users. Please try again.";
            }
        }
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      message: errorMessage,
      data: [],
      pagination: {
        totalData: 0,
        totalPage: 0,
        currentPage: params.page || 1,
        pageSize: params.pageSize || 10,
      },
    };
  }
};

export default addInvitedUser; 