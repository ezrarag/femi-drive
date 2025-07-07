"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Phone, Mail, MapPin, Clock } from "lucide-react"
import { PhoneDisplay } from "@/components/phone-display"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Handle form submission here
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex gap-4">
          <Link
            href="/"
            className="nav-text px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all"
          >
            Home
          </Link>
          <Link
            href="/inventory"
            className="nav-text px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all"
          >
            Fleet
          </Link>
          <Link
            href="/services"
            className="nav-text px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all"
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
            className="nav-text px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="nav-text px-4 py-2 bg-white text-black rounded-full border border-white transition-all"
          >
            Contact
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="display-heading text-6xl md:text-8xl mb-8">GET IN TOUCH</h1>
          <p className="body-text max-w-2xl opacity-80">
            Ready to start earning? Have questions about our fleet? We're here to help you succeed.
          </p>
        </div>
      </div>

      {/* Contact Content */}
      <div className="px-6 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div>
            <h2 className="display-heading text-3xl mb-8">CONTACT INFO</h2>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 mt-1 opacity-60" />
                <div>
                  <div className="label-text mb-2">Phone (AI Assistant Available 24/7)</div>
                  <PhoneDisplay phoneNumber="+12018987182" variant="cta" className="mb-2" />
                  <div className="body-text opacity-60">Our AI assistant Femi can help with:</div>
                  <ul className="body-text opacity-60 text-sm mt-1 space-y-1">
                    <li>• Vehicle availability and pricing</li>
                    <li>• Booking assistance and secure payment links</li>
                    <li>• General rental questions</li>
                    <li>• Transfer to human agent when needed</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 mt-1 opacity-60" />
                <div>
                  <div className="label-text mb-2">Email</div>
                  <div className="body-text">ayoola@femileasing.com</div>
                  <div className="body-text opacity-60">24/7 response</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 mt-1 opacity-60" />
                <div>
                  <div className="label-text mb-2">Locations</div>
                  <div className="body-text mb-2">Newark International Airport</div>
                  <div className="body-text opacity-60">10 Toler Pl</div>
                  <div className="body-text opacity-60">Newark, NJ 07114</div>

                  <div className="body-text mb-2 mt-4">Weequahic Park</div>
                  <div className="body-text opacity-60">Elizabeth Ave &, Meeker Ave</div>
                  <div className="body-text opacity-60">Newark, NJ 07112</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 mt-1 opacity-60" />
                <div>
                  <div className="label-text mb-2">Hours</div>
                  <div className="body-text">Mon-Fri: 8:00 AM - 8:00 PM</div>
                  <div className="body-text">Sat: 9:00 AM - 6:00 PM</div>
                  <div className="body-text">Sun: 10:00 AM - 4:00 PM</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-12">
              <h3 className="display-heading text-xl mb-6">QUICK ACTIONS</h3>
              <div className="space-y-4">
                <Link
                  href="/inventory"
                  className="block w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all"
                >
                  <div className="label-text mb-1">View Fleet</div>
                  <div className="body-text opacity-60">Browse available vehicles</div>
                </Link>

                <Link
                  href="/financing"
                  className="block w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all"
                >
                  <div className="label-text mb-1">Apply for Financing</div>
                  <div className="body-text opacity-60">Get pre-approved today</div>
                </Link>

                <Link
                  href="/drive-to-earn"
                  className="block w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all"
                >
                  <div className="label-text mb-1">Drive to Earn</div>
                  <div className="body-text opacity-60">Start earning with Uber/Lyft</div>
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="display-heading text-3xl mb-8">SEND MESSAGE</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label-text block mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="body-text w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:border-white/40 placeholder:opacity-50"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="label-text block mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="body-text w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:border-white/40 placeholder:opacity-50"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="label-text block mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="body-text w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:border-white/40 placeholder:opacity-50"
                  placeholder="(xxx) xxx-xxxx"
                />
              </div>

              <div>
                <label className="label-text block mb-2">Subject *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="body-text w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:border-white/40"
                >
                  <option value="">Select a subject</option>
                  <option value="vehicle-inquiry">Vehicle inquiry</option>
                  <option value="financing">Financing questions</option>
                  <option value="drive-to-earn">Drive to earn program</option>
                  <option value="fleet-partner">Fleet partner program</option>
                  <option value="support">Customer support</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="label-text block mb-2">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="body-text w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:border-white/40 placeholder:opacity-50 resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-white text-black rounded-lg nav-text hover:bg-gray-200 transition-all"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="px-6 pb-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto pt-16">
          <h2 className="display-heading text-4xl mb-12">FREQUENTLY ASKED</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="label-text mb-3">How quickly can I get a vehicle?</h3>
                <p className="body-text opacity-80">
                  Most approved applicants can pick up a vehicle within 24-48 hours of approval.
                </p>
              </div>

              <div>
                <h3 className="label-text mb-3">What if I have no credit?</h3>
                <p className="body-text opacity-80">
                  No problem! We have specialized programs for drivers with no credit or poor credit history.
                </p>
              </div>

              <div>
                <h3 className="label-text mb-3">Are all vehicles gig-ready?</h3>
                <p className="body-text opacity-80">
                  Most of our fleet is pre-approved for Uber, Lyft, and major delivery platforms.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="label-text mb-3">What's included in the rental?</h3>
                <p className="body-text opacity-80">
                  Insurance, maintenance, and 24/7 roadside assistance are included in all rentals.
                </p>
              </div>

              <div>
                <h3 className="label-text mb-3">Can I rent for just a few days?</h3>
                <p className="body-text opacity-80">
                  Yes! We offer flexible terms from daily rentals to long-term leases.
                </p>
              </div>

              <div>
                <h3 className="label-text mb-3">How do I become a fleet partner?</h3>
                <p className="body-text opacity-80">
                  Contact us to learn about listing your vehicle and earning passive income.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
