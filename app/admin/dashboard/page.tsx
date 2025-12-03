"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/lib/auth-guard"
import { useAuth } from "@/hooks/useAuth"
import { AUTHORIZED_ADMIN_EMAILS } from "@/lib/admin-authorized-emails"
import { CreditCard, Calendar, X, CheckCircle2, XCircle, Users as UsersIcon, Car, FileText } from "lucide-react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminHeader from "@/components/admin/AdminHeader"

interface Stats {
  totalVehicles: number
  totalBookings: number
  totalUsers: number
}

interface SubscriptionPayment {
  id: string
  type: string
  amount: number
  currency: string
  status: string
  description: string
  created: string
  receiptUrl: string | null
}

function AdminDashboardContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({ totalVehicles: 0, totalBookings: 0, totalUsers: 0 })
  const [statsLoading, setStatsLoading] = useState(true)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [subscriptionPayments, setSubscriptionPayments] = useState<SubscriptionPayment[]>([])
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)
  const [lastPayment, setLastPayment] = useState<SubscriptionPayment | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'inactive'>('inactive')
  
  // KPI Card Modals
  const [showActiveBookingsModal, setShowActiveBookingsModal] = useState(false)
  const [showVehiclesOutModal, setShowVehiclesOutModal] = useState(false)
  const [showTasksDueModal, setShowTasksDueModal] = useState(false)
  const [activeBookings, setActiveBookings] = useState<any[]>([])
  const [vehiclesOut, setVehiclesOut] = useState<any[]>([])
  const [tasksDue, setTasksDue] = useState<any[]>([])
  const [loadingModalData, setLoadingModalData] = useState<string | null>(null)
  const [kpiLoading, setKpiLoading] = useState(true)

  // Fetch KPI data on mount and refresh periodically
  const fetchKpiData = async () => {
    if (!user) return
    
    try {
      setKpiLoading(true)
      const idToken = await user.getIdToken()
      
      // Fetch all KPI data in parallel
      const [bookingsRes, vehiclesRes, tasksRes] = await Promise.all([
        fetch('/api/admin/dashboard/active-bookings', {
          headers: { 'Authorization': `Bearer ${idToken}` },
          cache: 'no-store',
        }),
        fetch('/api/admin/dashboard/vehicles-out', {
          headers: { 'Authorization': `Bearer ${idToken}` },
          cache: 'no-store',
        }),
        fetch('/api/admin/dashboard/tasks-due', {
          headers: { 'Authorization': `Bearer ${idToken}` },
          cache: 'no-store',
        }),
      ])
      
      if (bookingsRes.ok) {
        const data = await bookingsRes.json()
        setActiveBookings(data.bookings || [])
      }
      
      if (vehiclesRes.ok) {
        const data = await vehiclesRes.json()
        setVehiclesOut(data.vehicles || [])
      }
      
      if (tasksRes.ok) {
        const data = await tasksRes.json()
        setTasksDue(data.tasks || [])
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error)
    } finally {
      setKpiLoading(false)
    }
  }

  useEffect(() => {
    fetchKpiData()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchKpiData, 30000)
    return () => clearInterval(interval)
  }, [user])

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return
      
      try {
        const idToken = await user.getIdToken()
        const response = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          setStats({
            totalVehicles: data.totalVehicles || 0,
            totalBookings: data.totalBookings || 0,
            totalUsers: data.totalUsers || 0,
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchStats()
  }, [user])

  // Fetch subscription payments when modal opens
  const handleOpenSubscriptionModal = async () => {
    setShowSubscriptionModal(true)
    setSubscriptionLoading(true)
    
    if (!user) return
    
    try {
      const idToken = await user.getIdToken()
      const response = await fetch('/api/admin/subscription-payments', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setSubscriptionPayments(data.payments || [])
        setLastPayment(data.lastPayment || null)
        // Set subscription status based on whether there are payments
        setSubscriptionStatus(data.payments && data.payments.length > 0 ? 'active' : 'inactive')
      }
    } catch (error) {
      console.error('Error fetching subscription payments:', error)
    } finally {
      setSubscriptionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <AdminSidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 pt-16 lg:pt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.email?.split('@')[0] || 'Admin'}</p>
          </div>

          {/* Subscription CTA Card */}
          {subscriptionStatus === 'inactive' && (
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-300 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">ReadyAimGo C-Suite</h2>
                  <p className="text-sm text-gray-600">Unlock full admin features and priority support</p>
                </div>
                <button
                  onClick={handleOpenSubscriptionModal}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                  Activate Now
                </button>
              </div>
              </div>
            )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <button
              onClick={async () => {
                setShowActiveBookingsModal(true)
                setLoadingModalData('active-bookings')
                if (!user) return
                try {
                  const idToken = await user.getIdToken()
                  const response = await fetch('/api/admin/dashboard/active-bookings', {
                    headers: { 'Authorization': `Bearer ${idToken}` },
                  })
                  if (response.ok) {
                    const data = await response.json()
                    setActiveBookings(data.bookings || [])
                  }
                } catch (error) {
                  console.error('Error fetching active bookings:', error)
                } finally {
                  setLoadingModalData(null)
                }
              }}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Active Bookings Today</h3>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {kpiLoading ? '...' : activeBookings.length}
              </div>
              <p className="text-xs text-gray-500">Currently active</p>
            </button>

            <button
              onClick={async () => {
                setShowVehiclesOutModal(true)
                setLoadingModalData('vehicles-out')
                if (!user) return
                try {
                  const idToken = await user.getIdToken()
                  const response = await fetch('/api/admin/dashboard/vehicles-out', {
                    headers: { 'Authorization': `Bearer ${idToken}` },
                  })
                  if (response.ok) {
                    const data = await response.json()
                    setVehiclesOut(data.vehicles || [])
                  }
                } catch (error) {
                  console.error('Error fetching vehicles out:', error)
                } finally {
                  setLoadingModalData(null)
                }
              }}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Vehicles Out</h3>
                <Car className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {kpiLoading ? '...' : vehiclesOut.length}
              </div>
              <p className="text-xs text-gray-500">Currently rented</p>
            </button>

            <button
              onClick={async () => {
                setShowTasksDueModal(true)
                setLoadingModalData('tasks-due')
                if (!user) return
                try {
                  const idToken = await user.getIdToken()
                  const response = await fetch('/api/admin/dashboard/tasks-due', {
                    headers: { 'Authorization': `Bearer ${idToken}` },
                  })
                  if (response.ok) {
                    const data = await response.json()
                    setTasksDue(data.tasks || [])
                  }
                } catch (error) {
                  console.error('Error fetching tasks due:', error)
                } finally {
                  setLoadingModalData(null)
                }
              }}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Tasks Due</h3>
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{kpiLoading ? '...' : tasksDue.length}</div>
              <p className="text-xs text-gray-500">Require attention</p>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Recent Messages */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Recent Messages</h2>
                <Link href="/admin/messaging" className="text-sm text-yellow-600 hover:text-yellow-700">
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'John Doe', message: 'Need to extend rental', time: '2 min ago', unread: true },
                  { name: 'Sarah Smith', message: 'Vehicle inspection question', time: '15 min ago', unread: false },
                  { name: 'Mike Johnson', message: 'Weekly rental discount?', time: '1 hour ago', unread: true },
                ].map((msg, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      {msg.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 text-sm">{msg.name}</h3>
                        {msg.unread && (
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{msg.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{msg.time}</p>
                    </div>
                  </div>
                ))}
          </div>
        </div>
        
            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
                <Link href="/admin/bookings" className="text-sm text-yellow-600 hover:text-yellow-700">
                  View All →
          </Link>
              </div>
              <div className="space-y-3">
                {stats.totalBookings === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No bookings yet</p>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    <p>Booking details will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/admin/add-vehicle"
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-center text-sm font-medium text-gray-900 transition-colors"
              >
                Add Vehicle
          </Link>
              <Link
                href="/admin/bookings"
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-center text-sm font-medium text-gray-900 transition-colors"
              >
                View Bookings
          </Link>
              <Link
                href="/admin/messaging"
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-center text-sm font-medium text-gray-900 transition-colors"
              >
                Check Messages
          </Link>
              <Link
                href="/admin/finance"
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-center text-sm font-medium text-gray-900 transition-colors"
              >
                View Finance
          </Link>
        </div>
          </div>
        </main>
      </div>

      {/* Active Bookings Modal */}
      {showActiveBookingsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowActiveBookingsModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Active Bookings Today</h2>
              <button onClick={() => setShowActiveBookingsModal(false)} className="text-gray-500 hover:text-black">
                <X className="w-6 h-6" />
              </button>
            </div>
            {loadingModalData === 'active-bookings' ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : activeBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No active bookings today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeBookings.map((booking) => (
                  <div key={booking.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {booking.vehicle?.year} {booking.vehicle?.make} {booking.vehicle?.model}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Customer: {booking.customer_name} {booking.customer_email && `(${booking.customer_email})`}
                        </div>
                        <div className="text-sm text-gray-600">
                          Dates: {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">${booking.total_price}</div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vehicles Out Modal */}
      {showVehiclesOutModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowVehiclesOutModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Vehicles Currently Out</h2>
              <button onClick={() => setShowVehiclesOutModal(false)} className="text-gray-500 hover:text-black">
                <X className="w-6 h-6" />
              </button>
            </div>
            {loadingModalData === 'vehicles-out' ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : vehiclesOut.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Car className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No vehicles currently out</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vehiclesOut.map((vehicle) => (
                  <div key={vehicle.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </div>
                        {vehicle.booking && (
                          <>
                            <div className="text-sm text-gray-600 mt-1">
                              Rented by: {vehicle.booking.customer_name} {vehicle.booking.customer_email && `(${vehicle.booking.customer_email})`}
                            </div>
                            <div className="text-sm text-gray-600">
                              Return Date: {new Date(vehicle.booking.end_date).toLocaleDateString()}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">${vehicle.price_per_day}/day</div>
                        {vehicle.booking && (
                          <div className="text-sm text-gray-600">${vehicle.booking.total_price} total</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tasks Due Modal */}
      {showTasksDueModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTasksDueModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tasks Requiring Attention</h2>
              <button onClick={() => setShowTasksDueModal(false)} className="text-gray-500 hover:text-black">
                <X className="w-6 h-6" />
              </button>
            </div>
            {loadingModalData === 'tasks-due' ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : tasksDue.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No tasks due at this time</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasksDue.map((task) => (
                  <div key={task.id} className={`p-4 border rounded-lg hover:bg-gray-50 ${
                    task.priority === 'high' ? 'border-red-300 bg-red-50' :
                    task.priority === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                    'border-blue-300 bg-blue-50'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            task.priority === 'high' ? 'bg-red-200 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {task.priority.toUpperCase()}
                          </span>
                          <span className="font-semibold text-gray-900">{task.title}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                        {task.vehicle && (
                          <div className="text-sm text-gray-600 mt-1">
                            Vehicle: {task.vehicle.year} {task.vehicle.make} {task.vehicle.model}
                          </div>
                        )}
                        {task.due_date && (
                          <div className="text-sm text-gray-600 mt-1">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSubscriptionModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">ReadyAimGo Subscription Payments</h2>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="text-gray-500 hover:text-black"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {subscriptionLoading ? (
              <div className="text-center py-8 text-gray-500">Loading payment history...</div>
            ) : (
              <>
                {lastPayment && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Last Payment</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">${lastPayment.amount.toFixed(2)} {lastPayment.currency.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{new Date(lastPayment.created).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${lastPayment.status === 'succeeded' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {lastPayment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="font-semibold mb-2">Payment History</h3>
                  {subscriptionPayments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No subscription payments found. Payments will appear here once Femi Leasing makes subscription payments to ReadyAimGo.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {subscriptionPayments.map((payment) => (
                        <div key={payment.id} className="p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium">{payment.description}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {new Date(payment.created).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">${payment.amount.toFixed(2)}</div>
                              <div className={`text-xs ${payment.status === 'succeeded' ? 'text-green-600' : 'text-yellow-600'}`}>
                                {payment.status}
                              </div>
                            </div>
                          </div>
                          {payment.receiptUrl && (
                            <a
                              href={payment.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                            >
                              View Receipt →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AuthGuard allowedEmails={AUTHORIZED_ADMIN_EMAILS}>
      <AdminDashboardContent />
    </AuthGuard>
  )
} 