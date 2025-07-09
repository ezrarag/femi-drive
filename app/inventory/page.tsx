"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, X, Menu, ExternalLink, Calendar } from "lucide-react"

// Add type declaration for window.Outdoorsy
declare global {
  interface Window {
    Outdoorsy?: {
      color?: string
      Booking?: {
        load: () => void
      }
    }
  }
}

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200])
  const [selectedType, setSelectedType] = useState("all")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const [showBookingWidget, setShowBookingWidget] = useState(false)
  const [bookingVehicle, setBookingVehicle] = useState<any>(null)
  const [showInlineBooking, setShowInlineBooking] = useState<Record<string, boolean>>({})
  // Remove wheelbaseScriptLoaded state
  // Remove useEffect for script loading and cleanup
  // Remove useEffect for widget loading

  const vehicles = [
    {
      id: 1,
      make: "Volkswagen",
      model: "Passat",
      year: 2015,
      price: 45,
      wheelbaseId: "457237",
      image: "https://gfqhzuqckfxtzqawdcso.supabase.co/storage/v1/object/public/usethisfornow/femileasing/IMG_0698.jpeg",
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
      wheelbaseCheckoutUrl: "https://checkout.wheelbasepro.com/reserve/454552?locale=en-us", // Added for testing
    },
    {
      id: 2,
      make: "Ford",
      model: "Edge",
      year: 2014,
      price: 55,
      wheelbaseId: "457238",
      image: "https://gfqhzuqckfxtzqawdcso.supabase.co/storage/v1/object/public/usethisfornow/femileasing/IMG_0699.jpeg",
      mileage: "92K",
      transmission: "Automatic",
      location: "Jersey City, NJ",
      available: false,
      gigReady: true,
      type: "suv",
      category: "SUV",
      size: "medium",
      description: "Spacious SUV ideal for delivery services and passenger transport.",
      features: ["AWD", "Navigation", "Heated Seats", "Panoramic Roof"],
      insurance: "Full coverage included",
      maintenance: "Regular maintenance included",
      wheelbaseCheckoutUrl: "https://checkout.wheelbasepro.com/reserve/454552?locale=en-us", // Added for testing
    },
    {
      id: 3,
      make: "BMW",
      model: "328i xDrive",
      year: 2011,
      price: 50,
      wheelbaseId: "457239",
      image: "https://gfqhzuqckfxtzqawdcso.supabase.co/storage/v1/object/public/usethisfornow/femileasing/IMG_0701.jpeg",
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
      wheelbaseCheckoutUrl: "https://checkout.wheelbasepro.com/reserve/454552?locale=en-us", // Added for testing
    },
    {
      id: 4,
      make: "Chevy",
      model: "Equinox",
      year: 2013,
      price: 48,
      wheelbaseId: "457240",
      image: "https://gfqhzuqckfxtzqawdcso.supabase.co/storage/v1/object/public/usethisfornow/femileasing/IMG_0702.jpeg",
      mileage: "65K",
      transmission: "Automatic",
      location: "Elizabeth, NJ",
      available: false,
      gigReady: true,
      type: "suv",
      category: "SUV",
      size: "small",
      description: "Reliable compact SUV perfect for city driving and deliveries.",
      features: ["Fuel Efficient", "Cargo Space", "Easy Parking", "Reliable"],
      insurance: "Full coverage included",
      maintenance: "Regular maintenance included",
      wheelbaseCheckoutUrl: "https://checkout.wheelbasepro.com/reserve/454552?locale=en-us", // Added for testing
    },
    {
      id: 5,
      make: "Nissan",
      model: "Sentra",
      year: 2011,
      price: 42,
      wheelbaseId: "457241",
      image: "https://gfqhzuqckfxtzqawdcso.supabase.co/storage/v1/object/public/usethisfornow/femileasing/IMG_0703.jpeg",
      mileage: "89K",
      transmission: "CVT",
      location: "Paterson, NJ",
      available: false,
      gigReady: false,
      type: "sedan",
      category: "ECONOMY",
      size: "small",
      description: "Budget-friendly option for new drivers entering the gig economy.",
      features: ["Great MPG", "Compact Size", "Easy to Drive", "Low Maintenance"],
      insurance: "Full coverage included",
      maintenance: "Regular maintenance included",
      wheelbaseCheckoutUrl: "https://checkout.wheelbasepro.com/reserve/454552?locale=en-us", // Added for testing
    },
    {
      id: 6,
      make: "Dodge",
      model: "Charger",
      year: 2016,
      price: 65,
      wheelbaseId: "457242",
      image: "https://gfqhzuqckfxtzqawdcso.supabase.co/storage/v1/object/public/usethisfornow/femileasing/IMG_0704.jpeg",
      mileage: "71K",
      transmission: "Automatic",
      location: "Newark, NJ",
      available: true,
      gigReady: true,
      type: "sedan",
      category: "PERFORMANCE",
      size: "small",
      description: "Former Miami police cruiser, we converted it for civilian use. We have done upgrades that includes a fresh paint job and 19 inch rims You will enjoy the power and speed this",
      features: ["V6 Engine", "Sport Suspension", "Premium Interior", "Fast Acceleration"],
      insurance: "Full coverage included",
      maintenance: "Regular maintenance included",
      wheelbaseCheckoutUrl: "https://checkout.wheelbasepro.com/reserve/457237?locale=en-us", 
    },
    {
      id: 7,
      make: "Nissan",
      model: "Altima",
      year: 2035,
      price: 42,
      wheelbaseId: "457241",
      image: "https://gfqhzuqckfxtzqawdcso.supabase.co/storage/v1/object/public/usethisfornow/femileasing/IMG_3529-removebg-preview.png",
      mileage: "89K",
      transmission: "CVT",
      location: "Paterson, NJ",
      available: false,
      gigReady: false,
      type: "sedan",
      category: "ECONOMY",
      size: "small",
      description: "Budget-friendly option for new drivers entering the gig economy.",
      features: ["Great MPG", "Compact Size", "Easy to Drive", "Low Maintenance"],
      insurance: "Full coverage included",
      maintenance: "Regular maintenance included",
      wheelbaseCheckoutUrl: "https://checkout.wheelbasepro.com/reserve/454552?locale=en-us", // Added for testing
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

  // 2. For each vehicle, when the user clicks the "Click to Book" button, toggle a showInlineBooking[vehicle.id] state (already implemented)
  const toggleInlineBooking = (vehicleId) => {
    setShowInlineBooking((prev) => ({
      ...prev,
      [vehicleId]: !prev[vehicleId],
    }))
  }

  // 3. When showInlineBooking[vehicle.id] is true and vehicle.wheelbaseCheckoutUrl exists, render an inline <iframe> inside a container
  // Replace the old Wheelbase widget div with:
  // <div className="booking-iframe-container">
  //   <iframe
  //     src={vehicle.wheelbaseCheckoutUrl || 'https://checkout.wheelbasepro.com/reserve/454552?locale=en-us'}
  //     width="100%"
  //     height="600"
  //     frameBorder="0"
  //     allowFullScreen
  //     loading="lazy"
  //     title={`Book ${vehicle.make} ${vehicle.model}`}
  //   ></iframe>
  // </div>
  // ...
  // 4. Always render a visible fallback "Book on Wheelbase" button that opens vehicle.wheelbaseCheckoutUrl in a new tab
  // ...
  // <a
  //   href={vehicle.wheelbaseCheckoutUrl || 'https://checkout.wheelbasepro.com/reserve/454552?locale=en-us'}
  //   target="_blank"
  //   rel="noopener noreferrer"
  //   className="inline-block mt-2 text-blue-600 underline"
  // >
  //   Book on Wheelbase
  // </a>
  // ...
  // 5. Add a booking-iframe-container CSS class with a light shadow and rounded corners
  // ...
  // 6. Ensure the code is clean and commented clearly so it's easy to maintain
  // ...

  // Add the CSS class for iframe container (in a <style jsx> block or in your global CSS)
  // .booking-iframe-container {
  //   border-radius: 0.75rem;
  //   box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  //   overflow: hidden;
  //   background: #fff;
  //   margin-bottom: 1rem;
  // }

  // Handle card click - open booking unless clicking on details button
  const handleCardClick = (e: React.MouseEvent, vehicle: any) => {
    const isDetailsButton = (e.target as HTMLElement).closest('[data-action="details"]')

    if (!isDetailsButton && vehicle.available) {
      e.preventDefault()
      e.stopPropagation()
      toggleInlineBooking(vehicle.id)
    }
  }

  // Re-add openModal and closeModal for modal functionality
  const openModal = (vehicle: any) => {
    setSelectedVehicle(vehicle)
  }
  const closeModal = () => {
    setSelectedVehicle(null)
  }

  // Clean up script when component unmounts
  // Remove wheelbaseScriptLoaded state
  // Remove useEffect for script loading and cleanup
  // Remove useEffect for widget loading

  return (
    <div className="min-h-screen bg-gray-100 text-neutral-900">
      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6">
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
            Fleet
          </Link>
          <Link
            href="/services"
            className="nav-text px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-neutral-300 hover:bg-white transition-all"
          >
            Services
          </Link>
        </div>

        {/* Center Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="text-center">
            <div className="text-sm font-bold tracking-widest">FE</div>
            <div className="text-sm font-bold tracking-widest -mt-1">MI</div>
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
                    {cardNumber} {vehicle.make.toUpperCase()} {vehicle.model.toUpperCase()} - {vehicle.category}
                  </div>
                  <div
                    className={`relative w-full h-96 overflow-hidden rounded-lg ${vehicle.available ? "cursor-pointer" : "cursor-default"}`}
                    onClick={(e) => handleCardClick(e, vehicle)}
                  >
                    <Image
                      src={vehicle.image || "/placeholder.svg"}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      fill
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
                        data-action="details"
                        onClick={(e) => {
                          e.stopPropagation()
                          openModal(vehicle)
                        }}
                        className="px-4 py-2 bg-white/90 text-black rounded-full nav-text hover:bg-white transition-all"
                      >
                        DETAILS
                      </button>
                      {vehicle.available && (
                        <div className="px-4 py-2 bg-blue-600/90 text-white rounded-full nav-text flex items-center gap-2">
                          {isBookingOpen ? (
                            <>
                              CLOSE BOOKING
                              <X className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              CLICK TO BOOK
                              <Calendar className="w-3 h-3" />
                            </>
                          )}
                        </div>
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

                      {/* Inline booking iframe if available */}
                      {vehicle.wheelbaseCheckoutUrl ? (
                        <div className="booking-iframe-container">
                          <iframe
                            src={vehicle.wheelbaseCheckoutUrl}
                            width="100%"
                            height="600"
                            frameBorder="0"
                            allowFullScreen
                            loading="lazy"
                            title={`Book ${vehicle.make} ${vehicle.model}`}
                          ></iframe>
                        </div>
                      ) : (
                        <div className="booking-iframe-container">
                          <iframe
                            src="https://checkout.wheelbasepro.com/reserve/454552?locale=en-us"
                            width="100%"
                            height="600"
                            frameBorder="0"
                            allowFullScreen
                            loading="lazy"
                            title={`Book ${vehicle.make} ${vehicle.model}`}
                          ></iframe>
                        </div>
                      )}
                      {/* Always show fallback button */}
                      <a
                        href={vehicle.wheelbaseCheckoutUrl || 'https://checkout.wheelbasepro.com/reserve/454552?locale=en-us'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-blue-600 underline"
                      >
                        Book on Wheelbase
                      </a>
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
                    <div
                      className={`relative w-full h-64 aspect-video overflow-hidden rounded-lg bg-gray-100 ${vehicle.available ? "cursor-pointer" : "cursor-default"}`}
                      onClick={(e) => handleCardClick(e, vehicle)}
                    >
                      <Image
                        src={vehicle.image || "/placeholder.svg"}
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        fill
                        className="object-cover object-center w-full h-full aspect-video"
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
                          data-action="details"
                          onClick={(e) => {
                            e.stopPropagation()
                            openModal(vehicle)
                          }}
                          className="px-3 py-2 bg-white/90 text-black rounded-full nav-text hover:bg-white transition-all text-xs"
                        >
                          DETAILS
                        </button>
                        {vehicle.available && (
                          <div className="px-3 py-2 bg-blue-600/90 text-white rounded-full nav-text flex items-center gap-1 text-xs">
                            {isBookingOpen ? (
                              <>
                                CLOSE
                                <X className="w-3 h-3" />
                              </>
                            ) : (
                              <>
                                CLICK TO BOOK
                                <Calendar className="w-3 h-3" />
                              </>
                            )}
                          </div>
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
                          {/* Inline booking iframe if available */}
                          {vehicle.wheelbaseCheckoutUrl ? (
                            <div className="booking-iframe-container">
                              <iframe
                                src={vehicle.wheelbaseCheckoutUrl}
                                width="100%"
                                height="600"
                                frameBorder="0"
                                allowFullScreen
                                loading="lazy"
                                title={`Book ${vehicle.make} ${vehicle.model}`}
                              ></iframe>
                            </div>
                          ) : (
                            <div className="booking-iframe-container">
                              <iframe
                                src="https://checkout.wheelbasepro.com/reserve/454552?locale=en-us"
                                width="100%"
                                height="600"
                                frameBorder="0"
                                allowFullScreen
                                loading="lazy"
                                title={`Book ${vehicle.make} ${vehicle.model}`}
                              ></iframe>
                            </div>
                          )}
                          {/* Always show fallback button */}
                          <a
                            href={vehicle.wheelbaseCheckoutUrl || 'https://checkout.wheelbasepro.com/reserve/454552?locale=en-us'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-blue-600 underline"
                          >
                            Book on Wheelbase
                          </a>
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
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fadein"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky close button for mobile/desktop */}
            <button
              onClick={closeModal}
              className="sticky top-4 right-4 z-10 float-right p-2 bg-white/90 rounded-full hover:bg-white transition-all shadow-md"
              style={{ position: 'absolute', top: 16, right: 16 }}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full aspect-video bg-gray-100 rounded-t-2xl overflow-hidden">
              <Image
                src={selectedVehicle.image || "/placeholder.svg"}
                alt={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
                fill
                className="object-cover object-center w-full h-full aspect-video"
              />
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
                  {selectedVehicle.features.map((feature: string, index: number) => (
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
                  onClick={() => {
                    closeModal()
                    // No longer needed as wheelbaseCheckoutUrl is handled by iframe or fallback
                  }}
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
            {/* Inline booking iframe if toggled open */}
            {showInlineBooking[selectedVehicle.id] && (
              <div className="flex flex-col items-center justify-center w-full my-6">
                <div className="w-full max-w-3xl h-[600px] rounded-xl shadow-lg transition-opacity duration-300 bg-white overflow-hidden animate-fadein">
                  <iframe
                    src={selectedVehicle.wheelbaseCheckoutUrl || 'https://checkout.wheelbasepro.com/reserve/454552?locale=en-us'}
                    width="100%"
                    height="600"
                    frameBorder="0"
                    allowFullScreen
                    loading="lazy"
                    title={`Book ${selectedVehicle.make} ${selectedVehicle.model}`}
                    className="w-full h-full rounded-xl"
                  ></iframe>
                </div>
                <a
                  href={selectedVehicle.wheelbaseCheckoutUrl || 'https://checkout.wheelbasepro.com/reserve/454552?locale=en-us'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-blue-600 underline"
                >
                  Book on Wheelbase
                </a>
              </div>
            )}
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
