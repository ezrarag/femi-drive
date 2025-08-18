"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CreditCard, User, Mail, Phone, MapPin, Chrome } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  vehicle: any
  bookingDetails: {
    start_date: string
    end_date: string
    total_price: number
    total_days: number
  }
  onSuccess: () => void
}

export default function CheckoutModal({
  isOpen,
  onClose,
  vehicle,
  bookingDetails,
  onSuccess
}: CheckoutModalProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  })

  // Check if user is already authenticated when modal opens
  useEffect(() => {
    if (isOpen) {
      checkUserAuth()
    }
  }, [isOpen])

  const checkUserAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      populateFormWithUserData(user)
    }
  }

  const populateFormWithUserData = (user: any) => {
    // Extract name from user metadata
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || ""
    const [firstName, ...lastNameParts] = fullName.split(" ")
    const lastName = lastNameParts.join(" ") || ""
    
    setFormData(prev => ({
      ...prev,
      firstName: firstName || "",
      lastName: lastName || "",
      email: user.email || "",
      // Phone and address will need to be filled manually or fetched from user profile
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleNext = () => {
    if (step === 1) {
      // Check if user is authenticated
      if (!user) {
        toast.error("Please sign in to continue", {
          description: "You can use Google Sign-In or fill in your information manually"
        })
        return
      }
      
      // Validate personal info
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        toast.error("Please fill in all required fields")
        return
      }
      setStep(2)
    } else if (step === 2) {
      // Validate payment info
      if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardholderName) {
        toast.error("Please fill in all payment fields")
        return
      }
      handlePayment()
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleGoogleLogin = async () => {
    setAuthLoading(true)
    
    try {
      // Open Google OAuth in a popup window
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })

      if (error) {
        throw error
      }

      // If we have a URL, open it in a popup
      if (data.url) {
        const popup = window.open(
          data.url,
          'google-oauth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        )

        // Listen for the popup to close and check auth status
        const checkPopup = setInterval(async () => {
          if (popup?.closed) {
            clearInterval(checkPopup)
            
            // Check if user is now authenticated
            const { data: { user: newUser } } = await supabase.auth.getUser()
            if (newUser) {
              setUser(newUser)
              populateFormWithUserData(newUser)
              toast.success("Successfully signed in with Google!")
            }
            setAuthLoading(false)
          }
        }, 500)

        // Also listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            setUser(session.user)
            populateFormWithUserData(session.user)
            toast.success("Successfully signed in with Google!")
            setAuthLoading(false)
            if (popup && !popup.closed) {
              popup.close()
            }
          }
        })

        // Cleanup subscription after 30 seconds
        setTimeout(() => subscription.unsubscribe(), 30000)
      }
    } catch (error) {
      console.error("Google login error:", error)
      toast.error("Google login failed. Please try again.")
      setAuthLoading(false)
    }
  }

  const handlePayment = async () => {
    setLoading(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create the booking
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicle_id: vehicle.id,
          start_date: bookingDetails.start_date,
          end_date: bookingDetails.end_date,
          total_price: bookingDetails.total_price,
          // Note: user_id will be set by the API based on the session
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error("Booking API error:", responseData)
        throw new Error(responseData.error || `Failed to create booking: ${response.status}`)
      }

      toast.success("Payment successful! Your booking has been confirmed.")
      onSuccess()
      onClose()
      
      // Redirect to dashboard after successful booking
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1500)

    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Payment failed. Please try again.", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Complete Your Booking
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Booking Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-gray-600">{vehicle.category}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Pickup Date:</span>
                    <span className="font-medium">{formatDate(bookingDetails.start_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Return Date:</span>
                    <span className="font-medium">{formatDate(bookingDetails.end_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{bookingDetails.total_days} days</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${bookingDetails.total_price.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Checkout Form */}
          <div className="lg:col-span-2">
            {step === 1 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Google Login Option */}
                  <div className="text-center">
                                      {user ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-green-800 text-sm">
                            ✅ Signed in as <strong>{user.email}</strong>
                          </p>
                          <p className="text-green-600 text-xs mt-1">
                            Your information has been pre-filled
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            await supabase.auth.signOut()
                            setUser(null)
                            setFormData({
                              firstName: "",
                              lastName: "",
                              email: "",
                              phone: "",
                              address: "",
                              city: "",
                              state: "",
                              zipCode: "",
                              cardNumber: "",
                              expiryDate: "",
                              cvv: "",
                              cardholderName: ""
                            })
                          }}
                          className="text-green-600 hover:text-green-800 text-xs"
                        >
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  ) : (
                      <>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGoogleLogin}
                          disabled={authLoading}
                          className="mt-3 w-full"
                        >
                          <Chrome className="w-4 h-4 mr-2" />
                          {authLoading ? "Signing in..." : "Continue with Google"}
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardholderName">Cardholder Name *</Label>
                    <Input
                      id="cardholderName"
                      name="cardholderName"
                      value={formData.cardholderName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cardNumber">Card Number *</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date *</Label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={step === 1 ? onClose : handleBack}
                disabled={loading}
              >
                {step === 1 ? "Cancel" : "Back"}
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={loading || authLoading}
                className="min-w-[120px]"
              >
                {loading ? (
                  "Processing..."
                ) : step === 1 ? (
                  "Continue to Payment"
                ) : (
                  `Pay $${bookingDetails.total_price.toFixed(2)}`
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
