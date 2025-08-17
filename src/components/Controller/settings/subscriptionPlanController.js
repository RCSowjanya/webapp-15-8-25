"use server";
import { auth } from "@/app/(dashboard-screens)/auth";
import api from "@/utils/apiService";

export async function fetchSubscriptionPlans() {
  try {
    const session = await auth();
    if (!session?.token) {
      return {
        success: false,
        message: "Authentication required",
        data: null
      };
    }

    const response = await api.get('/subscription/get', {
      authorizationHeader: `Bearer ${session.token}`,
      showErrorToast: false
    });

    if (response.success) {
      return {
        success: true,
        message: "Subscription plans fetched successfully",
        data: response.data
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to fetch subscription plans",
        data: null
      };
    }
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return {
      success: false,
      message: error.message || "Failed to fetch subscription plans",
      data: null
    };
  }
}

export async function fetchDiscountList() {
  try {
    const session = await auth();
    if (!session?.token) {
      return {
        success: false,
        message: "Authentication required",
        data: null
      };
    }

    const response = await api.post('/subscription/discount/list', {}, {
      authorizationHeader: `Bearer ${session.token}`,
      showErrorToast: false
    });

    if (response.success) {
      return {
        success: true,
        message: response.message || "Discount list fetched successfully",
        data: response.data
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to fetch discount list",
        data: null
      };
    }
  } catch (error) {
    console.error('Error fetching discount list:', error);
    return {
      success: false,
      message: error.message || "Failed to fetch discount list",
      data: null
    };
  }
}

export async function fetchUserCards() {
  try {
    const session = await auth();
    if (!session?.token) {
      return {
        success: false,
        message: "Authentication required",
        data: null
      };
    }

    const response = await api.get('/user/cards', {
      authorizationHeader: `Bearer ${session.token}`,
      showErrorToast: false
    });

    if (response.success) {
      return {
        success: true,
        message: response.message || "User cards fetched successfully",
        data: response.data
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to fetch user cards",
        data: null
      };
    }
  } catch (error) {
    console.error('Error fetching user cards:', error);
    return {
      success: false,
      message: error.message || "Failed to fetch user cards",
      data: null
    };
  }
}

export async function fetchStayHubDiscount(userId) {
  try {
    const session = await auth();
    if (!session?.token) {
      return {
        success: false,
        message: "Authentication required",
        data: null
      };
    }

    const response = await api.post('/admin/discount/sales/verify', { userId }, {
      authorizationHeader: `Bearer ${session.token}`,
      showErrorToast: false
    });

    if (response.success) {
      return {
        success: true,
        message: response.message || "StayHub discount verified successfully",
        data: response.data
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to verify StayHub discount",
        data: null
      };
    }
  } catch (error) {
    console.error('Error verifying StayHub discount:', error);
    return {
      success: false,
      message: error.message || "Failed to verify StayHub discount",
      data: null
    };
  }
}

export async function subscribePremiumProperties(subscriptionData) {
  try {
    console.log('🔧 Controller: Starting subscription API call...');
    console.log('🔧 Controller: Request data:', subscriptionData);
    
    const session = await auth();
    if (!session?.token) {
      console.log('❌ Controller: No authentication token found');
      return {
        success: false,
        message: "Authentication required",
        data: null
      };
    }

    console.log('🔧 Controller: Making API call to /property/subscribe/premium');
    console.log('🔧 Controller: Authorization header:', `Bearer ${session.token}`);

    const response = await api.post('/property/subscribe/premium', subscriptionData, {
      authorizationHeader: `Bearer ${session.token}`,
      showErrorToast: false
    });

    console.log('🔧 Controller: Raw API response:', response);

    if (response.success) {
      console.log('✅ Controller: API call successful');
      return {
        success: true,
        message: response.message || "Subscription created successfully",
        data: response.data,
        isRedirect: response.isRedirect || false
      };
    } else {
      console.log('❌ Controller: API call failed:', response.message);
      return {
        success: false,
        message: response.message || "Failed to create subscription",
        data: null,
        isRedirect: false
      };
    }
  } catch (error) {
    console.error('💥 Controller: Exception occurred:', error);
    return {
      success: false,
      message: error.message || "Failed to create premium subscription",
      data: null,
      isRedirect: false
    };
  }
} 