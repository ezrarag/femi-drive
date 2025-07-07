"use client"

import { Phone } from "lucide-react"
import { formatPhoneNumber } from "@/lib/phone-utils"

export function PhoneDisplay() {
  const businessPhone = process.env.NEXT_PUBLIC_BUSINESS_PHONE

  if (!businessPhone) {
    return null // Don't render anything if no phone number is configured
  }

  const formattedPhone = formatPhoneNumber(businessPhone)

  const handlePhoneClick = () => {
    window.open(`tel:${businessPhone}`, "_self")
  }

  return (
    <button
      onClick={handlePhoneClick}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full nav-text hover:bg-green-700 transition-all"
    >
      <Phone className="w-4 h-4" />
      <span>{formattedPhone}</span>
    </button>
  )
}
