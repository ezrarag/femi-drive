// Wheelbase integration module
// This module isolates all Wheelbase-related functionality

export interface WheelbaseConfig {
  ownerId: string
  enabled: boolean
}

export const wheelbaseConfig: WheelbaseConfig = {
  ownerId: process.env.WHEELBASE_OWNER_ID || "4321962",
  enabled: process.env.INSURANCE_PROVIDER === "wheelbase",
}

/**
 * Generate Wheelbase checkout URL for a vehicle
 */
export function getWheelbaseCheckoutUrl(vehicleId: string): string {
  if (!wheelbaseConfig.enabled) {
    throw new Error("Wheelbase is not enabled")
  }
  
  // Map vehicle IDs to Wheelbase listing IDs
  const vehicleMapping: Record<string, string> = {
    "1": "457237", // Dodge Charger
    "2": "463737", // Nissan Altima
    "3": "454552", // Volkswagen Passat
  }

  const listingId = vehicleMapping[vehicleId] || vehicleId
  
  return `https://checkout.wheelbasepro.com/reserve?owner_id=${wheelbaseConfig.ownerId}&listing_id=${listingId}`
}

/**
 * Check if Wheelbase is enabled
 */
export function isWheelbaseEnabled(): boolean {
  return wheelbaseConfig.enabled
}

