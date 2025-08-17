"use server";

import { getAllProperties as getPropertiesFromService } from "./PropertyDataService";

export async function getAllProperties() {
  return await getPropertiesFromService();
}