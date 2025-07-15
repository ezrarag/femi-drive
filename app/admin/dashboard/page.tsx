"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !user.email || !user.email.endsWith("@femileasing.com")) {
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
        </ul>
      </div>
    </div>
  )
} 