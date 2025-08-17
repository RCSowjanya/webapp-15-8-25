"use client";
import React, { useState, useEffect } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaAnglesUp, FaAnglesDown } from "react-icons/fa6";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchOccupancyData } from "../../Controller/livefeed/occupancyController";

export default function OccupancyTrendCard({
  dateRange,
  customDateRange = null,
  propertyIds = [],
}) {
  const [trendData, setTrendData] = useState([]);
  const [percentageChange, setPercentageChange] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentRate, setCurrentRate] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Fetch occupancy trend data when dateRange, customDateRange, or propertyIds change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let startDate, endDate;

        if (dateRange === "Custom Range" && customDateRange) {
          // Use custom date range
          startDate = customDateRange.startDate;
          endDate = customDateRange.endDate;
        } else {
          // Calculate date range based on selection
          const now = new Date();
          const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );

          switch (dateRange) {
            case "Last 7 Days":
              const sevenDaysAgo = new Date(today);
              sevenDaysAgo.setDate(today.getDate() - 7);
              startDate = sevenDaysAgo.toISOString().split("T")[0];
              endDate = today.toISOString().split("T")[0];
              break;
            case "Last 30 Days":
              const thirtyDaysAgo = new Date(today);
              thirtyDaysAgo.setDate(today.getDate() - 30);
              startDate = thirtyDaysAgo.toISOString().split("T")[0];
              endDate = today.toISOString().split("T")[0];
              break;
            case "Last 3 Months":
              const threeMonthsAgo = new Date(today);
              threeMonthsAgo.setMonth(today.getMonth() - 3);
              startDate = threeMonthsAgo.toISOString().split("T")[0];
              endDate = today.toISOString().split("T")[0];
              break;
            case "Last 6 Months":
              const sixMonthsAgo = new Date(today);
              sixMonthsAgo.setMonth(today.getMonth() - 6);
              startDate = sixMonthsAgo.toISOString().split("T")[0];
              endDate = today.toISOString().split("T")[0];
              break;
            case "Last Year":
              const oneYearAgo = new Date(today);
              oneYearAgo.setFullYear(today.getFullYear() - 1);
              startDate = oneYearAgo.toISOString().split("T")[0];
              endDate = today.toISOString().split("T")[0];
              break;
            default:
              setLoading(false);
              return;
          }
        }

        console.log("Calling occupancy trend API with:", {
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
        console.log("Occupancy Trend API response:", response);

        if (response.success) {
          // Format the data for the chart
          const apiData = response.data;
          console.log("Processing Occupancy Trend API data:", apiData);

          // Extract trend data from the API response
          // The correct path is: response.data.data.occupancyTrend
          const occupancyTrend = apiData?.data?.occupancyTrend;

          if (occupancyTrend && occupancyTrend.chartData) {
            // Map the API data to the expected format for the chart
            const formattedData = occupancyTrend.chartData.map((item) => {
              // Convert date format from "2025-02-16" to "Feb 16" format
              const date = new Date(item.tag);
              const formattedDate = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              return {
                date: formattedDate,
                value1: item.pastOccupancyPercentage || 0, // Grey bar (past)
                value2: item.occupancyPercentage || 0, // Yellow bar (current)
              };
            });

            console.log("Formatted trend data:", formattedData);
            setTrendData(formattedData);
            setPercentageChange(occupancyTrend.percentageChange || 0);
            setCurrentRate(occupancyTrend.currentOccupancyRate || 0);
          } else {
            // Fallback to static data if API doesn't return trend data
            console.log("No trend data found in API response, using fallback");
            console.log("Available data structure:", apiData);
            setTrendData(getFallbackData());
            setPercentageChange(8);
          }
        } else {
          setError(response.message || "Failed to fetch occupancy trend data");
        }
      } catch (err) {
        console.error("Occupancy Trend API Error:", err);
        setError(err.message || "Failed to fetch occupancy trend data");
      } finally {
        setLoading(false);
      }
    };

    if (dateRange) {
      fetchData();
    }
  }, [dateRange, customDateRange, propertyIds]);

  // Fallback data if API doesn't return trend data
  // const getFallbackData = () => {
  //   return [
  //     { date: "Apr 15", value1: 20, value2: 40 },
  //     { date: "Apr 16", value1: 12, value2: 21 },
  //     { date: "Apr 17", value1: 19, value2: 40 },
  //     { date: "Apr 18", value1: 44, value2: 31 },
  //     { date: "Apr 19", value1: 12, value2: 9 },
  //     { date: "Apr 20", value1: 30, value2: 19 },
  //     { date: "Apr 22", value1: 20, value2: 18 },
  //     { date: "Apr 23", value1: 30, value2: 19 },
  //     { date: "Apr 24", value1: 27, value2: 48 },
  //   ];
  // };

  // Get trend icon
  const getTrendIcon = () => {
    return percentageChange >= 0 ? (
      <FaAnglesUp className="w-5 h-5" />
    ) : (
      <FaAnglesDown className="w-5 h-5" />
    );
  };

  // Get trend color
  const getTrendColor = () => {
    return percentageChange >= 0 ? "#56A968" : "#F87171";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-4 flex flex-col mt-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <div className="text-lg font-semibold text-[#654EE4] mb-1">
              Occupancy rate Trend
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
      <div className="bg-white rounded-xl shadow p-4 flex flex-col mt-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <div className="text-lg font-semibold text-[#654EE4] mb-1">
              Occupancy rate Trend
            </div>
            <div className="text-sm text-gray-500">{dateRange}</div>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-red-500 text-center">
            <p className="text-sm">Failed to load occupancy trend data</p>
            <p className="text-xs text-gray-500 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col mt-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <div className="text-lg font-semibold text-[#654EE4] mb-1">
            Occupancy rate Trend
          </div>
          <div className="text-sm text-gray-500">{dateRange}</div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-lg font-semibold"
            style={{ color: getTrendColor() }}
          >
            {percentageChange}%
          </span>
          <span className="text-lg" style={{ color: getTrendColor() }}>
            {getTrendIcon()}
          </span>
          <AiOutlineInfoCircle 
            className="w-5 h-5 text-gray-400 cursor-pointer" 
            onClick={() => setShowInfoModal(true)}
          />
        </div>
      </div>
      <div className="w-full mt-4">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={trendData} barCategoryGap={32} barGap={0}>
            <XAxis
              dataKey="date"
              fontSize={14}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              fontSize={14}
              tickLine={false}
              axisLine={false}
              label={{
                value: "Daily Occupancy (%)",
                angle: -90,
                position: "insideCenter",
                fontSize: 14,
                fill: "#888",
                dx: -18,
              }}
            />
            <Tooltip />
            <Bar
              dataKey="value1"
              fill="#AE9B9B"
              radius={[2, 2, 0, 0]}
              barSize={16}
            />
            <Bar
              dataKey="value2"
              fill="#F3B756"
              radius={[2, 2, 0, 0]}
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <div className="text-lg font-semibold text-[#222] mb-3 text-center">
              Occupancy Rate Trend
            </div>
            <div className="text-sm text-gray-600 mb-6">
              This chart shows how your occupancy rate is changing over time, compared to the previously selected period.
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