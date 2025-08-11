"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      // TEMPORARY: Allow any email for development - REMOVE BEFORE PRODUCTION
      // if (!user || !user.email || !user.email.endsWith("@femileasing.com")) {
      if (!user || !user.email) {
        window.location.href = "/admin/login"
      } else {
        setLoading(false)
      }
    }
    checkAdmin()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-semibold text-gray-700">Checking admin access...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
          ⚠️ Development Mode: Email restrictions temporarily disabled
        </div>
        <ul className="space-y-4">
          <li>
            <Link href="/admin/vehicles" className="block w-full bg-blue-600 text-white py-3 rounded-lg text-center hover:bg-blue-700 transition">
              🚗 View & Edit Vehicles
            </Link>
          </li>
          <li>
            <Link href="/admin/add-vehicle" className="block w-full bg-green-600 text-white py-3 rounded-lg text-center hover:bg-green-700 transition">
              ➕ Add New Vehicle
            </Link>
          </li>
          <li>
            <button 
              onClick={() => window.open('https://readyaimgo.biz', '_blank')}
              className="block w-full bg-purple-600 text-white py-3 rounded-lg text-center hover:bg-purple-700 transition"
            >
              💰 View Sales & Payouts
            </button>
          </li>
        </ul>
        
        {/* Sales Overview Section */}
        <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <h2 className="text-xl font-semibold text-purple-900 mb-3">Sales & Revenue Overview</h2>
          <p className="text-sm text-purple-700 mb-4">
            Click the button above to view detailed sales reports, customer analytics, and payout information on readyaimgo.biz
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-3 rounded border">
              <div className="text-purple-600 font-medium">Sales Dashboard</div>
              <div className="text-gray-600">Real-time revenue tracking</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="text-purple-600 font-medium">Payout Reports</div>
              <div className="text-gray-600">Commission & earnings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 