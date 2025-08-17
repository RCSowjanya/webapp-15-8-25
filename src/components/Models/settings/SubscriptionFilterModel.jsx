"use client";
import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { AiOutlineTag } from "react-icons/ai";
const SubscriptionFilterModel = ({ isOpen, onClose, onApplyFilters, selectedFilters }) => {
  const [selectedStatuses, setSelectedStatuses] = useState(selectedFilters || []);

  const subscriptionStatuses = [
    {
      id: "premium",
      label: "Premium",
      image: "/images/expiring-licence.svg",
      icon: null,
      description: "Active premium subscription"
    },
    {
      id: "free-trial",
      label: "Free Trial",
      image: "/images/sub-trial.svg",
      icon: <AiOutlineTag className="w-6 h-6 text-gray-500" />,
      description: "Currently on free trial"
    },
    {
      id: "expiring",
      label: "Expiring Subscription",
      image: "/images/sub-expiry.svg",
      icon: <AiOutlineTag className="w-4 h-4 text-[#654EE4]" />,
      description: "Subscription expiring soon"
    },
    {
      id: "expired",
      label: "Expired",
      image: "/images/sub-expired.svg",
      icon: null,
      description: "Subscription has expired"
    },
    {
      id: "payment-failed",
      label: "Payment failed",
      image: "/images/sub-payment.svg",
      icon: <AiOutlineTag className="w-4 h-4 text-[#654EE4]" />,
      description: "Payment processing failed"
    },
    {
      id: "cancelled",
      label: "Cancelled",
      image: "/images/sub-cancel.svg",
      icon: null,
      description: "Subscription has been cancelled"
    }
  ];

  const handleStatusChange = (statusId) => {
    setSelectedStatuses(prev => {
      if (prev.includes(statusId)) {
        // Remove if already selected
        return prev.filter(id => id !== statusId);
      } else {
        // Add if not selected
        return [...prev, statusId];
      }
    });
  };

  const handleReset = () => {
    setSelectedStatuses([]);
  };

  const handleSubmit = () => {
    const filters = {
      subscriptionStatus: selectedStatuses
    };
    onApplyFilters(filters);
    onClose();
  };

  const handleClose = () => {
    setSelectedStatuses([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 overflow-y-auto max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#5940C8]">
            Filter by Subscription Status
            {selectedStatuses.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">({selectedStatuses.length} selected)</span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            {selectedStatuses.length > 0 && (
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
              >
                Reset
              </button>
            )}
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Subscription Status Options */}
          <div className="mb-6">
               <div className="overflow-hidden">
              {subscriptionStatuses.map((status, index) => (
                <div key={status.id}>
                  <div
                    className={`flex items-center justify-between py-4 px-4 transition-colors cursor-pointer ${
                      selectedStatuses.includes(status.id)
                        ? "bg-[#F4F8FF]" 
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleStatusChange(status.id)}
                  >
                    {/* Left Side - Label Only */}
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-800">{status.label}</span>
                    </div>
                    
                    {/* Right Side - Image or Icon */}
                    <div className="flex items-center">
                      {status.image ? (
                        <img 
                          src={status.image} 
                          alt={status.label} 
                          className="w-5 h-5"
                        />
                      ) : status.icon ? (
                        status.icon
                      ) : (
                        <div className="w-5 h-5 bg-gray-200 rounded"></div>
                      )}
                    </div>
                  </div>
                  
                  {/* Dotted line separator (except for last item) */}
                  {index < subscriptionStatuses.length - 1 && (
                    <div className="border-b border-dotted border-blue-200"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-4">
            <button
              onClick={handleSubmit}
              className="w-full px-8 py-3 bg-[#25A4E8] cursor-pointer text-white rounded-lg transition-colors font-medium text-sm hover:bg-[#1e8bc8]"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionFilterModel; 