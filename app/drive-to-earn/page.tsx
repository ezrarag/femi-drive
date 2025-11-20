import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, CheckCircle, Star } from "lucide-react"
import Link from "next/link"

export default function DriveToEarnPage() {
  const benefits = [
    "Flexible rental terms starting at weekly rates",
    "Vehicles pre-approved for Uber, Lyft, DoorDash, and more",
    "24/7 roadside assistance included",
    "No long-term commitment required",
    "Maintenance and insurance guidance provided",
  ]

  const requirements = [
    "25+ years old",
    "Valid driver's license",
  ]

  const earnings = [
    { service: "Uber/Lyft", potential: "$800-1,500", timeframe: "per week" },
    { service: "DoorDash", potential: "$600-1,200", timeframe: "per week" },
    { service: "Amazon Flex", potential: "$500-1,000", timeframe: "per week" },
    { service: "Instacart", potential: "$400-800", timeframe: "per week" },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Femi Leasing
            </Link>
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Home
              </Link>
              <Link href="/inventory" className="text-gray-700 hover:text-blue-600">
                Inventory
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Drive to Earn — Rentals</h1>
            <p className="text-xl md:text-2xl mb-8">
              Rent a vehicle and start earning with rideshare and delivery services
            </p>
            <Button size="lg" className="bg-black text-yellow-400 hover:bg-gray-800">
              Get Started Today
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Start earning in just 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Your Vehicle</h3>
              <p className="text-gray-600">Browse our gig-ready fleet and select the perfect vehicle for your needs</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Complete Application</h3>
              <p className="text-gray-600">Quick approval process with flexible requirements and same-day decisions</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Earning</h3>
              <p className="text-gray-600">Hit the road and start making money with your favorite gig apps</p>
            </div>
          </div>
        </div>
      </section>

      {/* Earning Potential */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Earning Potential</h2>
            <p className="text-lg text-gray-600">See what drivers in your area are making</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {earnings.map((earning, index) => (
              <Card key={index} className="text-center p-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{earning.service}</h3>
                <p className="text-2xl font-bold text-green-600 mb-1">{earning.potential}</p>
                <p className="text-sm text-gray-600">{earning.timeframe}</p>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">*Earnings vary based on location, hours worked, and demand</p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Program Benefits</h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="text-center">
                  <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Success Story</h3>
                  <p className="text-gray-700 mb-4">
                    "I've been driving with Femi for 6 months and consistently earn $1,200+ per week. The support team
                    is amazing and the vehicles are always reliable."
                  </p>
                  <p className="font-semibold">- Marcus J., Uber Driver</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Eligibility Requirements</h2>
            <p className="text-lg text-gray-600">Simple requirements to get started</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <Card className="p-6">
              <div className="space-y-4">
                {requirements.map((requirement, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{requirement}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Apply Now</h2>
            <p className="text-lg text-gray-600">Start your journey to financial freedom</p>
          </div>
          <Card className="p-8">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter your first name" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter your last name" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="Enter your phone number" />
                </div>
              </div>
              <div>
                <Label htmlFor="services">Which services do you plan to use?</Label>
                <Input id="services" placeholder="e.g., Uber, Lyft, DoorDash" />
              </div>
              <div>
                <Label htmlFor="experience">Driving Experience</Label>
                <Textarea id="experience" placeholder="Tell us about your driving and gig work experience" />
              </div>
              <div>
                <Label htmlFor="location">Preferred Pickup Location</Label>
                <Input id="location" placeholder="Newark Airport, Downtown Newark, etc." />
              </div>
              <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                Submit Application
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </div>
  )
}
