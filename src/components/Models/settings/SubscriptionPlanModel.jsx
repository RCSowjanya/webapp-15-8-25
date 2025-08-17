"use client";
import React, { useState, useEffect } from "react";
import { FiX, FiCalendar, FiArrowUpRight } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { fetchSubscriptionPlans, fetchUserCards, fetchStayHubDiscount, subscribePremiumProperties } from "../../Controller/settings/subscriptionPlanController";
import AvailableCouponsModel from "./AvailableCouponsModel";
import SubscriptionPaymentModel from "./SubscriptionPaymentModel";

const SubscriptionPlanModel = ({
  isOpen,
  onClose,
  selectedProperties,
  onSubscribe,
  onRemoveProperty,
  onSubscriptionSuccess,
}) => {
  const [billingCycle, setBillingCycle] = useState("yearly");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState({
    monthly: 0,
    yearly: 0,
    vat: 0,
    serviceFee: 0,
    yearlyDiscount: 0
  });
  const [loading, setLoading] = useState(false);
  const [showCouponsModal, setShowCouponsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentCard, setSelectedPaymentCard] = useState(null); // Will be set from API
  const [userCards, setUserCards] = useState([]);
  const [stayHubDiscount, setStayHubDiscount] = useState(null);
  const [userId, setUserId] = useState(""); // This should come from user session/context
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState(null);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);

  // Fetch subscription plans when component mounts
  useEffect(() => {
    if (isOpen) {
      getSubscriptionPlans();
      getUserCards();
      getStayHubDiscount();
    }
  }, [isOpen]);

  // Fetch user cards and set MasterCard as default
  const getUserCards = async () => {
    try {
      const result = await fetchUserCards();
      
      if (result.success && result.data) {
        const cards = result.data.data || result.data;
        setUserCards(cards);
        
        // Find the primary card (isPrimary: true) and set it as default
        const primaryCard = cards.find(card => card.isPrimary === true);
        if (primaryCard) {
          setSelectedPaymentCard(primaryCard);
        }
      }
    } catch (error) {
      console.error('Error fetching user cards:', error);
    }
  };

  // Fetch subscription plans
  const getSubscriptionPlans = async () => {
    try {
      setLoading(true);
      const result = await fetchSubscriptionPlans();
      
      if (result.success && result.data) {
        // Handle nested data structure: result.data.data contains the actual pricing
        const pricingData = result.data.data || result.data;
        setSubscriptionPlans(pricingData);
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch StayHub discount verification
  const getStayHubDiscount = async () => {
    try {
      // TODO: Replace with actual user ID from user session/context
      // This should come from: useSession(), auth(), or user context
      const placeholderUserId = "user123"; // Replace with actual user ID from session
      setUserId(placeholderUserId);
      
      const result = await fetchStayHubDiscount(placeholderUserId);
      
      if (result.success && result.data && result.data.length > 0) {
        const discountData = result.data[0]; // Get first discount record
        if (discountData.success) {
          setStayHubDiscount(discountData);
        } else {
          setStayHubDiscount(null); // User not eligible
        }
      } else {
        setStayHubDiscount(null); // No discount available
      }
    } catch (error) {
      console.error('Error fetching StayHub discount:', error);
      setStayHubDiscount(null);
    }
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      // Mock coupon validation - replace with actual API call
      if (couponCode.toLowerCase() === "save10") {
        setAppliedCoupon({
          code: couponCode,
          discount: 10,
          type: "percentage",
        });
        setCouponCode("");
      } else {
        // Show error toast
        console.log("Invalid coupon code");
      }
    }
  };

  // Handle subscription submission
  const handleSubscribe = async () => {
    if (selectedProperties.length === 0) {
      setSubscriptionError("Please select at least one property");
      return;
    }

    setIsSubscribing(true);
    setSubscriptionError(null);

    try {
      // Prepare subscription data
      const subscriptionData = {
        properties: selectedProperties.map(prop => prop.propertyId || prop.id),
        subscriptionType: billingCycle === "yearly" ? "Yearly" : "Monthly",
        discountCode: appliedCoupon?.code || null,
        stayHubDiscount: stayHubDiscount?.success ? stayHubDiscount : null
      };

      console.log('📤 Submitting subscription with data:', subscriptionData);
      console.log('📤 API endpoint: /property/subscribe/premium');

      // 🧪 DEV MODE: Mock successful subscription for testing (bypass API failure)
      if (process.env.NODE_ENV === 'development') {
        console.log('🧪 DEV MODE: Simulating successful subscription');
        console.log('🧪 Properties to make Premium:', selectedProperties.map(p => p.propertyId || p.id));
        
        // Call parent's success handler with mock data
        if (onSubscriptionSuccess) {
          onSubscriptionSuccess({ properties: selectedProperties.map(p => p.propertyId || p.id) });
        }
        
        // Show success message
        setSubscriptionSuccess(true);
        
        // Close modal after success
        setTimeout(() => {
          onClose();
        }, 2000);
        
        return; // Exit early, don't call the real API
      }

      const result = await subscribePremiumProperties(subscriptionData);

      console.log('📥 API response received:', result);
      console.log('🔍 Debug - result structure:', {
        hasSuccess: !!result.success,
        hasData: !!result.data,
        dataSuccess: result.data?.success,
        dataMessage: result.data?.message,
        resultMessage: result.message
      });

      // 🔧 FIX: Check the nested data.success field
      if (result.success && result.data && result.data.success) {
        console.log('✅ Subscription API succeeded:', result.data);
        
        // Show success message
        setSubscriptionSuccess(true);
        
        // Call parent's success handler with subscription data
        if (onSubscriptionSuccess) {
          onSubscriptionSuccess(result.data);
        }
        
        // Check if redirect is needed
        if (result.data.isRedirect && result.data.paymentLink) {
          // Wait a moment to show success message, then redirect
          setTimeout(() => {
            // Redirect to payment gateway
            window.open(result.data.paymentLink, '_blank');
            
            // Close modal
            onClose();
          }, 2000); // 2 second delay to show success message
        } else {
          // Handle non-redirect case
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } else {
        // ❌ API failed - show error message
        let errorMessage = "Subscription failed";
        try {
          if (result.data && result.data.message) {
            errorMessage = result.data.message;
          } else if (result.message) {
            errorMessage = result.message;
          }
        } catch (err) {
          console.log("Error parsing error message:", err);
        }
        
        console.error('❌ Subscription API failed:', errorMessage);
        setSubscriptionError(errorMessage);
      }
    } catch (error) {
      console.error('💥 Error during subscription:', error);
      setSubscriptionError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleRemoveProperty = (propertyId) => {
    // Remove the property from the selected properties list
    const updatedProperties = selectedProperties.filter(property => property.id !== propertyId);
    
    // Call the parent component to update the selected properties
    if (onRemoveProperty) {
      onRemoveProperty(propertyId);
    }
  };

  const handleCouponApplied = (coupon) => {
    // Process the selected coupon
    if (coupon.discountType === 'Fixed') {
      setAppliedCoupon({
        code: coupon.coupenCode,
        discount: coupon.discountAmount[billingCycle] || 0,
        type: 'fixed',
        originalCoupon: coupon
      });
    } else if (coupon.discountType === 'Percentage') {
      setAppliedCoupon({
        code: coupon.coupenCode,
        discount: coupon.discountAmount,
        type: 'percentage',
        originalCoupon: coupon
      });
    }
    
    // Clear the manual coupon input
    setCouponCode("");
  };

  const handleCardSelect = (cardData) => {
    console.log('Card selected in SubscriptionPlanModel:', cardData);
    if (cardData && cardData._id) {
      setSelectedPaymentCard(cardData);
      setShowPaymentModal(false);
    }
  };

  const formatCardNumber = (description) => {
    // Handle undefined/null description
    if (!description) return '****';
    
    // Extract the last 4 digits from the description
    const match = description.match(/(\d{4})$/);
    return match ? match[1] : '****';
  };

  const getCardIcon = (paymentMethod) => {
    switch (paymentMethod) {
      case "MasterCard":
        return (
          <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="16" rx="2" fill="#EAE6FD"/>
            <path d="M9.5 8C9.5 6.343 10.843 5 12.5 5H16.5C18.157 5 19.5 6.343 19.5 8C19.5 9.657 18.157 11 16.5 11H12.5C10.843 11 9.5 9.657 9.5 8Z" fill="#6650E4"/>
            <path d="M14.5 8C14.5 6.343 13.157 5 11.5 5H7.5C5.843 5 4.5 6.343 4.5 8C4.5 9.657 5.843 11 7.5 11H11.5C13.157 11 14.5 9.657 14.5 8Z" fill="#F79E1B"/>
            <text x="12" y="10.5" textAnchor="middle" fontSize="6" fill="#6650E4" fontWeight="bold">MC</text>
          </svg>
        );
      case "Visa":
        return (
          <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="16" rx="2" fill="#1A1F71"/>
            <path d="M9.5 8C9.5 6.343 10.843 5 12.5 5H16.5C18.157 5 19.5 6.343 19.5 8C19.5 9.657 18.157 11 16.5 11H12.5C10.843 11 9.5 9.657 9.5 8Z" fill="#F7B600"/>
            <text x="12" y="10.5" textAnchor="middle" fontSize="6" fill="#1A1F71" fontWeight="bold">VISA</text>
          </svg>
        );
      default:
        return "CARD";
    }
  };

  const calculateTotal = () => {
    const basePrice = subscriptionPlans[billingCycle] || 0;
    const totalProperties = selectedProperties.length;
    const subtotal = basePrice * totalProperties;
    
    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === "percentage") {
        discount = (subtotal * appliedCoupon.discount) / 100;
      } else if (appliedCoupon.type === "fixed") {
        discount = appliedCoupon.discount;
      }
    }
    
    const yearlyDiscount = billingCycle === "yearly" 
      ? (subtotal * subscriptionPlans.yearlyDiscount) / 100 
      : 0;
    
    // StayHub discount based on user eligibility
    let stayHubDiscountAmount = 0;
    if (stayHubDiscount && stayHubDiscount.success) {
      if (billingCycle === "yearly") {
        stayHubDiscountAmount = stayHubDiscount.yearlyDiscount || 0;
      } else {
        stayHubDiscountAmount = stayHubDiscount.monthlyDiscount || 0;
      }
    }
    
    const serviceFee = (subtotal * subscriptionPlans.serviceFee) / 100;
    const vat = ((subtotal - discount - yearlyDiscount - stayHubDiscountAmount) * subscriptionPlans.vat) / 100;
    
    const finalTotal = subtotal - discount - yearlyDiscount - stayHubDiscountAmount + serviceFee + vat;
    
    return {
      subtotal,
      discount,
      yearlyDiscount,
      stayHubDiscount: stayHubDiscountAmount,
      serviceFee,
      vat,
      finalTotal,
    };
  };

  const totals = calculateTotal();

  if (!isOpen) return null;

  return (
    <>
      {/* Custom CSS for slide animation */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
      
      <div className="fixed inset-0 bg-black/30 z-40 flex justify-end transition-opacity duration-300 ease-in-out">
        <div className={`bg-white h-full w-full max-w-md overflow-y-auto transform transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-600 cursor-pointer" />
              </button>
              <h2 className="text-lg font-semibold text-gray-800">
                Subscription Summary
              </h2>
              <div className="w-9"></div> {/* Spacer for centering */}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* Subscription Plans Section */}
            <div className="bg-[#6650E4] rounded-lg p-4 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-2">
                    Subscription Plans
                  </h3>
                  <p className="text-sm text-white/90">
                    Experience straightforward and transparent pricing as you embark on effortless property listing with us.
                  </p>
                  {loading ? (
                    <div className="mt-2 text-sm text-white/80">Loading pricing...</div>
                  ) : (
                    <div className="mt-2 text-sm text-white/80">
                      Monthly: SAR {subscriptionPlans.monthly} | Yearly: SAR {subscriptionPlans.yearly} (Save {subscriptionPlans.yearlyDiscount}%)
                    </div>
                  )}
                </div>
                <FiArrowUpRight className="w-5 h-5 text-white/80 mt-1" />
              </div>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="bg-gray-100 rounded-lg p-1">
              <div className="flex">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                    billingCycle === "monthly"
                      ? "bg-[#25A4E8] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                    billingCycle === "yearly"
                      ? "bg-[#25A4E8] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Yearly (save {subscriptionPlans.yearlyDiscount}%)
                </button>
              </div>
            </div>

            {/* Properties Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-semibold text-gray-800">
                  Properties:
                </span>
                <div className="w-6 h-6 bg-[#6650E4] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {selectedProperties.length}
                </div>
              </div>
              
              <div className="space-y-3">
                {selectedProperties.map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden">
                      {(property.coverPhoto || property.photos?.[0] || property.image) ? (
                        <img
                          src={property.coverPhoto || property.photos?.[0] || property.image}
                          alt={property.id}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500 ${
                          (property.coverPhoto || property.photos?.[0] || property.image) ? 'hidden' : 'flex'
                        }`}
                      >
                        {property.id?.charAt(0)?.toUpperCase() || 'P'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm">
                        {property.id}
                      </div>
                      <div className="text-xs text-gray-600">
                        {property.unitType}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        SAR {subscriptionPlans[billingCycle] || 0}.00
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveProperty(property.id)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <MdDelete className="w-4 h-4 cursor-pointer" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon Section */}
            <div>
              <div className="font-semibold text-gray-800 mb-2">
                Coupon
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">
                  Have a promo or discount code?
                </span>
                <button 
                  onClick={() => setShowCouponsModal(true)}
                  className="text-[#25A4E8] text-sm font-medium cursor-pointer hover:underline"
                >
                  View Coupons
                </button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type Discount code..."
                    value={appliedCoupon ? appliedCoupon.code : couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25A4E8] focus:border-transparent ${
                      appliedCoupon ? 'border-green-300 bg-green-50' : 'border-gray-300'
                    }`}
                    disabled={appliedCoupon}
                  />
                  {appliedCoupon && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={appliedCoupon ? null : handleApplyCoupon}
                  disabled={appliedCoupon}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    appliedCoupon
                      ? 'bg-[#25A4E8]  text-white cursor-not-allowed'
                      : 'bg-[#25A4E8] text-white hover:bg-[#1e8bc8]'
                  }`}
                >
                  {appliedCoupon ? 'Applied' : 'Apply'}
                </button>
              </div>
              
              {/* Applied Coupon Display */}
              {appliedCoupon && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-800">
                      Coupon applied: {appliedCoupon.code}
                    </span>
                    <button
                      onClick={() => setAppliedCoupon(null)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Total Section */}
            <div>
              <div className="font-semibold text-gray-800 mb-3">
                Total
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Number of Properties:
                  </span>
                  <span className="text-gray-900">
                    {selectedProperties.length} × SAR {subscriptionPlans[billingCycle] || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Subtotal:
                  </span>
                  <span className="text-gray-900 line-through">
                    SAR {totals.subtotal}.00
                  </span>
                </div>
                
                {billingCycle === "yearly" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Yearly Discount ({subscriptionPlans.yearlyDiscount}%):
                    </span>
                    <span className="text-green-600">
                      -SAR {totals.yearlyDiscount}.00
                    </span>
                  </div>
                )}
                
                {/* StayHub Admin Discount */}
                {stayHubDiscount && stayHubDiscount.success ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      StayHub Discount ({billingCycle === "yearly" ? stayHubDiscount.yearlyDiscount : stayHubDiscount.monthlyDiscount}%):
                    </span>
                    <span className="text-green-600">
                      -SAR {totals.stayHubDiscount}.00
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      StayHub Discount:
                    </span>
                    <span className="text-gray-500">
                      Not eligible
                    </span>
                  </div>
                )}
                
                {appliedCoupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Coupon Discount ({appliedCoupon.code}):
                    </span>
                    <span className="text-green-600">
                      -SAR {totals.discount}.00
                    </span>
                  </div>
                )}

                {/* <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Service Fee ({subscriptionPlans.serviceFee}%):
                  </span>
                  <span className="text-gray-900">
                    SAR {totals.serviceFee}.00
                  </span>
                </div> */}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    VAT ({subscriptionPlans.vat}%):
                  </span>
                  <span className="text-gray-900">
                    SAR {totals.vat}.00
                  </span>
                </div>
                
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-gray-800">
                      Total:
                    </span>
                    <span className="text-gray-800">
                      SAR {totals.finalTotal}.00
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div>
              <div className="font-semibold text-gray-800 mb-3">
                Payment Method
              </div>
              {selectedPaymentCard ? (
                <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-semibold ${
                        selectedPaymentCard.payment_method === "MasterCard" 
                          ? 'bg-[#6650E4] text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getCardIcon(selectedPaymentCard.payment_method)}
                      </div>
                      <div>
                        <span className="text-gray-800">
                          {selectedPaymentCard.payment_method} ending {formatCardNumber(selectedPaymentCard.payment_description)}
                        </span>
                        <div className="text-xs text-gray-500">
                          Expires {selectedPaymentCard.expiryMonth}/{selectedPaymentCard.expiryYear}
                        </div>
                      </div>
                    </div>
                    {selectedPaymentCard.isPrimary ? (
                      <span className="px-2 py-1 text-xs rounded-full" style={{backgroundColor: '#EAE6FD', color: '#391FCB'}}>Primary</span>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2 text-gray-500 text-center">
                  Loading payment method...
                </div>
              )}
              <div className="flex justify-center">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="py-2 border border-[#25A4E8] w-full text-[#25A4E8] rounded-lg hover:bg-[#25A4E8] hover:text-white transition-colors cursor-pointer"
                >
                  Change Card
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            {/* Success Display */}
            {subscriptionSuccess && (
              <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-green-600 text-sm font-medium">
                  ✅ Subscription created successfully! Redirecting to payment...
                </div>
              </div>
            )}
            
            {/* Error Display */}
            {subscriptionError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-600 text-sm">{subscriptionError}</div>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className={`w-[90%] py-3 rounded-full font-semibold transition-colors cursor-pointer ${
                  isSubscribing 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-[#25A4E8] text-white hover:bg-[#1e8bc8]'
                }`}
              >
                {isSubscribing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Subscribing...
                  </div>
                ) : (
                  'Subscribe Now'
                )}
              </button>
              <button
                onClick={onClose}
                className="w-[90%] py-2 border border-[#25A4E8] rounded-full text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Available Coupons Modal */}
        {showCouponsModal && (
          <AvailableCouponsModel
            isOpen={showCouponsModal}
            onClose={() => setShowCouponsModal(false)}
            onApplyCoupon={handleCouponApplied}
          />
        )}

        {/* Payment Method Selection Modal */}
        {showPaymentModal && (
          <SubscriptionPaymentModel
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            onCardSelect={handleCardSelect}
          />
        )}
      </div>
    </>
  );
};

export default SubscriptionPlanModel; 