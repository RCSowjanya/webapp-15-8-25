import CreateReservation from "../../../../components/View/reservations/createreservation/CreateReservation";
import React from "react";
import { auth } from "../../auth";
const CreateReservationWithId =  async ({ params }) => {
  const uparams= await params;
  const propertyId = await uparams.id;
const session = await auth();
const token= session?.token||""
  return (
    <div className="h-full flex flex-col min-h-0">
      <CreateReservation initialPropertyId={propertyId} token={token} />
    </div>
  );
};

export default CreateReservationWithId;
