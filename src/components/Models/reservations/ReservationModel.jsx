"use server";

import api from "@/utils/apiService";
import { fetchPropertyById } from "../properties/PropertyModel";
import { auth } from "@/app/(dashboard-screens)/auth";

const ReservationModel = async (page = 1, pageSize = 10) => {
  const session = await auth();
  const token = session?.token;

  if (!token) {
    // console.log("No token found");
    return {
      success: false,
      message: "No token. Please log in again.",
      data: [],
      pagination: {
        totalData: 0,
        totalPage: 0,
        currentPage: page,
        pageSize: pageSize,
      },
    };
  }

  try {
    console.log("🔍 Fetching reservations from /pm/bookings...");
    console.log("🔍 Request params:", {
      page,
      pageSize,
      token: token ? "present" : "missing",
    });

    // Try to get recent bookings first
    const response = await api.get(
      `/pm/bookings?page=${page}&pageSize=${pageSize}`,
      {
        authorizationHeader: `Bearer ${token}`,
        showErrorToast: false,
        errorMessage: "Failed to load reservations.",
      }
    );

    console.log("🔍 Raw API response:", response);
    console.log("🔍 Response data structure:", {
      success: response?.success,
      hasData: !!response?.data,
      dataType: typeof response?.data,
      dataKeys: response?.data ? Object.keys(response?.data) : [],
      totalData: response?.data?.total_data,
      dataLength: response?.data?.data?.length || 0,
    });

    // Check if we need to use different parameters for recent bookings
    console.log(
      "🔍 Checking if we need different parameters for recent bookings..."
    );
    console.log("🔍 Current page:", page, "Page size:", pageSize);
    console.log("🔍 Total data available:", response?.data?.total_data);

    console.log("Raw API Response:", response);

    // Check for nested success and data
    console.log("🔍 Response structure analysis:", {
      hasSuccess: !!response?.success,
      hasData: !!response?.data,
      hasDataSuccess: !!response?.data?.success,
      hasDataData: !!response?.data?.data,
      responseKeys: response ? Object.keys(response) : [],
      dataKeys: response?.data ? Object.keys(response.data) : [],
    });

    if (response?.success && response?.data?.success && response?.data?.data) {
      const apiData = response.data.data;
      console.log("🔍 API Data (nested structure):", {
        totalData: apiData.total_data,
        totalPage: apiData.total_page,
        page: apiData.page,
        pageSize: apiData.pageSize,
        dataLength: apiData.data?.length,
      });

      if (Array.isArray(apiData.data) && apiData.data.length > 0) {
        // Log the first reservation's structure
        const firstReservation = apiData.data[0];
        console.log("🔍 First reservation structure:", {
          id: firstReservation._id,
          propertyDetails: firstReservation.propertyDetails,
          stayDetails: firstReservation.propertyDetails?.stayDetails,
          houseManual: firstReservation.propertyDetails?.houseManual,
          fname: firstReservation.fname,
          lname: firstReservation.lname,
          bookingId: firstReservation.bookingId,
          source: firstReservation.source,
          createdAt: firstReservation.createdAt || firstReservation.created_at,
          isCancelled: firstReservation.isCancelled,
        });

        // Log all reservation IDs to help debug
        const reservationIds = apiData.data.map((res) => ({
          id: res._id,
          bookingId: res.bookingId,
          source: res.source,
          guestName:
            res.fname && res.lname ? `${res.fname} ${res.lname}` : "N/A",
          checkIn: res.startDate || res.stayDetails?.checkIn || res.checkIn,
          checkOut: res.endDate || res.stayDetails?.checkOut || res.checkOut,
          createdAt: res.createdAt || res.created_at,
          isCancelled: res.isCancelled,
        }));
        console.log("🔍 All reservation IDs:", reservationIds);

        // Check if any reservations match the expected structure
        const recentReservations = apiData.data.filter((res) => {
          const created = res.createdAt || res.created_at;
          if (created) {
            const createdDate = new Date(created);
            const now = new Date();
            const diffHours = (now - createdDate) / (1000 * 60 * 60);
            return diffHours < 24; // Show reservations created in last 24 hours
          }
          return false;
        });
        console.log(
          "🔍 Recent reservations (last 24h):",
          recentReservations.length
        );

        // Log the exact paths we're trying to access
        console.log("Data access paths:", {
          stayDetailsTitle:
            firstReservation.propertyDetails?.stayDetails?.title,
          checkin: firstReservation.propertyDetails?.houseManual?.checkin,
          checkout: firstReservation.propertyDetails?.houseManual?.checkout,
        });

        // Normalize and enrich minimally to ensure UI fields are present
        const bookings = apiData.data;
        const enriched = await Promise.all(
          bookings.map(async (b) => {
            // Extract guest name from multiple possible fields
            const guestName =
              (b?.fname && b?.lname ? `${b.fname} ${b.lname}` : null) ||
              (b?.firstName && b?.lastName
                ? `${b.firstName} ${b.lastName}`
                : null) ||
              (b?.first_name && b?.last_name
                ? `${b.first_name} ${b.last_name}`
                : null) ||
              (b?.guestDetails?.firstName && b?.guestDetails?.lastName
                ? `${b.guestDetails.firstName} ${b.guestDetails.lastName}`
                : null) ||
              b?.guestDetails?.name ||
              b?.customerName ||
              b?.primaryGuest?.fullName ||
              b?.guest?.name ||
              "N/A";

            let title =
              b?.propertyId?.propertyDetails?.stayDetails?.title ||
              b?.property?.propertyDetails?.stayDetails?.title ||
              b?.propertyDetails?.stayDetails?.title ||
              b?.property?.title ||
              b?.propertyDetails?.title ||
              b?.unitTitle ||
              null;

            let unitNo =
              b?.propertyId?.unitNo ||
              b?.property?.unitNo ||
              b?.propertyDetails?.unitNo ||
              b?.unitNo ||
              null;

            // If missing title/unit, fetch property details by id when available
            const pid =
              typeof b?.propertyId === "string"
                ? b.propertyId
                : b?.propertyId?._id;
            if ((!title || !unitNo) && pid) {
              try {
                const propResp = await fetchPropertyById(pid);
                const prop = propResp?.data || propResp?.data?.data || null;
                title =
                  title ||
                  prop?.propertyDetails?.stayDetails?.title ||
                  prop?.title ||
                  null;
                unitNo = unitNo || prop?.unitNo || null;
              } catch (e) {
                // ignore enrichment errors
              }
            }

            const checkIn =
              b?.startDate ||
              b?.checkIn ||
              b?.check_in ||
              b?.stayDetails?.checkIn ||
              b?.propertyDetails?.houseManual?.checkin ||
              b?.property?.propertyDetails?.houseManual?.checkin ||
              b?.bookingFrom ||
              b?.fromDate ||
              null;

            const checkOut =
              b?.endDate ||
              b?.checkOut ||
              b?.check_out ||
              b?.stayDetails?.checkOut ||
              b?.propertyDetails?.houseManual?.checkout ||
              b?.property?.propertyDetails?.houseManual?.checkout ||
              b?.bookingTo ||
              b?.toDate ||
              null;

            const createdAt =
              b?.createdAt ||
              b?.created_at ||
              b?.bookingDate ||
              checkIn ||
              new Date().toISOString();

            return {
              ...b,
              __normalized: true,
              title: title || "Property Title",
              unitNo: unitNo || "Unit #",
              checkIn,
              checkOut,
              guestName,
              createdAt,
            };
          })
        );

        return {
          success: true,
          data: enriched,
          pagination: {
            totalData: apiData.total_data || bookings.length,
            totalPage: apiData.total_page || 1,
            currentPage: apiData.page || page,
            pageSize: apiData.pageSize || pageSize,
          },
        };
      } else if (response?.success && response?.data) {
        // Handle direct data structure (no nested success)
        const apiData = response.data;
        console.log("🔍 API Data (direct structure):", {
          totalData: apiData.total_data,
          totalPage: apiData.total_page,
          page: apiData.page,
          pageSize: apiData.pageSize,
          dataLength: apiData.data?.length,
        });

        if (Array.isArray(apiData.data) && apiData.data.length > 0) {
          // Process the same way as nested structure
          const bookings = apiData.data;
          const enriched = await Promise.all(
            bookings.map(async (b) => {
              // Extract guest name from multiple possible fields
              const guestName =
                (b?.fname && b?.lname ? `${b.fname} ${b.lname}` : null) ||
                (b?.firstName && b?.lastName
                  ? `${b.firstName} ${b.lastName}`
                  : null) ||
                (b?.first_name && b?.last_name
                  ? `${b.first_name} ${b.last_name}`
                  : null) ||
                (b?.guestDetails?.firstName && b?.guestDetails?.lastName
                  ? `${b.guestDetails.firstName} ${b.guestDetails.lastName}`
                  : null) ||
                b?.guestDetails?.name ||
                b?.customerName ||
                b?.primaryGuest?.fullName ||
                b?.guest?.name ||
                "N/A";

              let title =
                b?.propertyId?.propertyDetails?.stayDetails?.title ||
                b?.property?.propertyDetails?.stayDetails?.title ||
                b?.propertyDetails?.stayDetails?.title ||
                b?.property?.title ||
                b?.propertyDetails?.title ||
                b?.unitTitle ||
                null;

              let unitNo =
                b?.propertyId?.unitNo ||
                b?.property?.unitNo ||
                b?.propertyDetails?.unitNo ||
                b?.unitNo ||
                null;

              // If missing title/unit, fetch property details by id when available
              const pid =
                typeof b?.propertyId === "string"
                  ? b.propertyId
                  : b?.propertyId?._id;
              if ((!title || !unitNo) && pid) {
                try {
                  const propResp = await fetchPropertyById(pid);
                  const prop = propResp?.data || propResp?.data?.data || null;
                  title =
                    title ||
                    prop?.propertyDetails?.stayDetails?.title ||
                    prop?.title ||
                    null;
                  unitNo = unitNo || prop?.unitNo || null;
                } catch (e) {
                  // ignore enrichment errors
                }
              }

              const checkIn =
                b?.startDate ||
                b?.checkIn ||
                b?.check_in ||
                b?.stayDetails?.checkIn ||
                b?.propertyDetails?.houseManual?.checkin ||
                b?.property?.propertyDetails?.houseManual?.checkin ||
                b?.bookingFrom ||
                b?.fromDate ||
                null;

              const checkOut =
                b?.endDate ||
                b?.checkOut ||
                b?.check_out ||
                b?.stayDetails?.checkOut ||
                b?.propertyDetails?.houseManual?.checkout ||
                b?.property?.propertyDetails?.houseManual?.checkout ||
                b?.bookingTo ||
                b?.toDate ||
                null;

              const createdAt =
                b?.createdAt ||
                b?.created_at ||
                b?.bookingDate ||
                checkIn ||
                new Date().toISOString();

              return {
                ...b,
                __normalized: true,
                title: title || "Property Title",
                unitNo: unitNo || "Unit #",
                checkIn,
                checkOut,
                guestName,
                createdAt,
              };
            })
          );

          return {
            success: true,
            data: enriched,
            pagination: {
              totalData: apiData.total_data || bookings.length,
              totalPage: apiData.total_page || 1,
              currentPage: apiData.page || page,
              pageSize: apiData.pageSize || pageSize,
            },
          };
        }
      }
    }

    console.log("🔍 No data found in response");
    return {
      success: false,
      message: "No reservations found.",
      data: [],
      pagination: {
        totalData: 0,
        totalPage: 0,
        currentPage: page,
        pageSize: pageSize,
      },
    };
  } catch (error) {
    console.error("🔍 Error fetching reservations:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch reservations.",
      data: [],
      pagination: {
        totalData: 0,
        totalPage: 0,
        currentPage: page,
        pageSize: pageSize,
      },
    };
  }
};

