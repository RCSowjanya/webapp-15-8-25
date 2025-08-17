import React from 'react';
import { FiX, FiInfo } from 'react-icons/fi';

const UnsubscribeModel = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  propertyName, 
  billingEndDate, 
  isLoading = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
          {/* Header */}
          <div className="flex flex-col items-center p-6 pb-4 relative">
            {/* Info Icon - Centered on top */}
            <div className="w-10 h-10 rounded-full border-2 border-orange-500 bg-white flex items-center justify-center mb-3">
              <FiInfo className="w-5 h-5 text-orange-500" />
            </div>
            
            {/* Title - Centered below icon */}
            <h2 className="text-xl font-bold text-gray-800 text-center">Confirm Unsubscription</h2>
            
            {/* Close Button - Positioned absolutely on the right */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="text-gray-700 space-y-3 mb-6">
            <p>
              Are you sure you want to unsubscribe <span className="font-semibold">{propertyName}</span> from Premium?
            </p>
            <p>
              Your premium access will remain active until <span className="font-semibold">{billingEndDate}</span>. 
              After that,all Premium features will be disabled.
            </p>
           
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full bg-[#25A4E8] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#25A4E8] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processing...' : 'Confirm & Unsubscribe'}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full bg-white text-gray-700 py-3 cursor-pointer px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsubscribeModel;
