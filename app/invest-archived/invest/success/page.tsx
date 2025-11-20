"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle, ArrowLeft } from "lucide-react"
import NavBar from "@/components/NavBar"
import Link from "next/link"

export default function InvestSuccessPage() {
  const [amount, setAmount] = useState<string>('')

  useEffect(() => {
    // Get amount from URL params or localStorage if available
    const urlParams = new URLSearchParams(window.location.search)
    const amountParam = urlParams.get('amount')
    if (amountParam) {
      setAmount(amountParam)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Investment Successful!</h1>
          <p className="text-gray-600 mb-6">
            {amount ? `Thank you for investing $${parseFloat(amount).toLocaleString()} in Femi Leasing.` : 'Thank you for your investment in Femi Leasing.'}
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              Your investment has been processed successfully. You will receive a confirmation email shortly with all the details.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/invest">
              <motion.button
                className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-4 h-4" />
                Make Another Investment
              </motion.button>
            </Link>
            
            <Link href="/dashboard">
              <motion.button
                className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Go to Dashboard
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
