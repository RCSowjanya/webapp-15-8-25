"use client";
import { useState, useEffect } from "react";
import { MdCall } from "react-icons/md";
import { IoLogoWhatsapp } from "react-icons/io";
import { FaEnvelope } from "react-icons/fa";
import { BiSolidMessageDetail } from "react-icons/bi";
import { toast } from "react-toastify";
import TablerowDetailedView from "./TablerowDetailedView";
import ReservationModel, {
  addNoteToReservation,
} from "../../Models/reservations/ReservationModel";
import { MdCancel } from "react-icons/md";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { format } from "date-fns";
import { MdClose } from "react-icons/md";
import { DateRange } from "react-date-range";

const ReservationTable = ({
  dateRange,
  onDateRangeChange,
  initialReservations = [],
  initialPagination,
}) => {
  const [openPopoverId, setOpenPopoverId] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [reservations, setReservations] = useState(initialReservations);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(
    initialPagination || { currentPage: 1, totalPage: 1, pageSize: 10 }
  );
  const [openNoteId, setOpenNoteId] = useState(null);
  const [selectedNote, setSelectedNote] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [showAddNotePopup, setShowAddNotePopup] = useState(null);
  const [newNoteText, setNewNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!reservations?.length) {
      fetchReservations();
    } else {
      setLoading(false);
    }
  }, [pagination.currentPage]);

  // Add refresh mechanism for new bookings
  useEffect(() => {
    // Check URL parameters for refresh flag
    const urlParams = new URLSearchParams(window.location.search);
    const shouldRefresh = urlParams.get("refresh");
    const isNewBooking = urlParams.get("new");

    if (shouldRefresh === "true") {
      console.log("🔍 Refresh flag detected in URL, refreshing reservations...");
      // Remove the refresh parameter from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);

      // Reset to first page to see newest bookings
      setPagination((prev) => ({ ...prev, currentPage: 1 }));

              // Add a small delay to ensure the backend has processed the new booking
        setTimeout(() => {
          console.log("🔍 Executing delayed refresh...");
          fetchReservations();
          
          // Add additional retry attempts with increasing delays
          setTimeout(() => {
            console.log("🔍 Retry 1: Checking for new booking...");
            fetchReservations();
          }, 5000); // Increased to 5 seconds
          
          setTimeout(() => {
            console.log("🔍 Retry 2: Final check for new booking...");
            fetchReservations();
          }, 10000); // Increased to 10 seconds
          
          // Add one more retry after 30 seconds
          setTimeout(() => {
            console.log("🔍 Retry 3: Extended sync check...");
            fetchReservations();
          }, 30000); // 30 seconds
        }, 5000); // Increased initial delay to 5 seconds
    }

    // Check localStorage for new booking flag
    try {
      const newBookingCreated = localStorage.getItem("newBookingCreated");
      console.log("🔍 Checking localStorage for newBookingCreated:", newBookingCreated);
      if (newBookingCreated === "true") {
        console.log("🔍 New booking flag detected in localStorage, refreshing...");
        localStorage.removeItem("newBookingCreated");

        // Reset to first page to see newest bookings
        setPagination((prev) => ({ ...prev, currentPage: 1 }));

        // Add a small delay to ensure the backend has processed the new booking
        setTimeout(() => {
          console.log("🔍 Executing localStorage-triggered refresh...");
          fetchReservations();
        }, 2000); // Increased delay to 2 seconds
      }
    } catch (error) {
      console.error("Error checking localStorage:", error);
    }

    // Check when window gains focus (user returns from booking creation)
    const handleFocus = () => {
      console.log(
        "Window focused in ReservationTable, refreshing reservations..."
      );
      // Reset to first page to see newest bookings
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      fetchReservations();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Filter reservations based on date range
  useEffect(() => {
    if (!dateRange || !reservations.length) {
      setFilteredReservations(reservations);
      return;
    }

    // Check if dateRange has valid dates (not the same date for start and end)
    const rangeStart = new Date(dateRange.startDate);
    const rangeEnd = new Date(dateRange.endDate);

    // If start and end dates are the same, show all reservations (no filter)
    if (rangeStart.getTime() === rangeEnd.getTime()) {
      setFilteredReservations(reservations);
      return;
    }

    console.log("Date filtering:", {
      rangeStart: rangeStart.toISOString(),
      rangeEnd: rangeEnd.toISOString(),
      totalReservations: reservations.length,
    });

    const filtered = reservations.filter((reservation) => {
      // Always include external bookings (non-Stayhub bookings)
      if (!reservation.isStayhubBooking) {
        console.log("Including external booking in filter:", reservation.id);
        return true;
      }

      const checkIn = new Date(reservation.checkIn);
      const checkOut = new Date(reservation.checkOut);

      // Check if the reservation overlaps with the selected date range
      // A reservation overlaps if:
      // 1. Check-in is within the range, OR
      // 2. Check-out is within the range, OR
      // 3. Check-in is before range start AND check-out is after range end
      const isInRange =
        (checkIn >= rangeStart && checkIn <= rangeEnd) ||
        (checkOut >= rangeStart && checkOut <= rangeEnd) ||
        (checkIn <= rangeStart && checkOut >= rangeEnd);

      console.log("Reservation date check:", {
        id: reservation.id,
        guestName: reservation.guestName,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        isInRange: isInRange,
      });

      return isInRange;
    });

    console.log("Filtered reservations:", {
      before: reservations.length,
      after: filtered.length,
    });

    setFilteredReservations(filtered);
  }, [reservations, dateRange]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching reservations for page:", pagination.currentPage);

      const response = await ReservationModel(
        pagination.currentPage,
        pagination.pageSize
      );

      console.log("🔍 Debug: ReservationModel response:", response);

      console.log("Full API Response:", {
        success: response.success,
        message: response.message,
        data: response.data,
        pagination: response.pagination,
        rawResponse: response,
      });

      // Log the actual data structure
      if (response.data && Array.isArray(response.data)) {
        console.log("First reservation raw data:", response.data[0]);
        console.log("Total reservations fetched:", response.data.length);

        // Log all reservation IDs to help debug
        const reservationIds = response.data.map((res) => ({
          id: res._id,
          bookingId: res.bookingId,
          guestName:
            res.fname && res.lname ? `${res.fname} ${res.lname}` : "N/A",
          checkIn: res.startDate || res.stayDetails?.checkIn || res.checkIn,
          checkOut: res.endDate || res.stayDetails?.checkOut || res.checkOut,
        }));
        console.log("All reservation IDs:", reservationIds);
      }

      if (response.success) {
        console.log("✅ Successfully fetched reservations from API");
        console.log("Raw response data:", response.data);
        console.log("Number of reservations:", response.data?.length || 0);

        // Transform the data to match the table structure
        const transformedReservations = (response.data || []).map((res) => {
          console.log("Processing reservation:", {
            id: res._id,
            propertyDetails: res.propertyDetails,
            stayDetails: res.propertyDetails?.stayDetails,
            houseManual: res.propertyDetails?.houseManual,
            fname: res.fname,
            lname: res.lname,
            startDate: res.startDate,
            endDate: res.endDate,
            propertyId: res.propertyId,
          });

          // Handle different possible data structures
          const guestName =
            res.guestName || // Use normalized guestName from server
            (res.fname && res.lname && `${res.fname} ${res.lname}`) ||
            (res.firstName &&
              res.lastName &&
              `${res.firstName} ${res.lastName}`) ||
            (res.first_name &&
              res.last_name &&
              `${res.first_name} ${res.last_name}`) ||
            (res.guestDetails?.firstName &&
              res.guestDetails?.lastName &&
              `${res.guestDetails.firstName} ${res.guestDetails.lastName}`) ||
            res.guestDetails?.name ||
            res.customerName ||
            res.primaryGuest?.fullName ||
            res.guest?.name ||
            "Guest Name";

          const checkIn =
            res.checkIn || // Use normalized checkIn from server
            res.startDate ||
            res.check_in ||
            res.stayDetails?.checkIn ||
            res.propertyDetails?.houseManual?.checkin ||
            res.property?.propertyDetails?.houseManual?.checkin ||
            res.bookingFrom ||
            res.fromDate ||
            "Check-in Date";
          const checkOut =
            res.checkOut || // Use normalized checkOut from server
            res.endDate ||
            res.check_out ||
            res.stayDetails?.checkOut ||
            res.propertyDetails?.houseManual?.checkout ||
            res.property?.propertyDetails?.houseManual?.checkout ||
            res.bookingTo ||
            res.toDate ||
            "Check-out Date";

          const title =
            res.title || // Use normalized title from server
            res.propertyId?.propertyDetails?.stayDetails?.title ||
            res.property?.propertyDetails?.stayDetails?.title ||
            res.propertyDetails?.stayDetails?.title ||
            res.property?.title ||
            res.propertyDetails?.title ||
            res.unitTitle ||
            "Property Title";

          const unitNo =
            res.unitNo || // Use normalized unitNo from server
            res.propertyId?.unitNo ||
            res.property?.unitNo ||
            res.propertyDetails?.unitNo ||
            "Unit #";

          const isStayhubBooking = !res.channel && !res.secondaryOta;
          const channel = res.channel || res.secondaryOta;

          console.log("Reservation row:", res);

          const rowId =
            res._id ||
            res.bookingId ||
            res.id ||
            `${unitNo}-${checkIn}-${checkOut}-${res.createdAt || Date.now()}`;

          return {
            id: rowId,
            title: title,
            guestName: guestName,
            bookingId: res.bookingId || res._id || null,
            unitNo: unitNo,
            checkIn: checkIn,
            checkOut: checkOut,
            isStayhubBooking: isStayhubBooking,
            channel: channel,
            secondaryOta: res.attributes?.secondary_ota || null,
            isCancelled: res.isCancelled || false,
            isCheckinCompleted: res.isCheckinCompleted || false,
            isPaymentCompleted: res.isPaymentCompleted || false,
            propertyDetails: res.propertyDetails || res.property,
            mobileNumber:
              res.mobileNumber || res.guestDetails?.mobileNumber || "N/A",
            phone: res.phone || "N/A",
            email: res.email || "N/A",
            notes: res.notes || res.note ? [{ text: res.note }] : [],
            channelIcon: res.channelIcon,
            createdAt:
              res.createdAt ||
              res.created_at ||
              res.bookingDate ||
              checkIn ||
              null,
          };
        });

        console.log("Transformed reservations:", {
          length: transformedReservations.length,
          firstItem: transformedReservations[0],
        });

        // Sort newest first using createdAt fallback
        transformedReservations.sort((a, b) => {
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tb - ta;
        });

        setReservations(transformedReservations);
        setFilteredReservations(transformedReservations); // Also update filtered list

        // Update pagination
        const newPagination = {
          totalPage: response.pagination?.totalPage || 1,
          currentPage:
            response.pagination?.currentPage || pagination.currentPage,
          pageSize: response.pagination?.pageSize || pagination.pageSize,
        };
        console.log("Setting pagination:", newPagination);
        setPagination((prev) => ({ ...prev, ...newPagination }));
      } else {
        console.log("Error in response:", response.message);
        setError(response.message || "Failed to load reservations");
        toast.error(response.message || "Failed to load reservations");
        setReservations([]);
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
      const errorMessage =
        error.message || "An error occurred while fetching reservations";
      setError(errorMessage);
      toast.error(errorMessage);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewNote = async (reservationId) => {
    if (!newNoteText.trim()) {
      toast.error("Note cannot be empty");
      return;
    }

    setIsAddingNote(true);

    try {
      // Call API to save note to backend
      const response = await addNoteToReservation(reservationId, newNoteText);

      if (response.success) {
        // Update local state with the new note
        const updatedReservations = reservations.map((res) => {
          if (res.id === reservationId) {
            const newNote = { text: newNoteText };
            return { ...res, notes: [...(res.notes || []), newNote] };
          }
          return res;
        });

        setReservations(updatedReservations);
        setNewNoteText("");
        setShowAddNotePopup(null);
        toast.success("Note added successfully!");
      } else {
        toast.error(
          response.message || "Failed to add note. Please try again."
        );
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("An error occurred while adding the note. Please try again.");
    } finally {
      setIsAddingNote(false);
    }
  };

  // Debug log for current reservations
  useEffect(() => {
    console.log("Current reservations state:", {
      length: reservations.length,
      filteredLength: filteredReservations.length,
      firstItem: reservations[0],
      loading,
      error,
      dateRange,
    });
  }, [reservations, filteredReservations, loading, error, dateRange]);

  const togglePopover = (id) => {
    setOpenPopoverId(openPopoverId === id ? null : id);
  };

  const getStatusType = (reservation) => {
    if (reservation.isCancelled) return "red";
    if (reservation.isCheckinCompleted) return "blue";
    if (reservation.isPaymentCompleted) return "green";
    return "gray";
  };

  const getStatusText = (reservation) => {
    if (reservation.isCancelled) return "Reservation Cancelled";
    if (reservation.isCheckinCompleted) return "Check-in Completed";
    if (reservation.isPaymentCompleted) return "Payment Completed";
    return "Pending";
  };

  const getStatusIcon = (res) => {
    if (res.isCancelled)
      return <MdCancel className="inline mr-1 text-gray-500 w-4 h-4" />;
    if (
      res.isCheckinCompleted ||
      res.isPaymentCompleted ||
      getStatusText(res) === "Reservation Confirmed"
    )
      return <FaCheckCircle className="inline mr-1 text-green-500 w-4 h-4" />;
    if (getStatusText(res) === "Pending")
      return <FaTimesCircle className="inline mr-1 text-yellow-500 w-4 h-4" />;
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Debug and Refresh Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Reservations</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              console.log("🔍 Manual refresh triggered");
              setPagination(prev => ({ ...prev, currentPage: 1 }));
              fetchReservations();
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={() => {
              console.log("🔍 Checking for new bookings...");
              // Force refresh and check multiple times
              setPagination(prev => ({ ...prev, currentPage: 1 }));
              fetchReservations();
              
              // Check again after 2 seconds
              setTimeout(() => fetchReservations(), 2000);
              // Check again after 5 seconds
              setTimeout(() => fetchReservations(), 5000);
              // Check again after 10 seconds
              setTimeout(() => fetchReservations(), 10000);
            }}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            disabled={loading}
          >
            Check New Bookings
          </button>
          <button
            onClick={() => {
              console.log("🔍 Debug: Current state:", {
                reservationsCount: reservations.length,
                filteredCount: filteredReservations.length,
                pagination,
                loading,
                error
              });
            }}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Debug
          </button>
        </div>
      </div>
      {/* Header with Refresh Button */}
      <div className="mx-2 mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-800">
            <span className="font-semibold">Reservations</span>
            <span className="ml-2 text-gray-600">
              ({filteredReservations.length} reservations found)
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                console.log("Manual refresh requested");
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
                // Force a complete refresh by clearing any cached data
                setReservations([]);
                setFilteredReservations([]);
                setLoading(true);
                setTimeout(() => {
                  fetchReservations();
                }, 100);
              }}
              className="text-[#25A4E8] cursor-pointer hover:text-blue-800 text-sm underline"
            >
              Refresh
            </button>
            {dateRange &&
              (() => {
                const rangeStart = new Date(dateRange.startDate);
                const rangeEnd = new Date(dateRange.endDate);
                const isFiltered = rangeStart.getTime() !== rangeEnd.getTime();

                return isFiltered ? (
                  <button
                    onClick={() => {
                      if (onDateRangeChange) {
                        const today = new Date();
                        onDateRangeChange({
                          startDate: today,
                          endDate: today,
                          key: "selection",
                        });
                      }
                    }}
                    className="text-[#25A4E8] cursor-pointer hover:text-blue-800 text-sm underline"
                  >
                    Clear Filter
                  </button>
                ) : null;
              })()}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 mx-2 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="min-w-[768px] w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 text-gray-700 text-[12px] h-[2.5rem] sticky top-0 z-10">
              <tr>
                <th className="text-center px-1 py-2 whitespace-nowrap">
                  Apartment
                </th>
                <th className="text-center px-1 py-2 whitespace-nowrap"></th>
                <th className="text-center px-1 py-2 whitespace-nowrap">
                  Guest Name
                </th>
                <th className="text-center px-1 py-2 whitespace-nowrap">
                  Reservation No.
                </th>
                <th className="text-center px-1 py-2 whitespace-nowrap">
                  Unit No
                </th>
                <th className="text-center px-1 py-2 whitespace-nowrap">
                  Check-in
                </th>
                <th className="text-center px-1 py-2 whitespace-nowrap">
                  Check-out
                </th>
                <th className="text-center px-1 py-2 whitespace-nowrap">
                  Status
                </th>
                <th className="text-center px-1 py-2 pr-3 whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : !Array.isArray(filteredReservations) ||
                filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    {dateRange
                      ? "No reservations found for the selected date range"
                      : "No reservations found"}
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res) => (
                  <tr
                    key={`${res.id}-${
                      res.createdAt || res.checkIn || res.checkOut || ""
                    }`}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedReservation(res)}
                  >
                    <td className="px-1 py-2 text-[12px] text-center break-all whitespace-nowrap">
                      {res.title || "-"}
                    </td>
                    <td className="px-1 py-2 text-center whitespace-nowrap">
                      <div className="flex justify-center items-center gap-2">
                        {res.isStayhubBooking && (
                          <img
                            src="/images/stayhub-f.svg"
                            alt="Stayhub"
                            className="w-4 h-4 sm:w-5 sm:h-5"
                          />
                        )}
                        {!res.isStayhubBooking && res.channelIcon && (
                          <img
                            src={res.channelIcon}
                            alt={res.channel}
                            className="w-4 h-4 sm:w-5 sm:h-5"
                          />
                        )}
                        {!res.isStayhubBooking &&
                          !res.channelIcon &&
                          res.channel && (
                            <img
                              src={`/images/${res.channel.toLowerCase()}.svg`}
                              alt={res.channel}
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                          )}
                      </div>
                    </td>
                    <td className="px-1 py-2 text-[12px] text-center break-all whitespace-nowrap">
                      {res.guestName}
                    </td>
                    <td className="px-1 py-2 text-[12px] text-center break-all whitespace-nowrap">
                      {res.bookingId}
                    </td>
                    <td className="px-1 py-2 text-[12px] text-center break-all whitespace-nowrap">
                      {res.unitNo || "-"}
                    </td>
                    <td className="px-1 py-2 text-center whitespace-nowrap text-xs">
                      {res.checkIn
                        ? (() => {
                            try {
                              return format(
                                new Date(res.checkIn),
                                "d-MMM-yyyy"
                              );
                            } catch {
                              return "-";
                            }
                          })()
                        : "-"}
                    </td>
                    <td className="px-1 py-2 text-center whitespace-nowrap text-xs">
                      {res.checkOut
                        ? (() => {
                            try {
                              return format(
                                new Date(res.checkOut),
                                "d-MMM-yyyy"
                              );
                            } catch {
                              return "-";
                            }
                          })()
                        : "-"}
                    </td>
                    <td className="px-1 py-2 text-[12px] text-center whitespace-nowrap">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`inline-flex items-center w-[13rem] flex-wrap text-[10px] gap-2 pl-4 py-2 rounded-full text-xs font-medium ${
                            getStatusType(res) === "green"
                              ? "bg-green-100 text-green-700"
                              : getStatusType(res) === "red"
                              ? "bg-[#FFB8B8] text-[#821F1F]"
                              : getStatusText(res) === "Pending"
                              ? "bg-gray-200 text-gray-700"
                              : getStatusType(res) === "gray"
                              ? "bg-gray-200 text-gray-700"
                              : "bg-[#CAE7F7] text-[#156B9B]"
                          }`}
                        >
                          {getStatusIcon(res)}
                          {getStatusText(res)}
                        </span>
                      </div>
                    </td>
                    <td className="px-1 py-2 whitespace-nowrap">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePopover(res.id);
                          }}
                        >
                          <img
                            src="/images/mobile.svg"
                            alt="mobile"
                            className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer"
                          />
                        </button>
                        {openPopoverId === res.id && (
                          <div className="absolute z-50 bg-white rounded-lg shadow-lg border w-56 right-[4rem] mt-5 text-sm">
                            <div className="flex justify-between items-center p-2 border-b border-gray-300 font-semibold text-[#7C69E8]">
                              <span>{res.guestName || "Guest"}</span>
                              <button
                                className="text-gray-500 cursor-pointer hover:text-gray-800 text-2xl font-bold"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenPopoverId(null);
                                }}
                                aria-label="Close"
                              >
                                &times;
                              </button>
                            </div>
                            <div className="p-2 space-y-2">
                              <button
                                className="flex items-center gap-2 cursor-pointer w-full text-left hover:bg-gray-50 p-2 rounded"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(
                                    `tel:${res.mobileNumber || res.phone || ""}`
                                  );
                                }}
                                disabled={!res.mobileNumber && !res.phone}
                              >
                                <MdCall className="text-[#7C69E8]  cursor-pointer w-5 h-5" />
                                <span>Call</span>
                              </button>
                              <button
                                className="flex items-center gap-2 cursor-pointer w-full text-left hover:bg-gray-50 p-2 rounded"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(
                                    `https://wa.me/${
                                      res.mobileNumber || res.phone || ""
                                    }`
                                  );
                                }}
                                disabled={!res.mobileNumber && !res.phone}
                              >
                                <IoLogoWhatsapp className="text-green-700 w-5 h-5" />
                                <span>WhatsApp</span>
                              </button>
                              <button
                                className="flex items-center gap-2 cursor-pointer w-full text-left hover:bg-gray-50 p-2 rounded"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`mailto:${res.email || ""}`);
                                }}
                                disabled={!res.email}
                              >
                                <FaEnvelope className="text-[#7C69E8] w-5 h-5" />
                                <span>Email</span>
                              </button>
                              <button
                                className="flex items-center gap-2 cursor-pointer w-full text-left hover:bg-gray-50 p-2 rounded"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(
                                    `sms:${res.mobileNumber || res.phone || ""}`
                                  );
                                }}
                                disabled={!res.mobileNumber && !res.phone}
                              >
                                <BiSolidMessageDetail className="text-[#7C69E8] w-5 h-5" />
                                <span>Message</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenNoteId(res.id);
                            setSelectedNote(res.notes || []);
                          }}
                        >
                          <img
                            src="/images/note.svg"
                            alt="note"
                            className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer"
                          />
                        </button>
                        {openNoteId === res.id && (
                          <div className="absolute z-50 bg-white rounded-lg shadow-lg border w-64 right-[4rem] mt-5 text-sm">
                            <div className="flex justify-between items-center p-3 border-b">
                              <span className="font-semibold text-lg text-gray-800">
                                Attached Note
                              </span>
                              <button
                                className="text-gray-500 hover:text-gray-800 text-2xl"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenNoteId(null);
                                }}
                                aria-label="Close"
                              >
                                &times;
                              </button>
                            </div>
                            <div className="p-3">
                              {selectedNote && selectedNote.length > 0 ? (
                                <div className="space-y-3 max-h-48 overflow-y-auto">
                                  {selectedNote.map((note, idx) => (
                                    <div
                                      key={idx}
                                      className="text-xs text-gray-600 border-b pb-2 last:border-b-0"
                                    >
                                      {note.text}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4">
                                  <p className="text-gray-600 text-md mb-4">
                                    No Notes available
                                  </p>
                                </div>
                              )}

                              {/* Always show Add Note button */}
                              <div className="mt-1 pt-1 border-t border-gray-200">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAddNotePopup(res.id);
                                    setOpenNoteId(null);
                                  }}
                                  className="w-full bg-[#25A4E8] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#1f7bb8] cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Add Note
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 gap-4 sm:gap-0">
          <div className="text-sm text-gray-700">
            Showing page {pagination.currentPage} of {pagination.totalPage}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-4 py-1 bg-white text-[#7C69E8] border border-[#7C69E8] rounded hover:bg-[#7C69E8] active:bg-[#7C69E8] active:text-white cursor-pointer hover:text-white transition-colors duration-150"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: Math.max(1, prev.currentPage - 1),
                }))
              }
              disabled={pagination.currentPage === 1}
            >
              Previous
            </button>
            <button
              className="px-4 py-1 bg-white text-[#7C69E8] border border-[#7C69E8] rounded hover:bg-[#7C69E8] active:bg-[#7C69E8] active:text-white cursor-pointer hover:text-white transition-colors duration-150"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: Math.min(prev.totalPage, prev.currentPage + 1),
                }))
              }
              disabled={pagination.currentPage === pagination.totalPage}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {showAddNotePopup && (
        <div className="fixed inset-0 bg-black/30  flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 ">
              <h2 className="text-xl font-semibold">New Note</h2>
              <button
                onClick={() => setShowAddNotePopup(null)}
                className="text-gray-400 hover:text-gray-600 text-3xl"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              <textarea
                className="w-full border border-gray-300 rounded-md p-3 text-sm  "
                rows="5"
                placeholder="Write note..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                maxLength="100"
              ></textarea>
              <div className="text-right text-xs text-gray-500 mt-1">
                {newNoteText.length}/100
              </div>
            </div>
            <div className="flex justify-end p-4 ">
              <button
                onClick={() => handleAddNewNote(showAddNotePopup)}
                disabled={isAddingNote}
                className="bg-[#25A4E8] text-white mx-auto w-[40%] px-8 py-2 rounded-md text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingNote ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedReservation && (
        <TablerowDetailedView
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}
      {showDatePicker && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <DateRange
          // ...props
          />
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={() => setShowDatePicker(false)}
              className="w-full bg-[#25A4E8] text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Apply Dates
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationTable;
