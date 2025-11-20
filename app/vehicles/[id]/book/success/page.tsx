"use client"

import { useEffect, useState, use } from "react"
import { motion } from "framer-motion"
import { CheckCircle, ArrowLeft, Car } from "lucide-react"
import NavBar from "@/components/NavBar"
import Link from "next/link"

export default function BookingSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params Promise using React.use()
  const { id } = use(params)
  const [bookingDetails, setBookingDetails] = useState<any>(null)

  useEffect(() => {
    // Get booking details from URL params or localStorage if available
    const urlParams = new URLSearchParams(window.location.search)
    const vehicleId = id
    const startDate = urlParams.get('start_date')
    const endDate = urlParams.get('end_date')
    const totalCost = urlParams.get('total_cost')
    const vehicleName = urlParams.get('vehicle_name')

    if (vehicleId && startDate && endDate && totalCost) {
      setBookingDetails({
        vehicleId,
        vehicleName: vehicleName || 'Vehicle',
        startDate,
        endDate,
        totalCost: parseFloat(totalCost)
      })
    }
  }, [id])

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <NavBar variant="dark" transparent noBorder />
      
      {/* Background with animated gradient and video */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Video Background */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source
            src="https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/femileasing%2Finvest%2F19155080-hd_1080_1920_30fps.mp4?alt=media&token=0e436a38-0f94-4030-bead-cabd0e282302"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        {/* Color overlay with 15% transparency */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-15" />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <main className="relative z-40 flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-white/80 mb-6">
            {bookingDetails 
              ? `Your reservation for the ${bookingDetails.vehicleName} has been confirmed.`
              : 'Your vehicle reservation has been confirmed.'
            }
          </p>
          
          {bookingDetails && (
            <div className="bg-white/5 border border-white/20 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <Car className="w-6 h-6 text-white/60" />
                <div>
                  <h3 className="text-white font-semibold">{bookingDetails.vehicleName}</h3>
                  <p className="text-white/60 text-sm">Vehicle ID: {bookingDetails.vehicleId}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>Pickup Date:</span>
                  <span>{new Date(bookingDetails.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Return Date:</span>
                  <span>{new Date(bookingDetails.endDate).toLocaleDateString()}</span>
                </div>
                <div className="border-t border-white/20 pt-2 mt-2">
                  <div className="flex justify-between font-semibold text-white">
                    <span>Total Paid:</span>
                    <span>${bookingDetails.totalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              Your booking has been processed successfully. You will receive a confirmation email shortly with all the details and pickup instructions.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/dashboard">
              <motion.button
                className="w-full py-3 px-6 bg-white text-black rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-4 h-4" />
                Go to Dashboard
              </motion.button>
            </Link>
            
            <Link href="/inventory">
              <motion.button
                className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Browse More Vehicles
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
