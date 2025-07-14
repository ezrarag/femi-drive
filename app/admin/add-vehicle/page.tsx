"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AddVehiclePage() {
  const [form, setForm] = useState({
    name: "",
    year: "",
    slug: "",
    description: "",
    price_per_day: "",
    image_url: "",
    booking_url: "",
    available: true,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    // Insert into Supabase
    const { data, error } = await supabase.from("vehicles").insert([
      {
        name: form.name,
        year: Number(form.year),
        slug: form.slug,
        description: form.description,
        price_per_day: Number(form.price_per_day),
        image_url: form.image_url,
        booking_url: form.booking_url,
        available: form.available,
      },
    ])
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setForm({
        name: "",
        year: "",
        slug: "",
        description: "",
        price_per_day: "",
        image_url: "",
        booking_url: "",
        available: true,
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Add Vehicle</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <input
              type="number"
              name="year"
              value={form.year}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price Per Day</label>
            <input
              type="number"
              name="price_per_day"
              value={form.price_per_day}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="text"
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Booking URL</label>
            <input
              type="text"
              name="booking_url"
              value={form.booking_url}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
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
            <label className="text-sm">Available</label>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Vehicle"}
          </button>
          {success && <div className="text-green-600 text-sm mt-2">Vehicle added successfully!</div>}
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </form>
      </div>
    </div>
  )
} 