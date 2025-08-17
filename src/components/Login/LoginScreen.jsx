"use client";

import React, { useState, useTransition } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import LoginSlider from "./LoginSlider";
import {
  handlePhoneChange,
  handleCountrySelect,
  handleUserTypeChange,
  handleContinue} from "../Models/Login/LoginModel";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const LoginScreen = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [userType, setUserType] = useState("host");
  const [selectedCountry, setSelectedCountry] = useState({ code: "+966", label: "SA", name: "Saudi Arabia" });
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [hostPhone, setHostPhone] = useState(""); // Phone state for host
  const [invitedPhone, setInvitedPhone] = useState(""); // Phone state for invited user

  // Error states
  const [errors, setErrors] = useState({});

  const countryOptions = [
    { code: "+966", label: "SA", name: "Saudi Arabia" },
    { code: "+91", label: "IN", name: "India" },
    { code: "+1", label: "CA", name: "Canada" },
    { code: "+61", label: "AU", name: "Australia" },
    { code: "+44", label: "GB", name: "United Kingdom" },
  ];

  // ✅ Fixed: Use useTransition to handle async operations properly
  const onContinueClick = () => {
    startTransition(async () => {
      try {
        // console.log("selectedCountry",selectedCountry)
        // console.log("hostPhone",hostPhone)
        await handleContinue(
          userType,
          hostPhone,
          invitedPhone,
          selectedCountry,
          setErrors,
          setIsLoading,
          router
        );
        
        // For both host and invited users, proceed to OTP
        const timestamp = Date.now();
        const phone = userType === 'host' ? hostPhone : invitedPhone;
        const countryCode = userType === 'host' ? '+966' : selectedCountry?.code;
        
        const dataString = `${phone}-${countryCode}-${timestamp}`;
        const base64Data = btoa(dataString); // Convert to base64

        // Navigate to OTP page with base64 parameter
        router.push(`/otp/${base64Data}`);
      } catch (error) {
        console.error('Continue error:', error);
        setIsLoading(false);
      }
    });
  };

  // Loading state combines both isPending and isLoading
  const isSubmitting = isPending || isLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white overflow-y-auto ">
      <div className="flex flex-grow  shadow-3xl max-[1000px]:flex-col h-[100vh] w-[100vw]  border border-gray-200   overflow-hidden">
        {/* Left Panel */}
        <LoginSlider />

        {/* Right Panel */}
        <div className="w-1/2 max-[1000px]:w-full max-[1000px]:h-full bg-white px-[9rem] max-[1000px]:px-[5rem] flex flex-col justify-center">
          <div className="text-center space-y-2">
            <h3 className="text-md text-[#7C69E8] font-medium">Welcome to</h3>
            <img
              src="/images/stayhub-logo.svg"
              alt="logo"
              className="w-33 h-auto mx-auto pb-8"
            />
          </div>

          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 rounded-full p-1 mb-6">
            <button
              onClick={() => handleUserTypeChange("host", setUserType, setErrors)}
              disabled={isSubmitting}
              className={`flex-1 text-center py-2 rounded-full transition cursor-pointer ${userType === "host"
                  ? "bg-[#25A4E8] text-white shadow-md font-semibold"
                  : "text-gray-600"
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Host
            </button>
            <button
              onClick={() => handleUserTypeChange("invited", setUserType, setErrors)}
              disabled={isSubmitting}
              className={`flex-1 text-center py-2 rounded-full transition cursor-pointer ${userType === "invited"
                  ? "bg-[#25A4E8] text-white shadow-md font-semibold"
                  : "text-gray-600"
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Invited User
            </button>
          </div>

          {/* Phone No Label */}
          <label className="text-sm mb-2 text-gray-700">Phone No.</label>

          {/* Phone Input */}
          <div className="relative mb-4">
            {userType === "invited" ? (
              <div className={`flex items-center border rounded-md bg-gray-100 px-3 py-2 w-full ${errors.invitedPhone || errors.selectedCountry
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300'
                }`}>
                {/* Country Code + Dropdown */}
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  disabled={isSubmitting}
                  className={`flex items-center gap-1 text-md font-500 text-[#000113] focus:outline-none ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  <span className="mr-1">{selectedCountry.label}</span>
                  <span>{selectedCountry.code}</span>
                  <IoMdArrowDropdown className="text-gray-600 text-md cursor-pointer" />
                </button>

                {/* Vertical Divider */}
                <div className="h-6 border-l border-gray-300 mx-3" />

                {/* Phone Number Input */}
                <input
                  type="text"
                  placeholder="5xx xxxx xx"
                  value={invitedPhone}
                  disabled={isSubmitting}
                  onChange={(e) => handlePhoneChange(e, userType, setHostPhone, setInvitedPhone, errors, setErrors)}
                  className={`flex-1 bg-transparent text-md focus:outline-none text-[#3F3E3E] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                />

                {/* Dropdown */}
                {showDropdown && !isSubmitting && (
                  <div className="absolute left-0 top-[100%] mt-2 bg-white border border-gray-200 rounded-md shadow-md w-72 h-46 overflow-auto p-2 z-10">
                    {/* Search Bar */}
                    <div className="flex items-center gap-2 p-2 rounded-md bg-gray-100">
                      <FaSearch className="text-gray-400 text-sm" />
                      <input
                        type="text"
                        placeholder="Search country name or code"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full text-sm bg-gray-100 focus:outline-none"
                      />
                    </div>

                    {/* Country List */}
                    <div className="max-h-48 overflow-y-auto">
                      {countryOptions.length > 0 ? (
                        countryOptions.map((country, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleCountrySelect(country, setSelectedCountry, setShowDropdown, setSearchTerm, errors, setErrors)}
                            className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          >

                            <div className="w-8 text-center">
                              <span>{country.code}</span>
                            </div>


                            <div className="flex-1 pl-3">
                              <span>{country.label} - {country.name}</span>
                            </div>


                            {selectedCountry.label === country.label && (
                              <FaCheckCircle className="text-[#25A4E8] text-lg" />
                            )}
                          </div>

                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-400 text-sm">No results found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`flex items-center border rounded-md bg-gray-100 px-3 py-2 w-full ${errors.hostPhone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}>
                <span className="text-md font-500 text-[#000113]">+966</span>
                <div className="h-6 border-l border-gray-300 mx-3" />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={hostPhone}
                  disabled={isSubmitting}
                  onChange={(e) => handlePhoneChange(e, userType, setHostPhone, setInvitedPhone, errors, setErrors)}
                  placeholder="5xx xxxx xx"
                  className={`flex-1 bg-transparent text-md focus:outline-none text-[#3F3E3E] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                />
              </div>
            )}
          </div>

          {/* Error Messages */}
          {(errors.hostPhone || errors.invitedPhone || errors.selectedCountry) && (
            <div className="mb-4">
              {errors.hostPhone && (
                <p className="text-sm text-red-600 flex items-center mb-1">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.hostPhone}
                </p>
              )}
              {errors.invitedPhone && (
                <p className="text-sm text-red-600 flex items-center mb-1">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.invitedPhone}
                </p>
              )}
              {errors.selectedCountry && (
                <p className="text-sm text-red-600 flex items-center mb-1">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.selectedCountry}
                </p>
              )}
            </div>
          )}

          {/* Continue Button - ✅ Fixed with useTransition */}
          <button
            onClick={onContinueClick}
            disabled={isSubmitting}
            className={`text-white py-2 mt-6 rounded-full border font-semibold shadow transition cursor-pointer ${isSubmitting
                ? 'bg-gray-400 border-gray-400 cursor-not-allowed'
                : 'bg-[#25A4E8] border-[#34AAEA] hover:bg-[#1d8bd6]'
              }`}
          >
            {isSubmitting ? (
              <div className="flex items-center  justify-center cursor-pointer">
                <AiOutlineLoading3Quarters className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Please wait...
              </div>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
</div>
  );
};

export default LoginScreen;