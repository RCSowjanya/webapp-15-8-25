import React, { useState, useEffect } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaAnglesUp, FaAnglesDown } from "react-icons/fa6";
import { MdOutlineHotel } from "react-icons/md";
import { getDateRange } from "../../../utils/DateUtils";
import { fetchBusinessScoreData } from "../../Controller/livefeed/businessScoreController";

export default function RepeatGuests({
  dateRange,
  customDateRange = null,
  propertyIds = [],
}) {
  const [userStats, setUserStats] = useState(null);
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

        const response = await fetchBusinessScoreData({ startDate, endDate, propertyIds });
        if (response.success) {
          setUserStats(response.data.data.userStats);
        } else {
          setError(response.message || "Failed to fetch repeat guest data");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch repeat guest data");
      } finally {
        setLoading(false);
      }
    };
    if (dateRange) fetchData();
  }, [dateRange, customDateRange, propertyIds]);

  const getTrendIcon = (val) =>
    val >= 0 ? (
      <FaAnglesUp className="w-5 h-5 text-[#56A968]" />
    ) : (
      <FaAnglesDown className="w-5 h-5 text-[#F87171]" />
    );
  const getTrendColor = (val) => (val >= 0 ? "#56A968" : "#F87171");

  if (loading)
    return <div className="bg-white rounded-xl shadow p-4">Loading...</div>;
  if (error)
    return (
      <div className="bg-white rounded-xl shadow p-4 text-red-500">{error}</div>
    );
  if (!userStats) return null;

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col mt-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <div className="text-lg font-semibold text-[#654EE4] mb-1">
            Repeat Guests
          </div>
          <div className="text-sm text-gray-500">{dateRange}</div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-lg font-semibold"
            style={{
              color: getTrendColor(userStats.repeatedUserComparisonPercent),
            }}
          >
            {userStats.repeatedUserComparisonPercent > 0 ? "+" : ""}
            {Number(userStats.repeatedUserComparisonPercent?.toFixed(2))}%
          </span>
          <span>{getTrendIcon(userStats.repeatedUserComparisonPercent)}</span>
          <AiOutlineInfoCircle 
            className="w-5 h-5 text-gray-400 cursor-pointer" 
            onClick={() => setShowInfoModal(true)}
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        {/* Unique Guests */}
        <div className="flex-1 bg-[#FFF2B5] rounded-xl p-6 flex flex-col justify-between relative min-w-[200px]">
          <div className="text-lg font-medium text-[#222] mb-2">
            Unique Guests
          </div>
          <div className="text-4xl font-bold text-[#222] mb-2">
            {userStats.uniqueUsers}
          </div>
          <div className="absolute right-0 top-0 w-14 h-14 "><img src="/images/rectangle-unique.svg" className="rounded-tr-xl"alt="rectangle"/></div> 
          <MdOutlineHotel className="absolute right-6 bottom-4 w-10 h-10 text-[#D6C48B]" />
        </div>
        {/* Repeat Guest Bookings */}
        <div className="flex-1 bg-[#CAC1FF] rounded-xl p-6 flex flex-col justify-between relative min-w-[200px]">
          <div className="text-lg font-medium text-[#222] mb-2">
            Repeat Guest Bookings
          </div>
          <div className="text-4xl font-bold text-[#222] mb-2">
            {userStats.repeatedUsers}
          </div>
          <div className="absolute right-0 top-0 w-14 h-14 "><img src="/images/rectangle-repeat.svg" className="rounded-tr-xl"alt="rectangle"/></div> 
        
          <MdOutlineHotel className="absolute right-6 bottom-4 w-10 h-10 text-[#A89BD6]" />
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <div className="text-lg font-semibold text-[#222] mb-3 text-center">
              Repeat Guests
            </div>
            <div className="text-sm text-gray-600 mb-6">
              Shows how many of your past guests booked again during the selected time period.
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