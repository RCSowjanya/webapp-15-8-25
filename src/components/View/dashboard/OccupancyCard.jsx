"use client";
import React, { useState, useEffect } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaAnglesUp, FaAnglesDown } from "react-icons/fa6";
import { getDateRange } from "../../../utils/DateUtils";
import DonutChart from "./DonutChart";
import { fetchOccupancyData } from "../../Controller/livefeed/occupancyController";

export default function OccupancyCard({
  dateRange,
  customDateRange = null,
  propertyIds = [],
}) {
  const [occupancyData, setOccupancyData] = useState({
    occupancyRate: 0,
    breakdown: [],
    trend: { direction: "up", value: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Fetch occupancy data when dateRange, customDateRange, or propertyIds change
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

        console.log("Calling occupancy API with:", {
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
        console.log("API response:", response);

        if (response.success) {
          // Format the data for the chart
          const apiData = response.data;
          console.log("Processing API data:", apiData);

          // The data is nested: response.data.data.occupancyRateBreakdown
          const occupancyData = apiData?.data?.occupancyRateBreakdown;

          if (
            occupancyData &&
            occupancyData.current &&
            occupancyData.current.breakdown
          ) {
            const { current, difference } = occupancyData;
            const breakdown = current.breakdown;

            const chartData = [
              {
                name: "Booked",
                value: Number((breakdown.booked?.percentage || 0).toFixed(1)),
                color: breakdown.booked?.colorCode || "#2CAFFE",
                count: breakdown.booked?.count || 0,
              },
              {
                name: "Blocked",
                value: Number((breakdown.blocked?.percentage || 0).toFixed(1)),
                color: breakdown.blocked?.colorCode || "#01E272",
                count: breakdown.blocked?.count || 0,
              },
              {
                name: "Open",
                value: Number((breakdown.open?.percentage || 0).toFixed(1)),
                color: breakdown.open?.colorCode || "#FE6A35",
                count: breakdown.open?.count || 0,
              },
              {
                name: "Cancelled",
                value: Number(
                  (breakdown.cancelled?.percentage || 0).toFixed(1)
                ),
                color: breakdown.cancelled?.colorCode || "#544FC5",
                count: breakdown.cancelled?.count || 0,
              },
            ];

            console.log("Formatted chart data:", chartData);

            setOccupancyData({
              occupancyRate: Number((current.occupancyRate || 0).toFixed(1)),
              breakdown: chartData,
              trend: {
                direction: difference?.trend || "up",
                value: Number((difference?.value || 0).toFixed(1)),
              },
            });
          } else {
            console.error("Invalid data structure:", apiData);
            setError("Invalid data format received from server");
          }
        } else {
          setError(response.message || "Failed to fetch occupancy data");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch occupancy data");
      } finally {
        setLoading(false);
      }
    };

    if (dateRange) {
      fetchData();
    }
  }, [dateRange, customDateRange, propertyIds]);

  // Calculate center value for donut chart
  const getCenterValue = () => {
    return `${occupancyData.occupancyRate.toFixed(1)}%`;
  };

  // Get trend icon
  const getTrendIcon = () => {
    return occupancyData.trend.value >= 0 ? (
      <FaAnglesUp className="w-5 h-5" />
    ) : (
      <FaAnglesDown className="w-5 h-5" />
    );
  };

  // Get trend color
  const getTrendColor = () => {
    return occupancyData.trend.value >= 0 ? "#56A968" : "#F87171";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-4 flex flex-col min-w-0 w-full">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <div className="text-lg font-semibold text-[#654EE4] mb-1">
              Occupancy Rate
            </div>
            <div className="text-sm text-gray-500">{dateRange}</div>
          </div>
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
              Occupancy Rate
            </div>
            <div className="text-sm text-gray-500">{dateRange}</div>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-red-500 text-center">
            <p className="text-sm">Failed to load occupancy data</p>
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
            Occupancy Rate
          </div>
          <div className="text-sm text-gray-500">{dateRange}</div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-lg font-semibold"
            style={{ color: getTrendColor() }}
          >
            {occupancyData.trend.value > 0 ? "+" : ""}
            {Number(occupancyData.trend.value.toFixed(2))}%
          </span>
          <span className="text-lg" style={{ color: getTrendColor() }}>
            {getTrendIcon()}
          </span>
          <AiOutlineInfoCircle 
            className="w-5 h-5 text-[#7D7F88] cursor-pointer" 
            onClick={() => setShowInfoModal(true)}
          />
        </div>
      </div>

      <div className="w-full max-w-xl mx-auto">
        <div className="text-center text-md font-medium text-[#656575] my-2">
          Occupancy Breakdown
        </div>

        {occupancyData.breakdown.length > 0 ? (
          <>
            <DonutChart
              data={occupancyData.breakdown}
              centerValue={getCenterValue()}
            />
            <div className="flex flex-wrap justify-center gap-6">
              {occupancyData.breakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#222]">
                    {item.name}
                  </span>
                  <span
                    className="rounded-full px-5 py-1 font-bold text-white text-base"
                    style={{ background: item.color }}
                  >
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No occupancy data available
          </div>
        )}
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/30  flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <div className="text-lg font-semibold text-[#222] mb-3 text-center">
              Occupancy Rate
            </div>
            <div className="text-sm text-gray-600 mb-6 ">
            This shows the percentage of booked nights out of total available nights across your listings and breakdown of percentage of nights marked as Reserved, Cancelled, Blocked, or Open across your listings.  </div>
         
            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full bg-[#2694D0] text-white cursor-pointer py-3 px-4 rounded-lg font-medium  transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}