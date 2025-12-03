"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { AuthGuard } from "@/lib/auth-guard"
import { useAuth } from "@/hooks/useAuth"
import { AUTHORIZED_ADMIN_EMAILS } from "@/lib/admin-authorized-emails"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminHeader from "@/components/admin/AdminHeader"

function AdminVehiclesContent() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [togglingVehicle, setTogglingVehicle] = useState<string | null>(null)

  const fetchVehicles = async () => {
    if (!user) return
    
    setLoading(true)
    setError("")
    
    try {
      const idToken = await user.getIdToken()
      const response = await fetch('/api/admin/vehicles', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        cache: 'no-store', // Ensure we get fresh data
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Create a more detailed error message
        let errorMessage = errorData.error || errorData.message || `Failed to fetch vehicles (${response.status})`
        
        // Add help URL if it's a Firestore API error
        if (errorData.error === 'Firestore API not enabled' && errorData.helpUrl) {
          errorMessage += `. Please enable Firestore API: ${errorData.helpUrl}`
        }
        
        // Include details if available
        if (errorData.details) {
          errorMessage += ` - ${errorData.details}`
        }
        
        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      // Ensure available field is properly boolean
      const vehiclesWithBooleans = (data.vehicles || []).map((v: any) => ({
        ...v,
        available: v.available === true || v.available === 'true' || v.available === 1,
      }))
      setVehicles(vehiclesWithBooleans)
    } catch (err: any) {
      console.error('Error fetching vehicles:', err)
      setError(err.message || 'Failed to load vehicles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [user])

  // Debounced save function
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const debouncedSave = (form: any) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      if (!user) {
        return;
      }
      
      setSaving(true);
      setSaveStatus("Saving...");
      
      try {
        const idToken = await user.getIdToken();
        const response = await fetch(`/api/admin/vehicles?id=${form.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify(form),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update vehicle');
        }
        
        setSaveStatus("Saved!");
        setTimeout(() => setSaveStatus(""), 1200);
        
        // Refresh the vehicle list
        const vehiclesResponse = await fetch('/api/admin/vehicles', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });
        if (vehiclesResponse.ok) {
          const data = await vehiclesResponse.json();
          setVehicles(data.vehicles || []);
        }
      } catch (err: any) {
        setSaveStatus(`Error: ${err.message}`);
        setTimeout(() => setSaveStatus(""), 3000);
      } finally {
        setSaving(false);
      }
    }, 800);
  }

  const handleEditClick = (vehicle: any) => {
    setEditingVehicle(vehicle)
    setEditForm({ ...vehicle })
    setImagePreview(vehicle.image_url || null)
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
    setImagePreview(null)
    setSaveStatus("")
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) {
      return
    }

    setUploadingImage(true)
    try {
      const idToken = await user.getIdToken()
      const formData = new FormData()
      formData.append('file', file)
      formData.append('vehicleId', editingVehicle?.id || 'temp')

      const response = await fetch('/api/admin/vehicles/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      setEditForm((prev: any) => ({ ...prev, image_url: data.url }))
      setImagePreview(data.url)
      setSaveStatus('Image uploaded! Saving...')
    } catch (err: any) {
      setSaveStatus(`Image upload failed: ${err.message}`)
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <AdminSidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 pt-16 lg:pt-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Vehicles</h1>
              <p className="text-gray-600">Manage your vehicle fleet</p>
            </div>
            <Link href="/admin/add-vehicle" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
              Add Vehicle
            </Link>
          </div>
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading vehicles...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Error Loading Vehicles</h3>
                <p className="text-sm text-red-700 mb-3">{error}</p>
                {error.includes('Firestore API not enabled') && (
                  <a
                    href="https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=readyaimgo-clients-temp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Enable Firestore API →
                  </a>
                )}
                <button
                  onClick={fetchVehicles}
                  className="ml-3 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="mb-4">No vehicles found.</p>
            <Link href="/admin/add-vehicle" className="text-blue-600 hover:underline">
              Add your first vehicle →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full bg-white rounded shadow">
              <thead className="hidden sm:table-header-group">
                <tr className="bg-gray-100">
                  <th className="py-2 px-2 sm:px-3 text-left font-bold text-gray-800 text-xs sm:text-sm">Make</th>
                  <th className="py-2 px-2 sm:px-3 text-left font-bold text-gray-800 text-xs sm:text-sm">Model</th>
                  <th className="py-2 px-2 sm:px-3 text-left font-bold text-gray-800 text-xs sm:text-sm">Year</th>
                  <th className="py-2 px-2 sm:px-3 text-left font-bold text-gray-800 text-xs sm:text-sm">Price/Day</th>
                  <th className="py-2 px-2 sm:px-3 text-left font-bold text-gray-800 text-xs sm:text-sm">Status</th>
                  <th className="py-2 px-2 sm:px-3 text-left font-bold text-gray-800 text-xs sm:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <>
                    {/* Mobile Card View */}
                    <tr key={`mobile-${v.id}`} className="sm:hidden border-t">
                      <td className="py-4 px-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">{v.year} {v.make} {v.model}</div>
                              <div className="text-sm text-gray-600">${v.price_per_day}/day</div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              v.available 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {v.available ? "Available" : "Unavailable"}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditClick(v)} 
                              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (!user || togglingVehicle === v.id) return
                                
                                setTogglingVehicle(v.id)
                                
                                try {
                                  const idToken = await user.getIdToken()
                                  const newAvailableStatus = !v.available
                                  
                                  setVehicles(prevVehicles => 
                                    prevVehicles.map(vehicle => 
                                      vehicle.id === v.id 
                                        ? { ...vehicle, available: newAvailableStatus }
                                        : vehicle
                                    )
                                  )
                                  
                                  const response = await fetch(`/api/admin/vehicles?id=${v.id}`, {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${idToken}`,
                                    },
                                    body: JSON.stringify({ available: newAvailableStatus }),
                                  })
                                  
                                  if (!response.ok) {
                                    throw new Error('Failed to update vehicle')
                                  }
                                  
                                  await fetchVehicles()
                                } catch (err) {
                                  console.error('Failed to toggle availability:', err)
                                  await fetchVehicles()
                                  alert('Failed to update vehicle availability. Please try again.')
                                } finally {
                                  setTogglingVehicle(null)
                                }
                              }}
                              disabled={togglingVehicle === v.id}
                              className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                                togglingVehicle === v.id
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : v.available
                                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {togglingVehicle === v.id ? '...' : (v.available ? "Unavailable" : "Available")}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                    {/* Desktop Table View */}
                    <tr key={`desktop-${v.id}`} className="hidden sm:table-row border-t">
                      <td className="py-2 px-2 sm:px-3 text-gray-900 text-xs sm:text-sm">{v.make || 'N/A'}</td>
                      <td className="py-2 px-2 sm:px-3 text-gray-900 text-xs sm:text-sm">{v.model || 'N/A'}</td>
                      <td className="py-2 px-2 sm:px-3 text-gray-900 text-xs sm:text-sm">{v.year || 'N/A'}</td>
                      <td className="py-2 px-2 sm:px-3 text-gray-900 text-xs sm:text-sm">${v.price_per_day || 0}</td>
                      <td className="py-2 px-2 sm:px-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          v.available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {v.available ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="py-2 px-2 sm:px-3">
                        <div className="flex gap-1 flex-wrap">
                        <button 
                          onClick={() => handleEditClick(v)} 
                          className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (!user || togglingVehicle === v.id) return
                            
                            setTogglingVehicle(v.id)
                            
                            try {
                              const idToken = await user.getIdToken()
                              const newAvailableStatus = !v.available
                              
                              // Optimistic update
                              setVehicles(prevVehicles => 
                                prevVehicles.map(vehicle => 
                                  vehicle.id === v.id 
                                    ? { ...vehicle, available: newAvailableStatus }
                                    : vehicle
                                )
                              )
                              
                              const response = await fetch(`/api/admin/vehicles?id=${v.id}`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${idToken}`,
                                },
                                body: JSON.stringify({ available: newAvailableStatus }),
                              })
                              
                              if (!response.ok) {
                                throw new Error('Failed to update vehicle')
                              }
                              
                              // Refresh the vehicle list to ensure consistency
                              await fetchVehicles()
                            } catch (err) {
                              console.error('Failed to toggle availability:', err)
                              // Revert optimistic update on error
                              await fetchVehicles()
                              alert('Failed to update vehicle availability. Please try again.')
                            } finally {
                              setTogglingVehicle(null)
                            }
                          }}
                          disabled={togglingVehicle === v.id}
                          className={`px-2 py-1 rounded text-xs transition-colors ${
                            togglingVehicle === v.id
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : v.available
                              ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                          title={v.available ? "Mark Unavailable" : "Mark Available"}
                        >
                          {togglingVehicle === v.id ? '...' : (v.available ? "Unavailable" : "Available")}
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Are you sure you want to remove "${v.make} ${v.model}" from circulation? This will hide it from the frontend.`)) return
                            if (!user || togglingVehicle === v.id) return
                            
                            setTogglingVehicle(v.id)
                            
                            try {
                              const idToken = await user.getIdToken()
                              
                              // Optimistic update
                              setVehicles(prevVehicles => 
                                prevVehicles.map(vehicle => 
                                  vehicle.id === v.id 
                                    ? { ...vehicle, available: false }
                                    : vehicle
                                )
                              )
                              
                              const response = await fetch(`/api/admin/vehicles?id=${v.id}`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${idToken}`,
                                },
                                body: JSON.stringify({ available: false }),
                              })
                              
                              if (!response.ok) {
                                throw new Error('Failed to update vehicle')
                              }
                              
                              // Refresh the vehicle list to ensure consistency
                              await fetchVehicles()
                            } catch (err) {
                              console.error('Failed to remove vehicle:', err)
                              // Revert optimistic update on error
                              await fetchVehicles()
                              alert('Failed to remove vehicle. Please try again.')
                            } finally {
                              setTogglingVehicle(null)
                            }
                          }}
                          disabled={togglingVehicle === v.id}
                          className={`px-2 py-1 rounded text-xs transition-colors ${
                            togglingVehicle === v.id
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                          title="Remove from Frontend"
                        >
                          {togglingVehicle === v.id ? '...' : 'Remove'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </main>
      </div>

      {/* Edit Modal */}
      {editingVehicle && editForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl p-4 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
            <button onClick={closeModal} className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-500 hover:text-black p-2 z-10">✕</button>
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 border-b pb-3">Edit Vehicle</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Make *</label>
                  <input type="text" name="make" value={editForm.make || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Model *</label>
                  <input type="text" name="model" value={editForm.model || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Year *</label>
                  <input type="number" name="year" value={editForm.year || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Price Per Day *</label>
                  <input type="number" name="price_per_day" value={editForm.price_per_day || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Category</label>
                  <input type="text" name="category" value={editForm.category || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Size</label>
                  <select name="size" value={editForm.size || "medium"} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm">
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Mileage</label>
                  <input type="number" name="mileage" value={editForm.mileage || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Transmission</label>
                  <select name="transmission" value={editForm.transmission || "Automatic"} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm">
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Location</label>
                  <input type="text" name="location" value={editForm.location || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Origin Address (for distance calculation)</label>
                  <input 
                    type="text" 
                    name="origin_address" 
                    value={editForm.origin_address || "3 Brewster Rd, Newark, NJ 07114"} 
                    onChange={handleEditChange} 
                    className="w-full border rounded px-3 py-2 text-gray-900 text-sm" 
                    placeholder="3 Brewster Rd, Newark, NJ 07114"
                  />
                  <p className="text-xs text-gray-500 mt-1">This is the pickup location used to calculate estimated miles to destination</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Insurance</label>
                  <input type="text" name="insurance" value={editForm.insurance || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Maintenance</label>
                  <input type="text" name="maintenance" value={editForm.maintenance || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Slug</label>
                  <input type="text" name="slug" value={editForm.slug || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Booking URL</label>
                  <input type="text" name="booking_url" value={editForm.booking_url || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm" />
                </div>
              </div>
              
              {/* Security Deposit Section */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Security Deposit Settings</h3>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={!!editForm.security_deposit_enabled}
                    onChange={(e) => setEditForm((prev: any) => ({ ...prev, security_deposit_enabled: e.target.checked }))}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-900">Enable Security Deposit</label>
                </div>
                {editForm.security_deposit_enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-900">Deposit Amount ($)</label>
                      <input
                        type="number"
                        value={editForm.security_deposit_amount || 250}
                        onChange={(e) => setEditForm((prev: any) => ({ ...prev, security_deposit_amount: parseFloat(e.target.value) || 250 }))}
                        className="w-full border rounded px-3 py-2 text-gray-900 text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-900">Days Before Pickup</label>
                      <input
                        type="number"
                        value={editForm.security_deposit_days_before || 1}
                        onChange={(e) => setEditForm((prev: any) => ({ ...prev, security_deposit_days_before: parseInt(e.target.value) || 1 }))}
                        className="w-full border rounded px-3 py-2 text-gray-900 text-sm"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-900">Release Days After Return</label>
                      <input
                        type="number"
                        value={editForm.security_deposit_release_days || 7}
                        onChange={(e) => setEditForm((prev: any) => ({ ...prev, security_deposit_release_days: parseInt(e.target.value) || 7 }))}
                        className="w-full border rounded px-3 py-2 text-gray-900 text-sm"
                        min="0"
                      />
                    </div>
                  </div>
                )}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1 text-gray-900">Cancellation Policy</label>
                  <select
                    value={editForm.cancellation_policy || "Flexible"}
                    onChange={(e) => setEditForm((prev: any) => ({ ...prev, cancellation_policy: e.target.value }))}
                    className="w-full border rounded px-3 py-2 text-gray-900 text-sm"
                  >
                    <option value="Flexible">Flexible</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Strict">Strict</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Description</label>
                <textarea name="description" value={editForm.description || ""} onChange={handleEditChange} className="w-full border rounded px-3 py-2 text-gray-900 text-sm" rows={3} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Image</label>
                <div className="space-y-2">
                  {imagePreview && (
                    <div className="relative w-full h-48 border rounded overflow-hidden">
                      <img src={imagePreview} alt="Vehicle preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                      <div className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm text-center disabled:opacity-50">
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </div>
                    </label>
                    <input
                      type="text"
                      name="image_url"
                      value={editForm.image_url || ""}
                      onChange={handleEditChange}
                      placeholder="Or paste image URL"
                      className="flex-1 border rounded px-3 py-2 text-gray-900 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Features (comma-separated)</label>
                <input
                  type="text"
                  name="features"
                  value={Array.isArray(editForm.features) ? editForm.features.join(', ') : editForm.features || ""}
                  onChange={(e) => {
                    const features = e.target.value.split(',').map(f => f.trim()).filter(f => f)
                    setEditForm((prev: any) => ({ ...prev, features }))
                  }}
                  className="w-full border rounded px-3 py-2 text-gray-900 text-sm"
                  placeholder="Bluetooth, Backup Camera, Cruise Control"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <input type="checkbox" name="available" checked={!!editForm.available} onChange={handleEditChange} className="mr-2" />
                  <label className="text-sm text-gray-900">Available</label>
                </div>
              </div>
            </form>
            <div className="mt-4 text-sm text-gray-500 min-h-[1.5em]">{saving ? saveStatus : saveStatus}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminVehiclesPage() {
  return (
    <AuthGuard allowedEmails={[...AUTHORIZED_ADMIN_EMAILS]}>
      <AdminVehiclesContent />
    </AuthGuard>
  )
} 