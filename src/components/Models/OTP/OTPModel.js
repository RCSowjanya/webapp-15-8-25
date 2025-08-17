// components/Models/OTP/OTPModel.js - OTP verification logic
import * as yup from 'yup';
import { toast } from 'react-toastify';
import api from "../../../utils/apiService";
import { signIn } from 'next-auth/react';

// OTP Validation Schema
export const otpValidationSchema = yup.object({
  otp: yup
    .string()
    .required('OTP is required')
    .matches(/^\d{4}$/, 'OTP must be exactly 4 digits')
    .length(4, 'OTP must be 4 digits'),
});

// Validate OTP
export const validateOTP = async (otp) => {
  try {
    await otpValidationSchema.validate({ otp }, { abortEarly: false });
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

// Phone Login API call
export const verifyOTPAndLogin = async (phone, countryCode, otp) => {
  try {
    const response = await api.post('/user/login/phone', {
      phone: phone,
      countryCode: countryCode,
      otp: parseInt(otp)
    }, {
      requireAuth: false,
      showSuccessToast: false, // We'll handle success manually
      showErrorToast: true,
      errorMessage: 'OTP verification failed. Please try again.'
    });

    return response;
  } catch (error) {
    console.error('OTP Verification Error:', error);
    throw error;
  }
};

// Resend OTP API call
export const resendOTP = async (phone, countryCode) => {
  try {
    const response = await api.post('/user/generateotp', {
      phone: phone,
      countryCode: countryCode
    }, {
      requireAuth: false,
      showSuccessToast: true,
      showErrorToast: true,
      successMessage: 'New OTP sent successfully!',
      errorMessage: 'Failed to resend OTP. Please try again.'
    });

    return response;
  } catch (error) {
    console.error('Resend OTP Error:', error);
    throw error;
  }
};

// Handle OTP Input Change
export const handleOTPInputChange = (index, value, otp, setOtp, setErrors) => {
  if (value.length <= 1 && /^\d*$/.test(value)) {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Clear errors when user starts typing
    if (setErrors) {
      setErrors({});
    }
    
    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
      if (nextInput) nextInput.focus();
    }
  }
};

// Handle Backspace in OTP Input
export const handleOTPKeyDown = (index, e, otp) => {
  if (e.key === 'Backspace' && !otp[index] && index > 0) {
    const prevInput = document.querySelector(`input[data-index="${index - 1}"]`);
    if (prevInput) prevInput.focus();
  }
};

// Main OTP Verification Handler
export const handleOTPVerification = async (
    phone,
    countryCode,
    otp,
    setIsLoading,
    setErrors,
    router
  ) => {
    setIsLoading(true);
    setErrors({});
  
    try {
      // Validate OTP format
      const otpString = otp.join('');
      const validation = await validateOTP(otpString);
  
      if (!validation.isValid) {
        setErrors(validation.errors);
        toast.error('Please enter a valid 4-digit OTP', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }
  
      // Call phone login API
      const response = await verifyOTPAndLogin(phone, countryCode, otpString);
      // Check if the response was successful at the top level
      if (!response?.data?.success) {
        toast.error(response?.data?.message || 'Please enter a valid 4-digit OTP Sent to Mobile', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }
  
      // Destructure the nested data
      const { data: { data: userData, token } } = response;
  
      // Sign in with NextAuth using credentials provider
      const authResult = await signIn('phone-credentials', {
        phone: phone,
        countryCode: countryCode,
        token: token,
        userData: JSON.stringify(userData),
        redirect: false
      });
  
      if (authResult?.ok) {
        // Success - user logged in
        toast.success(`Welcome ${userData.fname || 'User'}! 🎉`, {
          position: 'top-right',
          autoClose: 3000,
        });
  
        // Clear OTP related data
        localStorage.removeItem('otpCountryCode');
        localStorage.removeItem('userType');
  
      
          router.push('/livefeed');
      
      } else {
        throw new Error('Authentication failed');
      }
  
    } catch (error) {
      console.error('OTP Verification Error:', error);
      
      // Handle specific error cases
      if (error.message.includes('401') || error.message.includes('invalid')) {
        toast.error('Invalid OTP. Please try again.', {
          position: 'top-right',
          autoClose: 3000,
        });
        setErrors({ otp: 'Invalid OTP' });
      } else if (error.message.includes('expired')) {
        toast.error('OTP has expired. Please request a new one.', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        toast.error('Verification failed. Please try again.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

// Handle Resend OTP
export const handleResendOTP = async (phone, countryCode, setIsResending) => {
  setIsResending(true);

  try {
    const response = await resendOTP(phone, countryCode);

    if (response.success) {
      // Update the URL parameter with new timestamp
      const timestamp = Date.now();
      const dataString = `${phone}-${timestamp}`;
      const base64Data = btoa(dataString);
      
      // Update browser URL without page reload
      window.history.replaceState(null, null, `/otp?data=${base64Data}`);
      
      toast.success('New OTP sent successfully! 📱', {
        position: 'top-right',
        autoClose: 3000,
      });
      
      return true;
    } else {
      throw new Error(response.message || 'Failed to resend OTP');
    }

  } catch (error) {
    console.error('Resend OTP Error:', error);
    toast.error('Failed to resend OTP. Please try again.', {
      position: 'top-right',
      autoClose: 3000,
    });
    return false;
  } finally {
    setIsResending(false);
  }
};