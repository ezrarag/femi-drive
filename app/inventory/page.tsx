"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, X, Menu, ExternalLink, User, Calendar, Heart } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";

// import { toast } from "sonner";
// import CheckoutModal from "@/components/CheckoutModal";

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
  const [selectedType, setSelectedType] = useState("available")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  // Remove unused state variables

  // Remove static vehicles array
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loadingVehicles, setLoadingVehicles] = useState(true)
  const [fetchError, setFetchError] = useState("")


  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  // COMMENTED OUT: All booking-related state variables
  // const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  // const [bookingForm, setBookingForm] = useState({ start_date: "", end_date: "" });
  // const [bookingLoading, setBookingLoading] = useState(false);
  // const [bookingError, setBookingError] = useState("");
  // const [bookingSuccess, setBookingSuccess] = useState(false);
  // const [showVehicleDetails, setShowVehicleDetails] = useState(false);

  // COMMENTED OUT: Add state for inline booking form
  // const [showInlineBooking, setShowInlineBooking] = useState(false);

  // Add state for saved vehicles
  const [savedVehicleIds, setSavedVehicleIds] = useState<string[]>([]);

  // COMMENTED OUT: Debug logging for modal state

  // Function to get Wheelbase checkout URL based on vehicle make and model
  const getWheelbaseUrl = (vehicle: any): string => {
    const make = vehicle.make?.toLowerCase()
    const model = vehicle.model?.toLowerCase()
    
    // Map specific vehicles to their Wheelbase URLs
    if (make === 'dodge' && model === 'charger') {
      return 'https://checkout.wheelbasepro.com/reserve/457237?locale=en-us'
    } else if (make === 'nissan' && model === 'altima') {
      return 'https://checkout.wheelbasepro.com/reserve/463737?locale=en-us'
    } else if (make === 'volkswagen' && model === 'passat') {
      return 'https://checkout.wheelbasepro.com/reserve/454552?locale=en-us'
    }
    
    // Default fallback URL (you can change this to a general booking page)
    return 'https://checkout.wheelbasepro.com'
  }

  // Function to handle booking redirect
  const handleBookNow = (vehicle: any) => {
    const wheelbaseUrl = getWheelbaseUrl(vehicle)
    window.open(wheelbaseUrl, '_blank')
  }

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoadingVehicles(true)
      setFetchError("")
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("make", { ascending: true })
      if (error) {
        setFetchError(error.message)
        setVehicles([])
      } else {
        setVehicles(data || [])
      }
      setLoadingVehicles(false)
    }
    
    // Only fetch vehicles once on component mount
    fetchVehicles()
  }, []) // Remove user dependency to prevent re-fetching

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      (vehicle.make?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (vehicle.model?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    const matchesPrice = vehicle.price_per_day >= priceRange[0] && vehicle.price_per_day <= priceRange[1]
    let matchesType = true
    if (selectedType === "available") {
      matchesType = vehicle.available === true
    } else if (selectedType !== "all") {
      matchesType = vehicle.type === selectedType
    }
    return matchesSearch && matchesPrice && matchesType
  })

  // COMMENTED OUT: Handle card click - open booking unless clicking on details button
  // const handleCardClick = (e: React.MouseEvent, vehicle: any) => {
  //   const isDetailsButton = (e.target as HTMLElement).closest('[data-action="details"]')

  //   if (!isDetailsButton && vehicle.available) {
  //     e.preventDefault()
  //     e.stopPropagation()
  //     // Instead of toggleInlineBooking, open the booking modal directly
  //     openModal(vehicle)
  //   }
  // }

  // COMMENTED OUT: Re-add openModal and closeModal for modal functionality
  // const openModal = (vehicle: any) => {
  //   setSelectedVehicle(vehicle)
  // }
  // const closeModal = () => {
  //   setSelectedVehicle(null)
  //   setShowInlineBooking(false)
  // }

  // Toggle favorite status for a vehicle
  const toggleFavorite = (vehicleId: string) => {
    setSavedVehicleIds(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId)
      } else {
        return [...prev, vehicleId]
      }
    })
  }

  // COMMENTED OUT: All booking form handling functions
  // const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setBookingForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  // };
  // const handleBookingSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
    
  //   if (!bookingForm.start_date || !bookingForm.end_date) {
  //     setBookingError("Please select start and end dates.");
  //     return;
  //   }
    
  //   // Show checkout modal - authentication will happen there
  //   setShowCheckoutModal(true);
  //   // Don't close inline booking yet - let CheckoutModal handle it
  // };

  // COMMENTED OUT: Clean up script when component unmounts
  // Remove wheelbaseScriptLoaded state
  // Remove useEffect for script loading and cleanup
  // Remove useEffect for widget loading

  return (
    <div className="min-h-screen bg-gray-100 text-neutral-900">
      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-4 sm:p-6">
        <div className="flex gap-2 sm:gap-4">
          <Link
            href="/"
            className="nav-text px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-neutral-300 hover:bg-white transition-all text-xs sm:text-sm"
          >
            Home
          </Link>
          <Link
            href="/inventory"
            className="nav-text px-3 sm:px-4 py-2 bg-neutral-900 text-white rounded-full border border-neutral-900 transition-all text-xs sm:text-sm"
          >
            Fleet
          </Link>
          <Link
            href="/services"
            className="nav-text px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-neutral-300 hover:bg-white transition-all text-xs sm:text-sm"
          >
            Services
          </Link>
        </div>

        {/* Center Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="text-center">
            <div className="text-xs sm:text-sm font-bold tracking-widest">FE</div>
            <div className="text-xs sm:text-sm font-bold tracking-widest -mt-1">MI</div>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-4 items-center relative">
          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="nav-text px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-neutral-300 hover:bg-white transition-all font-medium text-xs sm:text-sm"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              aria-controls="main-menu-dropdown"
              type="button"
            >
              Menu
            </button>
            {menuOpen && (
              <div
                id="main-menu-dropdown"
                className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-neutral-200 z-50"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <Link
                  href="/about"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-t-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-b-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>
            )}
          </div>
          {/* User/Login Button */}
          <button
            onClick={() => router.push("/login")}
            className="nav-text px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-neutral-300 hover:bg-white transition-all flex items-center gap-2 text-xs sm:text-sm"
            aria-label="Login"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Login</span>
          </button>
        </div>
      </nav>

      {/* Header Section */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <h1 className="display-heading text-4xl sm:text-6xl md:text-8xl">FLEET</h1>
          <h2 className="display-heading text-4xl sm:text-6xl md:text-8xl">OVERVIEW</h2>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="px-4 sm:px-6 pb-32">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {loadingVehicles ? (
            <div className="text-center py-16">
              <p className="body-text text-neutral-600">
                Loading vehicles...
              </p>
            </div>
          ) : fetchError ? (
            <div className="text-center py-16">
              <p className="body-text text-red-600">{fetchError}</p>
            </div>
          ) : (
            filteredVehicles.map((vehicle, index) => {
              const cardNumber = String(index + 1).padStart(2, "0")

              if (vehicle.size === "large") {
                return (
                  <div key={vehicle.id} className="group" data-vehicle-id={vehicle.id}>
                    <div className="label-text text-neutral-600 mb-3 sm:mb-4 text-xs sm:text-sm">
                      {cardNumber} {vehicle.make.toUpperCase()} {vehicle.model.toUpperCase()} - {vehicle.category}
                    </div>
                    <div
                      className={`relative w-full h-64 sm:h-80 md:h-96 overflow-hidden rounded-lg ${vehicle.available ? "cursor-pointer" : "cursor-default"}`}
                      // COMMENTED OUT: onClick={(e) => handleCardClick(e, vehicle)}
                    >
                      <Image
                        src={vehicle.image_url || "/placeholder.svg"}
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex gap-1 sm:gap-2">
                        {vehicle.gigReady && (
                          <div className="px-2 sm:px-3 py-1 bg-green-500 text-white label-text rounded-full text-xs">GIG READY</div>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(vehicle.id) }}
                          className="p-1 rounded-full bg-white/80 hover:bg-red-100 border border-neutral-300 transition-all"
                          aria-label={savedVehicleIds.includes(vehicle.id) ? "Unsave vehicle" : "Save vehicle"}
                        >
                          <Heart className={savedVehicleIds.includes(vehicle.id) ? "w-4 h-4 sm:w-5 sm:w-5 text-red-500 fill-red-500" : "w-4 h-4 sm:w-5 sm:w-5 text-neutral-400"} fill={savedVehicleIds.includes(vehicle.id) ? "#ef4444" : "none"} />
                        </button>
                      </div>
                      <div
                        className={`absolute top-2 sm:top-4 right-2 sm:right-4 px-2 sm:px-3 py-1 label-text rounded-full text-xs ${
                          vehicle.available ? "bg-green-500 text-white" : "bg-red-500 text-white"
                        }`}
                      >
                        {vehicle.available ? "AVAILABLE" : "RENTED"}
                      </div>
                      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 flex gap-1 sm:gap-2">
                        <button
                          data-action="details"
                          onClick={(e) => {
                            e.stopPropagation()
                            // COMMENTED OUT: openModal(vehicle)
                          }}
                          className="px-2 sm:px-4 py-1 sm:py-2 bg-white/90 text-black rounded-full nav-text hover:bg-white transition-all text-xs sm:text-sm"
                        >
                          DETAILS
                        </button>
                        {vehicle.available && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // COMMENTED OUT: openModal(vehicle);
                              // NEW: Redirect to Wheelbase checkout
                              handleBookNow(vehicle);
                            }}
                            className="px-2 sm:px-4 py-1 sm:py-2 bg-blue-600/90 text-white rounded-full nav-text flex items-center gap-1 text-xs sm:text-sm hover:bg-blue-700 transition-colors cursor-pointer"
                          >
                            <Calendar className="w-3 h-3" />
                            BOOK
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }

              return null
            })
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            {filteredVehicles
              .filter((v) => v.size === "medium" || v.size === "small")
              .map((vehicle, index) => {
                const cardNumber = String(filteredVehicles.findIndex((v) => v.id === vehicle.id) + 1).padStart(2, "0")

                return (
                  <div key={vehicle.id} className="group" data-vehicle-id={vehicle.id}>
                    <div className="label-text text-neutral-600 mb-3 sm:mb-4 text-xs sm:text-sm">
                      {cardNumber} {vehicle.make.toUpperCase()} - {vehicle.model.toUpperCase()} {vehicle.category}
                    </div>
                    <div
                      className={`relative w-full h-48 sm:h-64 aspect-video overflow-hidden rounded-lg bg-gray-100 ${vehicle.available ? "cursor-pointer" : "cursor-default"}`}
                      // COMMENTED OUT: onClick={(e) => handleCardClick(e, vehicle)}
                    >
                      <Image
                        src={vehicle.image_url || "/placeholder.svg"}
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        fill
                        className="object-cover object-center w-full h-full aspect-video"
                      />
                      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex gap-1 sm:gap-2">
                        {vehicle.gigReady && (
                          <div className="px-2 sm:px-3 py-1 bg-green-500 text-white label-text rounded-full text-xs">GIG READY</div>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(vehicle.id) }}
                          className="p-1 rounded-full bg-white/80 hover:bg-red-100 border border-neutral-300 transition-all"
                          aria-label={savedVehicleIds.includes(vehicle.id) ? "Unsave vehicle" : "Save vehicle"}
                        >
                          <Heart className={savedVehicleIds.includes(vehicle.id) ? "w-4 h-4 sm:w-5 sm:w-5 text-red-500 fill-red-500" : "w-4 h-4 sm:w-5 sm:w-5 text-neutral-400"} fill={savedVehicleIds.includes(vehicle.id) ? "#ef4444" : "none"} />
                        </button>
                      </div>
                      <div
                        className={`absolute top-2 sm:top-4 right-2 sm:right-4 px-2 sm:px-3 py-1 label-text rounded-full text-xs ${
                          vehicle.available ? "bg-green-500 text-white" : "bg-red-500 text-white"
                        }`}
                      >
                        {vehicle.available ? "AVAILABLE" : "RENTED"}
                      </div>
                      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 flex gap-1 sm:gap-2">
                        <button
                          data-action="details"
                          onClick={(e) => {
                            e.stopPropagation()
                            // COMMENTED OUT: openModal(vehicle)
                          }}
                          className="px-2 sm:px-4 py-1 sm:py-2 bg-white/90 text-black rounded-full nav-text hover:bg-white transition-all text-xs"
                        >
                          DETAILS
                        </button>
                        {vehicle.available && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // COMMENTED OUT: openModal(vehicle);
                              // NEW: Redirect to Wheelbase checkout
                              handleBookNow(vehicle);
                            }}
                            className="px-2 sm:px-4 py-1 sm:py-2 bg-blue-600/90 text-white rounded-full nav-text flex items-center gap-1 text-xs sm:text-sm hover:bg-blue-700 transition-colors cursor-pointer"
                          >
                            <Calendar className="w-3 h-3" />
                            BOOK
                          </button>
                        )}
                      </div>
                    </div>
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

      {/* COMMENTED OUT: Vehicle Details Modal with Inline Booking */}
      {/* {selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl relative animate-fadein"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="sticky top-4 right-4 z-10 float-right p-2 bg-white/90 rounded-full hover:bg-white transition-all shadow-md"
              style={{ position: 'absolute', top: 16, right: 16 }}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex h-full min-h-0">
              <motion.div 
                className={`flex-shrink-0 transition-all duration-500 ease-in-out ${
                  showInlineBooking ? 'w-[35%]' : 'w-full'
                }`}
                animate={{
                  width: showInlineBooking ? '35%' : '100%'
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="relative w-full h-40 bg-gray-100 rounded-t-2xl overflow-hidden">
                  <Image
                    src={selectedVehicle.image_url || "/placeholder.svg"}
                    alt={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
                    fill
                    className="object-cover object-center w-full h-full"
                  />
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 className="display-heading text-xl mb-1">
                        {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                      </h2>
                      <p className="body-text text-neutral-600 text-sm">{selectedVehicle.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="display-heading text-2xl">${selectedVehicle.price_per_day}</div>
                      <div className="label-text text-neutral-600 text-sm">per day</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
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

                  <div className="mb-4">
                    <div className="label-text text-neutral-600 mb-2">Features</div>
                    <div className="grid grid-cols-2 gap-1">
                      {selectedVehicle.features.map((feature: string, index: number) => (
                        <div key={index} className="body-text text-sm">
                          • {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="label-text text-neutral-600 text-sm">Insurance: </span>
                      <span className="body-text text-sm">{selectedVehicle.insurance}</span>
                    </div>
                    <div>
                      <span className="label-text text-neutral-600 text-sm">Maintenance: </span>
                      <span className="body-text text-sm">{selectedVehicle.maintenance}</span>
                    </div>
                  </div>

                  {selectedVehicle.available && (
                    <div className="pt-3 pb-3 border-t relative z-0">
                      <Button 
                        onClick={() => setShowInlineBooking(true)}
                        className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Now
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>

              {showInlineBooking && (
                <motion.div 
                  className={`flex-shrink-0 bg-gray-50 border-l transition-all duration-500 ease-in-out ${
                    showInlineBooking ? 'w-[65%] opacity-100' : 'w-0 opacity-0'
                  }`}
                  animate={{
                    width: showInlineBooking ? '65%' : '0%',
                    opacity: showInlineBooking ? 1 : 0
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <div className="p-6 h-full overflow-y-auto max-h-[calc(85vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setShowInlineBooking(false)}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          ← Back to Details
                        </button>
                        <span className="text-gray-400">|</span>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Book {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowInlineBooking(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleBookingSubmit} className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start_date">Start Date</Label>
                          <Input
                            type="date"
                            name="start_date"
                            value={bookingForm.start_date}
                            onChange={handleBookingChange}
                            min={new Date().toISOString().slice(0, 10)}
                            className="bg-white text-black border border-neutral-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                            style={{ background: '#fff', color: '#111', fontWeight: 500 }}
                            required
                            disabled={!selectedVehicle?.available}
                          />
                          <p className="text-xs text-gray-500 mt-1">Daily Rate: <span className="text-blue-600 font-semibold">${selectedVehicle?.price_per_day}/day</span></p>
                        </div>
                        <div>
                          <Label htmlFor="end_date">End Date</Label>
                          <Input
                            type="date"
                            name="end_date"
                            value={bookingForm.end_date}
                            onChange={handleBookingChange}
                            min={bookingForm.start_date || new Date().toISOString().slice(0, 10)}
                            className="bg-white text-black border border-neutral-400 focus:ring-blue-200"
                            style={{ background: '#fff', color: '#111', fontWeight: 500 }}
                            required
                            disabled={!selectedVehicle?.available}
                          />
                          <p className="text-xs text-gray-500 mt-1">Daily Rate: <span className="text-blue-600 font-semibold">${selectedVehicle?.price_per_day}/day</span></p>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border">
                        <Label>Total Price</Label>
                        <div className="font-semibold text-lg text-blue-600">
                          {bookingForm.start_date && bookingForm.end_date && selectedVehicle ?
                            `$${selectedVehicle.price_per_day * (Math.ceil((new Date(bookingForm.end_date).getTime() - new Date(bookingForm.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1)}` :
                            "$0.00"}
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <button
                          type="button"
                          onClick={() => setShowVehicleDetails(!showVehicleDetails)}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          <span>{showVehicleDetails ? 'Hide' : 'Show'} vehicle details</span>
                          <svg
                            className={`w-4 h-4 transition-transform ${showVehicleDetails ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {showVehicleDetails && (
                          <div className="mt-3 space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="font-medium text-gray-700">Mileage:</span>
                                <span className="ml-2 text-gray-600">{selectedVehicle?.mileage} miles</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Transmission:</span>
                                <span className="ml-2 text-gray-600">{selectedVehicle?.transmission}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Location:</span>
                                <span className="ml-2 text-gray-600">{selectedVehicle?.location}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Status:</span>
                                <span className={`ml-2 ${selectedVehicle?.available ? 'text-green-600' : 'text-red-600'}`}>
                                  {selectedVehicle?.available ? 'Available' : 'Rented'}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <span className="font-medium text-gray-700">Features:</span>
                              <div className="mt-1 grid grid-cols-2 gap-1">
                                {selectedVehicle?.features?.map((feature: string, index: number) => (
                                  <div key={index} className="text-gray-600">• {feature}</div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div>
                                <span className="font-medium text-gray-700">Insurance:</span>
                                <span className="ml-2 text-gray-600">{selectedVehicle?.insurance}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Maintenance:</span>
                                <span className="ml-2 text-gray-600">{selectedVehicle?.maintenance}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {bookingError && <div className="text-red-600 text-sm">{bookingError}</div>}
                      
                      <div className="flex gap-2 pt-4 pb-4">
                        <Button type="submit" disabled={!bookingForm.start_date || !bookingForm.end_date} className="flex-1 bg-blue-600 text-white hover:bg-blue-700">
                          Continue to Checkout
                        </Button>
                        <button 
                          type="button" 
                          onClick={() => setShowInlineBooking(false)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                        >
                          ← Back
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )} */}

      {/* COMMENTED OUT: Checkout Modal */}
      {/* {selectedVehicle && bookingForm.start_date && bookingForm.end_date && (
        <CheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          vehicle={selectedVehicle}
          bookingDetails={{
            start_date: bookingForm.start_date,
            end_date: bookingForm.end_date,
            total_price: selectedVehicle.price_per_day * (Math.ceil((new Date(bookingForm.end_date).getTime() - new Date(bookingForm.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1),
            total_days: Math.ceil((new Date(bookingForm.end_date).getTime() - new Date(bookingForm.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
          }}
          onSuccess={() => {
            setShowCheckoutModal(false);
            setShowInlineBooking(false);
            setBookingForm({ start_date: "", end_date: "" });
            setBookingError("");
            setBookingSuccess(false);
            window.location.reload();
          }}
          onClose={() => {
            setShowCheckoutModal(false);
          }}
        />
      )} */}

      {/* Bottom Menu Overlay */}
      <AnimatePresence>
        {!isMenuOpen && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0, scale: 0.8, transition: { type: "spring", bounce: 0.5, duration: 0.6 } }}
          >
            <motion.button
              onClick={() => setIsMenuOpen(true)}
              className="flex items-center gap-3 px-6 py-3 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700 transition-all"
              whileTap={{ scale: 0.95, y: -10 }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="nav-text font-medium">ALL VEHICLES</span>
              <Menu className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="display-heading text-2xl text-black">Filter Vehicles</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="label-text block mb-2 text-black">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search by make or model..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="body-text w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-500 text-black bg-white"
                    />
                  </div>
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="label-text block mb-2 text-black">Vehicle Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="body-text w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-500 text-black bg-white"
                  >
                    <option value="all">All Types</option>
                    <option value="available">Available</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="label-text block mb-2 text-black">
                    Daily Rate: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