export const createBooking = async (bookingData) => {
  const session = await auth();
  const token = session?.token || null;

  if (!token) {
    console.log("No token found");
    return {
      success: false,
      message: "No token. Please log in again.",
    };
  }

  try {
    // Validate required fields
    if (!bookingData.property?._id) {
      return {
        success: false,
        message: "Property ID is required",
      };
    }

    if (
      !bookingData.stayDetails?.checkIn ||
      !bookingData.stayDetails?.checkOut
    ) {
      return {
        success: false,
        message: "Check-in and check-out dates are required",
      };
    }

    // Parse and validate dates
    const checkInDate = new Date(bookingData.stayDetails.checkIn);
    const checkOutDate = new Date(bookingData.stayDetails.checkOut);

    if (isNaN(checkInDate.getTime())) {
      console.error(
        "❌ Invalid check-in date:",
        bookingData.stayDetails.checkIn
      );
      return {
        success: false,
        message: "Invalid check-in date format",
      };
    }

    if (isNaN(checkOutDate.getTime())) {
      console.error(
        "❌ Invalid check-out date:",
        bookingData.stayDetails.checkOut
      );
      return {
        success: false,
        message: "Invalid check-out date format",
      };
    }

    console.log("✅ Dates are valid");

    // Format dates to API expected format: "2024-12-14"
    const formatDateForAPI = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const formattedCheckIn = formatDateForAPI(checkInDate);
    const formattedCheckOut = formatDateForAPI(checkOutDate);

    console.log("📅 Formatted dates for API:");
    console.log("checkIn:", formattedCheckIn);
    console.log("checkOut:", formattedCheckOut);

    // Prepare the request body with the correct API parameters
    const requestBody = {
      propertyId: bookingData.property._id,
      startDate: formattedCheckIn,
      endDate: formattedCheckOut,
      adults: bookingData.guestDetails.adults || 1,
      child: bookingData.guestDetails.children || 0,
      fname: bookingData.guestDetails.firstName || "",
      lname: bookingData.guestDetails.lastName || "",
      phone: bookingData.guestDetails.mobileNumber || "",
      countryCode: bookingData.guestDetails.countryCode || "+966",
      stayingDurationNight: bookingData.stayDetails.nights || 1,
      reservedByOwner: true,
      isStayhubBooking: true,
      totalPrice: bookingData.pricing.total || 0,
    };

    console.log("🔍 Making API call to /property/book with:", requestBody);
    const response = await api.post(`/property/book`, requestBody, {
      authorizationHeader: `Bearer ${token}`,
      showErrorToast: false, // Handle toast in the component
    });

    console.log("🔍 Raw Create Booking API Response:", response);
    console.log("🔍 Create Booking Response Structure:", {
      success: response?.success,
      hasData: !!response?.data,
      dataType: typeof response?.data,
      dataKeys: response?.data ? Object.keys(response.data) : [],
      message: response?.message,
      dataMessage: response?.data?.message,
    });

    // Handle both response structures for /pm/bookings
    if (response?.success && response?.data) {
      console.log("Successfully created booking");
      return {
        success: true,
        data: response.data,
        message:
          response.data.message ||
          response.message ||
          "Booking created successfully!",
      };
    } else if (response?.data?.success) {
      console.log("Successfully created booking (nested structure)");
      return {
        success: true,
        data: response.data,
        message: response.data.message || "Booking created successfully!",
      };
    } else {
      const errorMessage =
        response?.data?.message ||
        response?.message ||
        "Failed to create booking. Please try again.";
      console.error("Create Booking API Failed:", errorMessage);

      // Check for specific error cases
      if (errorMessage.includes("already booked")) {
        return {
          success: false,
          message:
            "The selected dates are not available. This property is already booked for the chosen dates. Please select different dates.",
          errorType: "dates_unavailable",
        };
      }

      return {
        success: false,
        message: errorMessage,
        errorType: "general_error",
      };
    }
  } catch (error) {
    console.error("Create Booking Error:", error);
    return {
      success: false,
      message: error.message || "An error occurred while creating booking.",
    };
  }
};

/**
 * Add a note to an existing reservation
 * @param {string} reservationId - The reservation ID
 * @param {string} noteText - The note text to add
 * @returns {Promise<Object>} API response
 */
export const addNoteToReservation = async (reservationId, noteText) => {
  const session = await auth();
  const token = session?.token;

  if (!token) {
    return {
      success: false,
      message: "No token. Please log in again.",
    };
  }

  if (!reservationId || !noteText.trim()) {
    return {
      success: false,
      message: "Reservation ID and note text are required.",
    };
  }

  try {
    console.log("Adding note to reservation:", { reservationId, noteText });

    const response = await api.post(
      `/pm/bookings/${reservationId}/notes`,
      { note: noteText },
      {
        authorizationHeader: `Bearer ${token}`,
        showErrorToast: false,
        errorMessage: "Failed to add note to reservation.",
      }
    );

    console.log("Add Note API Response:", response);

    if (response?.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || "Note added successfully!",
      };
    } else {
      return {
        success: false,
        message:
          response?.data?.message ||
          response?.message ||
          "Failed to add note. Please try again.",
      };
    }
  } catch (error) {
    console.error("Add Note Error:", error);
    return {
      success: false,
      message: error.message || "An error occurred while adding the note.",
    };
  }
};

export default ReservationModel;
