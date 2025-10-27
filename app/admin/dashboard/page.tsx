"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { AuthGuard } from "@/lib/auth-guard"
import { useAuth } from "@/hooks/useAuth"

function AdminDashboardContent() {
  const { user, logout } = useAuth()
  
  const handleLogout = async () => {
    await logout()
    window.location.href = "/admin/login"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-4 sm:p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-center">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-sm text-gray-600">
                {user.email}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-300 rounded hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Main Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
          <Link href="/admin/vehicles" className="block w-full bg-blue-600 text-white py-4 sm:py-6 rounded-lg text-center hover:bg-blue-700 transition text-sm sm:text-base">
            🚗 Vehicle Management
            <div className="text-xs opacity-80 mt-1">View & Edit Fleet</div>
          </Link>
          
          <Link href="/admin/add-vehicle" className="block w-full bg-green-600 text-white py-4 sm:py-6 rounded-lg text-center hover:bg-green-700 transition text-sm sm:text-base">
            ➕ Add New Vehicle
            <div className="text-xs opacity-80 mt-1">Expand Fleet</div>
          </Link>
          
          <Link href="/admin/bookings" className="block w-full bg-red-600 text-white py-4 sm:py-6 rounded-lg text-center hover:bg-red-700 transition text-sm sm:text-base">
            📅 Booking Management
            <div className="text-xs opacity-80 mt-1">Approve & Manage</div>
          </Link>
          
          <Link href="/admin/users" className="block w-full bg-purple-600 text-white py-4 sm:py-6 rounded-lg text-center hover:bg-purple-700 transition text-sm sm:text-base">
            👥 User Management
            <div className="text-xs opacity-80 mt-1">Manage Accounts</div>
          </Link>
          
          <Link href="/admin/analytics" className="block w-full bg-indigo-600 text-white py-4 sm:py-6 rounded-lg text-center hover:bg-indigo-700 transition text-sm sm:text-base">
            📊 Analytics Dashboard
            <div className="text-xs opacity-80 mt-1">Business Metrics</div>
          </Link>
          
          <Link href="/admin/voice-settings" className="block w-full bg-orange-600 text-white py-4 sm:py-6 rounded-lg text-center hover:bg-orange-700 transition text-sm sm:text-base">
            🎤 Voice Settings
            <div className="text-xs opacity-80 mt-1">AI Configuration</div>
          </Link>
          
          <Link href="/admin/finance" className="block w-full bg-teal-600 text-white py-4 sm:py-6 rounded-lg text-center hover:bg-teal-700 transition text-sm sm:text-base">
            💰 Finance & Payouts
            <div className="text-xs opacity-80 mt-1">Balances & Transfers</div>
          </Link>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-center">
            <div className="text-lg sm:text-xl font-bold text-gray-900">24</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Vehicles</div>
          </div>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-center">
            <div className="text-lg sm:text-xl font-bold text-gray-900">156</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Bookings</div>
          </div>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-center">
            <div className="text-lg sm:text-xl font-bold text-gray-900">89</div>
            <div className="text-xs sm:text-sm text-gray-600">Active Users</div>
          </div>
        </div>
        
        {/* Sales Overview Section */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <h2 className="text-lg sm:text-xl font-semibold text-purple-900 mb-2 sm:mb-3">Sales & Revenue Overview</h2>
          <p className="text-xs sm:text-sm text-purple-700 mb-3 sm:mb-4">
            Click the button above to view detailed sales reports, customer analytics, and payout information on readyaimgo.biz
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="bg-white p-2 sm:p-3 rounded border">
              <div className="text-purple-600 font-medium">Sales Dashboard</div>
              <div className="text-gray-600">Real-time revenue tracking</div>
            </div>
            <div className="bg-white p-2 sm:p-3 rounded border">
              <div className="text-purple-600 font-medium">Payout Reports</div>
              <div className="text-gray-600">Commission & earnings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AuthGuard allowedEmails={['finance@readyaimgo.biz', 'ezra@readyaimgo.biz', 'femileasing@gmail.com']}>
      <AdminDashboardContent />
    </AuthGuard>
  )
} 