/**
 * Pure client-side phone number formatting utilities
 * No server dependencies - safe for client components
 */

export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return ""

  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, "")

  // Handle different phone number lengths
  if (digits.length === 10) {
    // US phone number: (XXX) XXX-XXXX
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  } else if (digits.length === 11 && digits.startsWith("1")) {
    // US phone number with country code: +1 (XXX) XXX-XXXX
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }

  // Return original if we can't format it
  return phoneNumber
}

export function isValidPhoneNumber(phoneNumber: string): boolean {
  if (!phoneNumber) return false

  const digits = phoneNumber.replace(/\D/g, "")
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"))
}
