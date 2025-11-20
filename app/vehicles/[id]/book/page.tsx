"use client"

import { useEffect, useMemo, use } from "react"
import NavBar from "@/components/NavBar"
import Link from "next/link"

const WHEELBASE_OWNER_ID = process.env.NEXT_PUBLIC_WHEELBASE_OWNER_ID || "4321962"

const wheelbaseListingMap: Record<string, string> = {
  "1": "457237", // Dodge Charger
  "2": "463737", // Nissan Altima
  "3": "454552", // Volkswagen Passat
}

function buildWheelbaseUrl(vehicleId: string): string {
  const listingId = wheelbaseListingMap[vehicleId] || vehicleId
  return `https://checkout.wheelbasepro.com/reserve?owner_id=${WHEELBASE_OWNER_ID}&listing_id=${listingId}`
}

export default function VehicleBookingRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const wheelbaseUrl = useMemo(() => buildWheelbaseUrl(id), [id])

  useEffect(() => {
    if (!wheelbaseUrl) return
    window.location.href = wheelbaseUrl
  }, [wheelbaseUrl])

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <NavBar variant="dark" transparent noBorder />

      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-emerald-500/20 to-black" />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Booking Redirect</p>
            <h1 className="text-4xl md:text-5xl font-semibold">Taking You To Wheelbase</h1>
            <p className="text-white/70">
              We&apos;re redirecting you to our secure Wheelbase booking portal to complete your reservation for this
              vehicle. If you&apos;re not redirected automatically, use the button below.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={wheelbaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-white/90 transition-all"
            >
              Continue to Wheelbase
            </Link>
            <Link
              href="/inventory"
              className="flex-1 px-6 py-3 border border-white/30 rounded-full font-semibold text-white hover:bg-white/10 transition-all"
            >
              Back to Fleet
            </Link>
          </div>

          <p className="text-xs text-white/50">
            Need help? Call us at <span className="underline">201-898-7281</span> and our team will assist with your booking.
          </p>
        </div>
      </main>
    </div>
  )
}

