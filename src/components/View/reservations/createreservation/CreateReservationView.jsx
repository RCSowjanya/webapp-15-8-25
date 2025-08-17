"use client";
import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaSearch } from "react-icons/fa";
import { BsFillFilterSquareFill } from "react-icons/bs";
import { IoMdArrowDropdown } from "react-icons/io";
import { format } from "date-fns";
import FilterPanel from "./FilterPanel";
import { fetchActiveProperties } from "../../../Models/properties/PropertyModel";
import { useRouter } from "next/navigation";

const CreateReservationView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProperties, setFilteredProperties] = useState([]);

  // State for current filters
  const [currentFilters, setCurrentFilters] = useState({
    city: "",
    neighbourhood: [],
    propertyType: [],
    checkIn: new Date(),
    checkOut: new Date(),
    adults: 1,
    children: 0,
    rooms: 1,
    totalGuests: 1,
  });

  const router = useRouter();

  useEffect(() => {
    const loadProperties = async () => {
      try {
        console.log("Loading properties...");
        setLoading(true);
        setError(null);

        const response = await fetchActiveProperties();
        console.log("Properties response:", response);

        if (response.success) {
          setProperties(response.data);
          setFilteredProperties(response.data);
          console.log(`Loaded ${response.data.length} properties successfully`);
        } else {
          setError(response.message);
          console.error("Failed to load properties:", response.message);
        }
      } catch (error) {
        console.error("Error loading properties:", error);
        setError(error.message || "Failed to load properties");
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  // Filter properties based on search term
  const handleSearch = (term) => {
    setSearchTerm(term);

    if (!term.trim()) {
      // If no search term, apply current filters
      applyCurrentFilters(properties);
      return;
    }

    // Apply search to current filtered properties
    const searchFiltered = properties.filter((property) => {
      const unitNo = property.unitNo?.toLowerCase() || "";
      const title =
        property.propertyDetails?.stayDetails?.title?.toLowerCase() || "";
      const city = property.address?.city?.toLowerCase() || "";
      const neighbourhood = property.address?.address_3?.toLowerCase() || "";
      const propertyType = property.propertyType?.toLowerCase() || "";

      const searchLower = term.toLowerCase();

      return (
        unitNo.includes(searchLower) ||
        title.includes(searchLower) ||
        city.includes(searchLower) ||
        neighbourhood.includes(searchLower) ||
        propertyType.includes(searchLower)
      );
    });

    // Apply current filters to search results
    const finalFiltered = applyFiltersToProperties(
      searchFiltered,
      currentFilters
    );
    setFilteredProperties(finalFiltered);
    console.log(
      `Search for "${term}" returned ${finalFiltered.length} results`
    );
  };

  // Apply current filters to properties
  const applyCurrentFilters = (propertiesToFilter = properties) => {
    const filtered = applyFiltersToProperties(
      propertiesToFilter,
      currentFilters
    );
    setFilteredProperties(filtered);
    return filtered;
  };

  // Helper function to apply filters to properties
  const applyFiltersToProperties = (propertiesToFilter, filters) => {
    let filtered = [...propertiesToFilter];

    // Apply city filter
    if (filters.city) {
      filtered = filtered.filter(
        (prop) =>
          prop.address?.city?.toLowerCase() === filters.city.toLowerCase()
      );
    }

    // Apply neighbourhood filter
    if (filters.neighbourhood && filters.neighbourhood.length > 0) {
      filtered = filtered.filter((prop) =>
        filters.neighbourhood.some(
          (neighbourhood) =>
            prop.address?.address_3?.toLowerCase() ===
            neighbourhood.toLowerCase()
        )
      );
    }

    // Apply property type filter
    if (filters.propertyType && filters.propertyType.length > 0) {
      filtered = filtered.filter((prop) =>
        filters.propertyType.includes(prop.propertyType)
      );
    }

    // Apply guest capacity filter
    if (filters.totalGuests > 1) {
      filtered = filtered.filter(
        (prop) => prop.propertyDetails?.guest >= filters.totalGuests
      );
    }

    // Apply room filter
    if (filters.rooms > 1) {
      filtered = filtered.filter(
        (prop) => prop.propertyDetails?.bedroom >= filters.rooms
      );
    }

    return filtered;
  };

  // Handle filter panel apply
  const handleFilterApply = (filterData) => {
    console.log("Applying filters:", filterData);

    if (filterData.properties) {
      setFilteredProperties(filterData.properties);

      // Update current filters
      const newFilters = {
        city: filterData.city || "",
        neighbourhood: filterData.neighbourhood || [],
        propertyType: filterData.propertyType || [],
        checkIn: filterData.checkIn || new Date(),
        checkOut: filterData.checkOut || new Date(),
        adults: filterData.adults || 1,
        children: filterData.children || 0,
        rooms: filterData.rooms || 1,
        totalGuests: filterData.totalGuests || 1,
      };

      setCurrentFilters(newFilters);
      console.log(
        `Filter applied: ${filterData.properties.length} properties match criteria`
      );
    }
  };

  // Handle filter changes (when user modifies filters)
  const handleFiltersChange = (newFilters) => {
    setCurrentFilters(newFilters);
  };

  // Handle property selection with booking data
  const handlePropertySelect = (property) => {
    console.log("Selected property:", property);

    // Calculate nights for booking duration
    const timeDiff =
      currentFilters.checkOut.getTime() - currentFilters.checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Prepare complete booking data including property details
    const bookingData = {
      property: property,
      guestDetails: {
        adults: currentFilters.adults,
        children: currentFilters.children,
        totalGuests: currentFilters.totalGuests,
      },
      stayDetails: {
        checkIn: currentFilters.checkIn,
        checkOut: currentFilters.checkOut,
        rooms: currentFilters.rooms,
        nights: nights,
      },
      searchCriteria: {
        city: currentFilters.city,
        neighbourhood: currentFilters.neighbourhood,
        propertyType: currentFilters.propertyType,
        searchTerm: searchTerm,
      },
      pricing: {
        pricePerNight: property.price || 0,
        totalPrice: (property.price || 0) * nights,
        currency: "USD", // You can make this dynamic
      },
      selectionTimestamp: new Date().toISOString(),
    };

    console.log("Booking data prepared:", bookingData);

    // Validate property compatibility before navigation
    const propertyCapacity = property.propertyDetails?.guest || 0;
    const propertyBedrooms = property.propertyDetails?.bedroom || 0;

    if (propertyCapacity < currentFilters.totalGuests) {
      console.warn(
        `Property capacity (${propertyCapacity}) is less than required guests (${currentFilters.totalGuests})`
      );
    }

    if (propertyBedrooms < currentFilters.rooms) {
      console.warn(
        `Property bedrooms (${propertyBedrooms}) is less than required rooms (${currentFilters.rooms})`
      );
    }

    try {
      // Store booking data in sessionStorage for the CreateReservation page
      sessionStorage.setItem(
        "selectedPropertyBookingData",
        JSON.stringify(bookingData)
      );
      console.log("Booking data stored in sessionStorage successfully");

      // Navigate to CreateReservation page
      router.push(`/create-reservation/${property._id}`);
    } catch (error) {
      console.error("Error storing booking data:", error);
      // Fallback: navigate with basic URL params
      const queryParams = new URLSearchParams({
        propertyId: property._id,
        adults: currentFilters.adults,
        children: currentFilters.children,
        rooms: currentFilters.rooms,
        checkIn: currentFilters.checkIn.toISOString(),
        checkOut: currentFilters.checkOut.toISOString(),
      });
      router.push(
        `/create-reservation/${property._id}?${queryParams.toString()}`
      );
    }
  };

  // Helper function to format location
  const formatLocation = (property) => {
    if (typeof property.location === "string") {
      return property.location;
    }

    if (property.address) {
      const parts = [
        property.address.address_3,
        property.address.city,
        property.address.country,
      ].filter(Boolean);
      return parts.join(", ") || "Location not specified";
    }

    return "Location not specified";
  };

  // Helper function to get property title
  const getPropertyTitle = (property) => {
    return (
      property.propertyDetails?.stayDetails?.title ||
      property.title ||
      `${property.propertyType || "Property"} - ${property.unitNo}`
    );
  };

  // Helper function to get property image
  const getPropertyImage = (property) => {
    if (property.photos && property.photos.length > 0) {
      return property.photos[0];
    }
    if (property.coverPhoto) {
      return property.coverPhoto;
    }
    return "/images/apartment.png";
  };

  // Helper function to get property stats
  const getPropertyStats = (property) => {
    const details = property.propertyDetails || {};
    return {
      guests: details.guest || 0,
      bedrooms: details.bedroom || 0,
      bathrooms: details.bathroom || 0,
      beds: details.beds || 0,
    };
  };

  // Check if filters are active
  const hasActiveFilters = () => {
    return (
      currentFilters.city ||
      currentFilters.neighbourhood.length > 0 ||
      currentFilters.propertyType.length > 0 ||
      currentFilters.adults > 1 ||
      currentFilters.children > 0 ||
      currentFilters.rooms > 1 ||
      searchTerm
    );
  };
  // Helper function to calculate nights
  const calculateNights = (checkIn, checkOut) => {
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    return Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  };

  // Helper function to format date for display
  const formatDateShort = (date) => {
    return format(date, "MMM dd");
  };

  return (
    <div className="px-3 py-2 flex flex-col flex-1 min-h-0">
      {showFilterDropdown && (
        <FilterPanel
          onClose={() => setShowFilterDropdown(false)}
          onApply={handleFilterApply}
          onFiltersChange={handleFiltersChange}
          allProperties={properties}
          currentFilters={currentFilters}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between flex-wrap gap-4  border-b border-gray-200 pb-2 ">
        <div className="flex gap-3">
          <h1 className="text-xl font-bold text-[#7C69E8]">
            Create Reservation
          </h1>
          {/*{filteredProperties.length !== properties.length && (
            <span className="text-sm text-gray-500 self-end">
              ({filteredProperties.length} of {properties.length} properties)
            </span>
          )}*/}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search Unit No, Title, City, Type..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 bg-[#F2F3F3] rounded-xl text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-[#654EE4] focus:border-transparent"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>

          <div className="w-full sm:w-auto">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`px-4 py-2 text-sm border rounded-md flex items-center justify-center gap-2 transition-colors w-full sm:w-auto ${
                hasActiveFilters()
                  ? "bg-[#25A4E8] text-white border-[#25A4E8]"
                  : "bg-[#25A4E81F] border-[#25A4E8] text-[#25A4E8] hover:bg-[#25A4E82F]"
              }`}
            >
              <BsFillFilterSquareFill />
              <span>Filters</span>
              {hasActiveFilters() && (
                <span className="bg-white text-[#25A4E8] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {
                    Object.values(currentFilters).filter((v) =>
                      Array.isArray(v)
                        ? v.length > 0
                        : v &&
                          v !== "" &&
                          (typeof v === "number" ? v > 1 : true)
                    ).length
                  }
                </span>
              )}
              <IoMdArrowDropdown className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="">
          {/*<div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-blue-800">
              Active Filters:
            </span>

            {currentFilters.city && (
              <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                📍 {currentFilters.city}
              </span>
            )}

            {currentFilters.neighbourhood.map((n) => (
              <span
                key={n}
                className="bg-green-500 text-white px-2 py-1 rounded-full text-xs"
              >
                🏘️ {n}
              </span>
            ))}

            {currentFilters.propertyType.map((type) => (
              <span
                key={type}
                className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs"
              >
                🏠 {type}
              </span>
            ))}

            {currentFilters.totalGuests > 1 && (
              <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs">
                👥 {currentFilters.totalGuests} guests
              </span>
            )}

            {currentFilters.rooms > 1 && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                🚪 {currentFilters.rooms} rooms
              </span>
            )}

            {searchTerm && (
              <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs">
                🔍 "{searchTerm}"
              </span>
            )}

            <button
              onClick={() => {
                setSearchTerm("");
                const defaultFilters = {
                  city: "",
                  neighbourhood: [],
                  propertyType: [],
                  checkIn: new Date(),
                  checkOut: new Date(),
                  adults: 1,
                  children: 0,
                  rooms: 1,
                  totalGuests: 1,
                };
                setCurrentFilters(defaultFilters);
                setFilteredProperties(properties);
              }}
              className="text-blue-600 hover:text-blue-800 text-xs underline ml-2"
            >
              Clear All
            </button>
          </div>*/}
        </div>
      )}

      {/* Property Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto mt-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C69E8]  mb-4"></div>
              <p className="text-gray-500">Loading properties...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-red-500 font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-[#7C69E8] text-white rounded-md hover:bg-[#6B5DD3] transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">🏠</div>
              <p className="text-gray-500 font-medium">
                {hasActiveFilters()
                  ? "No properties match your criteria"
                  : "No properties found"}
              </p>
              {hasActiveFilters() && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    const defaultFilters = {
                      city: "",
                      neighbourhood: [],
                      propertyType: [],
                      checkIn: new Date(),
                      checkOut: new Date(),
                      adults: 1,
                      children: 0,
                      rooms: 1,
                      totalGuests: 1,
                    };
                    setCurrentFilters(defaultFilters);
                    setFilteredProperties(properties);
                  }}
                  className="mt-4 px-4 py-2 text-[#7C69E8] border border-[#7C69E8] rounded-md hover:bg-[#7C69E8] hover:text-white transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProperties.map((property) => {
              const stats = getPropertyStats(property);
              const isCompatible =
                stats.guests >= currentFilters.totalGuests &&
                stats.bedrooms >= currentFilters.rooms;

              return (
                <div
                  key={property._id}
                  onClick={() => handlePropertySelect(property)}
                  className={`cursor-pointer transform transition-all hover:scale-105 bg-white p-1 border border-gray-200 rounded-2xl shadow-lg ${
                    !isCompatible ? "opacity-60" : ""
                  }`}
                >
                  <div
                    className={`bg-[#F7F5FE] border border-gray-200 rounded-2xl shadow-md flex flex-row items-center border p-1 h-full w-full  ${
                      isCompatible
                        ? "border-gray-100"
                        : "border-orange-200 bg-orange-50"
                    }`}
                  >
                    {/* Left: Property Image */}
                    <div className="relative flex-shrink-0 w-20 h-20 flex items-center justify-center">
                      <img
                        src={getPropertyImage(property)}
                        alt={getPropertyTitle(property)}
                        className="rounded-xl object-cover w-20 h-20"
                        onError={(e) => {
                          e.target.src = "/images/apartment.png";
                        }}
                      />
                    </div>
                    {/* Right: Details */}
                    <div className="flex-1 flex flex-col justify-center pl-3 py-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-xs leading-tight">
                          {property.unitNo}
                        </span>
                        <span className="text-[11px] leading-tight text-gray-500">
                          {getPropertyTitle(property)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-[11px] text-gray-500 gap-1">
                        <img
                          src="/images/location.svg"
                          alt="location"
                          className="w-3 h-3"
                        />
                        <span className="line-clamp-2">
                          {formatLocation(property)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateReservationView;
