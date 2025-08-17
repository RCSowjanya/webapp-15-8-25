// apiService.js - Simple API utility with conditional authorization
import { toast } from 'react-toastify';

class ApiService {
  constructor() {
    // Get base URL from environment variable and ensure it doesn't end with a slash
    this.baseURL = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/+$/, '');
    
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Build URL with search params
  buildURL(endpoint, searchParams = {}) {
    // Ensure endpoint starts with a slash and doesn't have /api prefix
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const finalEndpoint = cleanEndpoint.replace(/^\/api/, '');
    
    let url = `${this.baseURL}${finalEndpoint}`;
    console.log('API URL Construction:', {
      baseURL: this.baseURL,
      endpoint: finalEndpoint,
      finalURL: url
    });
    
    // Add search/query parameters
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, item));
        } else {
          params.append(key, value);
        }
      }
    });

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    return url;
  }

  // Get auth token from localStorage
  getAuthToken() {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('accessToken');
    }
    return null;
  }

  // Prepare headers with conditional authorization
  prepareHeaders(customHeaders = {}, requireAuth = false, authorizationHeader = null) {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    // Priority: 1. Custom authorization header, 2. Token from localStorage if requireAuth is true
    if (authorizationHeader) {
      headers.Authorization = authorizationHeader;
    } else if (requireAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  // Main API method
  async apiCall({
    endpoint,
    method = 'GET',
    body = null,
    headers = {},
    searchParams = {},
    requireAuth = false,
    authorizationHeader = null,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation successful!',
    errorMessage = null,
    timeout = 30000
  }) {
    try {
      const url = this.buildURL(endpoint, searchParams);
      const finalHeaders = this.prepareHeaders(headers, requireAuth, authorizationHeader);
      
      console.log('Making API request:', {
        url,
        method,
        headers: finalHeaders,
        body: body ? JSON.stringify(body) : null
      });

      const config = {
        method: method.toUpperCase(),
        headers: finalHeaders,
      };

      // Add body for non-GET requests
      if (body && !['GET', 'HEAD'].includes(method.toUpperCase())) {
        if (body instanceof FormData) {
          // Remove Content-Type for FormData
          delete config.headers['Content-Type'];
          config.body = body;
        } else if (typeof body === 'object') {
          config.body = JSON.stringify(body);
        } else {
          config.body = body;
        }
      }

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout);
      });

      // Make the request
      const response = await Promise.race([
        fetch(url, config),
        timeoutPromise
      ]);

      console.log('API Response status:', response.status);

      // Handle response
      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`${response.status}: ${response.statusText} - ${errorData}`);
      }

      // Parse response based on content type
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
        console.log('Parsed JSON response:', data);
      } else if (contentType?.includes('text/')) {
        data = await response.text();
        console.log('Text response:', data);
      } else {
        data = await response.blob();
        console.log('Blob response received');
      }

      return {
        success: true,
        data,
        status: response.status,
        message: 'Request successful'
      };

    } catch (error) {
      console.error('API Error:', {
        error,
        message: error.message,
        stack: error.stack
      });
      
      // Show error toast if enabled
      if (showErrorToast) {
        const message = errorMessage || this.getErrorMessage(error);
        toast.error(message);
      }

      return {
        success: false,
        error: error.message,
        status: error.status || 0,
        message: error.message
      };
    }
  }

  // Get user-friendly error message
  getErrorMessage(error) {
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return 'Network error. Please check your connection.';
    }
    if (error.message.includes('401')) {
      return 'Unauthorized. Please login again.';
    }
    if (error.message.includes('403')) {
      return 'Access denied. You do not have permission.';
    }
    if (error.message.includes('404')) {
      return 'Resource not found.';
    }
    if (error.message.includes('500')) {
      return 'Server error. Please try again later.';
    }
    return error.message || 'Something went wrong. Please try again.';
  }

  // Test if API server is reachable
  async testServerReachability() {
    try {
      console.log('🔍 Debug: Testing API server reachability...');
      console.log('🔍 Debug: Base URL:', this.baseURL);
      
      // Try a simple request to see if server responds
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000
      });
      
      console.log('🔍 Debug: Server response status:', response.status);
      return response.ok;
    } catch (error) {
      console.error('🔍 Debug: Server reachability test failed:', error);
      return false;
    }
  }

  // Utility function to format dates for API
  formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00.000+00:00`;
  }

  // GET method
  async get(endpoint, {
    searchParams = {},
    requireAuth = false,
    authorizationHeader = null,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Data retrieved successfully!',
    errorMessage = null,
    ...options
  } = {}) {
    return this.apiCall({
      endpoint,
      method: 'GET',
      searchParams,
      requireAuth,
      authorizationHeader,
      showSuccessToast,
      showErrorToast,
      successMessage,
      errorMessage,
      ...options
    });
  }

  // POST method
  async post(endpoint, body = null, {
    requireAuth = false,
    authorizationHeader = null,
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = 'Created successfully!',
    errorMessage = null,
    ...options
  } = {}) {
    console.log(endpoint)
    return this.apiCall({
      endpoint,
      method: 'POST',
      body,
      requireAuth,
      authorizationHeader,
      showSuccessToast,
      showErrorToast,
      successMessage,
      errorMessage,
      ...options
    });
  }

  // PUT method
  async put(endpoint, body = null, {
    requireAuth = false,
    authorizationHeader = null,
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = 'Updated successfully!',
    errorMessage = null,
    ...options
  } = {}) {
    return this.apiCall({
      endpoint,
      method: 'PUT',
      body,
      requireAuth,
      authorizationHeader,
      showSuccessToast,
      showErrorToast,
      successMessage,
      errorMessage,
      ...options
    });
  }

  // PATCH method
  async patch(endpoint, body = null, {
    requireAuth = false,
    authorizationHeader = null,
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = 'Updated successfully!',
    errorMessage = null,
    ...options
  } = {}) {
    return this.apiCall({
      endpoint,
      method: 'PATCH',
      body,
      requireAuth,
      authorizationHeader,
      showSuccessToast,
      showErrorToast,
      successMessage,
      errorMessage,
      ...options
    });
  }

  // DELETE method
  async delete(endpoint, {
    requireAuth = false,
    authorizationHeader = null,
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = 'Deleted successfully!',
    errorMessage = null,
    ...options
  } = {}) {
    return this.apiCall({
      endpoint,
      method: 'DELETE',
      requireAuth,
      authorizationHeader,
      showSuccessToast,
      showErrorToast,
      successMessage,
      errorMessage,
      ...options
    });
  }

  // File upload
  async upload(endpoint, file, additionalData = {}, {
    requireAuth = true,
    authorizationHeader = null,
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = 'File uploaded successfully!',
    errorMessage = 'File upload failed.',
    ...options
  } = {}) {
    const formData = new FormData();
    
    if (file instanceof File) {
      formData.append('file', file);
    } else if (Array.isArray(file)) {
      file.forEach((f, index) => {
        formData.append(`files`, f);
      });
    }

    // Add additional form data
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    return this.apiCall({
      endpoint,
      method: 'POST',
      body: formData,
      requireAuth,
      authorizationHeader,
      showSuccessToast,
      showErrorToast,
      successMessage,
      errorMessage,
      ...options
    });
  }

  // Download file
  async download(endpoint, filename, {
    requireAuth = true,
    authorizationHeader = null,
    searchParams = {},
    showErrorToast = true,
    errorMessage = 'Download failed.',
    ...options
  } = {}) {
    try {
      const response = await this.apiCall({
        endpoint,
        method: 'GET',
        searchParams,
        requireAuth,
        authorizationHeader,
        showSuccessToast: false,
        showErrorToast: false,
        ...options
      });

      if (response.success) {
        // Create blob and download
        const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error(response.message);
      }

      return response;
    } catch (error) {
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      throw error;
    }
  }
}

// Create and export single instance
const api = new ApiService();
export default api;

// Example usage:
/*
// Environment setup (.env file):
// NEXT_PUBLIC_API_BASE_URL=https://your-api.com/api
// or
// REACT_APP_API_BASE_URL=https://your-api.com/api

// Basic usage:

// GET without auth
const users = await api.get('/users', {
  searchParams: { page: 1, limit: 10 }
});

// GET with auth (token from localStorage)
const profile = await api.get('/profile', {
  requireAuth: true
});

// GET with custom authorization header (takes priority over localStorage token)
const customAuth = await api.get('/profile', {
  authorizationHeader: 'Bearer your-custom-token-here'
});

// GET with API key authorization
const apiKeyAuth = await api.get('/data', {
  authorizationHeader: 'API-Key your-api-key-here'
});

// POST with custom authorization
const result = await api.post('/users', {
  name: 'John',
  email: 'john@example.com'
}, {
  authorizationHeader: 'Bearer custom-token',
  successMessage: 'User created successfully!'
});

// PUT with Basic auth
const updated = await api.put('/users/123', userData, {
  authorizationHeader: 'Basic ' + btoa('username:password'),
  errorMessage: 'Failed to update user profile'
});

// DELETE with custom token
const deleted = await api.delete('/users/123', {
  authorizationHeader: 'Bearer specific-token-for-delete'
});

// File upload with custom auth
const uploadResult = await api.upload('/upload', file, {
  category: 'profile'
}, {
  authorizationHeader: 'Bearer upload-specific-token'
});

// Download file with API key
await api.download('/reports/123', 'report.pdf', {
  authorizationHeader: 'X-API-Key your-api-key'
});

// Mixed usage - fallback to localStorage if no custom header provided
const mixedAuth = await api.get('/profile', {
  requireAuth: true, // Will use localStorage token
  // authorizationHeader: 'Bearer custom' // If provided, this takes priority
});
*/