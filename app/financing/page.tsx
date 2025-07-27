import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Shield, DollarSign } from "lucide-react"
import Link from "next/link"
import Car from "@/components/icons/Car" // Import the Car component

export default function FinancingPage() {
  const features = [
    "No credit check required for most programs",
    "Flexible down payment options",
    "Weekly or bi-weekly payment plans",
    "Early payoff discounts available",
    "Build your credit with on-time payments",
  ]

  const programs = [
    {
      title: "Lease-to-Own",
      description: "Own your vehicle at the end of the lease term",
      features: ["Low weekly payments", "No large down payment", "Ownership after 104 weeks"],
      icon: <Car className="h-8 w-8" />,
    },
    {
      title: "Rent-to-Own",
      description: "Flexible rental with purchase option",
      features: ["Start with rental", "Apply payments to purchase", "Flexible terms"],
      icon: <DollarSign className="h-8 w-8" />,
    },
    {
      title: "Traditional Financing",
      description: "Standard auto loan with competitive rates",
      features: ["Competitive interest rates", "Fixed monthly payments", "Immediate ownership"],
      icon: <Shield className="h-8 w-8" />,
    },
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
              <Link href="/services" className="text-gray-700 hover:text-blue-600">
                Services
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-500 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">No Credit? No Problem.</h1>
            <p className="text-xl md:text-2xl mb-8">Flexible financing options to get you on the road today</p>
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              Apply Now
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Financing?</h2>
            <p className="text-lg text-gray-600">We believe everyone deserves access to reliable transportation</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 text-lg">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Financing Programs</h2>
            <p className="text-lg text-gray-600">Choose the option that works best for you</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center mb-4">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    {program.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{program.title}</h3>
                  <p className="text-gray-600 mb-4">{program.description}</p>
                </div>
                <div className="space-y-2">
                  {program.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-6 bg-transparent" variant="outline">
                  Learn More
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple Application Process</h2>
            <p className="text-lg text-gray-600">Get approved in minutes, not hours</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Apply Online</h3>
              <p className="text-gray-600">Fill out our simple application form</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Quick Review</h3>
              <p className="text-gray-600">We review your application within 30 minutes</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Get Approved</h3>
              <p className="text-gray-600">Receive your approval decision instantly</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Drive Away</h3>
              <p className="text-gray-600">Pick up your vehicle the same day</p>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Apply for Financing</h2>
            <p className="text-lg text-gray-600">Start your application today - it only takes 5 minutes</p>
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
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="income">Monthly Income</Label>
                  <Input id="income" placeholder="$0" />
                </div>
                <div>
                  <Label htmlFor="employment">Employment Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self-employed">Self-Employed</SelectItem>
                      <SelectItem value="gig-worker">Gig Worker</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="program">Preferred Program</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select financing program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lease-to-own">Lease-to-Own</SelectItem>
                    <SelectItem value="rent-to-own">Rent-to-Own</SelectItem>
                    <SelectItem value="traditional">Traditional Financing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vehicle">Vehicle Interest</Label>
                <Input id="vehicle" placeholder="Any specific make/model in mind?" />
              </div>
              <div>
                <Label htmlFor="comments">Additional Comments</Label>
                <Textarea id="comments" placeholder="Tell us about your situation or any questions you have" />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                Submit Application
              </Button>
              <p className="text-sm text-gray-600 text-center">
                By submitting this form, you agree to our terms and conditions. We'll contact you within 30 minutes
                during business hours.
              </p>
            </form>
          </Card>
        </div>
      </section>
    </div>
  )
}
