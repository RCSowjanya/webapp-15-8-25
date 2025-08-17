import React, { useState, useEffect } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaAnglesUp, FaAnglesDown } from "react-icons/fa6";
import { getDateRange } from "../../../utils/DateUtils";
import {
  BarChart,
  Bar,
  LineChart,
  Cell,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { fetchRevenueData } from "../../Controller/livefeed/revenueController";

export default function RevenueTrend({ dateRange, customDateRange = null }) {
  const [tab, setTab] = useState("revenue");
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [cashFlow, setCashFlow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

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

        const response = await fetchRevenueData({
          startDate,
          endDate,
        });
        if (response.success) {
          setRevenueTrend(response.data.data.revenueTrend || []);
          setCashFlow(response.data.data.cashFlow || null);
        } else {
          setError(response.message || "Failed to fetch revenue data");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch revenue data");
      } finally {
        setLoading(false);
      }
    };
    if (dateRange) fetchData();
  }, [dateRange, customDateRange]);

  const getTrendIcon = (val) =>
    val >= 0 ? (
      <FaAnglesUp className="w-5 h-5" />
    ) : (
      <FaAnglesDown className="w-5 h-5" />
    );
  const getTrendColor = (val) => (val >= 0 ? "#56A968" : "#F87171");

  if (loading)
    return <div className="bg-white rounded-xl shadow p-4">Loading...</div>;
  if (error)
    return (
      <div className="bg-white rounded-xl shadow p-4 text-red-500">{error}</div>
    );

  // Prepare chart data for revenue
  const chartData = revenueTrend.map((item) => ({
    date: new Date(item.label).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    revenue: item.current,
    previous: item.previous,
  }));

  // Prepare cash flow data for bar chart
  const cashflowData =
    cashFlow && cashFlow.cashFlow
      ? Object.entries(cashFlow.cashFlow).map(([key, val]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: val.value,
          color: val.colorCode,
        }))
      : [];

  // Get trend percent and color for header (from cashFlow.comparison.percentageChange)
  const trendPercent = cashFlow?.comparison?.percentageChange ?? 0;

  return (
    <div className="w-full">
      <div className="text-lg font-semibold text-[#F14467] mb-1 uppercase">
        Revenue & Earnings Summary
      </div>
      <div className="bg-white rounded-xl shadow p-4 flex flex-col mt-2">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <div className="text-md font-semibold text-[#654EE4] mb-1">
              Revenue Trend
            </div>
            <div className="text-sm text-gray-500">{dateRange}</div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-lg font-semibold"
              style={{ color: getTrendColor(trendPercent) }}
            >
              {trendPercent > 0 ? "+" : ""}
              {Number(trendPercent?.toFixed(2))}%
            </span>
            <span style={{ color: getTrendColor(trendPercent) }}>
              {getTrendIcon(trendPercent)}
            </span>
            <AiOutlineInfoCircle 
              className="w-5 h-5 text-gray-400 cursor-pointer" 
              onClick={() => setShowInfoModal(true)}
            />
          </div>
        </div>
        {/* Tab Switcher */}
        <div className="flex gap-0 mt-6 mb-6 w-full">
          <button
            className={`flex-1 py-2 cursor-pointer rounded-full text-lg font-semibold transition-all ${
              tab === "revenue"
                ? "bg-[#6C4EE6] text-white"
                : "bg-[#F5F3FA] text-[#555]"
            }`}
            onClick={() => setTab("revenue")}
          >
            Revenue
          </button>
          <button
            className={`flex-1 py-2 cursor-pointer rounded-full text-lg font-semibold transition-all ${
              tab === "cashflow"
                ? "bg-[#6C4EE6] text-white"
                : "bg-[#F5F3FA] text-[#555]"
            }`}
            onClick={() => setTab("cashflow")}
          >
            Cash flow
          </button>
        </div>
        {/* Chart */}
        {tab === "revenue" && (
          <div className="w-full flex justify-center">
            <ResponsiveContainer width="90%" height={300}>
              <LineChart
                data={chartData}
                margin={{ top: 40, right: 30, left: 10, bottom: 30 }}
              >
                <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  angle={-30}
                  textAnchor="end"
                  fontSize={12}
                  dy={10}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: "Daily Revenue (SAR)",
                    angle: -90,
                    position: "insideCenter",
                    dx: -30,
                    fontSize: 14,
                    fill: "#888",
                  }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2ECC40"
                  strokeWidth={2}
                  dot={{ stroke: "#2ECC40", fill: "#2ECC40", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {tab === "cashflow" && (
          <div className="w-full flex flex-col items-center">
            {/* Additional Cash Flow Details */}
            {cashFlow && (
              <div className="w-full mb-4 flex flex-wrap gap-4 justify-center">
               
              </div>
            )}
            <div className="w-full " style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={cashflowData}
                  margin={{ top: 30, right: 30, left: 80, bottom: 5 }}
                  barCategoryGap={20}
                >
                  <XAxis type="number" fontWeight={600}  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    fontSize={13}
                    width={70}
                    fontWeight={600}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    isAnimationActive={false}
                    barSize={24}
                    radius={0}
                  >
                    {cashflowData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Info Modal */}
        {showInfoModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
              <div className="text-lg font-semibold text-[#222] mb-3 text-center">
                Revenue Trend
              </div>
              <div className="text-sm text-gray-600 mb-6">
                Tracks your net earnings over time after fees and taxes, with comparison to previous performance. Note: The breakdown currently does not include Agoda.
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
    </div>
  );
}