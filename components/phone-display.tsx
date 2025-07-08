"use client"

import { formatPhoneNumber } from "@/lib/phone-utils"

interface PhoneDisplayProps {
  className?: string
}

export function PhoneDisplay({ className = "" }: PhoneDisplayProps) {
  // Get phone number from environment variable (client-side)
  const phoneNumber = process.env.NEXT_PUBLIC_BUSINESS_PHONE

  // Don't render if no phone number is configured
  if (!phoneNumber) {
    return null
  }

  const formattedPhone = formatPhoneNumber(phoneNumber)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium">📞</span>
      <a href={`tel:${phoneNumber}`} className="text-sm font-medium hover:underline transition-colors">
        {formattedPhone}
      </a>
    </div>
  )
}

// Also export as default for compatibility
export default PhoneDisplay
