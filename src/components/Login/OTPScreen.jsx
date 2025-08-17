"use client";

import React, { useState, useEffect } from "react";
import LoginSlider from "./LoginSlider";
import { useRouter } from "next/navigation";
import {
  handleOTPInputChange,
  handleOTPKeyDown,
  handleOTPVerification,
  handleResendOTP
} from "../../components/Models/OTP/OTPModel";
// Timeout Error Component
const TimeoutError = ({ onRetry }) => (
  <div className="text-center space-y-6">
    {/* Timeout SVG Icon */}
    <div className="flex justify-center mb-4">
      <svg 
        width="80" 
        height="80" 
        viewBox="0 0 24 24" 
        fill="none" 
        className="text-red-500"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 16L8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
    
    <h2 className="text-red-500 text-xl font-semibold mb-3">Session Expired</h2>
    
    <p className="text-md text-gray-700 mb-6">
      Your OTP session has timed out. <br />
      Please request a new OTP to continue.
    </p>
    
    <button 
      onClick={onRetry}
      className="bg-[#25A4E8] font-lg font-bold text-white w-[60%] py-2 rounded-full shadow hover:bg-[#1e8bc3] transition-colors"
    >
      Request New OTP
    </button>
  </div>
);

// OTP Input Component
const OTPInput = ({ phone, countryCode, onVerify, onResend, isLoading, errors, isResending }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  
  const handleInputChange = (index, value) => {
    handleOTPInputChange(index, value, otp, setOtp);
  };
  
  const handleKeyDown = (index, e) => {
    handleOTPKeyDown(index, e, otp);
  };

  const handleVerify = () => {
    onVerify(otp);
  };

  const handleResendClick = () => {
    onResend();
    // Clear OTP inputs after resend
    setOtp(['', '', '', '']);
  };
  
  return (
    <div className="text-center space-y-2">
      <h2 className="text-[#7C69E8] text-lg font-semibold mb-3">Verify</h2>

      {/* Description */}
      <p className="text-md text-gray-700 mb-6">
        Please enter the code we sent to <br />
        <span className="font-bold text-black">{countryCode} {phone}</span>
      </p>

      {/* OTP Inputs */}
      <div className="flex justify-center gap-3 mb-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            data-index={index}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`w-12 h-12 text-center text-lg border-2 rounded-md focus:outline-none focus:border-blue-500 ${
              errors.otp ? 'border-red-500 bg-red-50' : 'border-[#B8D2E0]'
            }`}
            disabled={isLoading}
          />
        ))}
      </div>

      {/* Error Message */}
      {errors.otp && (
        <div className="mb-4">
          <p className="text-sm text-red-600 flex items-center justify-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.otp}
          </p>
        </div>
      )}

      {/* Resend Link */}
      <p className="text-md text-[#575757] mb-2">Didn't Receive the Code ?</p>
      <button 
        onClick={handleResendClick}
        disabled={isResending}
        className="text-[#25A4E8] text-md w-full font-semibold mb-6 hover:underline disabled:opacity-50"
      >
        {isResending ? 'Sending...' : 'Resend Code'}
      </button>

      {/* Verify Button */}
      <button 
        onClick={handleVerify}
        className={`font-lg font-bold text-white w-[50%] py-2 rounded-full shadow transition-colors ${
          isLoading || otp.join('').length !== 4
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#25A4E8] hover:bg-[#1e8bc3]'
        }`}
        disabled={isLoading || otp.join('').length !== 4}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verifying...
          </div>
        ) : (
          'Verify'
        )}
      </button>
    </div>
  );
};

const OTPScreen = ({ mobileparam }) => {
  const router = useRouter();
  const [isExpired, setIsExpired] = useState(false);
  const [phoneData, setPhoneData] = useState({ phone: '', countryCode: '', timestamp: null });
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    try {
      // Decode the base64 parameter
      const decodedData = atob(decodeURIComponent(mobileparam));
      const parts = decodedData.split('-');
      console.log(parts);
      let phone, countryCode, timestamp;
      
      if (parts.length === 3) {
        // New format: phone-countryCode-timestamp
        [phone, countryCode, timestamp] = parts;
      } else if (parts.length === 2) {
        // Old format: phone-timestamp (fallback)
        [phone, timestamp] = parts;
        // Get country code from localStorage
        countryCode = localStorage.getItem('otpCountryCode') || '+966';
      } else {
        throw new Error('Invalid data format');
      }
      // Check if timestamp is valid
      const otpTimestamp = parseInt(timestamp);
      const currentTime = Date.now();
      const timeDifference = (currentTime - otpTimestamp) / 1000; // Convert to seconds
      
     // console.log('Time difference:', timeDifference, 'seconds');
      
      if (timeDifference > 600) { // 10 minutes timeout
        setIsExpired(true);
      } else {
        setIsExpired(false);
        setPhoneData({ 
          phone, 
          countryCode,
          timestamp: otpTimestamp 
        });
      }
    } catch (error) {
      console.error('Error decoding mobile parameter:', error);
      setIsExpired(true);
    }
  }, [mobileparam]);

  const handleRetry = () => {
    // Navigate back to login page to request new OTP
    router.push('/login');
  };

  const handleVerify = async (otp) => {
   // console.log(phoneData)
    await handleOTPVerification(
      phoneData.phone,
      phoneData.countryCode,
      otp,
      setIsLoading,
      setErrors,
      router
    );
  };

  const handleResend = async () => {
    const success = await handleResendOTP(
      phoneData.phone,
      phoneData.countryCode,
      setIsResending
    );
    
    if (success) {
      // Reset any existing errors
      setErrors({});
      // Reset expiry state
      setIsExpired(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white ">
      <div className="flex shadow-3xl p-2 max-[1000px]:flex-col w-[100vw] h-[100vh] shadow-xl border border-gray-200 rounded-xl overflow-hidden">
        {/* Left panel */}
        <LoginSlider />
        
        {/* Right panel */}
        <div className="w-1/2 bg-white p-9 max-[1000px]:w-full max-[1000px]:h-full flex flex-col justify-center">
          {isExpired ? (
            <TimeoutError onRetry={handleRetry} />
          ) : (
            <OTPInput 
              phone={phoneData.phone} 
              countryCode={phoneData.countryCode}
              onVerify={handleVerify}
              onResend={handleResend}
              isLoading={isLoading}
              errors={errors}
              isResending={isResending}
            />
          )}
          
          <div className="text-center">
            <a href="/login">
              <p className="text-[#25A4E8] mt-8 text-sm font-semibold hover:underline">
                Change Mobile Number
              </p>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OTPScreen;