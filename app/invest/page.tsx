"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, DollarSign, TrendingUp, Shield, Users, CreditCard, Mail, User } from "lucide-react"
import NavBar from "@/components/NavBar"
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function PaymentForm({ amount, onSuccess }: { amount: number, onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) return

    setIsProcessing(true)

    try {
      // Create payment intent
      const response = await fetch('/api/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, email, name }),
      })

      const { clientSecret } = await response.json()

      // Confirm payment
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/invest?success=true`,
        },
      })

      if (error) {
        console.error('Payment failed:', error)
      } else {
        onSuccess()
      }
    } catch (error) {
      console.error('Payment error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
            required
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
            required
          />
        </div>
      </div>
      
      <div className="bg-white/5 border border-white/20 rounded-lg p-4">
        <PaymentElement />
      </div>
      
      <motion.button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-4 px-6 bg-white text-black rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isProcessing ? 'Processing...' : `Invest $${amount.toLocaleString()}`}
      </motion.button>
    </form>
  )
}

export default function InvestPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedAmount, setSelectedAmount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const investmentOptions = [
    {
      title: "PREMIUM",
      subtitle: "INVESTMENT",
      label: "High Returns",
      description: "Invest in our premium vehicle fleet and earn competitive returns through our proven business model. Your investment helps us expand our operations.",
      cta: "Invest Now",
      info: "03 - 03 12-15% Annual Returns",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "FLEXIBLE",
      subtitle: "FINANCING",
      label: "Secure Investment",
      description: "Our flexible investment options allow you to choose your preferred terms. From short-term to long-term investments, we have options for every investor.",
      cta: "Learn More",
      info: "02 - 03 Flexible Terms",
      icon: Shield,
      color: "from-blue-500 to-cyan-600"
    },
    {
      title: "GROWTH",
      subtitle: "OPPORTUNITY",
      label: "Community Driven",
      description: "Join our growing community of investors who believe in the future of sustainable transportation and gig economy growth.",
      cta: "Join Community",
      info: "01 - 03 Community Benefits",
      icon: Users,
      color: "from-purple-500 to-violet-600"
    },
  ]

  const investmentAmounts = [
    { amount: 1000, label: "$1,000", popular: false },
    { amount: 5000, label: "$5,000", popular: true },
    { amount: 10000, label: "$10,000", popular: false },
    { amount: 25000, label: "$25,000", popular: false },
    { amount: 50000, label: "$50,000", popular: false },
    { amount: 100000, label: "$100,000", popular: false },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % investmentOptions.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + investmentOptions.length) % investmentOptions.length)
  }

  const handleInvest = async () => {
    if (selectedAmount === 0) return
    setShowPaymentForm(true)
  }

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true)
    setShowPaymentForm(false)
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
        <div className={`absolute inset-0 bg-gradient-to-br ${investmentOptions[currentSlide].color} opacity-15`} />
        <div className="absolute inset-0 bg-black/60" />
      </div>


      {/* Main Content */}
      <main className="relative z-40 flex items-center justify-center min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-100px)] md:min-h-[calc(100vh-120px)] px-3 sm:px-4 md:px-6 pt-20">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="text-left order-2 xl:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="label-text mb-2 sm:mb-3 md:mb-4 opacity-80 text-xs sm:text-sm flex items-center gap-2">
                  {(() => {
                    const IconComponent = investmentOptions[currentSlide].icon
                    return <IconComponent className="w-4 h-4" />
                  })()}
                  {investmentOptions[currentSlide].label}
                </div>
                <h1 className="display-heading text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl 2xl:text-8xl leading-none mb-3 sm:mb-4 md:mb-6 lg:mb-8">
                  {investmentOptions[currentSlide].title}
                </h1>
                <div className="body-text leading-relaxed max-w-sm sm:max-w-md mb-3 sm:mb-4 md:mb-6 lg:mb-8 text-xs sm:text-sm md:text-base">
                  {investmentOptions[currentSlide].description}
                </div>
                <div className="label-text underline hover:no-underline transition-all text-xs sm:text-sm md:text-base min-h-[44px] inline-flex items-center cursor-pointer">
                  Learn More
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Center Investment Amount Selection or Payment Form */}
          <div className="flex flex-col items-center order-1 xl:order-2 mb-4 sm:mb-6 lg:mb-0">
            <AnimatePresence mode="wait">
              {paymentSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.6 }}
                  className="w-full max-w-md text-center"
                >
                  <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-8">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-2xl font-bold mb-2 text-green-400">Investment Successful!</h3>
                    <p className="text-white/80 mb-4">
                      Thank you for investing ${selectedAmount.toLocaleString()} in Femi Leasing.
                    </p>
                    <p className="text-sm text-white/60">
                      You will receive a confirmation email shortly.
                    </p>
                  </div>
                </motion.div>
              ) : showPaymentForm ? (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.6 }}
                  className="w-full max-w-md"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Complete Investment</h3>
                    <button
                      onClick={() => setShowPaymentForm(false)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="bg-white/5 border border-white/20 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Investment Amount:</span>
                      <span className="text-xl font-bold">${selectedAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  <Elements stripe={stripePromise}>
                    <PaymentForm amount={selectedAmount} onSuccess={handlePaymentSuccess} />
                  </Elements>
                </motion.div>
              ) : (
                <motion.div
                  key="selection"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-full max-w-md"
                >
                  <h3 className="text-center text-lg font-semibold mb-6">Choose Investment Amount</h3>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {investmentAmounts.map((option) => (
                      <motion.button
                        key={option.amount}
                        onClick={() => setSelectedAmount(option.amount)}
                        className={`relative p-4 rounded-lg border transition-all ${
                          selectedAmount === option.amount
                            ? 'bg-white/20 border-white/40 text-white'
                            : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {option.popular && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                            Popular
                          </div>
                        )}
                        <div className="text-center">
                          <div className="text-lg font-bold">{option.label}</div>
                          <div className="text-xs opacity-70">Minimum</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  
                  <motion.button
                    onClick={handleInvest}
                    disabled={selectedAmount === 0}
                    className={`w-full py-4 px-6 rounded-lg font-semibold transition-all ${
                      selectedAmount === 0
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-white/90'
                    }`}
                    whileHover={selectedAmount !== 0 ? { scale: 1.02 } : {}}
                    whileTap={selectedAmount !== 0 ? { scale: 0.98 } : {}}
                  >
                    {selectedAmount === 0 ? 'Select Amount' : `Invest $${selectedAmount.toLocaleString()}`}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Content */}
          <div className="text-right order-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="display-heading text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl 2xl:text-8xl leading-none mb-3 sm:mb-4 md:mb-6 lg:mb-8">
                  {investmentOptions[currentSlide].subtitle}
                </h2>
                <div className="label-text mb-2 sm:mb-3 md:mb-4 opacity-80 text-xs sm:text-sm md:text-base">
                  {investmentOptions[currentSlide].info}
                </div>

                {/* Navigation Arrows */}
                <div className="flex justify-end gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4 md:mt-6 lg:mt-8">
                  <motion.button
                    onClick={prevSlide}
                    className="p-2 sm:p-2.5 md:p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  </motion.button>
                  <motion.button
                    onClick={nextSlide}
                    className="p-2 sm:p-2.5 md:p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer with Glass Translucent Menu */}
      <footer className="relative z-40 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-0">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 label-text text-xs sm:text-sm">
            <span>©2025 Femi Leasing</span>
            <span className="hidden sm:inline">·</span>
            <span className="hover:underline min-h-[44px] flex items-center cursor-pointer">
              Privacy
            </span>
          </div>

          {/* Progress Bar */}
          <div className="hidden lg:block flex-1 max-w-md mx-4 lg:mx-8">
            <div className="h-px bg-white/20 relative">
              <motion.div
                className="h-px bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${((currentSlide + 1) / investmentOptions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Glass Translucent Menu */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm font-medium">INVESTMENT OPTIONS</span>
            <div className="w-4 h-4 flex flex-col justify-center">
              <div className="w-full h-0.5 bg-white mb-1"></div>
              <div className="w-full h-0.5 bg-white mb-1"></div>
              <div className="w-full h-0.5 bg-white"></div>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}
