"use server";
import { auth } from "@/app/(dashboard-screens)/auth";
import api from "@/utils/apiService";

// Single function to get property data and extract different types
export async function getPropertyData(type = "properties") {
  console.log(`🔍 Debug: getPropertyData called for type: ${type}`);

  try {
    const session = await auth();
    const token = session?.token;

    if (!token) {
      console.log("❌ Error: No authentication token");
      return {
        success: false,
        error: "No authentication token",
        data: [],
      };
    }

    console.log("🔍 Debug: Making API call to /property/list");

    const response = await api.get("/property/list", {
      authorizationHeader: `Bearer ${token}`,
      showErrorToast: false,
    });

    console.log(
      "🔍 Debug: Full API response:",
      JSON.stringify(response, null, 2)
    );

    // Safely get the properties array from different possible response structures
    const properties = response.data?.data || response.data?.data?.data || null;

    if (response.success && Array.isArray(properties)) {
      console.log(
        `🔍 Debug: Processing ${properties.length} properties for ${type}`
      );

      switch (type) {
        case "cities":
          // Extract unique cities from property.address.city
          const citySet = new Set();
          properties.forEach((property, index) => {
            const city = property.address?.city;
            if (city) {
              citySet.add(city);
              console.log(`✅ Added city: ${city}`);
            }
          });
          return {
            success: true,
            cities: Array.from(citySet),
          };

        case "neighbourhoods":
          // Extract unique neighbourhoods from property.address.address_3
          const neighbourhoodSet = new Set();
          properties.forEach((property) => {
            const neighbourhood = property.address?.address_3;
            if (neighbourhood) neighbourhoodSet.add(neighbourhood);
          });
          return {
            success: true,
            neighbourhoods: Array.from(neighbourhoodSet),
          };

        case "properties":
        default:
          // Return all properties
          return {
            success: true,
            properties: properties,
          };
      }
    } else {
      console.log("❌ Error: Invalid response structure:", response);
      return {
        success: false,
        error: response.error || `Failed to load ${type}`,
        data: [],
      };
    }
  } catch (error) {
    console.error(`❌ getPropertyData error for ${type}:`, error);
    return {
      success: false,
      error: `Failed to load ${type}`,
      data: [],
    };
  }
}

// Convenience functions for backward compatibility
export async function getAllCities() {
  return getPropertyData("cities");
}

export async function getAllNeighbourhoods() {
  return getPropertyData("neighbourhoods");
}

export async function getAllProperties() {
  return getPropertyData("properties");
}