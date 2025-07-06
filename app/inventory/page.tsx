"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, X, Menu, ExternalLink, Calendar } from "lucide-react"

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState([0, 200])
  const [selectedType, setSelectedType] = useState("all")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [showBookingWidget, setShowBookingWidget] = useState(false)
  const [bookingVehicle, setBookingVehicle] = useState(null)
  const [showInlineBooking, setShowInlineBooking] = useState({})
  const [wheelbaseScriptLoaded, setWheelbaseScriptLoaded] = useState(false)

  const vehicles = [
    {
      id: 1,
      make: "Volkswagen",
      model: "Passat",
      year: 2015,
      price: 45,
      wheelbaseId: "VW_PASSAT_2015_001", // Added wheelbaseId for each vehicle
      image: "https://gfqhzuqckfxtzqawdcso.supabase.co/storage/v1/object/public/usethisfornow//IMG_0698.jpeg",
      mileage: "85K",
      transmission: "Automatic",
      location: "Newark, NJ",
      available: true,
      gigReady: true,
      type: "sedan",
      category: "SEDAN",
      size: "large",
      description: "Perfect for rideshare with excellent fuel economy and comfortable interior.",
      features: ["Bluetooth", "Backup Camera", "Cruise Control", "Power Windows"],
      insurance: "Full coverage included",
      maintenance: "Regular maintenance included",
    },
    {
      id: 2,
      make: "Ford",
      model: "Edge",
      year: 2014,
      price: 55,
      wheelbaseId: "FORD_EDGE_2014_002",
      image: "https://gfqhzuqckfxtzqawdcso.supabase.co/storage/v1/object/public/usethisfornow//IMG_0699.jpeg",
      mileage: "92K",
      transmission: "Automatic",
      location: "Jersey City, NJ",
      available: true,
      gigReady: true,
      type: "suv",
      category: "SUV",
      size: "medium",
      description: "Spacious SUV ideal for delivery services and passenger transport.",
      features: ["AWD", "Navigation", "Heated Seats", "Panoramic Roof"],
      insurance: "Full coverage included",
      maintenance: "Regular maintenance included",
    },
    {
      id: 3,
      make: "BMW",
      model: "328i xDrive",
      year: 2011,
      price: 50,
      wheelbaseId: "BMW_328I_2011_003",
      image: "https://gfqhzuqckfxtzqawdcso.supabase.co/storage/v1/object/public/usethisfornow//IMG_0701.jpeg",
      mileage: "78K",
      transmission: "Automatic",
      location: "Newark, NJ",
      available: false,
      gigReady: true,
      type: "sedan",
      category: "LUXURY",
      size: "medium",
      description: "Premium luxury sedan for high-end rideshare services.",
      features: ["Leather Seats", "Premium Sound", "Sport Mode", "All-Wheel Drive"],
      insurance: "Full coverage included",
      maintenance: "Regular maintenance included",
    },
    {
      id: 4,
      make: "Chevy",
      model: "Equinox",
      year: 2013,
      price: 48,
      wheelbaseId: "CHEVY_EQUINOX_2013_004",
      image: "https://gfqhzuqckfxtzqawdcso.supabase.co/storage/v1/object/public/usethisfornow//IMG_0702.jpeg",
      mileage: "65K",
      transmission: "Automatic",
      location: "Elizabeth, NJ",
      available: true,
      gigReady: true,
      type: "suv",
      category: "SUV",
      size: "small",
      description: "Reliable compact SUV perfect for city driving and deliveries.",
      features: ["Fuel Efficient", "Cargo Space", "Easy Parking", "Reliable"],
      insurance: "Full coverage included",
      maintenance: "Regular maintenance included",
    },
    {
      id: 5,
      make: "Nissan",
      model: "Sentra",
      year: 2011,
      price: 42,
      wheelbaseId: "NISSAN_SENTRA_2011_005",
      image: "https://gfqhzuqckfxtzqawdcso.supabase.co/storage/v1/object/public/usethisfornow//IMG_0703.jpeg",
      mileage: "89K",
      transmission: "CVT",
      location: "Paterson, NJ",
      available: true,
      gigReady: false,
      type: "sedan",
      category: "ECONOMY",
      size: "small",
      description: "Budget-friendly option for new drivers entering the gig economy.",
      features: ["Great MPG", "Compact Size", "Easy to Drive", "Low Maintenance"],
      insurance: "Full coverage included",
      maintenance: "Regular maintenance included",
    },
    {
      id: 6,
      make: "Dodge",
      model: "Charger",
      year: 2016,
      price: 52,
      wheelbaseId: "DODGE_CHARGER_2016_006",
      image: "https://gfqhzuqckfxtzqawdcso.supabase.co/storage/v1/object/public/usethisfornow//IMG_0704.jpeg",
      mileage: "71K",
      transmission: "Automatic",
      location: "Newark, NJ",
      available: true,
      gigReady: true,
      type: "sedan",
      category: "PERFORMANCE",
      size: "small",
      description: "Powerful sedan with impressive performance and style.",
      features: ["V6 Engine", "Sport Suspension", "Premium Interior", "Fast Acceleration"],
      insurance: "Full coverage included",
      maintenance: "Regular maintenance included",
    },
  ]

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPrice = vehicle.price >= priceRange[0] && vehicle.price <= priceRange[1]
    const matchesType = selectedType === "all" || vehicle.type === selectedType

    return matchesSearch && matchesPrice && matchesType
  })

  // Load Wheelbase script once
  useEffect(() => {
    if (!wheelbaseScriptLoaded && !document.querySelector('script[src*="wheelbase.min.js"]')) {
      const script = document.createElement("script")
      script.src = "https://d3cuf6g1arkgx6.cloudfront.net/sdk/wheelbase.min.js"
      script.async = true
      script.onload = () => {
        setWheelbaseScriptLoaded(true)
      }
      document.head.appendChild(script)
    }
  }, [wheelbaseScriptLoaded])

  const openModal = (vehicle) => {
    setSelectedVehicle(vehicle)
  }

  const closeModal = () => {
    setSelectedVehicle(null)
  }

  const toggleInlineBooking = (vehicleId) => {
    setShowInlineBooking((prev) => ({
      ...prev,
      [vehicleId]: !prev[vehicleId],
    }))
  }

  const openBookingWidget = (vehicle) => {
    setBookingVehicle(vehicle)
    setShowBookingWidget(true)
  }

  const closeBookingWidget = () => {
    setShowBookingWidget(false)
    setBookingVehicle(null)
  }

  const openWheelbaseReservation = (vehicle) => {
    const reservationUrl = `https://checkout.wheelbasepro.com/reserve?owner_id=4321962`
    window.open(reservationUrl, "_blank", "noopener,noreferrer")
  }

  // Clean up script when component unmounts
  useEffect(() => {
    return () => {
      const script = document.querySelector('script[src*="wheelbase.min.js"]')
      if (script) {
        script.remove()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 text-neutral-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex gap-4">
          <Link
            href="/"
            className="nav-text px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-neutral-300 hover:bg-white transition-all"
          >
            Home
          </Link>
          <Link
            href="/inventory"
            className="nav-text px-4 py-2 bg-neutral-900 text-white rounded-full border border-neutral-900 transition-all"
          >
            Works
          </Link>
          <Link
            href="/services"
            className="nav-text px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-neutral-300 hover:bg-white transition-all"
          >
            Archive
          </Link>
        </div>

        {/* Center Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="text-center">
            <div className="text-sm font-bold tracking-widest">MI</div>
            <div className="text-sm font-bold tracking-widest -mt-1">KK</div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/about"
            className="nav-text px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-neutral-300 hover:bg-white transition-all"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="nav-text px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-neutral-300 hover:bg-white transition-all"
          >
            Contact
          </Link>
        </div>
      </nav>

      {/* Header Section */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="display-heading text-6xl md:text-8xl">FLEET</h1>
          <h2 className="display-heading text-6xl md:text-8xl">OVERVIEW</h2>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="px-6 pb-32">
        <div className="max-w-7xl mx-auto space-y-8">
          {filteredVehicles.map((vehicle, index) => {
            const cardNumber = String(index + 1).padStart(2, "0")
            const isBookingOpen = showInlineBooking[vehicle.id]

            if (vehicle.size === "large") {
              return (
                <div key={vehicle.id} className="group">
                  <div className="label-text text-neutral-600 mb-4">
                    {cardNumber} {vehicle.make.toUpperCase()} {vehicle.model.toUpperCase()} - {vehicle.category}{" "}
                    {vehicle.category}
                  </div>
                  <div className="relative w-full h-96 overflow-hidden rounded-lg cursor-pointer">
                    <Image
                      src={vehicle.image || "/placeholder.svg"}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      width={1920}
                      height={1080}
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {vehicle.gigReady && (
                      <div className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white label-text rounded-full">
                        GIG READY
                      </div>
                    )}
                    <div
                      className={`absolute top-4 right-4 px-3 py-1 label-text rounded-full ${
                        vehicle.available ? "bg-green-500 text-white" : "bg-red-500 text-white"
                      }`}
                    >
                      {vehicle.available ? "AVAILABLE" : "RENTED"}
                    </div>
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button
                        onClick={() => openModal(vehicle)}
                        className="px-4 py-2 bg-white/90 text-black rounded-full nav-text hover:bg-white transition-all"
                      >
                        DETAILS
                      </button>
                      {vehicle.available && (
                        <button
                          onClick={() => toggleInlineBooking(vehicle.id)}
                          className={`px-4 py-2 rounded-full nav-text transition-all flex items-center gap-2 ${
                            isBookingOpen
                              ? "bg-red-600 text-white hover:bg-red-700"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {isBookingOpen ? (
                            <>
                              CLOSE BOOKING
                              <X className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              BOOK NOW
                              <Calendar className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline Booking Widget for Large Cards */}
                  {isBookingOpen && vehicle.available && (
                    <div className="mt-6 bg-white rounded-lg border border-neutral-200 p-6 shadow-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="display-heading text-xl">
                          Book {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                        <button
                          onClick={() => toggleInlineBooking(vehicle.id)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="min-h-[400px]">
                        {wheelbaseScriptLoaded ? (
                          <div
                            className="wheelbase-vehicle-embed"
                            data-owner="4321962"
                            data-vehicle={vehicle.wheelbaseId}
                            data-color="1b4a8f"
                            data-calendar="true"
                          ></div>
                        ) : (
                          <div className="flex items-center justify-center h-64 text-neutral-500">
                            <div className="text-center">
                              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                              <p className="body-text">Loading booking system...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            return null
          })}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredVehicles
              .filter((v) => v.size === "medium" || v.size === "small")
              .map((vehicle, index) => {
                const cardNumber = String(filteredVehicles.findIndex((v) => v.id === vehicle.id) + 1).padStart(2, "0")
                const isBookingOpen = showInlineBooking[vehicle.id]

                return (
                  <div key={vehicle.id} className="group">
                    <div className="label-text text-neutral-600 mb-4">
                      {cardNumber} {vehicle.make.toUpperCase()} - {vehicle.model.toUpperCase()} {vehicle.category}
                    </div>
                    <div className="relative w-full h-64 overflow-hidden rounded-lg cursor-pointer">
                      <Image
                        src={vehicle.image || "/placeholder.svg"}
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        width={800}
                        height={600}
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {vehicle.gigReady && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white label-text rounded-full">
                          GIG READY
                        </div>
                      )}
                      <div
                        className={`absolute top-4 right-4 px-3 py-1 label-text rounded-full ${
                          vehicle.available ? "bg-green-500 text-white" : "bg-red-500 text-white"
                        }`}
                      >
                        {vehicle.available ? "AVAILABLE" : "RENTED"}
                      </div>
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <button
                          onClick={() => openModal(vehicle)}
                          className="px-3 py-2 bg-white/90 text-black rounded-full nav-text hover:bg-white transition-all text-xs"
                        >
                          DETAILS
                        </button>
                        {vehicle.available && (
                          <button
                            onClick={() => toggleInlineBooking(vehicle.id)}
                            className={`px-3 py-2 rounded-full nav-text transition-all flex items-center gap-1 text-xs ${
                              isBookingOpen
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            {isBookingOpen ? (
                              <>
                                CLOSE
                                <X className="w-3 h-3" />
                              </>
                            ) : (
                              <>
                                BOOK
                                <Calendar className="w-3 h-3" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline Booking Widget for Medium/Small Cards */}
                    {isBookingOpen && vehicle.available && (
                      <div className="mt-4 bg-white rounded-lg border border-neutral-200 p-4 shadow-lg">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="display-heading text-lg">
                            Book {vehicle.year} {vehicle.make} {vehicle.model}
                          </h3>
                          <button
                            onClick={() => toggleInlineBooking(vehicle.id)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="min-h-[350px]">
                          {wheelbaseScriptLoaded ? (
                            <div
                              className="wheelbase-vehicle-embed"
                              data-owner="4321962"
                              data-vehicle={vehicle.wheelbaseId}
                              data-color="1b4a8f"
                              data-calendar="true"
                            ></div>
                          ) : (
                            <div className="flex items-center justify-center h-48 text-neutral-500">
                              <div className="text-center">
                                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                                <p className="body-text text-sm">Loading booking system...</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
          </div>

          {filteredVehicles.length === 0 && (
            <div className="text-center py-16">
              <p className="body-text text-neutral-600">No vehicles match your search criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Details Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64">
              <Image
                src={selectedVehicle.image || "/placeholder.svg"}
                alt={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
                fill
                className="object-cover rounded-t-2xl"
              />
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="display-heading text-2xl mb-2">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </h2>
                  <p className="body-text text-neutral-600">{selectedVehicle.description}</p>
                </div>
                <div className="text-right">
                  <div className="display-heading text-3xl">${selectedVehicle.price}</div>
                  <div className="label-text text-neutral-600">per day</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="label-text text-neutral-600 mb-1">Mileage</div>
                  <div className="body-text">{selectedVehicle.mileage} miles</div>
                </div>
                <div>
                  <div className="label-text text-neutral-600 mb-1">Transmission</div>
                  <div className="body-text">{selectedVehicle.transmission}</div>
                </div>
                <div>
                  <div className="label-text text-neutral-600 mb-1">Location</div>
                  <div className="body-text">{selectedVehicle.location}</div>
                </div>
                <div>
                  <div className="label-text text-neutral-600 mb-1">Status</div>
                  <div className={`body-text ${selectedVehicle.available ? "text-green-600" : "text-red-600"}`}>
                    {selectedVehicle.available ? "Available" : "Rented"}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="label-text text-neutral-600 mb-2">Features</div>
                <div className="grid grid-cols-2 gap-2">
                  {selectedVehicle.features.map((feature, index) => (
                    <div key={index} className="body-text">
                      • {feature}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <span className="label-text text-neutral-600">Insurance: </span>
                  <span className="body-text">{selectedVehicle.insurance}</span>
                </div>
                <div>
                  <span className="label-text text-neutral-600">Maintenance: </span>
                  <span className="body-text">{selectedVehicle.maintenance}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    closeModal()
                    toggleInlineBooking(selectedVehicle.id)
                  }}
                  disabled={!selectedVehicle.available}
                  className={`flex-1 py-3 rounded-lg nav-text transition-all flex items-center justify-center gap-2 ${
                    selectedVehicle.available
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                  }`}
                >
                  {selectedVehicle.available ? (
                    <>
                      Book Inline
                      <Calendar className="w-4 h-4" />
                    </>
                  ) : (
                    "Currently Unavailable"
                  )}
                </button>
                <button
                  onClick={() => openWheelbaseReservation(selectedVehicle)}
                  disabled={!selectedVehicle.available}
                  className={`flex-1 py-3 rounded-lg nav-text transition-all flex items-center justify-center gap-2 ${
                    selectedVehicle.available
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                  }`}
                >
                  {selectedVehicle.available ? (
                    <>
                      Book on Wheelbase
                      <ExternalLink className="w-4 h-4" />
                    </>
                  ) : (
                    "Currently Unavailable"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Menu Overlay */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-3 px-6 py-3 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700 transition-all"
        >
          <span className="nav-text font-medium">ALL VEHICLES</span>
          {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Filter Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setIsMenuOpen(false)}>
          <div
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="display-heading text-2xl">Filter Vehicles</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="label-text block mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search by make or model..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="body-text w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="label-text block mb-2">Vehicle Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="body-text w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-500"
                >
                  <option value="all">All Types</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="label-text block mb-2">
                  Daily Rate: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>$0</span>
                    <span>$200</span>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-full py-3 bg-neutral-900 text-white rounded-lg nav-text hover:bg-neutral-800 transition-all"
              >
                Apply Filters ({filteredVehicles.length} vehicles)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
