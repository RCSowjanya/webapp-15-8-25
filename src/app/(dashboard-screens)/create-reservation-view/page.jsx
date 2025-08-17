import React from "react";
import CreateReservationView from "../../../components/View/reservations/createreservation/CreateReservationView";
import { auth } from "../auth";
const CreateReservationViewPage = async () => {
const session= await auth();
const token= session?.token
  return (
    <div className="h-full flex flex-col min-h-0">
      <CreateReservationView token={token} />
    </div>
  );
};

export default CreateReservationViewPage;
