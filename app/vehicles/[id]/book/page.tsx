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
  // Security deposit fields
  security_deposit_enabled?: boolean
  security_deposit_amount?: number
  security_deposit_days_before?: number // Days before pickup to authorize
  security_deposit_release_days?: number // Days after return to release
  cancellation_policy?: string
  // Origin address for distance calculation
  origin_address?: string
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
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/vehicles/${vehicle.id}/book/success`,
        },
        redirect: 'if_required', // Only redirect if required (3D Secure, etc.)
      })

      if (error) {
        console.error('Payment failed - Full error details:', {
          message: error.message,
          type: error.type,
          code: error.code,
          decline_code: error.decline_code,
          param: error.param,
          payment_intent: error.payment_intent,
          error: error,
        })
        
        const errorMessage = error.message || 'Payment failed. Please try again.'
        alert(`Payment failed: ${errorMessage}${error.code ? ` (${error.code})` : ''}`)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded without redirect
        onSuccess()
      } else {
        // Payment might require redirect (3D Secure)
        // The redirect will happen automatically
        console.log('Payment requires redirect, status:', paymentIntent?.status)
      }
    } catch (error: any) {
      console.error('Payment error - Full details:', {
        message: error?.message,
        stack: error?.stack,
        error: error,
      })
      const errorMessage = error?.message || 'Payment error. Please try again.'
      alert(`Payment error: ${errorMessage}`)
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
  
  // Check URL params for paymentType
  const [paymentType, setPaymentType] = useState<'booking' | 'direct_payment'>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.get('paymentType') === 'direct_payment' ? 'direct_payment' : 'booking'
    }
    return 'booking'
  })
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5
  
  // Step 1: Date Selection (already have startDate, endDate)
  
  // Step 2: Protection/Insurance
  const [protectionType, setProtectionType] = useState<'basic' | 'decline'>('basic')
  
  // Step 3: Share Your Plans
  const [tripDescription, setTripDescription] = useState('')
  
  // Step 4: Trip Details
  const [pickupTime, setPickupTime] = useState('')
  const [dropoffTime, setDropoffTime] = useState('')
  const [destination, setDestination] = useState('')
  const [estimatedMiles, setEstimatedMiles] = useState('')
  const [calculatingDistance, setCalculatingDistance] = useState(false)
  const [outOfState, setOutOfState] = useState<'yes' | 'no' | ''>('')
  
  // Step 5: Review
  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [useSameCardForDeposit, setUseSameCardForDeposit] = useState(true)
  
  // Customer information
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  
  // Timer for booking completion
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds

  // Calculate total cost based on payment type
  const totalDays = startDate && endDate ? 
    Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0
  const bookingCost = vehicle ? vehicle.price_per_day * totalDays : 0
  const directPaymentCost = parseFloat(paymentAmount) || 0
  const subtotal = paymentType === 'booking' ? bookingCost : directPaymentCost
  const taxRate = 0.0863 // 8.63% NJ state tax
  const tax = subtotal * taxRate
  const totalCost = subtotal + tax - discountAmount
  
  // Security deposit
  const securityDepositAmount = vehicle?.security_deposit_enabled && vehicle?.security_deposit_amount 
    ? vehicle.security_deposit_amount 
    : 0
  
  // Progress percentage
  const progressPercentage = (currentStep / totalSteps) * 100
  
  // Timer countdown
  useEffect(() => {
    if (currentStep > 0 && currentStep < totalSteps && !bookingSuccess) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [currentStep, bookingSuccess])
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // Step navigation
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return startDate && endDate
      case 2:
        return protectionType !== ''
      case 3:
        return tripDescription.trim().length > 0
      case 4:
        return pickupTime && dropoffTime && destination && estimatedMiles && outOfState !== ''
      case 5:
        return termsAccepted
      default:
        return false
    }
  }

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true)
        setError('')
        
        // Fetch vehicle from Firebase API
        const response = await fetch(`/api/vehicles/${id}`, { cache: 'no-store' })
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Vehicle not found')
          } else {
            const errorData = await response.json().catch(() => ({}))
            setError(errorData.error || errorData.message || `Failed to load vehicle (${response.status})`)
          }
          return
        }
        
        const data = await response.json()
        
        if (data.vehicle) {
          // Ensure all required fields have defaults
          const vehicleData: Vehicle = {
            id: data.vehicle.id,
            make: data.vehicle.make || '',
            model: data.vehicle.model || '',
            year: data.vehicle.year || new Date().getFullYear(),
            price_per_day: data.vehicle.price_per_day || 0,
            available: data.vehicle.available !== false, // Default to true if undefined
            size: data.vehicle.size || 'medium',
            category: data.vehicle.category || 'Sedan',
            gigReady: data.vehicle.gigReady || false,
            image_url: data.vehicle.image_url || '/placeholder.svg',
            description: data.vehicle.description || '',
            mileage: data.vehicle.mileage || 0,
            transmission: data.vehicle.transmission || 'Automatic',
            location: data.vehicle.location || 'Newark, NJ',
            features: Array.isArray(data.vehicle.features) ? data.vehicle.features : [],
            insurance: data.vehicle.insurance || 'Full Coverage',
            maintenance: data.vehicle.maintenance || 'Regular Service',
            security_deposit_enabled: data.vehicle.security_deposit_enabled || false,
            security_deposit_amount: data.vehicle.security_deposit_amount || 250,
            security_deposit_days_before: data.vehicle.security_deposit_days_before || 1,
            security_deposit_release_days: data.vehicle.security_deposit_release_days || 7,
            cancellation_policy: data.vehicle.cancellation_policy || 'Flexible',
            origin_address: data.vehicle.origin_address || '3 Brewster Rd, Newark, NJ 07114',
          }
          
          setVehicle(vehicleData)
          console.log('Vehicle loaded:', vehicleData)
        } else {
          setError('Vehicle not found')
        }
      } catch (err: any) {
        console.error('Error fetching vehicle:', err)
        setError(err.message || 'Failed to load vehicle details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchVehicle()
    }
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
            connectedAccountId: "acct_1SK6dd1IscTKUkb9",
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
            connectedAccountId: "acct_1SK6dd1IscTKUkb9",
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
      <main className="relative z-40 flex items-start justify-center min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-100px)] md:min-h-[calc(100vh-120px)] px-3 sm:px-4 md:px-6 pt-20 pb-20">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Booking Form */}
          <div className="w-full">
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
                    onClick={() => {
                      setPaymentType('booking')
                      setCurrentStep(1)
                    }}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      paymentType === 'booking'
                        ? 'bg-white text-black'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Book Vehicle
                  </button>
                  <button
                    onClick={() => {
                      setPaymentType('direct_payment')
                      setCurrentStep(1)
                    }}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      paymentType === 'direct_payment'
                        ? 'bg-white text-black'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Make a Payment
                  </button>
                </div>
                
                {/* Progress Bar - Only show for booking flow */}
                {paymentType === 'booking' && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/60">{Math.round(progressPercentage)}% closer to your Car rental</span>
                      {timeRemaining > 0 && (
                        <span className="text-xs text-white/60">{formatTime(timeRemaining)} minutes to complete request</span>
                      )}
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className="bg-green-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Multi-Step Form for Booking */}
                  {paymentType === 'booking' ? (
                    <>
                      {/* Step 1: Date Selection */}
                      {currentStep === 1 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white mb-4">Select Dates</h3>
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              <Calendar className="w-4 h-4 inline mr-2" />
                              Pick Up Date *
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
                              Return Date *
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

                      {/* Step 2: Protection */}
                      {currentStep === 2 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white mb-4">Protection</h3>
                          <div className="space-y-3">
                            <label className="flex items-start p-4 bg-white/5 border border-white/20 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                              <input
                                type="radio"
                                name="protection"
                                value="basic"
                                checked={protectionType === 'basic'}
                                onChange={(e) => setProtectionType(e.target.value as 'basic' | 'decline')}
                                className="mt-1 mr-3"
                              />
                              <div className="flex-1">
                                <div className="font-semibold text-white mb-1">Basic Package</div>
                                <div className="text-sm text-white/70 space-y-1">
                                  <div>• State statutory minimum liability</div>
                                  <div>• Comprehensive and collision coverage up to $250,000</div>
                                  <div>• Up to $1,500 deductible for comprehensive and collision claims</div>
                                </div>
                              </div>
                            </label>
                            <label className="flex items-start p-4 bg-white/5 border border-white/20 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                              <input
                                type="radio"
                                name="protection"
                                value="decline"
                                checked={protectionType === 'decline'}
                                onChange={(e) => setProtectionType(e.target.value as 'basic' | 'decline')}
                                className="mt-1 mr-3"
                              />
                              <div className="flex-1">
                                <div className="font-semibold text-white">Decline Insurance</div>
                              </div>
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Share Your Plans */}
                      {currentStep === 3 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white mb-2">Share your plans</h3>
                          <p className="text-sm text-white/70 mb-4">Introduce yourself to Femi Leasing and describe your trip.</p>
                          <textarea
                            value={tripDescription}
                            onChange={(e) => setTripDescription(e.target.value)}
                            placeholder="Tell us about your trip..."
                            rows={6}
                            className="w-full px-4 py-3 text-white bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent placeholder-white/30"
                          />
                        </div>
                      )}

                      {/* Step 4: Trip Details */}
                      {currentStep === 4 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white mb-4">Questions from Femi Leasing</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-white/80 mb-2">Pick Up Time *</label>
                              <select
                                value={pickupTime}
                                onChange={(e) => setPickupTime(e.target.value)}
                                className="w-full px-4 py-3 text-white bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent"
                              >
                                <option value="">Select a pick-up time</option>
                                <option value="09:00">9:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="12:00">12:00 PM</option>
                                <option value="13:00">1:00 PM</option>
                                <option value="14:00">2:00 PM</option>
                                <option value="15:00">3:00 PM</option>
                                <option value="16:00">4:00 PM</option>
                                <option value="17:00">5:00 PM</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white/80 mb-2">Drop Off Time *</label>
                              <select
                                value={dropoffTime}
                                onChange={(e) => setDropoffTime(e.target.value)}
                                className="w-full px-4 py-3 text-white bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent"
                              >
                                <option value="">Select a drop-off time</option>
                                <option value="09:00">9:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="12:00">12:00 PM</option>
                                <option value="13:00">1:00 PM</option>
                                <option value="14:00">2:00 PM</option>
                                <option value="15:00">3:00 PM</option>
                                <option value="16:00">4:00 PM</option>
                                <option value="17:00">5:00 PM</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white/80 mb-2">Where are you going?</label>
                              <input
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                onBlur={async () => {
                                  if (destination && vehicle?.origin_address) {
                                    setCalculatingDistance(true)
                                    try {
                                      const response = await fetch('/api/calculate-distance', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          origin: vehicle.origin_address,
                                          destination: destination
                                        })
                                      })
                                      const data = await response.json()
                                      if (data.distance) {
                                        setEstimatedMiles(data.distance.toString())
                                      }
                                    } catch (error) {
                                      console.error('Error calculating distance:', error)
                                    } finally {
                                      setCalculatingDistance(false)
                                    }
                                  }
                                }}
                                placeholder="Enter destination address"
                                className="w-full px-4 py-3 text-white bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent placeholder-white/30"
                              />
                              {vehicle?.origin_address && (
                                <p className="text-xs text-white/60 mt-1">
                                  From: {vehicle.origin_address}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white/80 mb-2">
                                Estimated Miles
                                {calculatingDistance && (
                                  <span className="ml-2 text-xs text-white/60">(Calculating...)</span>
                                )}
                              </label>
                              <input
                                type="number"
                                value={estimatedMiles}
                                onChange={(e) => setEstimatedMiles(e.target.value)}
                                placeholder="Will be calculated automatically"
                                className="w-full px-4 py-3 text-white bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent placeholder-white/30"
                                readOnly={!!destination && !!vehicle?.origin_address}
                              />
                              {destination && vehicle?.origin_address && (
                                <p className="text-xs text-white/60 mt-1">
                                  Distance calculated from origin address
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white/80 mb-2">Do you plan on driving out of state?</label>
                              <div className="flex gap-4">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="outOfState"
                                    value="yes"
                                    checked={outOfState === 'yes'}
                                    onChange={(e) => setOutOfState(e.target.value as 'yes' | 'no')}
                                    className="mr-2"
                                  />
                                  <span className="text-white">Yes</span>
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="outOfState"
                                    value="no"
                                    checked={outOfState === 'no'}
                                    onChange={(e) => setOutOfState(e.target.value as 'yes' | 'no')}
                                    className="mr-2"
                                  />
                                  <span className="text-white">No</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 5: Review & Payment */}
                      {currentStep === 5 && (
                        <div className="space-y-6">
                          <div>
                            <p className="text-sm text-white/80 mb-4">
                              ${totalCost.toFixed(2)} will be charged upon owner approval to reserve.
                            </p>
                            
                            {/* Discount Code */}
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-white/80 mb-2">Discount Code</label>
                              <p className="text-xs text-white/60 mb-2">Enter your discount code if you have one.</p>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={discountCode}
                                  onChange={(e) => setDiscountCode(e.target.value)}
                                  placeholder="Discount Code"
                                  className="flex-1 px-4 py-2 text-white bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent placeholder-white/30"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Simple discount logic - can be enhanced
                                    if (discountCode.toLowerCase() === 'test10') {
                                      setDiscountAmount(subtotal * 0.1)
                                      setDiscountApplied(true)
                                    }
                                  }}
                                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                                >
                                  Apply
                                </button>
                              </div>
                              {discountApplied && (
                                <p className="text-xs text-green-400 mt-2">Discount applied!</p>
                              )}
                            </div>

                            {/* Cancellation Policy */}
                            <div className="mb-4 p-4 bg-white/5 border border-white/20 rounded-lg">
                              <h4 className="font-semibold text-white mb-2">
                                Cancellation Policy - {vehicle?.cancellation_policy || 'Flexible'}
                              </h4>
                              <p className="text-sm text-white/70">
                                {vehicle?.cancellation_policy === 'Flexible' 
                                  ? '100% refund of booking total up to 5 days before pickup, then renter is responsible for 25% of booking total for remaining days.'
                                  : 'Standard cancellation policy applies.'
                                }
                              </p>
                            </div>

                            {/* Security Deposit */}
                            {vehicle?.security_deposit_enabled && securityDepositAmount > 0 && (
                              <div className="mb-4 p-4 bg-white/5 border border-white/20 rounded-lg">
                                <h4 className="font-semibold text-white mb-2">Security Deposit</h4>
                                <p className="text-sm text-white/70 mb-3">
                                  ${securityDepositAmount.toFixed(2)} security deposit will be authorized {vehicle.security_deposit_days_before || 1} day{vehicle.security_deposit_days_before !== 1 ? 's' : ''} prior to departure and will be released {vehicle.security_deposit_release_days || 7} days after your reservation returns and has no issues.
                                </p>
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={useSameCardForDeposit}
                                    onChange={(e) => setUseSameCardForDeposit(e.target.checked)}
                                    className="mr-2"
                                  />
                                  <span className="text-sm text-white">Use the same card for the security deposit</span>
                                </label>
                              </div>
                            )}

                            {/* Terms of Service */}
                            <div className="mb-4">
                              <label className="flex items-start">
                                <input
                                  type="checkbox"
                                  checked={termsAccepted}
                                  onChange={(e) => setTermsAccepted(e.target.checked)}
                                  className="mt-1 mr-2"
                                />
                                <span className="text-sm text-white/80">
                                  I agree to the Terms of Service. You acknowledge that insurance coverage is contingent upon the vehicle being legally registered in accordance with state laws. If the vehicle is not legally registered, coverage may be void.
                                </span>
                              </label>
                            </div>

                            {/* Customer Information */}
                            <div className="space-y-4 pt-4 border-t border-white/20">
                              <h4 className="font-semibold text-white">Contact Information</h4>
                              <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">Full Name *</label>
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
                                <label className="block text-sm font-medium text-white/80 mb-2">Email Address *</label>
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
                                <label className="block text-sm font-medium text-white/80 mb-2">Phone Number *</label>
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
                          </div>
                        </div>
                      )}

                      {/* Navigation Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/20">
                        {currentStep > 1 && (
                          <button
                            onClick={prevStep}
                            className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                          >
                            ← Back
                          </button>
                        )}
                        <div className="flex-1" />
                        {timeRemaining > 0 && currentStep < totalSteps && (
                          <span className="text-xs text-white/60 mr-4">{formatTime(timeRemaining)} minutes to complete request</span>
                        )}
                        {currentStep < totalSteps ? (
                          <button
                            onClick={nextStep}
                            disabled={!canProceedToNextStep()}
                            className={`px-6 py-2 rounded-lg font-medium transition-all ${
                              canProceedToNextStep()
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-white/10 text-white/40 cursor-not-allowed'
                            }`}
                          >
                            Next
                          </button>
                        ) : (
                          <button
                            onClick={handleReserve}
                            disabled={!termsAccepted || !customerName.trim() || !customerEmail.trim() || !customerPhone.trim() || isLoadingPayment}
                            className={`px-6 py-2 rounded-lg font-medium transition-all ${
                              termsAccepted && customerName.trim() && customerEmail.trim() && customerPhone.trim() && !isLoadingPayment
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-white/10 text-white/40 cursor-not-allowed'
                            }`}
                          >
                            {isLoadingPayment ? 'Processing...' : 'Reserve Now'}
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    /* Direct Payment Form */
                    <>
                      {/* Vehicle Information Display */}
                      {vehicle && (
                        <div className="mb-6 bg-white/5 border border-white/20 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            {vehicle.image_url && (
                              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={vehicle.image_url}
                                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </h3>
                              <p className="text-sm text-white/70">{vehicle.location || 'Newark, NJ'}</p>
                              <p className="text-sm text-white/60 mt-1">
                                Daily Rate: ${vehicle.price_per_day}/day
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-white/80 mt-3">
                            Make a payment toward this vehicle rental
                          </p>
                        </div>
                      )}
                      
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
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
          
          {/* Right Column - Reservation Summary */}
          {vehicle && (
            <div className="w-full lg:sticky lg:top-20">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {paymentType === 'booking' ? 'Reservation Request' : 'Payment Request'}
                </h3>
                
                {/* Vehicle Image */}
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <img
                    src={vehicle.image_url || '/placeholder.svg'}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Vehicle Name */}
                <h4 className="text-xl font-bold text-white mb-4">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h4>
                
                {/* Dates - Only show for booking */}
                {paymentType === 'booking' && startDate && endDate && (
                  <div className="mb-4 text-white/80">
                    <div className="flex items-center gap-2">
                      <span>Pick up</span>
                      <span className="font-semibold">{new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span>Return</span>
                      <span className="font-semibold">{new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                )}
                
                {/* Payment Info for Direct Payment */}
                {paymentType === 'direct_payment' && (
                  <div className="mb-4 text-white/80">
                    <p className="text-sm">Making a payment toward this vehicle rental</p>
                    <p className="text-xs text-white/60 mt-1">Daily Rate: ${vehicle.price_per_day}/day</p>
                  </div>
                )}
                
                {/* Pricing Breakdown */}
                {((paymentType === 'booking' && startDate && endDate && totalDays > 0) || (paymentType === 'direct_payment' && paymentAmount && totalCost > 0)) && (
                  <div className="space-y-2 text-sm border-t border-white/20 pt-4">
                    {paymentType === 'booking' ? (
                      <>
                        <div className="flex justify-between text-white/80">
                          <span>${vehicle.price_per_day.toFixed(2)} x {totalDays} night{totalDays !== 1 ? 's' : ''}</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white/80">
                          <span>New Jersey State</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                        {discountApplied && discountAmount > 0 && (
                          <div className="flex justify-between text-green-400">
                            <span>Discount</span>
                            <span>-${discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-white pt-2 border-t border-white/20">
                          <span>Total</span>
                          <span>${totalCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white/80">
                          <span>Due to Reserve</span>
                          <span>${totalCost.toFixed(2)}</span>
                        </div>
                        {vehicle?.security_deposit_enabled && securityDepositAmount > 0 && (
                          <div className="flex justify-between text-white/80 pt-2">
                            <span className="flex items-center gap-1">
                              Refundable Security Deposit
                              <span className="text-xs">ℹ️</span>
                            </span>
                            <span>${securityDepositAmount.toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-white/80">
                          <span>Payment Amount</span>
                          <span>${parseFloat(paymentAmount || '0').toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white/80">
                          <span>Tax</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-white pt-2 border-t border-white/20">
                          <span>Total</span>
                          <span>${totalCost.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
