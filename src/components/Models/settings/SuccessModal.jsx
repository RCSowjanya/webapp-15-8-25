"use client";
import React from 'react';
import { FiCheckCircle, FiX, FiAlertCircle } from 'react-icons/fi';

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  title = "Success!", 
  message = "Operation completed successfully!",
  isSuccess = true,
  onContinue 
}) => {
  if (!isOpen) return null;

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex flex-col items-center p-6 pb-4 relative">
          {/* Icon - Centered on top */}
          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-4 ${
            isSuccess 
              ? 'border-green-500 bg-green-50' 
              : 'border-red-500 bg-red-50'
          }`}>
            {isSuccess ? (
              <FiCheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <FiAlertCircle className="w-6 h-6 text-red-500" />
            )}
          </div>
          
          {/* Title - Centered below icon */}
          <h2 className={`text-xl font-bold text-center mb-2 ${
            isSuccess ? 'text-gray-800' : 'text-red-600'
          }`}>{title}</h2>
          
          {/* Message */}
          <p className="text-gray-600 text-center">{message}</p>
          
          {/* Close Button - Positioned absolutely on the right */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Action Button */}
        <div className="px-6 pb-6">
          <button
            onClick={handleContinue}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isSuccess 
                ? 'bg-[#25A4E8] text-white hover:bg-[#1e8bc8]' 
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            {isSuccess ? 'Continue' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal; 