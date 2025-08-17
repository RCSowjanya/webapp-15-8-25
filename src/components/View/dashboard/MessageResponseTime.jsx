import React, { useState, useEffect } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaAnglesUp, FaAnglesDown } from "react-icons/fa6";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { getDateRange } from "../../../utils/DateUtils";
import { fetchBusinessScoreData } from "../../Controller/livefeed/businessScoreController";

export default function MessageResponseTime({
  dateRange,
  customDateRange = null,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [averageLeadTime, setAverageLeadTime] = useState(null);
  const [trendPercent, setTrendPercent] = useState(null);
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
        const response = await fetchBusinessScoreData({
          startDate,
          endDate,
        });
        console.log("API response:", response);
        if (response.success) {
          const leadTime = response.data.data.leadTime;
          console.log("leadTime:", leadTime);
          setAverageLeadTime(leadTime?.averageLeadTimeMinutes ?? null);
          setTrendPercent(leadTime?.comparativeChangePercent ?? null);
        } else {
          setError(response.message || "Failed to fetch lead time data");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch lead time data");
      } finally {
        setLoading(false);
      }
    };
    if (dateRange) fetchData();
  }, [dateRange, customDateRange]);

  const getTrendIcon = (val) =>
    val >= 0 ? (
      <FaAnglesUp className="w-5 h-5 text-[#56A968]" />
    ) : (
      <FaAnglesDown className="w-5 h-5 text-[#F87171]" />
    );

  function formatMinutesToHrMin(minutes) {
    if (minutes == null) return "--";
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hrs > 0) return `${hrs} hr ${mins} min`;
    return `${mins} min`;
  }

  if (loading)
    return <div className="bg-white rounded-xl shadow p-4">Loading...</div>;
  if (error)
    return (
      <div className="bg-white rounded-xl shadow p-4 text-red-500">{error}</div>
    );

  console.log("averageLeadTime in render:", averageLeadTime);

  return (
    <div className="w-full bg-white rounded-xl shadow p-4 mt-1">
      <div className="flex items-center justify-between border-b border-gray-200 mb-4">
        <div>
          <div className="text-lg font-semibold text-[#654EE4] mb-1">
            Message Response Time
          </div>
          <div className="text-sm text-gray-500 mb-1">{dateRange}</div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-lg font-semibold"
            style={{ color: trendPercent >= 0 ? "#56A968" : "#F87171" }}
          >
            {trendPercent !== null
              ? `${trendPercent > 0 ? "+" : ""}${Number(trendPercent).toFixed(
                  2
                )}%`
              : "--"}
          </span>
          <span>
            {trendPercent !== null ? getTrendIcon(trendPercent) : null}
          </span>
          <AiOutlineInfoCircle 
            className="w-5 h-5 text-gray-400 cursor-pointer" 
            onClick={() => setShowInfoModal(true)}
          />
        </div>
      </div>
      {/* Average Response Time Card */}
      <div className="bg-[#D3E5F6] rounded-xl flex items-center justify-between p-6 mb-2 relative">
        <div>
          <div className="text-xl text-[#222] font-medium mb-1">
            Average Response Time
          </div>
          <div className="text-2xl font-bold text-[#222]">
            {averageLeadTime !== null ? `${averageLeadTime} min` : "--"}
          </div>
        </div>
        <div className="absolute right-0 top-0 w-14 h-14"><img src="/images/rectangle-avg.svg" className="rounded-tr-xl" alt="rectangle"/></div> 
        <div className=" ">
          <img src="/images/calender-msg.svg" className="absolute right-6 top-8 w-6 h-6  text-[#3B6B6B]" />
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <div className="text-lg font-semibold text-[#222] mb-3 text-center">
              Message Response Time
            </div>
            <div className="text-sm text-gray-600 mb-6">
              Displays your average reply time to guest messages. Faster replies can help increase reservations and guest satisfaction.
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