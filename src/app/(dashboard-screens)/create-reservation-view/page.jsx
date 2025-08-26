import React from "react";
import CreateReservationView from "../../../components/View/reservations/createreservation/CreateReservationView";
import { auth } from "../auth";
import { fetchActiveProperties } from "@/components/Models/properties/PropertyModel";
const CreateReservationViewPage = async () => {
  const session = await auth();
  const token = session?.token;
  const propertiesResponse = await fetchActiveProperties();
  const initialProperties = propertiesResponse?.success
    ? propertiesResponse.data || []
    : [];
  return (
    <div className="h-full flex flex-col min-h-0">
      <CreateReservationView
        token={token}
        initialProperties={initialProperties}
      />
    </div>
  );
};

export default CreateReservationViewPage;
