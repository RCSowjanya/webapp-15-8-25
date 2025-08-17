"use client";
import React, { useState, useEffect } from "react";
import { FiDownload, FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { fetchPropertyDetails } from "../../Controller/settings/subscriptionController";
import { cancelSubscription } from "../../Controller/settings/cancelSubscriptionController";
import UnsubscribeModel from "../../Models/settings/UnsubscribeModel";
import SuccessModal from "../../Models/settings/SuccessModal";

const SubscriptionPremiumDetailPage = ({ subscription }) => {
  const router = useRouter();
  const [propertyData, setPropertyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);
  const [unsubscribing, setUnsubscribing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalConfig, setSuccessModalConfig] = useState({
    isSuccess: true,
    title: "Success!",
    message: "Operation completed successfully!"
  });

  const handleBack = () => {
    // Navigate back to subscription management screen
    router.push("/settings?view=subscription");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const response = await fetchPropertyDetails(subscription?.propertyId || subscription?.id);
        
        if (response.success) {
          setPropertyData(response.data);
        } else {
          setError(response.message || 'Failed to fetch property data');
        }
      } catch (error) {
        console.error('Error fetching property details:', error);
        setError('Failed to fetch property details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subscription]);

  const handleUnsubscribe = async () => {
    try {
      setUnsubscribing(true);
      
      // Call the server action to cancel subscription
      const response = await cancelSubscription(subscription?.propertyId || subscription?.id);
      
      if (response.success) {
        // Close modal and show success message
        setShowUnsubscribeModal(false);
        setSuccessModalConfig({
          isSuccess: true,
          title: "Success!",
          message: response.message || 'Successfully unsubscribed from premium!'
        });
        setShowSuccessModal(true);
        
        // Don't redirect immediately - let user see success message first
        // The redirect will happen when they click "Continue" in the success modal
      } else {
        // Show error message in success modal (reusing the component)
        setSuccessModalConfig({
          isSuccess: false,
          title: "Error",
          message: response.message || 'Failed to unsubscribe. Please try again.'
        });
        setShowSuccessModal(true);
      }
      
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setSuccessModalConfig({
        isSuccess: false,
        title: "Error",
        message: 'Failed to unsubscribe. Please try again.'
      });
      setShowSuccessModal(true);
    } finally {
      setUnsubscribing(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Only redirect on success, not on error
    if (successModalConfig.isSuccess) {
      router.push("/settings?view=subscription");
    }
  };

  const handleDownloadInvoice = async (invoiceNumber) => {
    try {
      // Get the auth token from the session
      const session = await fetchPropertyDetails(subscription?.propertyId || subscription?.id);
      if (!session?.success) {
        setSuccessModalConfig({
          isSuccess: false,
          title: "Error",
          message: 'Failed to get authentication token'
        });
        setShowSuccessModal(true);
        return;
      }

      // Construct the download URL
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.stayhub.sa';
      const downloadUrl = `${baseUrl}/booking/invoice/download/${invoiceNumber}`;
      
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `invoice-${invoiceNumber}.pdf`;
      link.target = '_blank';
      
      // Add authorization header if needed
      // Note: For direct downloads, you might need to handle auth differently
      // or the API might handle it via cookies/session
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading invoice:', error);
      setSuccessModalConfig({
        isSuccess: false,
        title: "Error",
        message: 'Failed to download invoice. Please try again.'
      });
      setShowSuccessModal(true);
    }
  };

  // Check if we have property data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <span className="ml-2 text-gray-600">Loading property details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">Error loading property details</div>
        <div className="text-gray-600 text-sm">{error}</div>
      </div>
    );
  }

  if (!propertyData) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">No property data available</div>
      </div>
    );
  }

  // Handle the case where propertyData might contain the full API response structure
  let actualPropertyData = propertyData;
  if (propertyData && propertyData.data && typeof propertyData.data === 'object') {
    actualPropertyData = propertyData.data;
  }

  // Only create formattedData when propertyData exists
  if (!actualPropertyData) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">No property data available</div>
      </div>
    );
  }

  // Format the data from API response
  const formattedData = {
    title: actualPropertyData.propertyDetails?.stayDetails?.title || actualPropertyData.unitNo || "Property",
    propertyId: actualPropertyData.unitNo || actualPropertyData._id,
    coverPhoto: actualPropertyData.coverPhoto || actualPropertyData.photos?.[0] || "/images/apartment.png",
    subscriptionType: actualPropertyData.subscriptionId?.subscriptionType || (actualPropertyData.isPremium ? "Premium" : "Standard"),
    isActive: actualPropertyData.subscriptionId?.isActive || false,
    // Use pre-formatted dates from server, with fallback to client-side formatting
    renewalDate: actualPropertyData.formattedDates?.renewalDate || (() => {
      const dateString = actualPropertyData.subscriptionId?.nextBillingDate;
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleDateString('en-GB', { month: 'short' });
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    })(),
    billingPeriod: actualPropertyData.subscriptionId?.subscriptionType || "N/A",
    planCost: actualPropertyData.subscriptionId?.totalPrice ? `SAR ${actualPropertyData.subscriptionId.totalPrice}` : "N/A",
    // Use pre-formatted dates from server, with fallback to client-side formatting
    nextPaymentDate: actualPropertyData.formattedDates?.nextPaymentDate || (() => {
      const dateString = actualPropertyData.subscriptionId?.nextBillingDate;
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleDateString('en-GB', { month: 'short' });
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    })(),
    paymentMethod: actualPropertyData.subscriptionId?.lastPayment?.paymentInfo?.payment_method
      ? `${actualPropertyData.subscriptionId.lastPayment.paymentInfo.payment_method} ending in ****${actualPropertyData.subscriptionId.lastPayment.paymentInfo.payment_description?.slice(-4)}`
      : "N/A",
    paymentHistory: actualPropertyData.paymentHistory?.map(payment => ({
      date: new Date(payment.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      invoiceNo: payment.invoiceNo,
      status: payment.isPaymentCompleted ? "Paid" : "Pending",
      amount: `SAR ${payment.totalPrice}`,
      paymentMethod: payment.paymentInfo?.payment_method || payment.paymentMethod || "N/A"
    })) || []
  };

  return (
    <div className="min-h-screen bg-[#F6F6F9] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white h-full flex flex-col">
          {/* Back Button */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Back to Subscriptions</span>
            </button>
          </div>
          
          {/* Scrollable Body Content */}
          <div className="flex-grow overflow-y-auto">
            <div className="flex flex-col lg:flex-row p-6">
              {/* Left Panel - Property Image */}
              <div className="lg:w-1/2 mb-6 lg:mb-0">
                
                <div className="bg-gray-200 rounded-lg h-64 lg:h-96 flex items-center justify-center overflow-hidden">
                  <img
                    src={formattedData.coverPhoto}
                    alt="Property"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
              {/* Right Panel - Subscription Details */}
              <div className="lg:w-1/2 lg:pl-6 space-y-6">
              <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{formattedData.title}</h2>
                  <p className="text-lg text-gray-600">{formattedData.propertyId}</p>
                </div>
                {/* Subscription Details Panel */}
                <div className="bg-white  p-2 ">
                   <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subscription Type</span>
                      <span className="font-semibold text-[#312285] flex items-center gap-2">
                        {formattedData.subscriptionType} 
                        <span className="font-normal">({formattedData.isActive ? 'Active' : 'Inactive'})</span>
                        <div className={`w-3 h-3 rounded-full ${formattedData.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subscription Renewal Date</span>
                      <span className="font-semibold text-gray-800">{formattedData.renewalDate}</span>
                    </div>
                  </div>
                </div>
                {/* Billing Cycle Details Panel */}
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Billing Cycle Details</h3>
               
                <div className=" p-2 space-y-4">
                    <div className="grid grid-cols-2 grid-rows-2 gap-2">
                    <div className="flex flex-col bg-[#F7F5FE] p-2 rounded-lg">
                      <span className="text-gray-600">Billing Period:</span>
                      <span className="font-semibold text-gray-800">{formattedData.billingPeriod}</span>
                    </div>
                    <div className="flex flex-col bg-[#F7F5FE] p-2 rounded-lg">
                      <span className="text-gray-600">Current Plan Cost:</span>
                      <span className="font-semibold text-gray-800">{formattedData.planCost}</span>
                    </div>
                    <div className="flex flex-col bg-[#F7F5FE] p-2 rounded-lg">
                      <span className="text-gray-600">Next Payment Date:</span>
                      <span className="font-semibold text-gray-800">{formattedData.nextPaymentDate}</span>
                    </div>
                    <div className="flex flex-col bg-[#F7F5FE] p-2 rounded-lg">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-semibold text-gray-800">{formattedData.paymentMethod}</span>
                    </div>
                  </div>
                </div>
                {/* Payment History Panel */}
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Payment History</h4>
                <div className="bg-[#F6F6F9] rounded-lg border border-gray-200 p-4 shadow-sm">
                 
                  <div className="space-y-4">
                    {formattedData.paymentHistory.length > 0 ? (
                      formattedData.paymentHistory.map((payment, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-start rounded-lg">
                            {/* Left Column - Invoice Details */}
                            <div className="flex-1">
                              <div className="mb-3">
                                <span className="font-medium text-gray-800">{payment.date}</span>
                              </div>
                              
                              <div>
                                {/* Invoice Number */}
                                <div className="mb-2">
                                  <span className="text-sm text-[#6E63B1]">Invoice No.</span>
                                  <div className="font-medium text-gray-800">{payment.invoiceNo}</div>
                                </div>
                                
                                {/* Status */}
                                <div>
                                  <span className="text-sm text-[#6E63B1]">Status</span>
                                  <div className="font-medium text-gray-800">{payment.status}</div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Right Column - Amount, Payment Method, Download */}
                            <div className="text-right">
                              <div className="mb-2">
                                <span className="font-medium text-gray-800">{payment.amount}</span>
                              </div>
                              
                              <div className="mb-2">
                                <span className="text-sm text-[#6E63B1]">Payment Method</span>
                                <div className="font-medium text-gray-800">{payment.paymentMethod}</div>
                              </div>
                              
                              <div className="mt-4">
                                <button 
                                  onClick={() => handleDownloadInvoice(payment.invoiceNo)}
                                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 justify-end cursor-pointer"
                                >
                                  <FiDownload className="w-4 h-4 text-[#6E63B1]" />
                                  <span className="text-[#6E63B1]">Download Invoice</span>
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Separator line between payments */}
                          {index < formattedData.paymentHistory.length - 1 && (
                            <hr className="border-gray-200 my-4" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-500">No payment history available</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Bottom Unsubscribe Button */}
            <div className="flex justify-center p-6 border-t border-gray-200">
              <button 
                onClick={() => setShowUnsubscribeModal(true)}
                className="px-8 py-3 bg-white text-[#EC5D5D] cursor-pointer border border-[#EC5D5D] rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors font-medium"
              >
                Unsubscribe
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Unsubscribe Confirmation Modal */}
      <UnsubscribeModel
        isOpen={showUnsubscribeModal}
        onClose={() => setShowUnsubscribeModal(false)}
        onConfirm={handleUnsubscribe}
        propertyName={formattedData?.title || "Property"}
        billingEndDate={formattedData?.renewalDate || "N/A"}
        isLoading={unsubscribing}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        message={successModalConfig.message}
        isSuccess={successModalConfig.isSuccess}
        title={successModalConfig.title}
      />
    </div>
  );
};

export default SubscriptionPremiumDetailPage; 