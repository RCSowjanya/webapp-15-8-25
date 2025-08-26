"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaThLarge, FaList } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { PiLockKeyFill } from "react-icons/pi";
import { IoAlarmSharp } from "react-icons/io5";
import { DateRange } from "react-date-range";
import { FaCalendarAlt } from "react-icons/fa";
import { format } from "date-fns";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import ReservationTable from "./ReservationTable";
import ReservationModel from "../../Models/reservations/ReservationModel";

const ReservationView = ({ initialReservations = [], initialPagination }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [tempState, setTempState] = useState(state);
  const calendarRef = useRef();
  const [pagination, setPagination] = useState(
    initialPagination || {
      currentPage: 1,
      totalPage: 1,
      pageSize: 10,
    }
  );

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [pagination.currentPage]);

  // Refresh reservations when component mounts or when returning from booking creation
  useEffect(() => {
    fetchReservations();

    // Check if we need to refresh due to new booking creation
    const shouldRefresh = sessionStorage.getItem("refreshReservations");
    if (shouldRefresh === "true") {
      console.log("New booking detected, refreshing reservations...");
      sessionStorage.removeItem("refreshReservations");
      // Add a small delay to ensure the new booking is saved
      setTimeout(() => {
        fetchReservations();
      }, 1000);
    }
  }, []);

  // Add a refresh mechanism when returning from booking creation
  useEffect(() => {
    const handleFocus = () => {
      console.log("Window focused, refreshing reservations...");
      fetchReservations();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Page became visible, refreshing reservations...");
        fetchReservations();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const fetchReservations = async () => {
    const response = await ReservationModel(
      pagination.currentPage,
      pagination.pageSize
    );
    // setReservations(response.data) or whatever you need to do with the data

    setPagination((prev) => ({
      ...prev,
      totalPage: response.pagination?.totalPage || prev.totalPage,
      pageSize: response.pagination?.pageSize || prev.pageSize,
    }));
  };

  return (
    <div className="flex flex-col h-full min-h-0 pt-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 px-3">
        <h1 className="text-xl font-semibold text-[#7C69E8]">Reservations</h1>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div
            className="relative inline-block w-full sm:w-auto"
            ref={calendarRef}
          >
            <button
              onClick={() => {
                setTempState(state);
                setShowCalendar((prev) => !prev);
              }}
              className="flex items-center cursor-pointer gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-auto justify-center"
            >
              <FaCalendarAlt />
              Select Date Range
            </button>

            {showCalendar && (
              <div className="absolute z-50 cursor-pointer bg-white rounded border border-gray-300 shadow-lg p-4 top-full left-0 mt-2 w-auto">
                <DateRange
                  editableDateInputs={true}
                  onChange={(item) => setTempState([item.selection])}
                  moveRangeOnFirstSelection={false}
                  ranges={tempState}
                  rangeColors={["#25A4E8"]}
                  minDate={new Date()}
                />
                <div className="flex flex-wrap justify-between items-center gap-2 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <div className="relative border border-gray-300 rounded-md px-3 py-2">
                      <span className="absolute -top-2.5 left-2 bg-white px-1 text-xs text-gray-500">
                        From
                      </span>
                      <div className="font-500 text-sm">
                        {tempState[0].startDate.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="relative border border-gray-300 rounded-md px-3 py-2">
                      <span className="absolute -top-2.5 left-2 bg-white px-1 text-xs text-gray-500">
                        To
                      </span>
                      <div className="font-500 text-sm">
                        {tempState[0].endDate.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="bg-[#25A4E8] cursor-pointer text-white px-6 py-2 rounded text-sm hover:bg-[#25A4E8]"
                      onClick={() => {
                        setState(tempState);
                        setShowCalendar(false);
                      }}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 bg-gray-200 p-3 rounded-md w-full sm:w-auto justify-center">
            <button>
              <FaThLarge className="w-5 h-5 cursor-pointer text-gray-600" />
            </button>
            <button>
              <FaCalendarAlt className="w-5 h-5 cursor-pointer text-gray-600" />
            </button>
            <button>
              <FaList className="w-5 h-5 cursor-pointer text-gray-600" />
            </button>
          </div>
          <a href="/create-reservation-view" className="w-full sm:w-auto">
            <button className="bg-[#25A4E8] cursor-pointer text-white flex items-center gap-2 px-4 py-2 rounded-lg text-sm w-full sm:w-auto justify-center">
              <IoMdAdd className="text-lg" />
              Add Reservation
            </button>
          </a>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-2">
        <ReservationTable
          dateRange={{
            startDate: format(state[0].startDate, "yyyy-MM-dd"),
            endDate: format(state[0].endDate, "yyyy-MM-dd"),
            key: "selection",
          }}
          onDateRangeChange={(newRange) => setState([newRange])}
          initialReservations={initialReservations}
          initialPagination={initialPagination}
        />

        {/* <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded text-white bg-gray-400 hover:bg-[#7C69E8] active:bg-[#7C69E8] transition-colors"
            onClick={() => setPagination(prev => ({
              ...prev,
              currentPage: Math.max(1, prev.currentPage - 1)
            }))}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 rounded text-white bg-gray-400 hover:bg-[#7C69E8] active:bg-[#7C69E8] transition-colors"
          >
            Next
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default ReservationView;
