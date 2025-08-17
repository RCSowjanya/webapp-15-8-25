import React, { useState, useEffect } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaAnglesUp, FaAnglesDown } from "react-icons/fa6";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { getDateRange } from "../../../utils/DateUtils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Label,
} from "recharts";
import { fetchRevenueData } from "../../Controller/livefeed/revenueController";

export default function RevPAR({ dateRange, customDateRange = null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [revparData, setRevparData] = useState([]);
  const [trendPercent, setTrendPercent] = useState(0);
  const [adrPercentageChange, setAdrPercentageChange] = useState(0);
  const [adr, setAdr] = useState(null);
  const [showRevPARModal, setShowRevPARModal] = useState(false);

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
          // Use the correct path for RevPAR data
          setRevparData(response.data.data.RevPAR?.RevPAR || []);
          setTrendPercent(
            response.data.data.revparComparison?.percentageChange ?? 0
          );
          setAdrPercentageChange(
            response.data.data.RevPAR?.adr?.adrPercentageChange ?? 0
          );
          setAdr(response.data.data.RevPAR?.adr?.currentADR ?? null);
        } else {
          setError(response.message || "Failed to fetch RevPAR data");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch RevPAR data");
      } finally {
        setLoading(false);
      }
    };
    if (dateRange) fetchData();
  }, [dateRange, customDateRange]);

  // Prepare chart data for RevPAR
  const chartData = revparData.map((item) => ({
    date: item.tag
      ? new Date(item.tag).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "",
    revpar: item.revenue,
  }));

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "#fff",
            padding: 18,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            borderRadius: 4,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: 20,
              color: "#222",
              marginBottom: 4,
            }}
          >
            {label}
          </div>
          <div style={{ color: "#2ECC40", fontSize: 20, fontWeight: 500 }}>
            RevPAR : {payload[0].value}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading)
    return <div className="bg-white rounded-xl shadow p-4">Loading...</div>;
  if (error)
    return (
      <div className="bg-white rounded-xl shadow p-4 text-red-500">{error}</div>
    );

  // Custom Y-axis ticks: leave the first grid square empty, start at 1100
  const yTicks = [1100, 1200, 1300, 1400, 1500, 1600];
  return (
    <div className="w-full bg-white rounded-xl shadow p-4 mt-1">
      <div className="flex items-center justify-between border-b border-gray-200 mb-4">
        <div>
          <div className="text-lg font-semibold text-[#654EE4] mb-1">
            RevPAR
          </div>
          <div className="text-sm text-gray-500 mb-1">
            Revenue Per Available Room
          </div>
          <div className="text-sm text-gray-500 mb-4">{dateRange}</div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-lg font-semibold"
            style={{ color: adrPercentageChange >= 0 ? "#56A968" : "#F87171" }}
          >
            {adrPercentageChange > 0 ? "+" : ""}
            {Number(adrPercentageChange?.toFixed(2))}%
          </span>
          <span style={{ color: adrPercentageChange >= 0 ? "#56A968" : "#F87171" }}>
            {adrPercentageChange >= 0 ? <FaAnglesUp className="w-5 h-5" /> : <FaAnglesDown className="w-5 h-5" />}
          </span>
          <AiOutlineInfoCircle 
            className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" 
            onClick={() => setShowRevPARModal(true)}
          />
        </div>
      </div>
      {/* ADR Card */}
      <div className="bg-[#9DEEE6] rounded-xl flex items-center justify-between  p-6 mb-6 relative">
        <div>
          <div className="text-xl text-[#222] font-medium mb-1">
            ADR (Avg Daily Rate)
          </div>
          <div className="text-2xl font-bold text-[#222]">
            {adr !== null ? `SAR ${adr}` : "SAR --"}
          </div>
        </div>
        <div className="absolute right-0 top-0 w-14 h-14  "><img src="/images/rectangle-revpar.svg" className="rounded-tr-xl" alt="rectangle"/></div> 
   
        <div className="absolute right-4 top-8 w-8 h-8 max-[600px]:right-2  max-[600px]:top-12 flex items-center justify-center rounded-full opacity-60">
          <img src="/images/calendar-blank-outline.svg" alt="calendar" className="w-8 h-8 text-[#3B6B6B]" />
        </div>
         </div>
      {/* Chart */}
      <div className="w-full flex flex-col items-center">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 40, right: 30, left: 10, bottom: 40 }}
          >
            {/* Chart Title */}
            <svg width="100%" height={60} viewBox="0 0 350 60">
              <foreignObject x="0" y="0" width="100%" height="60">
                <div
                  style={{
                    width: "100%",
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: 16,
                    color: "#222",
                    wordBreak: "break-word",
                    lineHeight: 1.2,
                  }}
                >
                  Daily RevPAR Trend
                </div>
              </foreignObject>
            </svg>
            <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              angle={-30}
              textAnchor="end"
              fontSize={13}
              dy={24}
              tickLine={false}
              axisLine={{ stroke: "#bbb" }}
              interval={0}
            >
              <Label
                value="Date"
                offset={20}
                position="outsideBottom"
                fontSize={16}
                fill="#222"
              />
            </XAxis>
            <YAxis
              fontSize={13}
              tickLine={false}
              axisLine={{ stroke: "#bbb" }}
              label={{
                value: "RevPAR (SAR)",
                angle: -90,
                position: "insideCenter",
                dx: -30,
                fontSize: 16,
                fill: "#222",
              }}
              ticks={yTicks}
              domain={[1000, 1600]}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#bbb", strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="revpar"
              stroke="#2ECC40"
              strokeWidth={2}
              dot={{ stroke: "#2ECC40", fill: "#2ECC40", r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* RevPAR Info Modal */}
      {showRevPARModal && (
        <div className="fixed inset-0 bg-black/30  flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            {/* Close button */}
            {/* <button
              onClick={() => setShowRevPARModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <IoMdClose className="w-6 h-6 cursor-pointer" />
            </button> */}
            
            {/* Modal content */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4">RevPAR</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Tracks revenue per available room, calculated by multiplying ADR (Average Daily Rate) by Occupancy Rate.
              </p>
              <button
                onClick={() => setShowRevPARModal(false)}
                className="w-full bg-[#2694D0] text-white cursor-pointer py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}