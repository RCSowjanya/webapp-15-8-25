"use client";
import React, { useState, useEffect } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { fetchOccupancyData } from "../../Controller/livefeed/occupancyController";
import { getDateRange } from "../../../utils/DateUtils";

export default function OccupancySourceCard({
  dateRange,
  customDateRange = null,
  propertyIds = [],
}) {
  const [sourceData, setSourceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Fetch occupancy source data when dateRange, customDateRange, or propertyIds change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { startDate, endDate } = getDateRange(dateRange, customDateRange);
        
        if (!startDate || !endDate) {
              setLoading(false);
              return;
        }

        console.log("Calling occupancy source API with:", {
          startDate,
          endDate,
          propertyIds,
        });

        // Call the server action directly
        const response = await fetchOccupancyData({
          startDate,
          endDate,
          propertyIds,
        });
        console.log("Occupancy Source API response:", response);

        if (response.success) {
          // Format the data for the chart
          const apiData = response.data;
          console.log("Processing Occupancy Source API data:", apiData);

          // Extract source data from the API response
          // The correct path is: response.data.data.occupancySource.otaData
          const occupancySource = apiData?.data?.occupancySource;
          const otaData = occupancySource?.otaData;

          if (otaData && Array.isArray(otaData)) {
            // Map the API data to the expected format
            const formattedData = otaData.map((source, index) => ({
              name: source.ota || source.name || `Source ${index + 1}`,
              value: Number(
                (source.percentage || source.value || 0).toFixed(1)
              ),
              color: source.colorCode || source.color || getDefaultColor(index),
              count: source.count || 0,
            }));

            console.log("Formatted source data:", formattedData);
            setSourceData(formattedData);
          } else {
            // Fallback to static data if API doesn't return source data
            console.log("No OTA data found in API response, using fallback");
            console.log("Available data structure:", apiData);
            setSourceData(getFallbackData());
          }
        } else {
          setError(response.message || "Failed to fetch occupancy source data");
        }
      } catch (err) {
        console.error("Occupancy Source API Error:", err);
        setError(err.message || "Failed to fetch occupancy source data");
      } finally {
        setLoading(false);
      }
    };

    if (dateRange) {
      fetchData();
    }
  }, [dateRange, customDateRange, propertyIds]);

  // Helper function to get default colors
  const getDefaultColor = (index) => {
    const colors = [
      "#FF6B6B", // Red
      "#4ECDC4", // Teal
      "#45B7D1", // Blue
      "#96CEB4", // Green
      "#FFEAA7", // Yellow
      "#DDA0DD", // Plum
      "#98D8C8", // Mint
    ];
    return colors[index % colors.length];
  };

  // Fallback data if API doesn't return source data
  // const getFallbackData = () => {
  //   return [
  //     { name: "Airbnb", value: 22, color: "#FF6B6B" },
  //     { name: "Stayhub", value: 18, color: "#4ECDC4" },
  //     { name: "Booking.com", value: 40, color: "#45B7D1" },
  //     { name: "Agoda", value: 4, color: "#96CEB4" },
  //     { name: "Expedia", value: 15, color: "#FFEAA7" },
  //     { name: "Trivago", value: 10, color: "#DDA0DD" },
  //     { name: "Vrbo", value: 32, color: "#98D8C8" },
  //   ];
  // };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-4 flex flex-col min-w-0 w-full">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <div className="text-lg font-semibold text-[#654EE4] mb-1">
              Occupancy Source
            </div>
            <div className="text-sm text-gray-500">{dateRange}</div>
          </div>
          <AiOutlineInfoCircle className="w-5 h-5 text-[#7D7F88]" />
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#654EE4]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow p-4 flex flex-col min-w-0 w-full">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <div className="text-lg font-semibold text-[#654EE4] mb-1">
              Occupancy Source
            </div>
            <div className="text-sm text-gray-500">{dateRange}</div>
          </div>
          <AiOutlineInfoCircle className="w-5 h-5 text-[#7D7F88]" />
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-red-500 text-center">
            <p className="text-sm">Failed to load occupancy source data</p>
            <p className="text-xs text-gray-500 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col min-w-0 w-full">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <div className="text-lg font-semibold text-[#654EE4] mb-1">
            Occupancy Source
          </div>
          <div className="text-sm text-gray-500">{dateRange}</div>
        </div>
        <AiOutlineInfoCircle 
          className="w-5 h-5 text-[#7D7F88] cursor-pointer" 
          onClick={() => setShowInfoModal(true)}
        />
      </div>
      <div className="pt-3">
        <div className="w-full max-w-md mx-auto">
          <div className="w-full">
            {sourceData.map((src, idx) => (
              <div key={src.name} className="flex items-center mb-6">
                <div className="w-24 text-sm text-gray-700 font-medium">
                  {src.name}
                </div>
                <div className="flex-1 bg-[#E6EAFD] rounded-sm h-8 flex items-center relative">
                  <div
                    className="h-8 rounded-sm flex items-center justify-end"
                    style={{ width: `${src.value}%`, background: src.color }}
                  ></div>
                  <span className="text-xs font-bold text-[#5940C8] ml-2">
                    {src.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex w-full justify-between pl-24 mt-2 text-xs text-gray-400 font-semibold">
            {[0, 20, 40, 60, 80, 100].map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <div className="text-lg font-semibold text-[#222] mb-3 text-center">
              Occupancy Source
            </div>
            <div className="text-sm text-gray-600 mb-6">
              Shows which channel is the best performing channel during the selected time period (StayHub, Airbnb, etc.).
            </div>
            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full bg-[#2694D0] text-white cursor-pointer py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}