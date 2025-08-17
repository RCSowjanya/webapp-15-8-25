"use server"
import api from "@/utils/apiService";
import { auth } from "@/app/(dashboard-screens)/auth";
export const getListings = async (phone, countryCode) => {
const session = await auth();
const token=session?.token||null;
    try {
      // Wrap the API call to ensure proper promise handling
      const apiCall = () => api.get('/property/list',  {authorizationHeader: `Bearer ${token}`});
  
      const response = await apiCall();
     // console.log("response is at getListings", response);
      return response;
    } catch (error) {
      console.error('OTP Generation Error:', error);
      // Return a structured error response instead of throwing
      return {
        success: false,
        error: error.message || 'Network error',
        message: 'Failed to send OTP. Please check your connection and try again.'
      };
    }
  };

