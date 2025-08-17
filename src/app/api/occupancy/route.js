import { fetchOccupancyData } from "../../../components/Models/livefeed/Occupancymodel";

export async function POST(req) {
  try {
    // Parse the request body
    const body = await req.json();

    console.log("Shared Occupancy API route received request:", body);

    // Call the server action
    const result = await fetchOccupancyData(body);

    console.log("Shared Occupancy API route returning result:", result);

    // Return the result
    return Response.json(result);
  } catch (error) {
    console.error("Shared Occupancy API Error:", error);
    return Response.json(
      {
        success: false,
        data: null,
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}