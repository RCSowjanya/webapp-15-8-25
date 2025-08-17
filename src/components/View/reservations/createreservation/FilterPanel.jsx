"use client";
import React, { useEffect, useState, useRef } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { IoSearchOutline } from "react-icons/io5";
import Select from "react-select";

const FilterPanel = ({
  onClose,
  onApply,
  allProperties = [],
  currentFilters = null,
  onFiltersChange,
}) => {
  // Initialize state with current filters or defaults
  const getInitialFilters = () => {
    if (currentFilters) {
      return {
        city: currentFilters.city || "",
        neighbourhood: currentFilters.neighbourhood || [],
        propertyType: currentFilters.propertyType || [],
        adults: currentFilters.adults || 1,
        children: currentFilters.children || 0,
        rooms: currentFilters.rooms || 1,
        checkIn: currentFilters.checkIn || new Date(),
        checkOut: currentFilters.checkOut || new Date(),
      };
    }
    return {
      city: "",
      neighbourhood: [],
      propertyType: [],
      adults: 1,
      children: 0,
      rooms: 1,
      checkIn: new Date(),
      checkOut: new Date(),
    };
  };

  const [filters, setFilters] = useState(getInitialFilters());
  const [selectedRange, setSelectedRange] = useState({
    startDate: filters.checkIn,
    endDate: filters.checkOut,
    key: "selection",
  });

  const [cityOptions, setCityOptions] = useState([]);
  const [neighbourhoodOptions, setNeighbourhoodOptions] = useState([]);
  const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);
  const formRef = useRef(null);

  // Update local state when currentFilters prop changes
  useEffect(() => {
    if (currentFilters) {
      const newFilters = getInitialFilters();
      setFilters(newFilters);
      setSelectedRange({
        startDate: newFilters.checkIn,
        endDate: newFilters.checkOut,
        key: "selection",
      });
    }
  }, [currentFilters]);

  // Extract options from properties
  useEffect(() => {
    if (allProperties.length > 0) {
      // Extract unique cities
      const cities = [
        ...new Set(
          allProperties
            .filter((prop) => prop.isActive === true)
            .map((prop) => prop.address?.city)
            .filter(Boolean)
        ),
      ];
      setCityOptions(cities.map((city) => ({ value: city, label: city })));

      // Extract unique neighbourhoods
      const neighbourhoods = [
        ...new Set(
          allProperties
            .filter((prop) => prop.isActive === true)
            .map((prop) => prop.address?.address_3)
            .filter(Boolean)
        ),
      ];
      setNeighbourhoodOptions(
        neighbourhoods.map((n) => ({ value: n, label: n }))
      );

      // Extract unique property types
      const propertyTypes = [
        ...new Set(
          allProperties
            .filter((prop) => prop.isActive === true)
            .map((prop) => prop.propertyType)
            .filter(Boolean)
        ),
      ];
      setPropertyTypeOptions(
        propertyTypes.map((type) => ({ value: type, label: type }))
      );
    }
  }, [allProperties]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDateRangeChange = (ranges) => {
    setSelectedRange(ranges.selection);
    setFilters((prev) => ({
      ...prev,
      checkIn: ranges.selection.startDate,
      checkOut: ranges.selection.endDate,
    }));
  };

  const applyFilters = () => {
    let filteredProperties = [...allProperties];

    // Filter by city
    if (filters.city) {
      filteredProperties = filteredProperties.filter(
        (prop) =>
          prop.address?.city?.toLowerCase() === filters.city.toLowerCase()
      );
    }

    // Filter by neighbourhood
    if (filters.neighbourhood.length > 0) {
      filteredProperties = filteredProperties.filter((prop) =>
        filters.neighbourhood.some(
          (neighbourhood) =>
            prop.address?.address_3?.toLowerCase() ===
            neighbourhood.toLowerCase()
        )
      );
    }

    // Filter by property type
    if (filters.propertyType.length > 0) {
      filteredProperties = filteredProperties.filter((prop) =>
        filters.propertyType.includes(prop.propertyType)
      );
    }

    // Filter by guest capacity
    const totalGuests = filters.adults + filters.children;
    filteredProperties = filteredProperties.filter(
      (prop) => prop.propertyDetails?.guest >= totalGuests
    );

    // Filter by bedroom count
    filteredProperties = filteredProperties.filter(
      (prop) => prop.propertyDetails?.bedroom >= filters.rooms
    );

    // Filter by date availability
    if (selectedRange.startDate && selectedRange.endDate) {
      filteredProperties = filteredProperties.filter((prop) => {
        if (!prop.blockedDate || prop.blockedDate.length === 0) return true;

        const checkIn = new Date(selectedRange.startDate);
        const checkOut = new Date(selectedRange.endDate);

        return !prop.blockedDate.some((blocked) => {
          const blockedStart = new Date(blocked.startDate);
          const blockedEnd = new Date(blocked.endDate);

          return (
            (checkIn >= blockedStart && checkIn <= blockedEnd) ||
            (checkOut >= blockedStart && checkOut <= blockedEnd) ||
            (checkIn <= blockedStart && checkOut >= blockedEnd)
          );
        });
      });
    }

    return filteredProperties;
  };

  const handleApply = () => {
    const filteredProperties = applyFilters();

    const finalFilters = {
      ...filters,
      checkIn: selectedRange.startDate,
      checkOut: selectedRange.endDate,
      totalGuests: filters.adults + filters.children,
    };

    // Notify parent about filter changes
    onFiltersChange && onFiltersChange(finalFilters);

    // Call the onApply callback with filtered properties and filter data
    const filterParams = {
      ...finalFilters,
      isActive: true,
      properties: filteredProperties,
    };

    onApply && onApply(filterParams);
    onClose && onClose();
  };

  const handleReset = () => {
    const defaultFilters = {
      city: "",
      neighbourhood: [],
      propertyType: [],
      adults: 1,
      children: 0,
      rooms: 1,
      checkIn: new Date(),
      checkOut: new Date(),
    };

    setFilters(defaultFilters);
    setSelectedRange({
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    });

    // Notify parent about filter reset
    onFiltersChange && onFiltersChange(defaultFilters);

    if (formRef.current) {
      formRef.current.reset();
    }

    // Reset to all properties
    onApply &&
      onApply({
        properties: allProperties,
        ...defaultFilters,
        totalGuests: 1,
      });
    onClose && onClose();
  };

  return (
    <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-50 p-3 border border-gray-200 rounded-tl-2xl rounded-tr-2xl transition-transform duration-300 ease-in-out">
      <div className="flex flex-col h-full justify-between">
        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(100vh-120px)] pr-1">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-200">
            <span className="font-semibold text-lg">Filters</span>
            <button
              onClick={onClose}
              className="flex items-center cursor-pointer justify-center w-8 h-8 rounded-full hover:bg-gray-200 text-gray-500 text-xl transition-colors"
              aria-label="Close filter panel"
            >
              ×
            </button>
          </div>

          <form ref={formRef} className="p-4 space-y-4">
            {/* City */}
            <div className="mb-3">
              <label className="text-sm font-semibold text-gray-700 leading-[35px]">
                Select City
              </label>
              <div className="relative w-full">
                <IoSearchOutline className="text-[#25A4E8] absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none z-[3]" />
                <Select
                  options={cityOptions}
                  value={
                    filters.city
                      ? { value: filters.city, label: filters.city }
                      : null
                  }
                  onChange={(option) =>
                    handleFilterChange("city", option ? option.value : "")
                  }
                  placeholder="Search City..."
                  isClearable
                  className="w-full text-sm z-[99] cursor-pointer"
                  isSearchable
                  styles={{
                    control: (base) => ({
                      ...base,
                      paddingLeft: "1rem",
                      backgroundColor: "transparent",
                      zIndex: 2,
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      paddingLeft: "1em",
                    }),
                  }}
                />
              </div>
            </div>

            {/* Neighbourhood */}
            <div className="mb-3">
              <label className="text-sm font-semibold text-gray-700 leading-[35px]">
                Select Neighbourhood
              </label>
              <div className="relative w-full">
                <IoSearchOutline className="text-[#25A4E8] absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none z-[3]" />
                <Select
                  isMulti
                  options={neighbourhoodOptions}
                  value={filters.neighbourhood.map((n) => ({
                    value: n,
                    label: n,
                  }))}
                  onChange={(options) =>
                    handleFilterChange(
                      "neighbourhood",
                      Array.isArray(options) ? options.map((o) => o.value) : []
                    )
                  }
                  placeholder="Search"
                  className="w-full text-sm"
                  isSearchable
                  styles={{
                    control: (base) => ({
                      ...base,
                      paddingLeft: "1rem",
                      backgroundColor: "transparent",
                      zIndex: 2,
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      paddingLeft: "1rem",
                    }),
                  }}
                />
              </div>
            </div>

            {/* Property Type */}
            {/* <div className="mb-3">
              <label className="text-sm font-semibold text-gray-700 leading-[35px]">
                Property Type
              </label>
              <div className="relative w-full">
                <Select
                  isMulti
                  options={propertyTypeOptions}
                  value={filters.propertyType.map((type) => ({ value: type, label: type }))}
                  onChange={(options) =>
                    handleFilterChange('propertyType', Array.isArray(options) ? options.map((o) => o.value) : [])
                  }
                  placeholder="Select Property Type..."
                  className="w-full text-sm"
                  isSearchable
                />
              </div>
            </div> */}

            {/* Filter Tags */}
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              {/* Neighbourhood tags */}
              {filters.neighbourhood.map((n) => (
                <span
                  key={n}
                  className="border border-blue-400 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs flex items-center shadow-sm"
                >
                  {n}
                  <button
                    className="ml-2 text-blue-400 hover:text-red-500 bg-white border border-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-xs transition-colors"
                    onClick={() =>
                      handleFilterChange(
                        "neighbourhood",
                        filters.neighbourhood.filter((val) => val !== n)
                      )
                    }
                    aria-label={`Remove ${n}`}
                    type="button"
                  >
                    ×
                  </button>
                </span>
              ))}

              {/* Property type tags */}
              {filters.propertyType.map((type) => (
                <span
                  key={type}
                  className="border border-green-400 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs flex items-center shadow-sm"
                >
                  {type}
                  <button
                    className="ml-2 text-green-400 hover:text-red-500 bg-white border border-green-200 rounded-full w-5 h-5 flex items-center justify-center text-xs transition-colors"
                    onClick={() =>
                      handleFilterChange(
                        "propertyType",
                        filters.propertyType.filter((val) => val !== type)
                      )
                    }
                    aria-label={`Remove ${type}`}
                    type="button"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Dates */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Select Dates
              </label>
              <div className="w-full">
                <DateRange
                  editableDateInputs={true}
                  onChange={handleDateRangeChange}
                  moveRangeOnFirstSelection={false}
                  ranges={[selectedRange]}
                  rangeColors={["#7C69E8"]}
                  showDateDisplay={false}
                  months={1}
                  direction="horizontal"
                  className="w-full"
                  minDate={new Date()}
                />
              </div>
              <div className="flex gap-2 mt-2">
                <div className="relative w-full">
                  <legend className="absolute text-xs text-gray-500 bg-white px-1 left-3 -top-2 z-10">
                    From
                  </legend>
                  <input
                    readOnly
                    value={format(selectedRange.startDate, "dd/MM/yyyy")}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm pl-3 pt-3"
                  />
                </div>
                <div className="relative w-full">
                  <legend className="absolute text-xs text-gray-500 bg-white px-1 left-3 -top-2 z-10">
                    To
                  </legend>
                  <input
                    readOnly
                    value={format(selectedRange.endDate, "dd/MM/yyyy")}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm pl-3 pt-3"
                  />
                </div>
              </div>
            </div>

            {/* Guests */}
            <div className="mb-3">
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                No. Of Guests
              </label>
              <div className="border border-gray-200 p-2 rounded-md flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Adults</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleFilterChange(
                          "adults",
                          Math.max(filters.adults - 1, 1)
                        )
                      }
                      className="w-5 h-5 flex items-center justify-center rounded-full border border-gray-500"
                      type="button"
                    >
                      −
                    </button>
                    <span className="w-4 text-center">{filters.adults}</span>
                    <button
                      onClick={() =>
                        handleFilterChange("adults", filters.adults + 1)
                      }
                      className="w-5 h-5 flex items-center justify-center rounded-full border border-gray-500"
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Children</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleFilterChange(
                          "children",
                          Math.max(filters.children - 1, 0)
                        )
                      }
                      className="w-5 h-5 flex items-center justify-center rounded-full border border-gray-500"
                      type="button"
                    >
                      −
                    </button>
                    <span className="w-4 text-center">{filters.children}</span>
                    <button
                      onClick={() =>
                        handleFilterChange("children", filters.children + 1)
                      }
                      className="w-5 h-5 flex items-center justify-center rounded-full border border-gray-500"
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Rooms */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                No. Of Rooms
              </label>
              <div className="flex justify-between items-center border border-gray-200 rounded-md p-2">
                <span className="text-sm">Rooms</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleFilterChange(
                        "rooms",
                        Math.max(filters.rooms - 1, 1)
                      )
                    }
                    className="text-sm border border-gray-500 rounded-full w-5 h-5 flex items-center justify-center"
                    type="button"
                  >
                    −
                  </button>
                  <span className="w-4 text-center">{filters.rooms}</span>
                  <button
                    onClick={() =>
                      handleFilterChange("rooms", filters.rooms + 1)
                    }
                    className="text-sm border border-gray-500 rounded-full w-5 h-5 flex items-center justify-center"
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Summary */}
            {/* <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600">
                <div>📅 {format(selectedRange.startDate, "MMM dd")} - {format(selectedRange.endDate, "MMM dd")}</div>
                <div>👥 {filters.adults + filters.children} guests ({filters.adults} adults, {filters.children} children)</div>
                <div>🏠 {filters.rooms} room{filters.rooms > 1 ? 's' : ''}</div>
              </div>
            </div> */}
          </form>
        </div>

        {/* Sticky footer */}
        <div className="px-1 mb-2 sticky bottom-0 bg-white pt-2 z-10">
          <button
            className="w-full bg-[#25A4E8] text-white py-2 rounded-md mb-2 hover:bg-[#1D90D0] cursor-pointer font-semibold shadow-sm transition-colors"
            onClick={handleApply}
            type="button"
          >
            Apply
          </button>
          <button
            className="w-full border border-[#25A4E8] text-[#25A4E8] py-2 rounded-md cursor-pointer font-semibold hover:bg-[#F0F8FF] transition-colors"
            onClick={handleReset}
            type="button"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
