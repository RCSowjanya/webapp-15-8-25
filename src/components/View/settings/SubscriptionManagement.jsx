"use client";
import React, { useState, useEffect } from "react";
import { FiSearch, FiCalendar, FiAlertCircle } from "react-icons/fi";
import { MdOutlineCancel } from "react-icons/md";
import { BsFilterSquareFill} from "react-icons/bs";
import { useRouter } from "next/navigation";
import SubscriptionFilterModel from "../../Models/settings/SubscriptionFilterModel";
import SubscriptionPlanModel from "../../Models/settings/SubscriptionPlanModel";
import { fetchSubscriptionData, fetchPropertyDetails } from "../../Controller/settings/subscriptionController";
import { toast } from "react-toastify";


const SubscriptionManagement = ({ onBack }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showSubscriptionPlan, setShowSubscriptionPlan] = useState(false);
  const [selectedPropertiesWithDetails, setSelectedPropertiesWithDetails] = useState([]);




  // Subscription status options for filter tags
  const subscriptionStatuses = [
    { id: "premium", label: "Premium" },
    { id: "free-trial", label: "Free Trial" },
    { id: "expiring", label: "Expiring Subscription" },
    { id: "expired", label: "Expired" },
    { id: "payment-failed", label: "Payment Failed" },
    { id: "cancelled", label: "Cancelled" }
  ];


  // Helper function to calculate remaining trial days
  const getTrialDaysLeft = (property) => {
    if (property.propertyOwner?.isTrialPeriodActive && property.license?.expiryDate) {
      const expiryDate = new Date(property.license.expiryDate);
      const currentDate = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
      return Math.max(0, daysUntilExpiry);
    }
    return null;
  };

  // Helper function to format expiry date
  const getExpiryDateDisplay = (property) => {
    if (property.license?.expiryDate) {
      const expiryDate = new Date(property.license.expiryDate);
      return expiryDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
    
    // Fallback to premiumExpDate if license expiry is not available
    if (property.premiumExpDate) {
      const premiumExpDate = new Date(property.premiumExpDate);
      const day = premiumExpDate.getUTCDate().toString().padStart(2, '0');
      const month = premiumExpDate.toLocaleDateString("en-US", { month: "short" });
      const year = premiumExpDate.getUTCFullYear();
      return `${day}/${month}/${year}`;
    }
    
    return "N/A";
  };

  // Helper function to get date label based on status
  const getDateLabel = (property, status) => {
    switch (status) {
      case "Free Trial":
        return "Expiry on";
      case "Expired":
        return "Expired in";
      case "Cancelled":
        return "Expiry on";
      case "Payment failed":
        return "Expiry on";
      case "Premium":
        return "Next Billing";
      default:
        return "Next Billing";
    }
  };

  // Helper function to determine subscription status based on API data
  const getSubscriptionStatus = (property) => {
    // First check if subscription is cancelled
    if (property.isPremiumSubscriptionCancelled) {
      return {
        status: "Cancelled",
        statusIcon: "MdOutlineCancel",
        statusColor: "text-red-600"
      };
    }
    
    // Check if it's a premium subscription
    if (property.isPremium) {
      return {
        status: "Premium",
        statusIcon: "/images/expiring-licence.svg",
        statusColor: "text-[#312285]"
      };
    }
    
    // Check if it's in trial period (only if isTrialPeriodActive is true)
    if (property.propertyOwner?.isTrialPeriodActive === true) {
      const daysLeft = getTrialDaysLeft(property);
      return {
        status: daysLeft > 0 ? "Free Trial" : "Expired",
        statusIcon: daysLeft > 0 ? "/images/expiring-licence.svg" : "FiAlertCircle",
        statusColor: daysLeft > 0 ? "text-gray-800" : "text-red-600"
      };
    }
    
    // Check if license is expired
    if (property.license?.expiryDate) {
      const expiryDate = new Date(property.license.expiryDate);
      const currentDate = new Date();
      if (expiryDate < currentDate) {
        return {
          status: "Expired",
          statusIcon: "FiAlertCircle",
          statusColor: "text-red-600"
        };
      }
    }
    
    // If none of the above conditions are met, it's likely an expired subscription
    return {
      status: "Expired",
      statusIcon: "FiAlertCircle",
      statusColor: "text-red-600"
    };
  };

  // Fetch subscription data
  const fetchData = async () => {
    try {
      console.log('📡 Fetching subscription data...');
      setLoading(true);
      setError(null);
      
      const response = await fetchSubscriptionData();
      
      if (response.success) {
        console.log('✅ API response successful:', response);
        
        // Transform API data to match our component structure
        
        // Handle different possible response structures
        let properties = [];
        if (Array.isArray(response.data)) {
          properties = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          properties = response.data.data;
        } else if (response.data?.properties && Array.isArray(response.data.properties)) {
          properties = response.data.properties;
        } else {
          console.error("Unexpected response structure:", response.data);
          throw new Error("Invalid response structure");
        }
        
        console.log('🏠 Raw properties data:', properties);
        
        const transformedData = properties.map(property => {
          const statusInfo = getSubscriptionStatus(property);
          const daysLeft = getTrialDaysLeft(property);
          const dateLabel = getDateLabel(property, statusInfo.status);
          
          const transformedItem = {
            id: property.unitNo || property._id,
            propertyId: property._id, // Add the actual property ID
            unitType: property.propertyDetails?.stayDetails?.title || `${property.propertyDetails?.bedroom || 0} Bed Room ${property.propertyType || 'Apartment'}`,
            status: statusInfo.status,
            statusIcon: statusInfo.statusIcon,
            statusColor: statusInfo.statusColor,
            nextBilling: getExpiryDateDisplay(property),
            premiumExpDate: property.premiumExpDate, // Add this field
            dateLabel: dateLabel,
            daysLeft: daysLeft,
            isSubscribed: property.isPremium || property.propertyOwner?.isTrialPeriodActive,
          };
          
          console.log(`🏠 Property ${transformedItem.id}: Status = ${transformedItem.status}, isPremium = ${property.isPremium}`);
          return transformedItem;
        });
        
        console.log('🔄 Setting transformed subscriptions:', transformedData);
        setSubscriptions(transformedData);
      } else {
        console.error("API returned error:", response.message);
        setError(response.message);
      }
    } catch (error) {
      console.error("Component error:", error);
      setError("Failed to fetch subscription data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);



  const handleFilterChange = (newFilters) => {
    setSelectedFilters(newFilters);
  };

  const handleSelectionModeToggle = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedSubscriptions([]);
    }
  };

  const handleSubscriptionSelect = (subscriptionId) => {
    // Find the subscription to check its status
    const subscription = subscriptions.find(sub => sub.id === subscriptionId);
    
    // Only allow selection of non-premium properties
    if (subscription && (subscription.status === "Premium" || subscription.status === "Subscribed")) {
      return; // Don't allow selection of premium properties
    }
    
    setSelectedSubscriptions(prev => {
      if (prev.includes(subscriptionId)) {
        return prev.filter(id => id !== subscriptionId);
      } else {
        return [...prev, subscriptionId];
      }
    });
  };

  const handleBulkSubscribe = async () => {
    if (selectedSubscriptions.length === 0) return;
    
    setIsSubscribing(true); // Start loading
    
    try {
      console.log('🔄 Starting bulk subscribe process...');
      console.log('🔄 Selected subscription IDs:', selectedSubscriptions);
      
      // Fetch full property details for each selected property
      const propertiesWithDetails = [];
      
      for (const subscriptionId of selectedSubscriptions) {
        const subscription = subscriptions.find(sub => sub.id === subscriptionId);
        console.log(`🔄 Found subscription for ID ${subscriptionId}:`, subscription);
        
        if (subscription) {
          const propertyDetails = await fetchPropertyDetails(subscription.propertyId);
          console.log(`🔄 Property details for ${subscription.propertyId}:`, propertyDetails);
          
          if (propertyDetails) {
            const enhancedProperty = {
              ...subscription,
              ...propertyDetails
            };
            console.log(`🔄 Enhanced property:`, enhancedProperty);
            propertiesWithDetails.push(enhancedProperty);
          }
        }
      }
      
      console.log('🔄 Final properties with details:', propertiesWithDetails);
      setSelectedPropertiesWithDetails(propertiesWithDetails);
      setShowSubscriptionPlan(true);
    } catch (error) {
      console.error('Error fetching property details:', error);
    } finally {
      setIsSubscribing(false); // Stop loading
    }
  };

  const handleSubscribeConfirm = (selectedProperties, billingCycle, appliedCoupon) => {
    // Handle subscription confirmation
    console.log('📋 Subscription confirmed:', { selectedProperties, billingCycle, appliedCoupon });
    
    // Get the property IDs from selected properties
    const propertyIds = selectedProperties.map(prop => prop.propertyId || prop.id);
    console.log('🆔 Property IDs to update:', propertyIds);
    console.log('🆔 Property ID types:', propertyIds.map(id => typeof id));
    console.log('🆔 Property ID lengths:', propertyIds.map(id => id?.length));
    
    // Debug: Check what's in the subscriptions array
    console.log('🔍 Current subscriptions for comparison:', subscriptions.map(sub => ({
      id: sub.id,
      propertyId: sub.propertyId,
      status: sub.status
    })));
    
    // Reset selection state after successful subscription
    resetSelectionState({ properties: propertyIds });
  };

  // Reset selection state after subscription
  const resetSelectionState = (subscriptionData = null) => {
    console.log('🔄 Starting subscription reset process...', subscriptionData);
    
    setSelectedSubscriptions([]);
    setSelectedPropertiesWithDetails([]);
    setIsSelectionMode(false);
    setShowSubscriptionPlan(false);
    
    // Show success message
    setSubscriptionSuccess(true);
    setSuccessMessage("Subscription successful! Updating property statuses...");
    
          // If we have subscription data, update local state directly
      if (subscriptionData && subscriptionData.properties) {
        console.log('🔄 Updating local state with subscription data:', subscriptionData);
        console.log('🔄 Properties to update:', subscriptionData.properties);
        console.log('🔄 Current subscriptions:', prevSubscriptions);
        
        setSubscriptions(prevSubscriptions => {
          const updatedSubscriptions = prevSubscriptions.map(sub => {
            console.log(`🔄 Checking subscription ${sub.id} (propertyId: ${sub.propertyId})`);
            console.log(`🔄 Looking for propertyId: ${sub.propertyId} in:`, subscriptionData.properties);
            console.log(`🔄 Match found:`, subscriptionData.properties.includes(sub.propertyId));
            
            // Check if this subscription is in the newly subscribed properties
            if (subscriptionData.properties.includes(sub.propertyId)) {
              console.log(`🔄 ✅ Updating property ${sub.id} to Premium status`);
              return {
                ...sub,
                status: "Premium",
                statusIcon: "FiSettings",
                statusColor: "text-green-600",
                isSubscribed: true
              };
            } else {
              console.log(`🔄 ❌ Property ${sub.id} not in subscription list`);
            }
            return sub;
          });
          
          console.log('🔄 Updated subscriptions:', updatedSubscriptions);
          return updatedSubscriptions;
        });
      
      setLoading(false);
      
      // Hide success message after update
      setTimeout(() => {
        setSubscriptionSuccess(false);
        setSuccessMessage("");
      }, 3000);
      
      return; // Exit early since we updated state directly
    }
    
    // Fallback: Add delay to allow backend to process subscription
    setTimeout(async () => {
      console.log('🔄 First refresh attempt (1 second delay)...');
      setLoading(true);
      
      // First refresh attempt
      await fetchData();
      
      // Wait a bit more and try again to ensure data is updated
      setTimeout(async () => {
        console.log('🔄 Second refresh attempt (3 seconds total delay)...');
        await fetchData();
        setLoading(false);
        
        console.log('🔄 Final refresh complete, hiding success message...');
        // Hide success message after final refresh
        setTimeout(() => {
          setSubscriptionSuccess(false);
          setSuccessMessage("");
        }, 2000);
      }, 2000); // Wait 2 more seconds for second refresh
      
    }, 1000); // Initial 1 second delay
  };

  const handleRemoveProperty = (propertyId) => {
    // Remove the property from selected subscriptions
    setSelectedSubscriptions(prev => prev.filter(id => id !== propertyId));
    // Also remove from enhanced properties
    setSelectedPropertiesWithDetails(prev => prev.filter(prop => prop.id !== propertyId));
  };

  const handleSubscriptionClick = (subscription) => {
    router.push(`/premium-unsubscribe/${subscription.propertyId}`);
  };









  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.unitType.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Handle multiple filter logic (OR logic - must match ANY of the selected filters)
    let matchesFilter = true;
    if (selectedFilters.subscriptionStatus && Array.isArray(selectedFilters.subscriptionStatus) && selectedFilters.subscriptionStatus.length > 0) {
      const filterStatuses = selectedFilters.subscriptionStatus;
      const subscriptionStatus = subscription.status;
      
      // Check if subscription matches ANY of the selected filters
      matchesFilter = filterStatuses.some(filterStatus => {
        switch (filterStatus) {
          case "premium":
            return subscriptionStatus === "Premium";
          case "free-trial":
            return subscriptionStatus === "Free Trial";
          case "expiring":
            // For expiring, check if premium and has expiry date within 30 days
            return subscriptionStatus === "Premium" && subscription.premiumExpDate;
          case "expired":
            return subscriptionStatus === "Expired";
          case "payment-failed":
            // For now, this will not match any subscriptions since we don't have this status
            return false;
          case "cancelled":
            return subscriptionStatus === "Cancelled";
          default:
            return true;
        }
      });
      
    }
    
    return matchesSearch && matchesFilter;
  });

  const getStatusDisplay = (subscription) => {
    if (subscription.status === "Free Trial" && subscription.daysLeft !== null) {
      return `${subscription.status} ${subscription.daysLeft}D Left`;
    }
    return subscription.status;
  };

  if (loading) {
    return (
      <div className="bg-white h-full flex flex-col">
        <div className="flex-grow p-4 overflow-y-auto">
          <div className="flex items-center gap-4 mb-6">
            
            <h1 className="text-xl font-semibold text-gray-800">Subscription Management</h1>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading properties...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        {/* Header with Search and Filters on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left Side - Title */}
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Subscription Management</h1>

          {/* Right Side - Search and Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
              <input
                type="text"
                placeholder="Search Unit No., Title"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Select Button */}
            <button
              onClick={handleSelectionModeToggle}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isSelectionMode 
                  ? 'bg-red-100 text-red-600 border-red-300' 
                  : 'bg-[#EDF7FD] text-[#25A4E8] border border-[#25A4E8] cursor-pointer hover:bg-[#25A4E8] hover:text-white'
              }`}
            >
              {isSelectionMode ? 'Cancel' : 'Select'}
            </button>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer w-full sm:w-auto justify-center transition-colors ${
                  selectedFilters.subscriptionStatus && Array.isArray(selectedFilters.subscriptionStatus) && selectedFilters.subscriptionStatus.length > 0
                    ? "bg-[#25A4E8] text-white border-[#25A4E8] hover:bg-[#1e8bc8]"
                    : "bg-[#25A4E8] text-white border-[#25A4E8] hover:bg-[#1e8bc8]"
                }`}
              >
                <BsFilterSquareFill className="text-white" />
                <p className="text-white text-sm font-semibold cursor-pointer">
                  {selectedFilters.subscriptionStatus && Array.isArray(selectedFilters.subscriptionStatus) && selectedFilters.subscriptionStatus.length > 0 
                    ? `Filters Applied (${selectedFilters.subscriptionStatus.length})` 
                    : "Filters"
                  }
                </p>
              </button>
              
              {/* Clear Filters Button */}
              {selectedFilters.subscriptionStatus && Array.isArray(selectedFilters.subscriptionStatus) && selectedFilters.subscriptionStatus.length > 0 && (
                <button
                  onClick={() => setSelectedFilters({})}
                  className="px-3 py-2 text-[#25A4E8] cursor-pointer hover:text-[#25A4E8] border border-[#25A4E8] hover:bg-[#25A4E8] hover:text-white rounded-lg transition-colors text-sm font-medium"
                  title="Clear filters"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {subscriptionSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-green-700 font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-grow overflow-y-auto p-4 ${
        isSelectionMode && selectedSubscriptions.length > 0 && !showSubscriptionPlan 
          ? 'pb-24' // Add bottom padding when selection bar is visible
          : 'pb-4'
      }`}>
        {/* Show Premium Detail View if selected */}
        {/* Removed as per edit hint */}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading subscriptions...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-8">
            <div className="text-red-500 mb-2">Error loading subscriptions</div>
            <div className="text-gray-600 text-sm">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        )}

        {/* Active Filter Tags */}
        {!loading && !error && selectedFilters.subscriptionStatus && Array.isArray(selectedFilters.subscriptionStatus) && selectedFilters.subscriptionStatus.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Active Filters:</span>
              {selectedFilters.subscriptionStatus.map((filterId) => {
                const filter = subscriptionStatuses.find(s => s.id === filterId);
                return (
                  <div
                    key={filterId}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    <span>{filter?.label || filterId}</span>
                    <button
                      onClick={() => {
                        const newFilters = selectedFilters.subscriptionStatus.filter(id => id !== filterId);
                        setSelectedFilters({
                          ...selectedFilters,
                          subscriptionStatus: newFilters.length > 0 ? newFilters : undefined
                        });
                      }}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

                {/* Subscription Cards Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubscriptions.map((subscription) => (
              <div key={subscription.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                {/* Main Card Content */}
                <div 
                  className="cursor-pointer"
                  onClick={() => {
                    if (subscription.status === "Premium" || subscription.status === "Subscribed") {
                      // Navigate to property details page
                      router.push(`/premium-unsubscribe/${subscription.propertyId}`);
                    }
                  }}
                >
                  {/* Top Section with Background */}
                  <div className="bg-[#F7F5FE] rounded-lg p-3 mb-3">
                    {/* Unit ID and Type */}
                    <div className="mb-3">
                      <div className="text-sm font-semibold text-gray-900">{subscription.id}</div>
                      <div className="text-xs font-semibold text-gray-900">{subscription.unitType}</div>
                    </div>

                    {/* Status and Checkbox */}
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-2 text-sm font-medium ${subscription.statusColor}`}>
                        {subscription.statusIcon.startsWith('/') ? (
                          <img src={subscription.statusIcon} alt="" className="w-5 h-5" />
                        ) : subscription.statusIcon === 'FiAlertCircle' ? (
                          <FiAlertCircle className="w-5 h-5" />
                        ) : subscription.statusIcon === 'MdOutlineCancel' ? (
                          <MdOutlineCancel className="w-5 h-5" />
                        ) : (
                          <img src={subscription.statusIcon} alt="" className="w-5 h-5" />
                        )}
                        {getStatusDisplay(subscription)}
                      </div>
                      
                      {/* Checkbox for selection mode - only for non-premium properties */}
                      {isSelectionMode && subscription.status !== "Premium" && subscription.status !== "Subscribed" && (
                        <input
                          type="checkbox"
                          checked={selectedSubscriptions.includes(subscription.id)}
                          onChange={() => handleSubscriptionSelect(subscription.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      )}
                    </div>
                  </div>

                  {/* Bottom Section - Next Billing and Subscribe Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-100 border border-purple-300 rounded-full flex items-center justify-center">
                          <FiCalendar className="w-3 h-3 text-[#391FCB] bg-[#E4E0FA]" />
                        </div>
                        <span className="text-xs text-gray-900 font-semibold">{subscription.dateLabel}:</span>
                      </div>
                      <div className="ml-8">
                        <span className="text-xs text-gray-900 font-semibold">
                          {subscription.premiumExpDate ? (() => {
                            const date = new Date(subscription.premiumExpDate);
                            const day = date.getUTCDate().toString().padStart(2, '0');
                            const month = date.toLocaleDateString("en-US", { month: "short" });
                            const year = date.getUTCFullYear();
                            return `${day}/${month}/${year}`;
                          })() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  
                    {/* Show Subscribe Now button for all statuses except Premium/Subscribed */}
                    {subscription.status !== "Premium" && subscription.status !== "Subscribed" && (
                      <button 
                        className="px-4 py-2  bg-[#EDF7FD] text-[#25A4E8]  text-sm rounded-full transition-colors font-medium  border border-[#25A4E8] hover:bg-[#1e8bc8] hover:border-[#1e8bc8] hover:text-white cursor-pointer"
                      >
                        Subscribe Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredSubscriptions.length === 0 && (
          <div className="text-center py-8">
            <div className="mb-4">
              <img 
                src="/images/sub-expired.svg" 
                alt="No results" 
                className="w-16 h-16 mx-auto mb-4"
              />
            </div>
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No matching results.</p>
              <p className="text-sm">Try adjusting your filter range.</p>
            </div>
          </div>
        )}
      </div>

      {/* Selection Modal */}
      {isSelectionMode && selectedSubscriptions.length > 0 && !showSubscriptionPlan && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
          <div className="flex items-center justify-center gap-8  max-w-5xl mx-auto px-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#6650E4] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {selectedSubscriptions.length}
              </div>
              <span className="text-gray-700 font-medium ">
              Properties Selected
              </span>
            </div>
            <button
              onClick={handleBulkSubscribe}
              disabled={isSubscribing}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isSubscribing 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-[#25A4E8] text-white hover:bg-[#1E8BC3]'
              }`}
            >
              {isSubscribing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Opening...
                </div>
              ) : (
                'Subscribe Now'
              )}
            </button>
          </div>
        </div>
      )}

 {/* Filter Model */}
      <SubscriptionFilterModel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleFilterChange}
        selectedFilters={selectedFilters.subscriptionStatus || []}
      />
      {/* Subscription Plan Model */}
      <SubscriptionPlanModel
        isOpen={showSubscriptionPlan}
        onClose={() => setShowSubscriptionPlan(false)}
        selectedProperties={selectedPropertiesWithDetails.length > 0 ? selectedPropertiesWithDetails : subscriptions.filter(sub => selectedSubscriptions.includes(sub.id))}
        onSubscribe={handleSubscribeConfirm}
        onRemoveProperty={handleRemoveProperty}
        onSubscriptionSuccess={resetSelectionState}
      />
    </div>
  );
};

export default SubscriptionManagement;