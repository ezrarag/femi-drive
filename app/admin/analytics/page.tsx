"use client"

import { useEffect, useState } from "react"
import { supabase, checkAdminRole } from "@/lib/supabase"
import Link from "next/link"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Car, 
  DollarSign, 
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"

interface AnalyticsData {
  totalBookings: number
  totalRevenue: number
  totalUsers: number
  totalVehicles: number
  monthlyBookings: { month: string; count: number }[]
  vehicleUtilization: { vehicle: string; utilization: number }[]
  revenueTrend: { month: string; revenue: number }[]
  popularVehicles: { vehicle: string; bookings: number }[]
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [authLoading, setAuthLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = "/admin/login"
        return
      }

      const isAdmin = await checkAdminRole(user.id)
      if (!isAdmin) {
        window.location.href = "/admin/login"
        return
      }

      setAuthLoading(false)
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (!authLoading) {
      loadAnalytics()
    }
  }, [authLoading, timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      // Simulate API call - replace with actual Supabase queries
      const mockData: AnalyticsData = {
        totalBookings: 156,
        totalRevenue: 23450,
        totalUsers: 89,
        totalVehicles: 24,
        monthlyBookings: [
          { month: "Jan", count: 12 },
          { month: "Feb", count: 18 },
          { month: "Mar", count: 22 },
          { month: "Apr", count: 28 },
          { month: "May", count: 35 },
          { month: "Jun", count: 41 }
        ],
        vehicleUtilization: [
          { vehicle: "Tesla Model 3", utilization: 85 },
          { vehicle: "Toyota Camry", utilization: 72 },
          { vehicle: "Honda CR-V", utilization: 68 },
          { vehicle: "Ford Escape", utilization: 61 }
        ],
        revenueTrend: [
          { month: "Jan", revenue: 1800 },
          { month: "Feb", revenue: 2700 },
          { month: "Mar", revenue: 3300 },
          { month: "Apr", revenue: 4200 },
          { month: "May", revenue: 5100 },
          { month: "Jun", revenue: 6300 }
        ],
        popularVehicles: [
          { vehicle: "Tesla Model 3", bookings: 45 },
          { vehicle: "Toyota Camry", bookings: 38 },
          { vehicle: "Honda CR-V", bookings: 32 },
          { vehicle: "Ford Escape", bookings: 28 }
        ]
      }
      
      setAnalytics(mockData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }

  const getGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 100
    return ((current - previous) / previous) * 100
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-semibold text-gray-700">Checking admin access...</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-semibold text-gray-700">Loading analytics...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-semibold text-gray-700">No analytics data available</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Track performance and business metrics</p>
          </div>
          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Link href="/admin/dashboard" className="px-3 sm:px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">Dashboard</Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalBookings}</p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+12% from last month</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+18% from last month</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+8% from last month</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Car className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Fleet Size</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalVehicles}</p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+2 new vehicles</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Bookings Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Bookings</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-end justify-between">
              {analytics.monthlyBookings.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-blue-500 rounded-t w-8 sm:w-12 transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${(item.count / Math.max(...analytics.monthlyBookings.map(b => b.count))) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">{item.month}</span>
                  <span className="text-xs font-medium text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-end justify-between">
              {analytics.revenueTrend.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-green-500 rounded-t w-8 sm:w-12 transition-all duration-300 hover:bg-green-600"
                    style={{ height: `${(item.revenue / Math.max(...analytics.revenueTrend.map(r => r.revenue))) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">{item.month}</span>
                  <span className="text-xs font-medium text-gray-900">{formatCurrency(item.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vehicle Utilization & Popular Vehicles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Utilization */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Vehicle Utilization</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {analytics.vehicleUtilization.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate">{item.vehicle}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.utilization}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">{item.utilization}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Vehicles */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Popular Vehicles</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {analytics.popularVehicles.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate">{item.vehicle}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(item.bookings / Math.max(...analytics.popularVehicles.map(v => v.bookings))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">{item.bookings}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
