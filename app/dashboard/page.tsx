"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { auth } from "@/lib/firebase"
import NavBar from "@/components/NavBar"
import { CreditCard, User, Calendar, Star, LogOut, RefreshCw, Settings, DollarSign } from "lucide-react"

export default function CustomerDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", avatar_url: "" })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState("")
  const [savedVehicles, setSavedVehicles] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [paymentsError, setPaymentsError] = useState<string>("")
  const [showDebug, setShowDebug] = useState(false)
  const [reviewText, setReviewText] = useState("")
  const [reviewMsg, setReviewMsg] = useState("")
  const [bookingActionMsg, setBookingActionMsg] = useState("")
  const router = useRouter()
  const { user, loading, logout } = useAuth()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
            router.push("/login")
      return
    }

    // If user is authenticated, initialize profile data and fetch payments
    if (user && !profile) {
      // Initialize profile from user data
      const profileData = {
        name: user.displayName || "",
        phone: user.phoneNumber || "",
        avatar_url: user.photoURL || ""
      }
        setProfile(profileData)
      setProfileForm(profileData)
      
      // Fetch payments
      fetchPayments()
      
      // TODO: Fetch additional profile data from backend when ready
      // TODO: Fetch saved vehicles from backend when ready
      // TODO: Fetch bookings from API when ready
    }
  }, [user, loading, router, profile])

  const fetchPayments = async () => {
    if (!user || !auth) return
    
    setPaymentsLoading(true)
    setPaymentsError("")
    try {
      // Get the Firebase ID token
      const idToken = await user.getIdToken()
      
      const response = await fetch('/api/payments', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch payments')
      }
      
      const data = await response.json()
      setPayments(data.payments || [])
      
      // Show debug info in console
      if (data.debug) {
        console.log('Payment fetch debug:', data.debug)
      }
      
      if ((data.payments || []).length === 0) {
        setPaymentsError("No payments found. This could mean: 1) Payments were made with a different email, 2) Payments don't have email stored in metadata, or 3) Payments are older than our search range. Check the browser console for details.")
      }
    } catch (error: any) {
      console.error('Error fetching payments:', error)
      setPaymentsError(error.message || 'Failed to fetch payments. Please check the browser console for details.')
    } finally {
      setPaymentsLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
  }

  const handleProfileSave = async () => {
    setProfileLoading(true)
    setProfileMsg("")
    // TODO: Implement profile update when backend is ready
    // For now, just update local state
    setProfile({ ...profile, ...profileForm })
      setProfileMsg("Profile updated!")
      setEditing(false)
    setProfileLoading(false)
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setReviewMsg("")
    if (!reviewText.trim()) {
      setReviewMsg("Please enter a review.")
      return
    }
    // TODO: Implement review submission when backend is ready
    setReviewMsg("Thank you for your review!")
    setReviewText("")
  }

  const handleCancelBooking = async (bookingId: string) => {
    setBookingActionMsg("")
    // TODO: Implement booking cancellation when backend is ready
    setBookingActionMsg("Booking cancelled.")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-lg font-semibold">Loading your dashboard...</div>
      </div>
    )
  }

  // Don't render if user is not authenticated (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background with video or gradient overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-900" />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <NavBar variant="dark" transparent noBorder />

      {/* Main Content */}
      <main className="relative z-10 pt-20 sm:pt-24 md:pt-28 pb-12 px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 md:mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                  Welcome back, {profile?.name || user?.email?.split('@')[0] || "User"}
                </h1>
                <p className="text-white/60 text-sm sm:text-base">
                  Manage your bookings, payments, and profile
                </p>
              </div>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 transition-all text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment History */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-semibold">Payment History</h2>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDebug(!showDebug)}
                      className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 transition-all"
                    >
                      {showDebug ? 'Hide' : 'Debug'}
                    </button>
                    <button
                      onClick={fetchPayments}
                      disabled={paymentsLoading}
                      className="flex items-center gap-1 text-xs px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-3 h-3 ${paymentsLoading ? 'animate-spin' : ''}`} />
                      {paymentsLoading ? 'Loading' : 'Refresh'}
                    </button>
                  </div>
                </div>
                {showDebug && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-200">
                    <p><strong>Debug Info:</strong></p>
                    <p>Logged in as: <strong>{user?.email}</strong></p>
                    <p>Payments found: <strong>{payments.length}</strong></p>
                    <p className="mt-1">Check browser console (F12) for detailed payment search logs.</p>
                  </div>
                )}
                {paymentsError && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-200">
                    {paymentsError}
                  </div>
                )}
                {paymentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-white/60" />
                    <p className="ml-3 text-white/60">Loading payments... (this may take a moment)</p>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="mb-2">No payments found.</p>
                    <p className="text-xs text-white/40">
                      If you made a payment before this feature was added, it might not have your email stored. 
                      Payments are matched by the email address you're logged in with ({user?.email}).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div key={payment.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white mb-1">{payment.description}</div>
                            <div className="text-xs text-white/60 mb-2">
                              {new Date(payment.created).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            {payment.type && (
                              <span className="inline-block px-2 py-1 text-xs bg-white/10 text-white rounded-full capitalize border border-white/20">
                                {payment.type.replace('_', ' ')}
                              </span>
                            )}
                            {payment.receiptUrl && (
                              <a
                                href={payment.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block mt-2 text-xs text-white/80 hover:text-white underline"
                              >
                                View Receipt →
                              </a>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-xl text-green-400 mb-1">
                              ${payment.amount.toFixed(2)}
                            </div>
                            <span className={`text-xs capitalize px-2 py-1 rounded-full ${
                              payment.status === 'succeeded' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                              payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                              'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {payment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Booking History */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-semibold">Booking History</h2>
                </div>
                {bookingActionMsg && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">
                    {bookingActionMsg}
                  </div>
                )}
            {bookings.length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No bookings yet.</p>
                  </div>
            ) : (
                  <div className="space-y-3">
                {bookings.map((b) => (
                      <div key={b.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1">
                            <div className="font-medium text-white mb-1">
                              {b.vehicle_id}
                            </div>
                            <div className="text-sm text-white/60">
                              {b.start_date} to {b.end_date}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 text-xs bg-white/10 text-white rounded-full capitalize border border-white/20">
                              {b.status}
                    </span>
                    {b.status === "pending" && (
                              <button 
                                onClick={() => handleCancelBooking(b.id)} 
                                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full border border-red-500/30 text-xs transition-all"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
        </div>

            {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Profile Section */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <User className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-semibold">Profile</h2>
                  </div>
                  {!editing && (
                    <button 
                      onClick={() => setEditing(true)} 
                      className="p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                      <Settings className="w-4 h-4 text-white/60" />
                    </button>
                  )}
            </div>
            {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                        placeholder="Your name"
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                        placeholder="Your phone"
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Avatar URL</label>
                <input
                  type="text"
                  name="avatar_url"
                  value={profileForm.avatar_url}
                  onChange={handleProfileChange}
                  placeholder="Avatar URL (optional)"
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                </div>
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={handleProfileSave} 
                        disabled={profileLoading} 
                        className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all text-sm disabled:opacity-50"
                      >
                        {profileLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button 
                        onClick={() => setEditing(false)} 
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-all text-sm"
                      >
                        Cancel
                      </button>
              </div>
                    {profileMsg && (
                      <div className="text-sm text-green-400 mt-2">{profileMsg}</div>
            )}
          </div>
                ) : (
                  <div className="space-y-3">
                    {profile?.avatar_url && (
                      <img 
                        src={profile.avatar_url} 
                        alt="Avatar" 
                        className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-white/20" 
                      />
                    )}
                    <div className="text-center">
                      <div className="text-white font-medium mb-1">{profile?.name || "No name set"}</div>
                      <div className="text-white/60 text-sm">{profile?.phone || "No phone set"}</div>
                      <div className="text-white/40 text-xs mt-2">{user?.email}</div>
                    </div>
                  </div>
            )}
          </div>

          {/* Saved Vehicles */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-semibold">Saved Vehicles</h2>
                </div>
            {savedVehicles.length === 0 ? (
                  <div className="text-center py-6 text-white/60 text-sm">
                    You have no saved vehicles yet.
                  </div>
            ) : (
                  <div className="space-y-3">
                {savedVehicles.map((v) => (
                      <div key={v.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-3">
                        <img 
                          src={v.imageUrl || "/placeholder.svg"} 
                          alt={v.make} 
                          className="w-16 h-12 object-cover rounded" 
                        />
                        <div>
                          <div className="font-medium text-white">{v.make} {v.model}</div>
                        </div>
                      </div>
                    ))}
                  </div>
            )}
          </div>

          {/* Leave a Review Section */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Star className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-semibold">Leave a Review</h2>
                </div>
                <form onSubmit={handleReviewSubmit} className="space-y-3">
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Share your experience..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
                required
              />
                  <button 
                    type="submit" 
                    className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all text-sm"
                  >
                    Submit Review
                  </button>
                  {reviewMsg && (
                    <div className="text-sm text-green-400 mt-2">{reviewMsg}</div>
                  )}
            </form>
          </div>
        </div>
      </div>
        </div>
      </main>
    </div>
  )
} 