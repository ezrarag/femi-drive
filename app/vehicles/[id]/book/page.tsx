"use client"

import { useState, useEffect, use } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, CreditCard, Car, DollarSign, ArrowLeft } from "lucide-react"
import NavBar from "@/components/NavBar"
import Link from "next/link"
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price_per_day: number
  available: boolean
  size: string
  category: string
  gigReady: boolean
  image_url: string
  description: string
  mileage: number
  transmission: string
  location: string
  features: string[]
  insurance: string
  maintenance: string
}

function PaymentForm({ 
  amount, 
  vehicle, 
  startDate, 
  endDate, 
  paymentType,
  clientSecret,
  onSuccess 
}: { 
  amount: number
  vehicle: Vehicle
  startDate: string
  endDate: string
  paymentType: 'booking' | 'direct_payment'
  clientSecret: string
  onSuccess: () => void 
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) return

    setIsProcessing(true)

    try {
      // ✅ This line must come FIRST - validate and tokenize card details
      const { error: submitError } = await elements.submit()
      if (submitError) {
        console.error('Submit error:', submitError)
        alert(submitError.message || 'Error submitting payment details')
        setIsProcessing(false)
        return
      }

      // ✅ THEN confirm payment using the prefetched client secret
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/vehicles/${vehicle.id}/book/success`,
        },
      })

      if (error) {
        console.error('Payment failed:', error)
        alert('Payment failed. Please try again.')
      } else {
        onSuccess()
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment error. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/5 border border-white/20 rounded-lg p-4">
        <PaymentElement />
      </div>
      
      <motion.button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-4 px-6 bg-white text-black rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <CreditCard className="w-5 h-5" />
        {isProcessing ? 'Processing...' : `${paymentType === 'booking' ? 'Reserve Now' : 'Pay Now'} - $${amount.toLocaleString()}`}
      </motion.button>
    </form>
  )
}

export default function VehicleBookingPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params Promise using React.use()
  const { id } = use(params)
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentType, setPaymentType] = useState<'booking' | 'direct_payment'>('booking')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)
  // Customer information
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  // Calculate total cost based on payment type
  const totalDays = startDate && endDate ? 
    Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0
  const bookingCost = vehicle ? vehicle.price_per_day * totalDays : 0
  const directPaymentCost = parseFloat(paymentAmount) || 0
  const totalCost = paymentType === 'booking' ? bookingCost : directPaymentCost

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true)
        // For now, use static data - replace with actual API call
        const vehicles = [
          {
            id: "1",
            make: "Dodge",
            model: "Charger",
            year: 2020,
            price_per_day: 85,
            available: true,
            size: "large",
            category: "Sedan",
            gigReady: true,
            image_url: "https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/femileasing%2FVehicles%2FCharger%2Fcharger-front.webp?alt=media&token=123",
            description: "Powerful and stylish sedan perfect for rideshare",
            mileage: 45000,
            transmission: "Automatic",
            location: "Newark, NJ",
            features: ["Bluetooth", "Backup Camera", "Cruise Control", "Heated Seats"],
            insurance: "Full Coverage",
            maintenance: "Regular Service"
          },
          {
            id: "2",
            make: "Nissan",
            model: "Altima",
            year: 2019,
            price_per_day: 75,
            available: true,
            size: "medium",
            category: "Sedan",
            gigReady: true,
            image_url: "https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/femileasing%2FVehicles%2FAltima%2Faltima-front.webp?alt=media&token=456",
            description: "Reliable and fuel-efficient sedan",
            mileage: 55000,
            transmission: "Automatic",
            location: "Newark, NJ",
            features: ["Bluetooth", "Backup Camera", "Cruise Control"],
            insurance: "Full Coverage",
            maintenance: "Regular Service"
          },
          {
            id: "3",
            make: "Volkswagen",
            model: "Passat",
            year: 2015,
            price_per_day: 65,
            available: true,
            size: "medium",
            category: "Sedan",
            gigReady: true,
            image_url: "https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/femileasing%2FVehicles%2FPassat%2Flm58zgcoez8ne9cdsu3c.webp?alt=media&token=789",
            description: "Comfortable and spacious sedan",
            mileage: 65000,
            transmission: "Automatic",
            location: "Newark, NJ",
            features: ["Bluetooth", "Backup Camera", "Cruise Control", "Heated Seats"],
            insurance: "Full Coverage",
            maintenance: "Regular Service"
          }
        ]

        const foundVehicle = vehicles.find(v => v.id === id)
        if (foundVehicle) {
          setVehicle(foundVehicle)
        } else {
          setError('Vehicle not found')
        }
      } catch (err) {
        setError('Failed to load vehicle details')
      } finally {
        setLoading(false)
      }
    }

    fetchVehicle()
  }, [id])

  const handleReserve = async () => {
    // Clear any previous errors
    setError('')

    // Validate customer information
    if (!customerName.trim()) {
      setError('Please enter your name')
      return
    }
    if (!customerEmail.trim()) {
      setError('Please enter your email address')
      return
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail)) {
      setError('Please enter a valid email address')
      return
    }
    if (!customerPhone.trim()) {
      setError('Please enter your phone number')
      return
    }

    if (paymentType === 'booking') {
      if (!startDate || !endDate) {
        setError('Please select both pickup and return dates')
        return
      }
      
      // Validate dates
      const start = new Date(startDate)
      const end = new Date(endDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (start < today) {
        setError('Pickup date cannot be in the past')
        return
      }
      
      if (end <= start) {
        setError('Return date must be after pickup date')
        return
      }
      
      if (totalCost <= 0) {
        setError('Invalid booking duration. Please check your dates.')
        return
      }
    } else {
      if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
        setError('Please enter a valid payment amount')
        return
      }
      
      if (totalCost <= 0) {
        setError('Invalid payment amount')
        return
      }
    }

    if (!vehicle) {
      setError('Vehicle information is missing')
      return
    }
    
    // Check if Stripe is configured
    if (!stripePromise) {
      setError('Payment system is not configured. Please contact support.')
      return
    }

    setIsLoadingPayment(true)
    try {
      // Create payment intent based on payment type
      const paymentData = paymentType === 'booking' 
        ? {
            amount: totalCost,
            connectedAccountId: "acct_1SK6dd1lscTKUkb9",
            description: `Booking for ${vehicle.make} ${vehicle.model}`,
            metadata: { 
              type: "booking", 
              vehicleId: vehicle.id, 
              vehicleName: `${vehicle.make} ${vehicle.model}`,
              startDate,
              endDate,
              customerName: customerName.trim(),
              customerEmail: customerEmail.trim(),
              customerPhone: customerPhone.trim()
            }
          }
        : {
            amount: totalCost,
            connectedAccountId: "acct_1SK6dd1lscTKUkb9",
            description: `Direct payment for ${vehicle.make} ${vehicle.model}`,
            metadata: { 
              type: "direct_payment", 
              vehicleId: vehicle.id, 
              vehicleName: `${vehicle.make} ${vehicle.model}`,
              customerName: customerName.trim(),
              customerEmail: customerEmail.trim(),
              customerPhone: customerPhone.trim()
            }
          }

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      })

      const data = await response.json()

      if (!response.ok) {
        // Show more detailed error message
        const errorMsg = data.message || data.error || 'Failed to create payment intent'
        const errorCode = data.code ? ` (${data.code})` : ''
        throw new Error(`${errorMsg}${errorCode}`)
      }

      const { clientSecret: secret } = data

      if (!secret) {
        throw new Error('No client secret received from server')
      }

      setClientSecret(secret)
      setShowPaymentForm(true)
    } catch (error: any) {
      console.error('Failed to create payment intent:', error)
      const errorMessage = error?.message || 'Failed to initialize payment. Please try again.'
      alert(errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoadingPayment(false)
    }
  }

  const handleBookingSuccess = () => {
    setBookingSuccess(true)
    setShowPaymentForm(false)
  }

  const resetForm = () => {
    setStartDate('')
    setEndDate('')
    setPaymentAmount('')
    setPaymentType('booking')
    setShowPaymentForm(false)
    setBookingSuccess(false)
    setClientSecret(null)
    setCustomerName('')
    setCustomerEmail('')
    setCustomerPhone('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <NavBar variant="dark" transparent noBorder />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-lg font-semibold text-white">Loading vehicle details...</div>
        </div>
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <NavBar variant="dark" transparent noBorder />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-lg font-semibold text-white mb-4">{error || 'Vehicle not found'}</div>
            <Link href="/inventory" className="text-white/80 hover:text-white underline">
              ← Back to Inventory
            </Link>
          </div>
        </div>
      </div>
    )
  }

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

      {/* Main Content */}
      <main className="relative z-40 flex items-center justify-center min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-100px)] md:min-h-[calc(100vh-120px)] px-3 sm:px-4 md:px-6 pt-20">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {bookingSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-8 text-center"
              >
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold mb-2 text-green-400">
                  {paymentType === 'booking' ? 'Booking Confirmed!' : 'Payment Successful!'}
                </h3>
                <p className="text-white/80 mb-6">
                  {paymentType === 'booking' 
                    ? `Your reservation for the ${vehicle.make} ${vehicle.model} has been confirmed.`
                    : `Your payment for the ${vehicle.make} ${vehicle.model} has been processed successfully.`
                  }
                </p>
                <div className="space-y-3">
                  <Link href="/dashboard">
                    <motion.button
                      className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/20"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      View Dashboard
                    </motion.button>
                  </Link>
                  <button
                    onClick={resetForm}
                    className="w-full py-3 px-6 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg font-medium transition-colors"
                  >
                    Make Another Booking
                  </button>
                </div>
              </motion.div>
            ) : showPaymentForm ? (
              <motion.div
                key="payment"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    {paymentType === 'booking' ? 'Complete Reservation' : 'Complete Payment'}
                  </h3>
                  <button
                    onClick={() => setShowPaymentForm(false)}
                    className="text-white/60 hover:text-white transition-colors text-xl"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Vehicle Summary */}
                <div className="bg-white/5 border border-white/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Car className="w-6 h-6 text-white/60" />
                    <div>
                      <h4 className="text-white font-semibold">{vehicle.make} {vehicle.model}</h4>
                      <p className="text-white/60 text-sm">{vehicle.year} • {vehicle.location}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-white/80">
                      <span>Dates:</span>
                      <span>{startDate} to {endDate}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Duration:</span>
                      <span>{totalDays} day{totalDays !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Daily Rate:</span>
                      <span>${vehicle.price_per_day}</span>
                    </div>
                    <div className="border-t border-white/20 pt-2 mt-2">
                      <div className="flex justify-between font-semibold text-white">
                        <span>Total:</span>
                        <span>${totalCost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {clientSecret && stripePromise ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm 
                      amount={totalCost} 
                      vehicle={vehicle}
                      startDate={startDate}
                      endDate={endDate}
                      paymentType={paymentType}
                      clientSecret={clientSecret}
                      onSuccess={handleBookingSuccess} 
                    />
                  </Elements>
                ) : (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
                    <p className="text-sm">Stripe is not configured. Please check your environment variables.</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="booking"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Link href="/inventory" className="text-white/60 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-white">{vehicle.make} {vehicle.model}</h1>
                    <p className="text-white/80 text-sm">{vehicle.year} • ${vehicle.price_per_day}/day</p>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
                    <p className="text-sm font-medium">Error: {error}</p>
                    <button
                      onClick={() => setError('')}
                      className="mt-2 text-xs underline hover:no-underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Payment Type Toggle */}
                <div className="flex bg-white/5 border border-white/20 rounded-lg p-1 mb-6">
                  <button
                    onClick={() => setPaymentType('booking')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      paymentType === 'booking'
                        ? 'bg-white text-black'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Book Vehicle
                  </button>
                  <button
                    onClick={() => setPaymentType('direct_payment')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      paymentType === 'direct_payment'
                        ? 'bg-white text-black'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Make a Payment
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        placeholder="John Doe"
                        className="w-full px-4 py-3 text-white bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent placeholder-white/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        required
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 text-white bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent placeholder-white/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        required
                        placeholder="(201) 555-1234"
                        className="w-full px-4 py-3 text-white bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent placeholder-white/30"
                      />
                    </div>
                  </div>

                  {/* Date Selection - Only for Booking */}
                  {paymentType === 'booking' && (
                    <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Pickup Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 text-white bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Return Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 text-white bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent"
                      />
                    </div>
                    </div>
                  )}

                  {/* Direct Payment Input - Only for Direct Payment */}
                  {paymentType === 'direct_payment' && (
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-3">
                        <DollarSign className="w-4 h-4 inline mr-2" />
                        Enter payment amount (USD)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/50" />
                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder="0"
                          className="w-full pl-12 pr-4 py-4 text-3xl font-bold text-white bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent placeholder-white/30"
                          min="1"
                          step="0.01"
                        />
                      </div>
                    </div>
                  )}

                  {/* Cost Summary */}
                  {((paymentType === 'booking' && startDate && endDate && totalDays > 0) || (paymentType === 'direct_payment' && paymentAmount && totalCost > 0)) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-white/5 border border-white/20 rounded-lg p-4"
                    >
                      <div className="space-y-2 text-sm">
                        {paymentType === 'booking' ? (
                          <>
                            <div className="flex justify-between text-white/70">
                              <span>Daily Rate:</span>
                              <span>${vehicle.price_per_day}</span>
                            </div>
                            <div className="flex justify-between text-white/70">
                              <span>Duration:</span>
                              <span>{totalDays} day{totalDays !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="border-t border-white/20 pt-2 mt-2">
                              <div className="flex justify-between font-semibold text-white">
                                <span>Total Cost:</span>
                                <span>${totalCost.toLocaleString()}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between font-semibold text-white">
                            <span>Payment Amount:</span>
                            <span>${totalCost.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  <motion.button
                    onClick={handleReserve}
                    disabled={
                      !customerName.trim() || !customerEmail.trim() || !customerPhone.trim() ||
                      (paymentType === 'booking' 
                        ? (!startDate || !endDate || totalCost <= 0 || isLoadingPayment)
                        : (!paymentAmount || totalCost <= 0 || isLoadingPayment))
                    }
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                      customerName.trim() && customerEmail.trim() && customerPhone.trim() &&
                      ((paymentType === 'booking' && startDate && endDate && totalCost > 0) || 
                      (paymentType === 'direct_payment' && paymentAmount && totalCost > 0)) && !isLoadingPayment
                        ? 'bg-white text-black hover:bg-white/90'
                        : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/20'
                    }`}
                    whileHover={
                      customerName.trim() && customerEmail.trim() && customerPhone.trim() &&
                      ((paymentType === 'booking' && startDate && endDate && totalCost > 0) || 
                      (paymentType === 'direct_payment' && paymentAmount && totalCost > 0)) && !isLoadingPayment
                        ? { scale: 1.02 } : {}
                    }
                    whileTap={
                      customerName.trim() && customerEmail.trim() && customerPhone.trim() &&
                      ((paymentType === 'booking' && startDate && endDate && totalCost > 0) || 
                      (paymentType === 'direct_payment' && paymentAmount && totalCost > 0)) && !isLoadingPayment
                        ? { scale: 0.98 } : {}
                    }
                  >
                    <DollarSign className="w-5 h-5" />
                    {isLoadingPayment 
                      ? 'Initializing Payment...'
                      : !customerName.trim() || !customerEmail.trim() || !customerPhone.trim()
                        ? 'Complete Contact Info'
                        : paymentType === 'booking' 
                          ? (!startDate || !endDate ? 'Select Dates' : `Reserve Now - $${totalCost.toLocaleString()}`)
                          : (!paymentAmount ? 'Enter Amount' : `Pay Now - $${totalCost.toLocaleString()}`)
                    }
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
