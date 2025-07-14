"use client"

import Link from "next/link"

export default function AdminDashboard() {
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
          {/* Optional future features */}
          {/* <li>
            <Link href="/admin/users" className="block w-full bg-gray-200 text-gray-700 py-3 rounded-lg text-center hover:bg-gray-300 transition">
              👤 Manage Users
            </Link>
          </li> */}
        </ul>
      </div>
    </div>
  )
} 