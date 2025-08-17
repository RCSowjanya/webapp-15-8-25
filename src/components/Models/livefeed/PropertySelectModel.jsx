"use client";
import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { getAllProperties } from "../../Controller/livefeed/AllProperties";

const PropertySelectModal = ({ isOpen, onClose, onSubmit }) => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      
      const fetchProperties = async () => {
        try {
          console.log("🔍 Debug: Fetching properties...");
          const result = await getAllProperties();
          console.log("🔍 Debug: Properties result:", result);
          
          if (result.success) {
            console.log("🔍 Debug: Setting properties:", result.properties);
            setProperties(result.properties);
          } else {
            console.log("❌ Error: Failed to load properties:", result.error);
            setProperties([]);
            setError(result.error);
          }
        } catch (error) {
          console.error("❌ Error fetching properties:", error);
          setProperties([]);
          setError("Failed to load properties");
        } finally {
          setLoading(false);
        }
      };
      
      fetchProperties();
    }
  }, [isOpen]);

  const handlePropertySelect = (propertyId) => {
    setSelectedProperty(propertyId);
  };

  const handleReset = () => {
    setSelectedProperty("all");
  };

  const handleSubmit = () => {
    if (selectedProperty === "all") {
      onSubmit("all");
    } else {
      // Find the selected property object
      const selectedPropertyObj = properties.find(p => p._id === selectedProperty);
      if (selectedPropertyObj) {
        onSubmit(selectedPropertyObj);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 overflow-y-auto max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#5940C8]">Select Properties</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="text-orange-500 hover:text-orange-600 cursor-pointer transition-colors font-medium"
            >
              RESET
            </button>
          
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && <div className="text-center py-4">Loading...</div>}
          {error && (
            <div className="text-center text-red-500 py-4">{error}</div>
          )}
          {!loading && !error && (
            <div className="space-y-3">
              {properties.length === 0 && (
                <div className="text-center text-gray-500">
                  No properties found.
                </div>
              )}
              
              {/* All Properties Option */}
              <div
                className="flex items-center justify-between py-3 px-4 rounded-lg transition-colors cursor-pointer border border-gray-200"
                style={{
                  background: selectedProperty === "all" ? "#F4F8FF" : "transparent",
                }}
                onClick={() => handlePropertySelect("all")}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-800">All Properties</span>
                </div>
                <div
                  className={`w-5 h-5 flex items-center justify-center border-2 rounded-full ${
                    selectedProperty === "all" ? 'bg-[#25A4E8] border-[#25A4E8]' : 'border-gray-100 bg-white'
                  }`}
                  style={{ minWidth: 20 }}
                >
                  {selectedProperty === "all" && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 8.5L7 11.5L12 5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>

              {/* Individual Properties */}
              {properties.map((property) => (
                <div
                  key={property._id}
                  className="flex items-center justify-between py-3 px-4 rounded-lg transition-colors cursor-pointer border border-gray-200"
                  style={{
                    background: selectedProperty === property._id ? "#F4F8FF" : "transparent",
                  }}
                  onClick={() => handlePropertySelect(property._id)}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">{property.unitNo}</span>
                    <span className="text-xs text-gray-500">
                      {property.propertyDetails?.stayDetails?.title || ""}
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 flex items-center justify-center border-2 rounded-full ${
                      selectedProperty === property._id ? 'bg-[#25A4E8] border-[#25A4E8]' : 'border-gray-100 bg-white'
                    }`}
                    style={{ minWidth: 20 }}
                  >
                    {selectedProperty === property._id && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 8.5L7 11.5L12 5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <div className="text-center pt-6">
            <button
              onClick={handleSubmit}
              disabled={!selectedProperty}
              className="w-full px-8 py-3 bg-[#25A4E8] cursor-pointer text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySelectModal;