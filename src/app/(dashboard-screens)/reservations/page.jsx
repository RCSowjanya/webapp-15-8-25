import React from "react";
import ReservationScreenLayout from "../../../components/View/reservations/ReservationScreenLayout";
import ReservationModel from "@/components/Models/reservations/ReservationModel";

const ReservationsPage = async () => {
  // Server-side fetch of reservations (page 1 default)
  const result = await ReservationModel(1, 10);

  const initialReservations = result?.success ? result.data || [] : [];
  const initialPagination = result?.pagination || {
    currentPage: 1,
    totalPage: 1,
    pageSize: 10,
  };

  return (
    <ReservationScreenLayout
      initialReservations={initialReservations}
      initialPagination={initialPagination}
    />
  );
};

export default ReservationsPage;
