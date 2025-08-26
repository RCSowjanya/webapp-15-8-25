import { NextResponse } from "next/server";
import { getRatePlan } from "@/components/Models/reservations/RatePlanModel";

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (_) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (!body?.startDate || !body?.endDate || !body?.propertyId) {
      return NextResponse.json(
        {
          success: false,
          message: "startDate, endDate and propertyId are required",
        },
        { status: 400 }
      );
    }

    const result = await getRatePlan(body);
    return NextResponse.json(result, { status: result?.success ? 200 : 400 });
  } catch (error) {
    console.error("/api/rate-plan error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
