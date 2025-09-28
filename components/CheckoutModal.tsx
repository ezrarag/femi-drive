// COMMENTED OUT: CheckoutModal component is no longer used
// The booking system has been replaced with direct Wheelbase redirects

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Calendar, CreditCard, User, Phone, Mail, MapPin, Car, X } from "lucide-react"
// import { toast } from "sonner"

// interface CheckoutModalProps {
//   isOpen: boolean
//   onClose: () => void
//   vehicle: any
//   bookingDetails: {
//     start_date: string
//     end_date: string
//     total_price: number
//     total_days: number
//   }
//   onSuccess: () => void
// }

// export default function CheckoutModal({
//   isOpen,
//   onClose,
//   vehicle,
//   bookingDetails,
//   onSuccess
// }: CheckoutModalProps) {
//   const [loading, setLoading] = useState(false)
//   const [authLoading, setAuthLoading] = useState(false)
//   const [user, setUser] = useState<any>(null)
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     address: "",
//     city: "",
//     state: "",
//     zipCode: "",
//     licenseNumber: "",
//     licenseState: "",
//     licenseExpiry: ""
//   })

//   useEffect(() => {
//     if (isOpen) {
//       checkUser()
//     }
//   }, [isOpen])

//   const checkUser = async () => {
//     // TODO: Implement authentication when backend is ready
//     if (user) {
//       setUser(user)
//       // Pre-fill form with user data if available
//       if (user.user_metadata) {
//         setFormData(prev => ({
//           ...prev,
//           firstName: user.user_metadata.full_name?.split(' ')[0] || "",
//           lastName: user.user_metadata.full_name?.split(' ').slice(1).join(' ') || "",
//           email: user.email || ""
//         }))
//       }
//     }
//   }

//   const handleGoogleLogin = async () => {
//     setAuthLoading(true)
    
//     try {
//       // TODO: Implement OAuth when backend is ready
//         provider: 'google',
//         options: {
//           redirectTo: `${window.location.origin}/auth/callback`
//         }
//       })

//       if (error) throw error

//       // Subscribe to auth state changes
//       // TODO: Implement auth state change when backend is ready
//         if (event === 'SIGNED_IN' && session?.user) {
//           setUser(session.user)
//           setAuthLoading(false)
//           toast.success("Successfully signed in!")
//           // Pre-fill form with user data
//           if (session.user.user_metadata) {
//             setFormData(prev => ({
//               ...prev,
//               firstName: session.user.user_metadata.full_name?.split(' ')[0] || "",
//               lastName: session.user.user_metadata.full_name?.split(' ').slice(1).join(' ') || "",
//               email: session.user.email || ""
//             }))
//           }
//         }
//       })

//       // Cleanup subscription after 30 seconds
//       setTimeout(() => subscription.unsubscribe(), 30000)
//     } catch (error) {
//       console.error("Google login error:", error)
//       toast.error("Google login failed. Please try again.")
//       setAuthLoading(false)
//     }
//   }

//   const handlePayment = async () => {
//     setLoading(true)
    
//     try {
//       // Simulate payment processing
//       await new Promise(resolve => setTimeout(resolve, 2000))
      
//       // Create the booking
//       const response = await fetch("/api/bookings", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           vehicle_id: vehicle.id,
//           start_date: bookingDetails.start_date,
//           end_date: bookingDetails.end_date,
//           total_price: bookingDetails.total_price,
//           // Note: user_id will be set by the API based on the session
//         }),
//       })

//       const responseData = await response.json()

//       if (!response.ok) {
//         console.error("Booking API error:", responseData)
//         throw new Error(responseData.error || `Failed to create booking: ${response.status}`)
//       }

//       toast.success("Payment successful! Your booking has been confirmed.")
//       onSuccess()
//       onClose()
      
//       // Redirect to dashboard after successful booking
//       setTimeout(() => {
//         window.location.href = "/dashboard"
//       }, 1500)

//     } catch (error) {
//       console.error("Payment error:", error)
//       toast.error("Payment failed. Please try again.", {
//         description: error instanceof Error ? error.message : "Unknown error occurred"
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     })
//   }

//   if (!isOpen) return null

//   return (
//     <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900">Complete Your Booking</h2>
//             <p className="text-gray-600 mt-1">
//               {vehicle.year} {vehicle.make} {vehicle.model} • {formatDate(bookingDetails.start_date)} - {formatDate(bookingDetails.end_date)}
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <div className="flex h-full min-h-0">
//           {/* Left Side - Vehicle Summary */}
//           <div className="w-1/3 bg-gray-50 p-6 border-r">
//             <div className="sticky top-6">
//               <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
              
