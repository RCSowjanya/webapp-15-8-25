"use server";

import { getAllNeighbourhoods as getNeighbourhoodsFromService } from "./PropertyDataService";

export async function getAllNeighbourhoods() {
  return await getNeighbourhoodsFromService();
}
