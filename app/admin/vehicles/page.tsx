"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

function debounce(fn: (...args: any[]) => void, delay: number) {
  let timer: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState("")
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      // TEMPORARY: Allow any email for development - REMOVE BEFORE PRODUCTION
      // if (!user || !user.email || !user.email.endsWith("@femileasing.com")) {
      if (!user || !user.email) {
        window.location.href = "/admin/login"
      } else {
        setAuthLoading(false)
      }
    }
    checkAdmin()
  }, [])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-semibold text-gray-700">Checking admin access...</div>
      </div>
    )
  }

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true)
      setError("")
      const { data, error } = await supabase.from("vehicles").select("*").order("make", { ascending: true })
      if (error) setError(error.message)
      setVehicles(data || [])
      setLoading(false)
    }
    fetchVehicles()
  }, [])

  // Debounced save function
  const debouncedSave = debounce(async (form: any) => {
    setSaving(true)
    setSaveStatus("Saving...")
    const { error } = await supabase.from("vehicles").update(form).eq("id", form.id)
    setSaving(false)
    setSaveStatus(error ? "Error saving" : "Saved!")
    setTimeout(() => setSaveStatus(""), 1200)
    // Optionally, refresh the vehicle list
  }, 800)

  const handleEditClick = (vehicle: any) => {
    setEditingVehicle(vehicle)
    setEditForm({ ...vehicle })
    setSaveStatus("")
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    let newValue: string | boolean = value
    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked
    }
    setEditForm((prev: any) => {
      const updated = { ...prev, [name]: newValue }
      debouncedSave(updated)
      return updated
    })
  }

  const closeModal = () => {
    setEditingVehicle(null)
    setEditForm(null)
    setSaveStatus("")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Admin: Vehicles</h1>
          <div className="flex gap-2">
            <Link href="/admin/dashboard" className="px-3 sm:px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">Dashboard</Link>
            <Link href="/admin/add-vehicle" className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Add Vehicle</Link>
          </div>
        </div>
        <div className="mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
          ⚠️ Development Mode: Email restrictions temporarily disabled
        </div>
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading vehicles...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-2 sm:px-3 text-left font-bold text-gray-800 text-xs sm:text-sm">Make</th>
                  <th className="py-2 px-2 sm:px-3 text-left font-bold text-gray-800 text-xs sm:text-sm">Model</th>
                  <th className="py-2 px-2 sm:px-3 text-left font-bold text-gray-800 text-xs sm:text-sm">Year</th>
                  <th className="py-2 px-2 sm:px-3 text-left font-bold text-gray-800 text-xs sm:text-sm">Price/Day</th>
                  <th className="py-2 px-2 sm:px-3 text-left font-bold text-gray-800 text-xs sm:text-sm">Available</th>
                  <th className="py-2 px-2 sm:px-3 text-left font-bold text-gray-800 text-xs sm:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-t">
                    <td className="py-2 px-2 sm:px-3 text-gray-900 text-xs sm:text-sm">{v.make}</td>
                    <td className="py-2 px-2 sm:px-3 text-gray-900 text-xs sm:text-sm">{v.model}</td>
                    <td className="py-2 px-2 sm:px-3 text-gray-900 text-xs sm:text-sm">{v.year}</td>
                    <td className="py-2 px-2 sm:px-3 text-gray-900 text-xs sm:text-sm">${v.price_per_day}</td>
                    <td className="py-2 px-2 sm:px-3 text-gray-900 text-xs sm:text-sm">{v.available ? "Yes" : "No"}</td>
                    <td className="py-2 px-2 sm:px-3">
                      <button onClick={() => handleEditClick(v)} className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs sm:text-sm">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingVehicle && editForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl p-4 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
            <button onClick={closeModal} className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-500 hover:text-black p-2">✕</button>
            <h2 className="text-lg sm:text-xl font-bold mb-4">Edit Vehicle</h2>
            <form className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Make</label>
                <input type="text" name="make" value={editForm.make || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Model</label>
                <input type="text" name="model" value={editForm.model || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Year</label>
                <input type="number" name="year" value={editForm.year || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Slug</label>
                <input type="text" name="slug" value={editForm.slug || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Description</label>
                <textarea name="description" value={editForm.description || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Price Per Day</label>
                <input type="number" name="price_per_day" value={editForm.price_per_day || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Image URL</label>
                <input type="text" name="image_url" value={editForm.image_url || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Booking URL</label>
                <input type="text" name="booking_url" value={editForm.booking_url || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="available" checked={!!editForm.available} onChange={handleEditChange} className="mr-2" />
                <label className="text-sm text-gray-900">Available</label>
              </div>
            </form>
            <div className="mt-4 text-sm text-gray-500 min-h-[1.5em]">{saving ? saveStatus : saveStatus}</div>
          </div>
        </div>
      )}
    </div>
  )
} 