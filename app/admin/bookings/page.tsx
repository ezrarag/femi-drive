"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/lib/auth-guard"
import { useAuth } from "@/hooks/useAuth"
import { AUTHORIZED_ADMIN_EMAILS } from "@/lib/admin-authorized-emails"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminHeader from "@/components/admin/AdminHeader"
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
  Search,
  Download,
  Upload,
  Plus,
  X
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

function AdminBookingsContent() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showAddBookingModal, setShowAddBookingModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [newBooking, setNewBooking] = useState({
    vehicle_id: '',
    start_date: '',
    end_date: '',
    total_price: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    status: 'pending' as Booking['status'],
    notes: '',
  })

  useEffect(() => {
    if (user) {
      loadBookings()
      loadVehicles()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadVehicles = async () => {
    if (!user) return
    try {
      const idToken = await user.getIdToken()
      const response = await fetch('/api/admin/vehicles', {
        headers: { 'Authorization': `Bearer ${idToken}` },
      })
      if (response.ok) {
        const data = await response.json()
        setVehicles(data.vehicles || [])
      }
    } catch (err) {
      console.error('Error loading vehicles:', err)
    }
  }

  const handleCreateBooking = async () => {
    if (!user) return
    
    try {
      const idToken = await user.getIdToken()
      const response = await fetch('/api/admin/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(newBooking),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create booking')
      }

      // Reset form and reload bookings
      setNewBooking({
        vehicle_id: '',
        start_date: '',
        end_date: '',
        total_price: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        status: 'pending',
        notes: '',
      })
      setShowAddBookingModal(false)
      loadBookings()
      alert('Booking created successfully!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create booking')
    }
  }

  const handleImportBookings = async (file: File) => {
    if (!user) return
    
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim())
      
      // Expected headers: vehicle_id, start_date, end_date, total_price, customer_name, customer_email, customer_phone, status
      const bookings = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        const booking: any = {}
        headers.forEach((header, index) => {
          booking[header] = values[index] || ''
        })
        return booking
      })

      const idToken = await user.getIdToken()
      let successCount = 0
      let errorCount = 0

      for (const booking of bookings) {
        try {
          const response = await fetch('/api/admin/bookings/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify(booking),
          })
          if (response.ok) {
            successCount++
          } else {
            errorCount++
          }
        } catch (err) {
          errorCount++
        }
      }

      setShowImportModal(false)
      loadBookings()
      alert(`Import complete: ${successCount} successful, ${errorCount} failed`)
    } catch (err) {
      alert('Failed to import bookings. Please check CSV format.')
    }
  }

  const loadBookings = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const idToken = await user.getIdToken()
      const response = await fetch('/api/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }
      
      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, newStatus: Booking['status']) => {
    if (!user) return
    
    try {
      const idToken = await user.getIdToken()
      const response = await fetch('/api/admin/bookings/update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ bookingId, status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update booking status')
      }

      // Reload bookings to get updated data
      loadBookings()
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-lg font-semibold text-gray-700">Loading bookings...</div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <AdminSidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 pt-16 lg:pt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Bookings</h1>
            <p className="text-gray-600">Manage and approve vehicle bookings</p>
          </div>

          {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6">
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

        {/* Filters and Export */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
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
            <div className="flex gap-2 flex-wrap w-full sm:w-auto">
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
              <button
                onClick={async () => {
                  if (!user) return
                  try {
                    const idToken = await user.getIdToken()
                    const response = await fetch('/api/admin/bookings/export', {
                      headers: {
                        'Authorization': `Bearer ${idToken}`,
                      },
                    })
                    if (response.ok) {
                      const blob = await response.blob()
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `bookings-export-${new Date().toISOString().split('T')[0]}.csv`
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                    }
                  } catch (err) {
                    console.error('Export failed:', err)
                    alert('Failed to export bookings')
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => {
                  alert('QuickBooks import coming soon! This will allow you to import transactions from QuickBooks.')
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Upload className="w-4 h-4" />
                Import QuickBooks
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden -mx-4 sm:mx-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 hidden sm:table-header-group">
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
                  <>
                    {/* Mobile Card View */}
                    <tr key={`mobile-${booking.id}`} className="sm:hidden hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{booking.user?.name}</div>
                              <div className="text-xs text-gray-500 truncate">{booking.user?.email}</div>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="border-t pt-3 space-y-2">
                            <div>
                              <span className="text-xs text-gray-500">Vehicle:</span>
                              <div className="text-sm font-medium text-gray-900">
                                {booking.vehicle?.year} {booking.vehicle?.make} {booking.vehicle?.model}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Dates:</span>
                              <div className="text-sm text-gray-900">
                                {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <div>
                                <span className="text-xs text-gray-500">Total:</span>
                                <div className="text-lg font-bold text-gray-900">${booking.total_price}</div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setSelectedBooking(booking)}
                                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {booking.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => updateBookingStatus(booking.id, 'approved')}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                                      title="Approve"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => updateBookingStatus(booking.id, 'rejected')}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                                      title="Reject"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                {booking.status === 'approved' && (
                                  <button
                                    onClick={() => updateBookingStatus(booking.id, 'completed')}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                    title="Mark Complete"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                    {/* Desktop Table View */}
                    <tr key={`desktop-${booking.id}`} className="hidden sm:table-row hover:bg-gray-50">
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
                  </>
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

      {/* Add Booking Modal */}
      {showAddBookingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddBookingModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Booking</h2>
              <button onClick={() => setShowAddBookingModal(false)} className="text-gray-500 hover:text-black">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Vehicle</label>
                <select
                  value={newBooking.vehicle_id}
                  onChange={(e) => setNewBooking({ ...newBooking, vehicle_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  required
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newBooking.start_date}
                    onChange={(e) => setNewBooking({ ...newBooking, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newBooking.end_date}
                    onChange={(e) => setNewBooking({ ...newBooking, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Total Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={newBooking.total_price}
                  onChange={(e) => setNewBooking({ ...newBooking, total_price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={newBooking.customer_name}
                  onChange={(e) => setNewBooking({ ...newBooking, customer_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Customer Email</label>
                  <input
                    type="email"
                    value={newBooking.customer_email}
                    onChange={(e) => setNewBooking({ ...newBooking, customer_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Customer Phone</label>
                  <input
                    type="tel"
                    value={newBooking.customer_phone}
                    onChange={(e) => setNewBooking({ ...newBooking, customer_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Status</label>
                <select
                  value={newBooking.status}
                  onChange={(e) => setNewBooking({ ...newBooking, status: e.target.value as Booking['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Notes (Optional)</label>
                <textarea
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleCreateBooking}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg"
                >
                  Create Booking
                </button>
                <button
                  onClick={() => setShowAddBookingModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowImportModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Import Bookings from CSV</h2>
              <button onClick={() => setShowImportModal(false)} className="text-gray-500 hover:text-black">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Upload a CSV file with the following columns:
              </p>
              <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono text-gray-700">
                vehicle_id, start_date, end_date, total_price, customer_name, customer_email, customer_phone, status
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleImportBookings(file)
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => setShowImportModal(false)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
        </main>
      </div>
    </div>
  )
}

export default function AdminBookingsPage() {
  return (
    <AuthGuard allowedEmails={[...AUTHORIZED_ADMIN_EMAILS]}>
      <AdminBookingsContent />
    </AuthGuard>
  )
}
