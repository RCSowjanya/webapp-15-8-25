"use client";
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { fetchDiscountList } from "../../Controller/settings/subscriptionPlanController";

const AvailableCouponsModel = ({ isOpen, onClose, onApplyCoupon }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // Fetch coupons when modal opens
  useEffect(() => {
    const getCoupons = async () => {
      if (isOpen) {
        try {
          setLoading(true);
          const result = await fetchDiscountList();
          
          if (result.success && result.data) {
            // Handle nested data structure like subscription plans
            const couponsData = result.data.data || result.data;
            setCoupons(couponsData);
          } else {
            setCoupons([]);
          }
        } catch (error) {
          console.error('Error fetching coupons:', error);
          setCoupons([]);
        } finally {
          setLoading(false);
        }
      }
    };

    getCoupons();
  }, [isOpen]);

  const handleApplyCoupon = () => {
    if (selectedCoupon && onApplyCoupon) {
      onApplyCoupon(selectedCoupon);
      onClose();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#312285]">Available Coupons</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-600 cursor-pointer" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading coupons...</div>
            </div>
          ) : coupons.length > 0 ? (
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedCoupon?._id === coupon._id
                      ? 'bg-gray-50 border-2 border-[#6650E4]'
                      : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCoupon(coupon)}
                >
                  {/* Coupon Code */}
                  <div className="font-bold text-gray-800 text-lg mb-2">
                    {coupon.coupenCode}
                  </div>
                  
                  {/* Pricing Details Only */}
                  <div className="text-sm text-gray-600">
                    {coupon.discountType === 'Fixed' && coupon.discountAmount && (
                      <div className="flex gap-6">
                        <div>Monthly: SAR {coupon.discountAmount.monthly}</div>
                        <div> Yearly: SAR {coupon.discountAmount.annual}</div>
                      </div>
                    )}
                    
                    {coupon.discountType === 'Percentage' && (
                      <div>Get {coupon.discountAmount}% off on Annual Plans</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500">No coupons available</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleApplyCoupon}
            disabled={!selectedCoupon}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              selectedCoupon
                ? 'bg-[#25A4E8] text-white hover:bg-[#1e8bc8]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailableCouponsModel; 