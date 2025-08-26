"use server";

import { getRatePlan } from "@/components/Models/reservations/RatePlanModel";

export async function checkRatePlanAction(prevState, formData) {
  try {
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");
    const propertyId = formData.get("propertyId");

    if (!startDate || !endDate || !propertyId) {
      return {
        success: false,
        message: "startDate, endDate and propertyId are required",
      };
    }

    const result = await getRatePlan({ startDate, endDate, propertyId });
    return result || { success: false, message: "No response from rate plan" };
  } catch (error) {
    return { success: false, message: error?.message || "Server error" };
  }
}
