import ListingScreenLayout from "@/components/View/listings/ListingScreenLayout";
import React from "react";
import { getListings } from "@/components/Models/listings/GetListingsModel";
const Listings = async () => {
  const listings = await getListings();
  return (
    <div className="h-full">
      <ListingScreenLayout listingslist={listings}/>
    </div>
  );
};

export default Listings;
