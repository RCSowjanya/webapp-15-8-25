import ListingScreenLayout from "@/components/View/listings/ListingScreenLayout";
import React, { useState } from "react";
import { getListings } from "@/components/Models/listings/GetListingsModel";

const Listings = ({ initialListings }) => {
  const [listings, setListings] = useState(initialListings);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const updatedListings = await getListings();
      setListings(updatedListings);
    } catch (error) {
      console.error('Error refreshing listings:', error);
      // You might want to show a toast notification here
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div>
      {isRefreshing && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg z-[1000]">
          <div className="flex items-center gap-2">
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            Refreshing listings...
          </div>
        </div>
      )}
      <ListingScreenLayout 
        listingslist={listings} 
        onRefresh={handleRefresh}
      />
    </div>
  );
};

// If you're using this as a server component, you can keep the original structure:
const ListingsServer = async () => {
  const listings = await getListings();
  return <Listings initialListings={listings} />;
};

export default ListingsServer;