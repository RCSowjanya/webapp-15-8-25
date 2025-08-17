"use server";

import { getAllCities as getCitiesFromService } from "./PropertyDataService";

export async function getAllCities() {
  return await getCitiesFromService();
}