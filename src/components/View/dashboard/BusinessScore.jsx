import React, { useState, useEffect } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaAnglesUp, FaAnglesDown } from "react-icons/fa6";
import { MdOutlineHotel } from "react-icons/md";
import { getDateRange } from "../../../utils/DateUtils";
import { fetchBusinessScoreData } from "../../Controller/livefeed/businessScoreController";

export default function BusinessScore({
  dateRange,
  customDateRange = null,
  propertyIds = [],
}) {
  const [scoreData, setScoreData] = useState(null);
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
          setScoreData(response.data.data.businessScore);
        } else {
          setError(response.message || "Failed to fetch business score data");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch business score data");
      } finally {
        setLoading(false);
      }
    };
    if (dateRange) fetchData();
  }, [dateRange, customDateRange, propertyIds]);

  const getTrendIcon = (val) =>
    val >= 0 ? (
      <FaAnglesUp className="w-5 h-5" />
    ) : (
      <FaAnglesDown className="w-5 h-5" />
    );
  const getTrendColor = (val) => (val >= 0 ? "#56A968" : "#F87171");

  if (loading)
    return <div className="bg-white rounded-xl shadow p-5">Loading...</div>;
  if (error)
    return (
      <div className="bg-white rounded-xl shadow p-5 text-red-500">{error}</div>
    );
  if (!scoreData) return null;

  return (
    <div className="w-full mx-auto">
      <div className="text-[#F14467] text-lg font-semibold mb-2 uppercase">
        Business Score
      </div>
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <div className="text-lg font-semibold text-[#654EE4]">
              Business Score
            </div>
            <div className="text-sm text-gray-500">{dateRange}</div>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="text-lg font-semibold"
              style={{ color: getTrendColor(scoreData.ratingChangePercent) }}
            >
              {scoreData.ratingChangePercent > 0 ? "+" : ""}
              {Number(scoreData.ratingChangePercent?.toFixed(2))}%
            </span>
            <span
              style={{ color: getTrendColor(scoreData.ratingChangePercent) }}
            >
              {getTrendIcon(scoreData.ratingChangePercent)}
            </span>
            <AiOutlineInfoCircle 
              className="text-gray-400 w-5 h-5 ml-1 cursor-pointer" 
              onClick={() => setShowInfoModal(true)}
            />
          </div>
        </div>
        <div className="bg-[#FFE3CB] mt-4 rounded-xl flex items-center justify-between p-6 relative">
          <div>
            <div className="text-base text-[#222] font-medium mb-1">
              Overall Score
            </div>
            <div className="text-4xl font-bold text-[#222]">
              {Number(scoreData.averageRating?.toFixed(2))}
            </div>
          </div>
          <div className="absolute right-0 top-0 w-16 h-16 "><img src="/images/rectangle-business.svg" className="rounded-tr-xl" alt="rectangle"/></div> 
          <MdOutlineHotel className="absolute right-6 top-4 w-10 h-10 text-[#BD8257]" />
        </div>
        <div className="text-[#656575] text-lg font-medium mt-5 mb-3 ml-1">
          Business Score Breakdown
        </div>
        <div className="border border-gray-200 rounded-xl px-4 py-4 bg-white">
          {scoreData.groupedByOTA &&
            scoreData.groupedByOTA.map((item) => {
              const scorePercent = (item.avgRating / item.maxRating) * 100;
              const reviewPercent =
                (item.reviewCount / item.lifetimeReviewCount) * 100;
              return (
                <div key={item.ota} className="flex items-start mb-6">
                  <div className="w-28 text-sm text-gray-800 font-medium pt-1">
                    {item.ota}
                  </div>
                  <div className="flex-1 flex flex-col gap-0">
                    <div className="relative h-5 rounded-sm overflow-hidden bg-[#F1F3FE]">
                      <div
                        className="h-full flex items-center justify-center text-xs font-bold text-[#5940C8]"
                        style={{
                          width: `${scorePercent}%`,
                          backgroundColor: item.colorCode,
                        }}
                      >
                        {item.avgRating}/{item.maxRating}
                      </div>
                    </div>
                    <div className="relative h-5 rounded-sm overflow-hidden bg-[#F1F3FE]">
                      <div
                        className="h-full flex items-center justify-center text-xs font-bold text-[#5940C8]"
                        style={{
                          width: `${reviewPercent}%`,
                          backgroundColor: "#BDBDBD",
                        }}
                      >
                        {item.reviewCount}/{item.lifetimeReviewCount}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          <div className="flex justify-between px-8 mt-2 text-xs text-gray-400 font-semibold">
            <span>0</span>
            <span>20</span>
            <span>40</span>
            <span>60</span>
            <span>80</span>
            <span>100</span>
            <span className="ml-1">Reviews</span>
          </div>
        </div>

        {/* Info Modal */}
        {showInfoModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
              <div className="text-lg font-semibold text-[#222] mb-3 text-center">
                Business Score
              </div>
              <div className="text-sm text-gray-600 mb-6">
                Displaying overall ratings for all connected channels and best performing channels and which channels can be optimized to get more reservations.
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