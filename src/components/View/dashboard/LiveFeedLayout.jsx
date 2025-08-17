"use client";
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Sector,
} from "recharts";
import { IoMdArrowDropdown } from "react-icons/io";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaAnglesUp } from "react-icons/fa6";
import DonutChart from "./DonutChart";
import OccupancyCard from "./OccupancyCard";
import OccupancySourceCard from "./OccupancySourceCard";
import OccupancyTrendCard from "./OccupancyTrendCard";
import BusinessScore from "./BusinessScore";
import RepeatGuests from "./RepeatGuests";
import RevenueTrend from "./RevenueTrend";
import RevPAR from "./RevPAR";
import MessageResponseTime from "./MessageResponseTime";
import FilterModal from "../../Models/livefeed/FilterModel";
import PropertySelectModal from "../../Models/livefeed/PropertySelectModel";
import CitySelectModal from "../../Models/livefeed/CitySelectModel";
import NeighbourhoodSelectModal from "../../Models/livefeed/NeighbourhoodSelectModel";
import { useTimeline } from "../../layout/ClientLayout";
import { getAllProperties } from "../../Controller/livefeed/AllProperties";

export default function LiveFeedLayout() {
  const [mounted, setMounted] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedPropertyLabel, setSelectedPropertyLabel] = useState("");
  const [selectedPropertyUnitNo, setSelectedPropertyUnitNo] = useState("");
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [isNeighbourhoodModalOpen, setIsNeighbourhoodModalOpen] =
    useState(false);
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState("");

  // Store the property list for filtering
  const [propertyList, setPropertyList] = useState([]);

  // Use timeline context for date range state
  const {
    selectedDateRange,
    setSelectedDateRange,
    customDateRange,
    setCustomDateRange,
  } = useTimeline();

  useEffect(() => {
    setMounted(true);
    // Fetch property list on component mount
    fetchPropertyList();
  }, []);

  const fetchPropertyList = async () => {
    try {
      const response = await getAllProperties();
      if (response.success && Array.isArray(response.properties)) {
        setPropertyList(response.properties);
      }
    } catch (error) {
      console.error("Failed to fetch property list:", error);
    }
  };

  const handleFilterClick = () => {
    setIsFilterModalOpen(true);
  };

  const handlePropertyClick = () => {
    setIsPropertyModalOpen(true);
  };

  const handleCityClick = () => {
    setIsCityModalOpen(true);
  };

  const handleNeighbourhoodClick = () => {
    setIsNeighbourhoodModalOpen(true);
  };

  // Use context setters for timeline
  const handleApplyFilters = (filters) => {
    setSelectedDateRange(filters.dateRange);

    // Handle custom date range
    if (
      filters.dateRange === "Custom Range" &&
      filters.customStartDate &&
      filters.customEndDate
    ) {
      setCustomDateRange({
        startDate: filters.customStartDate,
        endDate: filters.customEndDate,
      });
    } else {
      setCustomDateRange(null);
    }

    // Here you would typically make API calls to fetch filtered data
    console.log("Applied filters:", filters);
  };

  const handlePropertySelect = (propertyData) => {
    console.log("Property selected:", propertyData);
    if (propertyData === "all") {
      setSelectedProperty(null);
      setSelectedPropertyLabel("All Properties");
      setSelectedPropertyUnitNo("");
      // Clear city and neighbourhood selections when "All Properties" is selected
      setSelectedCity("");
      setSelectedNeighbourhood("");
    } else {
      // propertyData should be an object with _id and unitNo
      setSelectedProperty(propertyData._id);
      setSelectedPropertyLabel(propertyData.unitNo);
      setSelectedPropertyUnitNo(propertyData.unitNo);
      // Clear city and neighbourhood selections when specific property is selected
      setSelectedCity("");
      setSelectedNeighbourhood("");
    }
    console.log(
      "After property selection - Property:",
      propertyData,
      "City cleared, Neighbourhood cleared"
    );
  };

  const handleCitySelect = (city) => {
    console.log("City selected:", city);
    if (city === "all") {
      setSelectedCity("");
      // Clear property and neighbourhood selections when "All Cities" is selected
      setSelectedProperty(null);
      setSelectedPropertyLabel("");
      setSelectedPropertyUnitNo("");
      setSelectedNeighbourhood("");
    } else {
      setSelectedCity(city);
      // Clear property and neighbourhood selections when specific city is selected
      setSelectedProperty(null);
      setSelectedPropertyLabel("");
      setSelectedPropertyUnitNo("");
      setSelectedNeighbourhood("");
    }
    console.log(
      "After city selection - City:",
      city,
      "Property cleared, Neighbourhood cleared"
    );
  };

  const handleNeighbourhoodSelect = (neighbourhood) => {
    console.log("Neighbourhood selected:", neighbourhood);
    if (neighbourhood === "all") {
      setSelectedNeighbourhood("");
      // Clear property and city selections when "All Neighbourhoods" is selected
      setSelectedProperty(null);
      setSelectedPropertyLabel("");
      setSelectedPropertyUnitNo("");
      setSelectedCity("");
    } else {
      setSelectedNeighbourhood(neighbourhood);
      // Clear property and city selections when specific neighbourhood is selected
      setSelectedProperty(null);
      setSelectedPropertyLabel("");
      setSelectedPropertyUnitNo("");
      setSelectedCity("");
    }
    console.log(
      "After neighbourhood selection - Neighbourhood:",
      neighbourhood,
      "Property cleared, City cleared"
    );
  };

  // Helper function to get property IDs based on current filters
  const getFilteredPropertyIds = () => {
    // Priority: Property > City > Neighbourhood > All

    if (selectedProperty) {
      return [selectedProperty]; // Specific property
    }

    if (selectedCity) {
      // Filter properties by city
      const cityFilteredProperties = propertyList.filter(
        (property) => property.address?.city === selectedCity
      );
      return cityFilteredProperties.map((property) => property._id);
    }

    if (selectedNeighbourhood) {
      // Filter properties by neighbourhood (address_3)
      const neighbourhoodFilteredProperties = propertyList.filter(
        (property) => property.address?.address_3 === selectedNeighbourhood
      );
      return neighbourhoodFilteredProperties.map((property) => property._id);
    }

    return []; // All properties
  };

  if (!mounted) {
    // Optionally, show a skeleton or loader here
    return null;
  }

  return (
    <div className="p-2 sm:p-4 space-y-6 bg-[#F4F3EF] min-h-screen">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 text-sm items-center justify-center w-full">
        <button
          onClick={handleFilterClick}
          className="px-2 py-2 w-full sm:w-[48%] md:w-[23%] rounded-md bg-[#F4F8FF] text-[#1A1919] text-xs border border-gray-300 font-[500] cursor-pointer flex items-center justify-between gap-2"
        >
          {selectedDateRange}{" "}
          <IoMdArrowDropdown className="w-5 h-5 text-[#5940C8]" />
        </button>
        <button
          onClick={handlePropertyClick}
          className="px-2 py-2 w-full sm:w-[48%] md:w-[23%] rounded-md bg-[#F4F8FF] text-[#1A1919] text-xs border border-gray-300 font-[500] cursor-pointer flex items-center justify-between gap-2"
        >
          {selectedPropertyUnitNo || selectedPropertyLabel || "All Properties"}{" "}
          <IoMdArrowDropdown className="w-5 h-5 text-[#5940C8]" />
        </button>
        <button
          onClick={handleCityClick}
          className="px-2 py-2 w-full sm:w-[48%] md:w-[23%] rounded-md bg-[#F4F8FF] text-[#1A1919] text-xs border border-gray-300 font-[500] cursor-pointer flex items-center justify-between gap-2"
        >
          {selectedCity || "All Cities"}{" "}
          <IoMdArrowDropdown className="w-5 h-5 text-[#5940C8]" />
        </button>
        <button
          onClick={handleNeighbourhoodClick}
          className="px-2 py-2 w-full sm:w-[48%] md:w-[23%] rounded-md bg-[#F4F8FF] text-[#1A1919] text-xs border border-gray-300 font-[500] cursor-pointer flex items-center justify-between gap-2"
        >
          {selectedNeighbourhood || "All Neighbourhoods"}{" "}
          <IoMdArrowDropdown className="w-5 h-5 text-[#5940C8]" />
        </button>
      </div>
      {/* OCCUPANCY */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-[#F14467] tracking-wide">
          OCCUPANCY
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 w-full">
        {/* Occupancy Rate Card */}
        <OccupancyCard
          dateRange={selectedDateRange}
          customDateRange={customDateRange}
          propertyIds={getFilteredPropertyIds()}
        />
        {/* Occupancy Source Card */}
        <OccupancySourceCard
          dateRange={selectedDateRange}
          customDateRange={customDateRange}
          propertyIds={getFilteredPropertyIds()}
        />
      </div>
      {/* Occupancy Trend as a separate card/section */}
      <div className="w-full min-w-0">
        <OccupancyTrendCard
          dateRange={selectedDateRange}
          customDateRange={customDateRange}
          propertyIds={getFilteredPropertyIds()}
        />
      </div>
      {/* Business Score as a separate card/section */}
      <div className="w-full min-w-0">
        <BusinessScore
          dateRange={selectedDateRange}
          customDateRange={customDateRange}
          propertyIds={getFilteredPropertyIds()}
        />
      </div>
      {/* Repeat Guests as a separate card/section */}
      <div className="w-full min-w-0">
        <RepeatGuests
          dateRange={selectedDateRange}
          customDateRange={customDateRange}
          propertyIds={getFilteredPropertyIds()}
        />
      </div>
      {/* Revenue Trend as a separate card/section */}
      <div className="w-full min-w-0 overflow-x-auto">
        <RevenueTrend
          dateRange={selectedDateRange}
          customDateRange={customDateRange}
        />
      </div>
      {/* RevPAR as a separate card/section */}
      <div className="w-full min-w-0 overflow-x-auto">
        <RevPAR
          dateRange={selectedDateRange}
          customDateRange={customDateRange}
        />
      </div>
      {/* Message Response Time as a separate card/section */}
      <div className="w-full min-w-0">
        <MessageResponseTime
          dateRange={selectedDateRange}
          customDateRange={customDateRange}
        />
      </div>
      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
      {/* Property Select Modal */}
      <PropertySelectModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        onSubmit={handlePropertySelect}
      />
      {/* City Select Modal */}
      <CitySelectModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        onSubmit={handleCitySelect}
      />
      {/* Neighbourhood Select Modal */}
      <NeighbourhoodSelectModal
        isOpen={isNeighbourhoodModalOpen}
        onClose={() => setIsNeighbourhoodModalOpen(false)}
        onSubmit={handleNeighbourhoodSelect}
      />
    </div>
  );
}