//               <div className="space-y-4">
//                 <div className="flex items-center gap-3">
//                   <Car className="w-8 h-8 text-blue-600" />
//                   <div>
//                     <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
//                     <p className="text-sm text-gray-600">{vehicle.transmission} • {vehicle.mileage} miles</p>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Start Date:</span>
//                     <span className="font-medium">{formatDate(bookingDetails.start_date)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">End Date:</span>
//                     <span className="font-medium">{formatDate(bookingDetails.end_date)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Duration:</span>
//                     <span className="font-medium">{bookingDetails.total_days} days</span>
//                   </div>
//                   <div className="flex justify-between text-lg font-bold border-t pt-2">
//                     <span>Total:</span>
//                     <span className="text-blue-600">${bookingDetails.total_price}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right Side - Form */}
//           <div className="flex-1 p-6 overflow-y-auto">
//             {!user ? (
//               <div className="text-center py-12">
//                 <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <User className="w-8 h-8 text-blue-600" />
//                 </div>
//                 <h3 className="text-xl font-semibold mb-2">Sign in to continue</h3>
//                 <p className="text-gray-600 mb-6">Please sign in to complete your booking</p>
//                 <Button
//                   onClick={handleGoogleLogin}
//                   disabled={authLoading}
//                   className="w-full max-w-sm"
//                 >
//                   {authLoading ? (
//                     <div className="flex items-center gap-2">
//                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                       Signing in...
//                     </div>
//                   ) : (
//                     <div className="flex items-center gap-2">
//                       <svg className="w-5 h-5" viewBox="0 0 24 24">
//                         <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//                         <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//                         <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//                         <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//                       </svg>
//                       Continue with Google
//                     </div>
//                   )}
//                 </Button>
//               </div>
//             ) : (
//               <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }} className="space-y-6">
//                 {/* Personal Information */}
//                 <div>
//                   <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//                     <User className="w-5 h-5" />
//                     Personal Information
//                   </h3>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <Label htmlFor="firstName">First Name</Label>
//                       <Input
//                         id="firstName"
//                         value={formData.firstName}
//                         onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
//                         required
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="lastName">Last Name</Label>
//                       <Input
//                         id="lastName"
//                         value={formData.lastName}
//                         onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
//                         required
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="email">Email</Label>
//                       <Input
//                         id="email"
//                         type="email"
//                         value={formData.email}
//                         onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
//                         required
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="phone">Phone</Label>
//                       <Input
//                         id="phone"
//                         type="tel"
//                         value={formData.phone}
//                         onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
//                         required
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Address */}
//                 <div>
//                   <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//                     <MapPin className="w-5 h-5" />
//                     Address
//                   </h3>
//                   <div className="space-y-4">
//                     <div>
//                       <Label htmlFor="address">Street Address</Label>
//                       <Input
//                         id="address"
//                         value={formData.address}
//                         onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
//                         required
//                       />
//                     </div>
//                     <div className="grid grid-cols-3 gap-4">
//                       <div>
//                         <Label htmlFor="city">City</Label>
//                         <Input
//                           id="city"
//                           value={formData.city}
//                           onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
//                           required
//                         />
//                       </div>
//                       <div>
//                         <Label htmlFor="state">State</Label>
//                         <Input
//                           id="state"
//                           value={formData.state}
//                           onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
//                           required
//                         />
//                       </div>
//                       <div>
//                         <Label htmlFor="zipCode">ZIP Code</Label>
//                         <Input
//                           id="zipCode"
//                           value={formData.zipCode}
//                           onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
//                           required
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Driver's License */}
//                 <div>
//                   <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//                     <CreditCard className="w-5 h-5" />
//                     Driver's License
//                   </h3>
//                   <div className="grid grid-cols-3 gap-4">
//                     <div>
//                       <Label htmlFor="licenseNumber">License Number</Label>
//                       <Input
//                         id="licenseNumber"
//                         value={formData.licenseNumber}
//                         onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
//                         required
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="licenseState">State</Label>
//                       <Input
//                         id="licenseState"
//                         value={formData.licenseState}
//                         onChange={(e) => setFormData(prev => ({ ...prev, licenseState: e.target.value }))}
//                         required
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="licenseExpiry">Expiry Date</Label>
//                       <Input
//                         id="licenseExpiry"
//                         type="date"
//                         value={formData.licenseExpiry}
//                         onChange={(e) => setFormData(prev => ({ ...prev, licenseExpiry: e.target.value }))}
//                         required
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Payment Button */}
//                 <div className="pt-6 border-t">
//                   <Button
//                     type="submit"
//                     disabled={loading}
//                     className="w-full py-3 text-lg"
//                   >
//                     {loading ? (
//                       <div className="flex items-center gap-2">
//                         <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                         Processing Payment...
//                       </div>
//                     ) : (
//                       <div className="flex items-center gap-2">
//                         <CreditCard className="w-5 h-5" />
//                         Pay ${bookingDetails.total_price}
//                       </div>
//                     )}
//                   </Button>
//                 </div>
//               </form>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// COMMENTED OUT: CheckoutModal component is no longer used
// The booking system has been replaced with direct Wheelbase redirects
