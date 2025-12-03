"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/lib/auth-guard"
import { useAuth } from "@/hooks/useAuth"
import { AUTHORIZED_ADMIN_EMAILS } from "@/lib/admin-authorized-emails"
import Link from "next/link"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminHeader from "@/components/admin/AdminHeader"

function AddVehicleContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    price_per_day: "",
    description: "",
    image_url: "",
    mileage: "",
    transmission: "Automatic",
    location: "Newark, NJ",
    origin_address: "3 Brewster Rd, Newark, NJ 07114",
    features: "",
    insurance: "Full Coverage",
    maintenance: "Regular Service",
    size: "medium",
    category: "Sedan",
    available: true,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    let fieldValue: string | boolean = value
    if (type === "checkbox") {
      fieldValue = (e.target as HTMLInputElement).checked
    }
    setForm((prev) => ({
      ...prev,
      [name]: fieldValue,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    if (!user) {
      setError("You must be logged in to add a vehicle")
      setLoading(false)
      return
    }

    try {
      const idToken = await user.getIdToken()
      const response = await fetch('/api/admin/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          ...form,
          features: form.features.split(',').map(f => f.trim()).filter(f => f),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add vehicle')
      }

      setSuccess(true)
      setForm({
        make: "",
        model: "",
        year: "",
        price_per_day: "",
        description: "",
        image_url: "",
        mileage: "",
        transmission: "Automatic",
        location: "Newark, NJ",
        features: "",
        insurance: "Full Coverage",
        maintenance: "Regular Service",
        size: "medium",
        category: "Sedan",
        available: true,
      })

      // Redirect to vehicles page after 2 seconds
      setTimeout(() => {
        router.push('/admin/vehicles')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to add vehicle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <AdminSidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 pt-16 lg:pt-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Add New Vehicle</h1>
                <p className="text-gray-600">Add a new vehicle to your fleet</p>
              </div>
              <Link href="/admin/vehicles" className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm">
                Back to Vehicles
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Make *</label>
                <input
                  type="text"
                  name="make"
                  value={form.make}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-gray-900 text-sm"
                  required
                  placeholder="e.g., Dodge"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Model *</label>
                <input
                  type="text"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-gray-900 text-sm"
                  required
                  placeholder="e.g., Charger"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Year *</label>
                <input
                  type="number"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-gray-900 text-sm"
                  required
                  min="1900"
                  max="2030"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Price Per Day ($) *</label>
                <input
                  type="number"
                  name="price_per_day"
                  value={form.price_per_day}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-gray-900 text-sm"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Category</label>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Size</label>
                <select
                  name="size"
                  value={form.size}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-gray-900 text-sm"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Mileage</label>
                <input
                  type="number"
                  name="mileage"
                  value={form.mileage}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-gray-900 text-sm"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Transmission</label>
                <select
                  name="transmission"
                  value={form.transmission}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-gray-900 text-sm"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Location</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-gray-900 text-sm"
                  placeholder="Newark, NJ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Origin Address (for distance calculation)</label>
                <input
                  type="text"
                  name="origin_address"
                  value={form.origin_address || "3 Brewster Rd, Newark, NJ 07114"}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-gray-900 text-sm"
                  placeholder="3 Brewster Rd, Newark, NJ 07114"
                />
                <p className="text-xs text-gray-500 mt-1">This is the pickup location used to calculate estimated miles to destination</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Insurance</label>
                <input
                  type="text"
                  name="insurance"
                  value={form.insurance}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Maintenance</label>
                <input
                  type="text"
                  name="maintenance"
                  value={form.maintenance}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-gray-900 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-gray-900 text-sm"
                rows={3}
                placeholder="Vehicle description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">Image</label>
              <div className="space-y-2">
                {form.image_url && (
                  <div className="relative w-full h-48 border rounded overflow-hidden">
                    <img src={form.image_url} alt="Vehicle preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file || !user) return
                        
                        try {
                          const idToken = await user.getIdToken()
                          const formData = new FormData()
                          formData.append('file', file)
                          formData.append('vehicleId', 'temp')
                          
                          const response = await fetch('/api/admin/vehicles/upload-image', {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${idToken}`,
                            },
                            body: formData,
                          })
                          
                          if (response.ok) {
                            const data = await response.json()
                            setForm(prev => ({ ...prev, image_url: data.url }))
                          }
                        } catch (err) {
                          console.error('Upload failed:', err)
                        }
                      }}
                      className="hidden"
                    />
                    <div className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm text-center">
                      Upload Image
                    </div>
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    value={form.image_url}
                    onChange={handleChange}
                    className="flex-1 border rounded px-3 py-2 text-gray-900 text-sm"
                    placeholder="Or paste image URL"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Features (comma-separated)</label>
              <input
                type="text"
                name="features"
                value={form.features}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-gray-900 text-sm"
                placeholder="Bluetooth, Backup Camera, Cruise Control"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="available"
                checked={form.available}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-sm text-gray-900">Available</label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded p-3 text-green-600 text-sm">
                Vehicle added successfully! Redirecting to vehicles page...
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Adding Vehicle..." : "Add Vehicle"}
            </button>
          </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AddVehiclePage() {
  return (
    <AuthGuard allowedEmails={[...AUTHORIZED_ADMIN_EMAILS]}>
      <AddVehicleContent />
    </AuthGuard>
  )
} 