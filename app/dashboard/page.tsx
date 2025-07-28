"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", avatar_url: "" })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState("")
  const [savedVehicles, setSavedVehicles] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [reviewText, setReviewText] = useState("")
  const [reviewMsg, setReviewMsg] = useState("")
  const [bookingActionMsg, setBookingActionMsg] = useState("")
  const router = useRouter()

  useEffect(() => {
    let isMounted = true
    const checkSession = async (retry = 0) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !session.user) {
        if (retry < 5) {
          setTimeout(() => checkSession(retry + 1), 300)
        } else {
          if (isMounted) {
            // Clear any hash fragments from the URL
            if (window.location.hash) {
              window.history.replaceState(null, '', window.location.pathname)
            }
            router.push("/login")
          }
        }
        return
      }
      const user = session.user
      if (isMounted) setUser(user)
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("name, phone, avatar_url")
        .eq("id", user.id)
        .single()
      if (isMounted) {
        setProfile(profileData)
        setProfileForm({
          name: profileData?.name || "",
          phone: profileData?.phone || "",
          avatar_url: profileData?.avatar_url || ""
        })
      }
      // Fetch saved vehicles
      const { data: saved } = await supabase
        .from("saved_vehicles")
        .select("vehicle_id, vehicles(*)")
        .eq("user_id", user.id)
      if (isMounted) setSavedVehicles(saved?.map((v: any) => v.vehicles) || [])
      // Fetch bookings from API
      const res = await fetch(`/api/bookings?user_id=${user.id}`)
      const bookingsData = await res.json()
      if (isMounted) setBookings(bookingsData.bookings || [])
      if (isMounted) setLoading(false)
    }
    checkSession()
    return () => { isMounted = false }
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
  }

  const handleProfileSave = async () => {
    setProfileLoading(true)
    setProfileMsg("")
    const { error } = await supabase
      .from("profiles")
      .update({
        name: profileForm.name,
        phone: profileForm.phone,
        avatar_url: profileForm.avatar_url
      })
      .eq("id", user.id)
    if (error) {
      setProfileMsg("Failed to update profile.")
    } else {
      setProfileMsg("Profile updated!")
      setProfile({ ...profile, ...profileForm })
      setEditing(false)
    }
    setProfileLoading(false)
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setReviewMsg("")
    if (!reviewText.trim()) {
      setReviewMsg("Please enter a review.")
      return
    }
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      name: profile?.name || user.email,
      review: reviewText.trim(),
    })
    if (error) {
      setReviewMsg("Failed to submit review. Please try again.")
    } else {
      setReviewMsg("Thank you for your review!")
      setReviewText("")
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    setBookingActionMsg("")
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" })
    })
    if (res.ok) {
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: "cancelled" } : b))
      setBookingActionMsg("Booking cancelled.")
    } else {
      setBookingActionMsg("Failed to cancel booking.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-semibold text-neutral-900">Loading your dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-neutral-900">Welcome, {profile?.name || user.email}</h1>
          <button onClick={handleLogout} className="text-sm px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Logout</button>
        </div>
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-neutral-900">Profile Settings</h2>
              {!editing && <button onClick={() => setEditing(true)} className="text-blue-700 text-sm">Edit</button>}
            </div>
            {editing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  placeholder="Name"
                  className="w-full px-3 py-2 rounded border text-neutral-900"
                />
                <input
                  type="text"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  placeholder="Phone"
                  className="w-full px-3 py-2 rounded border text-neutral-900"
                />
                <input
                  type="text"
                  name="avatar_url"
                  value={profileForm.avatar_url}
                  onChange={handleProfileChange}
                  placeholder="Avatar URL (optional)"
                  className="w-full px-3 py-2 rounded border text-neutral-900"
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={handleProfileSave} disabled={profileLoading} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Save</button>
                  <button onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-300 text-neutral-900 rounded text-sm">Cancel</button>
                </div>
                {profileMsg && <div className="text-sm text-green-700 mt-1">{profileMsg}</div>}
              </div>
            ) : (
              <div>
                <div className="text-neutral-900 font-medium">{profile?.name || "No name set"}</div>
                <div className="text-neutral-700">{profile?.phone || "No phone set"}</div>
                {profile?.avatar_url && <img src={profile.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full mt-2" />}
              </div>
            )}
          </div>
          {/* Booking History */}
          <div className="bg-gray-100 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2 text-neutral-900">Booking History</h2>
            {bookingActionMsg && <div className="text-green-700 text-sm mb-2">{bookingActionMsg}</div>}
            {bookings.length === 0 ? (
              <p className="text-neutral-700">No bookings yet.</p>
            ) : (
              <ul className="divide-y">
                {bookings.map((b) => (
                  <li key={b.id} className="py-2 flex flex-col md:flex-row md:justify-between md:items-center text-sm text-neutral-900 gap-2 md:gap-0">
                    <span>
                      {b.vehicle_id} {/* Optionally, fetch and display vehicle details by ID */}
                    </span>
                    <span>{b.start_date} to {b.end_date}</span>
                    <span className="font-medium capitalize">{b.status}</span>
                    {b.status === "pending" && (
                      <button onClick={() => handleCancelBooking(b.id)} className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs">Cancel</button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Saved Vehicles */}
          <div className="bg-gray-100 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2 text-neutral-900">Saved Vehicles</h2>
            {savedVehicles.length === 0 ? (
              <p className="text-neutral-700">You have no saved vehicles yet.</p>
            ) : (
              <ul className="divide-y">
                {savedVehicles.map((v) => (
                  <li key={v.id} className="py-2 flex items-center gap-3 text-neutral-900">
                    <img src={v.image_url || "/placeholder.svg"} alt={v.make} className="w-12 h-8 object-cover rounded" />
                    <span className="font-medium">{v.make} {v.model}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Leave a Review Section */}
          <div className="bg-gray-100 rounded-lg p-4 mt-6">
            <h2 className="text-xl font-semibold mb-2 text-neutral-900">Leave a Review</h2>
            <form onSubmit={handleReviewSubmit} className="space-y-2">
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Share your experience..."
                className="w-full px-3 py-2 rounded border text-neutral-900 min-h-[80px]"
                required
              />
              <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm">Submit Review</button>
              {reviewMsg && <div className="text-sm mt-1 text-green-700">{reviewMsg}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 