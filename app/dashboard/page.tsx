"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = "/login"
      } else {
        setUser(user)
        setLoading(false)
      }
    }
    checkSession()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-semibold text-gray-700">Loading your dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome, {user.email}</h1>
        <div className="space-y-6">
          <div className="bg-gray-100 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Your Bookings</h2>
            <p className="text-gray-600">(Placeholder) You have no bookings yet.</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Profile</h2>
            <p className="text-gray-600">(Placeholder) Profile management coming soon.</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Saved Vehicles</h2>
            <p className="text-gray-600">(Placeholder) You have no saved vehicles yet.</p>
          </div>
        </div>
      </div>
    </div>
  )
} 