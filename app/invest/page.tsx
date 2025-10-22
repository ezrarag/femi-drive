"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DollarSign, CreditCard } from "lucide-react"
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) return

    setIsProcessing(true)

    try {
      // Create payment intent
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount,
          description: `Investment in Femi Leasing`
        }),
      })

      const { clientSecret } = await response.json()

      if (!clientSecret) {
        throw new Error('No client secret received')
      }

      // Confirm payment
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/invest/success`,
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
        {isProcessing ? 'Processing...' : `Pay $${amount.toLocaleString()}`}
      </motion.button>
    </form>
  )
}

export default function InvestPage() {
  const [amount, setAmount] = useState('')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const handleContinue = () => {
    const numAmount = parseFloat(amount)
    if (numAmount > 0) {
      setShowPaymentForm(true)
    }
  }

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true)
    setShowPaymentForm(false)
  }

  const resetForm = () => {
    setAmount('')
    setShowPaymentForm(false)
    setPaymentSuccess(false)
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
            {paymentSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-8 text-center"
              >
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold mb-2 text-green-400">Investment Successful!</h3>
                <p className="text-white/80 mb-6">
                  Thank you for investing ${parseFloat(amount).toLocaleString()} in Femi Leasing.
                </p>
                <button
                  onClick={resetForm}
                  className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/20"
                >
                  Make Another Investment
                </button>
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
                  <h3 className="text-xl font-semibold text-white">Complete Payment</h3>
                  <button
                    onClick={() => setShowPaymentForm(false)}
                    className="text-white/60 hover:text-white transition-colors text-xl"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="bg-white/5 border border-white/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Investment Amount:</span>
                    <span className="text-2xl font-bold text-white">${parseFloat(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm text-white/60">
                    <span>Platform Fee (0.5%):</span>
                    <span>${(parseFloat(amount) * 0.005).toFixed(2)}</span>
                  </div>
                </div>
                
                <Elements stripe={stripePromise}>
                  <PaymentForm amount={parseFloat(amount)} onSuccess={handlePaymentSuccess} />
                </Elements>
              </motion.div>
            ) : (
              <motion.div
                key="input"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-8"
              >
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">Invest in Femi Leasing</h1>
                  <p className="text-white/80">Enter your investment amount</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">
                      Enter investment amount (USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/50" />
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="w-full pl-12 pr-4 py-4 text-3xl font-bold text-white bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent placeholder-white/30"
                        min="1"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {amount && parseFloat(amount) > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-white/5 border border-white/20 rounded-lg p-4"
                    >
                      <div className="flex justify-between text-sm text-white/70 mb-1">
                        <span>Investment Amount:</span>
                        <span>${parseFloat(amount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-white/70 mb-1">
                        <span>Platform Fee (0.5%):</span>
                        <span>${(parseFloat(amount) * 0.005).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-white/20 pt-2 mt-2">
                        <div className="flex justify-between font-semibold text-white">
                          <span>Total:</span>
                          <span>${parseFloat(amount).toLocaleString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <motion.button
                    onClick={handleContinue}
                    disabled={!amount || parseFloat(amount) <= 0}
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                      amount && parseFloat(amount) > 0
                        ? 'bg-white text-black hover:bg-white/90'
                        : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/20'
                    }`}
                    whileHover={amount && parseFloat(amount) > 0 ? { scale: 1.02 } : {}}
                    whileTap={amount && parseFloat(amount) > 0 ? { scale: 0.98 } : {}}
                  >
                    Continue
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