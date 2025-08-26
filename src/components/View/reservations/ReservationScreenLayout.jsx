import React from "react";

import ReservationView from "./ReservationView";

const ReservationScreenLayout = ({
  initialReservations = [],
  initialPagination,
}) => {
  return (
    <div className="w-full h-full px-2 flex flex-col min-h-0">
      <div className="flex-1 flex flex-col min-h-0">
        <ReservationView
          initialReservations={initialReservations}
          initialPagination={initialPagination}
        />
      </div>
    </div>
  );
};

export default ReservationScreenLayout;
