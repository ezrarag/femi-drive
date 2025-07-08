/**
 * Client-safe phone number formatting utilities
 * No server-side dependencies - safe for client components
 */

export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return ""

  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, "")

  // Format as (XXX) XXX-XXXX for US numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  // Format as +X (XXX) XXX-XXXX for international numbers starting with 1
  if (digits.length === 11 && digits.startsWith("1")) {
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
