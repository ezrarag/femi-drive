"use client"

import { useEffect, useState } from "react"
import { supabase, checkAdminRole } from "@/lib/supabase"
import Link from "next/link"
import { 
  Calendar, 
  Car, 
  User, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Edit,
  Filter,
  Search
} from "lucide-react"

interface Booking {
  id: string
  user_id: string
  vehicle_id: string
  start_date: string
  end_date: string
  total_price: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'
  created_at: string
  user?: {
    name: string
    email: string
  }
  vehicle?: {
    make: string
    model: string
    year: number
  }
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [authLoading, setAuthLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

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
      loadBookings()
    }
  }, [authLoading])

  const loadBookings = async () => {
    try {
      setLoading(true)
      // Simulate API call - replace with actual Supabase queries
      const mockBookings: Booking[] = [
        {
          id: "1",
          user_id: "user1",
          vehicle_id: "vehicle1",
          start_date: "2024-01-15",
          end_date: "2024-01-17",
          total_price: 150,
          status: "pending",
          created_at: "2024-01-10T10:00:00Z",
          user: { name: "John Doe", email: "john@example.com" },
          vehicle: { make: "Tesla", model: "Model 3", year: 2023 }
        },
        {
          id: "2",
          user_id: "user2",
          vehicle_id: "vehicle2",
          start_date: "2024-01-20",
          end_date: "2024-01-22",
          total_price: 200,
          status: "approved",
          created_at: "2024-01-12T14:30:00Z",
          user: { name: "Jane Smith", email: "jane@example.com" },
          vehicle: { make: "Toyota", model: "Camry", year: 2022 }
        },
        {
          id: "3",
          user_id: "user3",
          vehicle_id: "vehicle3",
          start_date: "2024-01-18",
          end_date: "2024-01-19",
          total_price: 100,
          status: "completed",
          created_at: "2024-01-08T09:15:00Z",
          user: { name: "Mike Johnson", email: "mike@example.com" },
          vehicle: { make: "Honda", model: "CR-V", year: 2021 }
        }
      ]
      
      setBookings(mockBookings)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      // Simulate API call - replace with actual Supabase update
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      )
      setBookings(updatedBookings)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update booking")
    }
  }

  const getStatusBadge = (status: Booking['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600'
      case 'approved': return 'text-green-600'
      case 'rejected': return 'text-red-600'
      case 'cancelled': return 'text-gray-600'
      case 'completed': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = selectedStatus === "all" || booking.status === selectedStatus
    const matchesSearch = searchTerm === "" || 
      booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  const getStats = () => {
    const total = bookings.length
    const pending = bookings.filter(b => b.status === 'pending').length
    const approved = bookings.filter(b => b.status === 'approved').length
    const completed = bookings.filter(b => b.status === 'completed').length
    const revenue = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.total_price, 0)

    return { total, pending, approved, completed, revenue }
  }

  const stats = getStats()

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
        <div className="text-lg font-semibold text-gray-700">Loading bookings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Booking Management</h1>
            <p className="text-gray-600 mt-2">Manage and approve vehicle bookings</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/dashboard" className="px-3 sm:px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">Dashboard</Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Car className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.revenue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer name or vehicle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{booking.user?.name}</div>
                          <div className="text-sm text-gray-500">{booking.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.vehicle?.year} {booking.vehicle?.make} {booking.vehicle?.model}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${booking.total_price}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {booking.status === 'approved' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                            className="text-blue-600 hover:text-blue-900"
                            title="Mark Complete"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No bookings found matching your criteria</p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                    <p className="text-sm text-gray-900">{selectedBooking.user?.name}</p>
                    <p className="text-sm text-gray-500">{selectedBooking.user?.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Vehicle</h3>
                    <p className="text-sm text-gray-900">
                      {selectedBooking.vehicle?.year} {selectedBooking.vehicle?.make} {selectedBooking.vehicle?.model}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                    <p className="text-sm text-gray-900">{new Date(selectedBooking.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                    <p className="text-sm text-gray-900">{new Date(selectedBooking.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total Price</h3>
                    <p className="text-lg font-bold text-gray-900">${selectedBooking.total_price}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p className="text-sm text-gray-900">{new Date(selectedBooking.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
