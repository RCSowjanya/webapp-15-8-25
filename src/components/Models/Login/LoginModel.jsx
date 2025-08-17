// loginLogic.js - All validation schemas and handlers with API integration
import * as yup from 'yup';
import { toast } from 'react-toastify';
import api from "../../../utils/apiService";

// Validation Schemas
export const hostLoginSchema = yup.object({
  hostPhone: yup
    .string()
    .required('Phone number is required')
    .matches(/^\d+$/, 'Phone number must contain only digits')
    .min(8, 'Phone number must be at least 9 digits')
    .max(9, 'Phone number cannot exceed 15 digits')
    .matches(/^5\d{7,8}$/, 'Phone number must start with 5 and be 9 digits long'),
});

export const invitedUserLoginSchema = yup.object({
  invitedPhone: yup
    .string()
    .required('Phone number is required')
    .matches(/^\d+$/, 'Phone number must contain only digits')
    .min(7, 'Phone number must be at least 7 digits')
    .max(15, 'Phone number cannot exceed 15 digits'),
  selectedCountry: yup
    .object({
      code: yup.string().required(),
      label: yup.string().required(),
      name: yup.string().required(),
    })
    .required('Please select a country code'),
});

// Validation Function
export const validateLoginForm = async (userType, formData) => {
  try {
    if (userType === 'host') {
      await hostLoginSchema.validate(formData, { abortEarly: false });
    } else {
      await invitedUserLoginSchema.validate(formData, { abortEarly: false });
    }
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      error.inner.forEach(err => {
        validationErrors[err.path] = err.message;
      });
      return { isValid: false, errors: validationErrors };
    }
    throw error;
  }
};

// Event Handlers
export const handlePhoneChange = (e, userType, setHostPhone, setInvitedPhone, errors, setErrors) => {
  const value = e.target.value;
  if (/^\d*$/.test(value)) {
    if (userType === "host") {
      setHostPhone(value);
      // Clear host phone error when typing
      if (errors.hostPhone) {
        setErrors(prev => ({
          ...prev,
          hostPhone: ''
        }));
      }
    } else {
      setInvitedPhone(value);
      // Clear invited phone error when typing
      if (errors.invitedPhone) {
        setErrors(prev => ({
          ...prev,
          invitedPhone: ''
        }));
      }
    }
  }
};

export const handleCountrySelect = (country, setSelectedCountry, setShowDropdown, setSearchTerm, errors, setErrors) => {
  setSelectedCountry(country);
  setShowDropdown(false);
  setSearchTerm("");
  
  // Clear country error when selected
  if (errors.selectedCountry) {
    setErrors(prev => ({
      ...prev,
      selectedCountry: ''
    }));
  }
};

export const handleUserTypeChange = (type, setUserType, setErrors) => {
  setUserType(type);
  // Clear errors when switching tabs
  setErrors({});
};

// API call function to generate OTP - Fixed to prevent uncached promises
export const generateOTP = async (phone, countryCode) => {
  try {
    // Wrap the API call to ensure proper promise handling
    const apiCall = () => api.post('/user/generateotp', {
      phone: phone,
      countryCode: countryCode
    }, {
      requireAuth: false, // No auth needed for OTP generation
      showSuccessToast: false, // Handle toasts manually
      showErrorToast: false,
    });

    const response = await apiCall();
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

// API call function to register invited user
export const registerInvitedUser = async (userData) => {
  try {
    console.log("Registering invited user with data:", userData);
    
    const response = await api.post('/user/manage/add', userData, {
      requireAuth: false, // No auth needed for user registration
      showSuccessToast: false, // Handle toasts manually
      showErrorToast: false,
    });

    console.log("Invited User Registration Response:", response);
    return response;
  } catch (error) {
    console.error('Invited User Registration Error:', error);
    // Return a structured error response instead of throwing
    return {
      success: false,
      error: error.message || 'Network error',
      message: 'Failed to register invited user. Please check your connection and try again.'
    };
  }
};

export const handleContinue = async (
  userType, 
  hostPhone, 
  invitedPhone, 
  selectedCountry, 
  setErrors, 
  setIsLoading,
  router
) => {
  // Clear errors and set loading state
 // console.log('handleContinue',hostPhone);
  setErrors({});
  setIsLoading(true);

  try {
    // Prepare form data based on user type
    const formData = userType === 'host' 
      ? { hostPhone }
      : { invitedPhone, selectedCountry };

    // Validate form
    const validation = await validateLoginForm(userType, formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please fix the errors below', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Prepare API request data
    let phone, countryCode;
    
    if (userType === 'host') {
      phone = hostPhone;
      countryCode = '+966'; // Fixed for host (Saudi Arabia)
    } else {
      phone = invitedPhone;
      countryCode = selectedCountry.code;
    }

    // For both host and invited users, generate OTP
    const response = await generateOTP(phone, countryCode);

    if (response && response.success) {
      // Success - API call successful
     // console.log('OTP Generation Response:', response.data);
      
      toast.success(`OTP sent to ${countryCode} ${phone}! 📱`, {
        position: 'top-right',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
     
     // return;
    } else {
      // API call failed
      console.error('OTP Generation Failed:', response?.error || 'Unknown error');
      toast.error(response?.message || 'Failed to send OTP. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    toast.error('Something went wrong. Please try again.', {
      position: 'top-right',
      autoClose: 3000,
    });
  } finally {
    setIsLoading(false);
  }
};

// Filter Countries Function
export const filterCountries = async (countryOptions, searchTerm) => {
  return countryOptions.filter((country) =>
    country.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.includes(searchTerm)
  );
};