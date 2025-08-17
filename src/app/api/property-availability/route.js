"use server";
import { auth } from "@/app/(dashboard-screens)/auth";
import api from "@/utils/apiService";

export async function POST(request) {
  try {
    const session = await auth();
    const token = session?.token;
    
    if (!token) {
      return new Response(JSON.stringify({ error: "No token" }), { status: 401 });
    }
    
    const { propertyId } = await request.json();
    
    if (!propertyId) {
      return new Response(JSON.stringify({ error: "Property ID is required" }), { status: 400 });
    }
    
    // Get property availability/blocked dates
    const response = await api.get(`/property/availability/${propertyId}`, {
      authorizationHeader: `Bearer ${token}`,
    });
    
    return new Response(JSON.stringify(response?.data || { blockedDates: [] }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error("Property availability API error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch property availability", blockedDates: [] }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
} 