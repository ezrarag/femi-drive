"use client"

import Link from "next/link"
import NavBar from "@/components/NavBar"

export default function ServicesPage() {
  const services = [
    {
      id: "01",
      service: "VEHICLE RENTAL",
      description: "DAILY & WEEKLY RENTALS",
      category: "RENTAL",
      location: "NJ/NY",
      details: "UBER/LYFT READY",
      year: "2024",
    },
    {
      id: "02",
      service: "DRIVE TO EARN",
      description: "GIG ECONOMY PROGRAM",
      category: "PROGRAM",
      location: "NEWARK",
      details: "RIDESHARE SUPPORT",
      year: "2024",
    },
    {
      id: "03",
      service: "FINANCING",
      description: "NO CREDIT SOLUTIONS",
      category: "FINANCIAL",
      location: "NJ/NY",
      details: "FLEXIBLE TERMS",
      year: "2024",
    },
    {
      id: "04",
      service: "LEASE TO OWN",
      description: "OWNERSHIP PATHWAY",
      category: "FINANCIAL",
      location: "NJ/NY",
      details: "104 WEEK PROGRAM",
      year: "2024",
    },
    {
      id: "05",
      service: "FLEET MANAGEMENT",
      description: "BUSINESS SOLUTIONS",
      category: "COMMERCIAL",
      location: "REGIONAL",
      details: "MULTI-VEHICLE",
      year: "2024",
    },
    {
      id: "06",
      service: "INSURANCE",
      description: "FULL COVERAGE INCLUDED",
      category: "PROTECTION",
      location: "NJ/NY",
      details: "COMPREHENSIVE",
      year: "2024",
    },
    {
      id: "07",
      service: "MAINTENANCE",
      description: "24/7 ROADSIDE ASSISTANCE",
      category: "SUPPORT",
      location: "REGIONAL",
      details: "EMERGENCY SERVICE",
      year: "2024",
    },
    {
      id: "08",
      service: "AIRPORT PICKUP",
      description: "NEWARK INTERNATIONAL",
      category: "LOGISTICS",
      location: "NEWARK",
      details: "TERMINAL SERVICE",
      year: "2024",
    },
    {
      id: "09",
      service: "VEHICLE INSPECTION",
      description: "PRE-RENTAL CHECKS",
      category: "QUALITY",
      location: "ALL LOCATIONS",
      details: "SAFETY FIRST",
      year: "2024",
    },
    {
      id: "10",
      service: "DRIVER TRAINING",
      description: "GIG ECONOMY BASICS",
      category: "EDUCATION",
      location: "NJ/NY",
      details: "SUCCESS PROGRAM",
      year: "2024",
    },
    {
      id: "11",
      service: "FUEL CARDS",
      description: "DISCOUNTED FUEL ACCESS",
      category: "SAVINGS",
      location: "REGIONAL",
      details: "PARTNER STATIONS",
      year: "2024",
    },
    {
      id: "12",
      service: "VEHICLE DELIVERY",
      description: "DOOR TO DOOR SERVICE",
      category: "LOGISTICS",
      location: "NJ/NY",
      details: "CONVENIENCE",
      year: "2024",
    },
    {
      id: "13",
      service: "BACKGROUND CHECKS",
      description: "DRIVER VERIFICATION",
      category: "COMPLIANCE",
      location: "NJ/NY",
      details: "PLATFORM READY",
      year: "2024",
    },
    {
      id: "14",
      service: "TAX ASSISTANCE",
      description: "GIG WORKER SUPPORT",
      category: "FINANCIAL",
      location: "NJ/NY",
      details: "DEDUCTION HELP",
      year: "2024",
    },
    {
      id: "15",
      service: "VEHICLE SWAPS",
      description: "FLEXIBLE EXCHANGES",
      category: "FLEXIBILITY",
      location: "ALL LOCATIONS",
      details: "UPGRADE OPTIONS",
      year: "2024",
    },
    {
      id: "16",
      service: "EMERGENCY REPLACEMENT",
      description: "BREAKDOWN COVERAGE",
      category: "SUPPORT",
      location: "NJ/NY",
      details: "SAME DAY",
      year: "2024",
    },
    {
      id: "17",
      service: "EARNINGS TRACKING",
      description: "PERFORMANCE ANALYTICS",
      category: "ANALYTICS",
      location: "DIGITAL",
      details: "PROFIT OPTIMIZATION",
      year: "2024",
    },
    {
      id: "18",
      service: "VEHICLE CUSTOMIZATION",
      description: "BRANDING & ACCESSORIES",
      category: "ENHANCEMENT",
      location: "NJ/NY",
      details: "PROFESSIONAL SETUP",
      year: "2024",
    },
    {
      id: "19",
      service: "WEEKEND SPECIALS",
      description: "EXTENDED HOUR RATES",
      category: "PRICING",
      location: "ALL LOCATIONS",
      details: "SURGE SUPPORT",
      year: "2024",
    },
    {
      id: "20",
      service: "CORPORATE ACCOUNTS",
      description: "BUSINESS PARTNERSHIPS",
      category: "COMMERCIAL",
      location: "REGIONAL",
      details: "VOLUME DISCOUNTS",
      year: "2024",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar variant="dark" />

      {/* Header Section */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-start justify-between">
          <div>
            <h1 className="display-heading text-6xl md:text-8xl mb-4">SERVICES</h1>
          </div>
          <div className="text-right">
            <h2 className="display-heading text-6xl md:text-8xl mb-4">OVERVIEW</h2>
            <div className="label-text opacity-60 max-w-md">
              FULL SERVICE AVAILABLE ON REQUEST,{" "}
              <Link href="/contact" className="underline hover:no-underline">
                SEND A MESSAGE
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-1">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="grid grid-cols-12 gap-4 py-3 border-b border-white/10 hover:bg-white/5 transition-all group"
              >
                {/* ID */}
                <div className="col-span-1">
                  <span className="label-text opacity-40 group-hover:opacity-80 font-light group-hover:font-medium transition-all">
                    {service.id}
                  </span>
                </div>

                {/* Service Name */}
                <div className="col-span-2">
                  <span className="body-text font-light group-hover:font-medium transition-all">{service.service}</span>
                </div>

                {/* Description */}
                <div className="col-span-3">
                  <span className="body-text opacity-60 group-hover:opacity-90 font-light group-hover:font-normal transition-all">
                    {service.description}
                  </span>
                </div>

                {/* Category */}
                <div className="col-span-2">
                  <span className="label-text opacity-40 group-hover:opacity-70 font-light group-hover:font-normal transition-all">
                    {service.category}
                  </span>
                </div>

                {/* Location */}
                <div className="col-span-1">
                  <span className="label-text opacity-40 group-hover:opacity-70 font-light group-hover:font-normal transition-all">
                    {service.location}
                  </span>
                </div>

                {/* Details */}
                <div className="col-span-2">
                  <span className="label-text opacity-40 group-hover:opacity-70 font-light group-hover:font-normal transition-all">
                    {service.details}
                  </span>
                </div>

                {/* Year */}
                <div className="col-span-1 text-right">
                  <span className="label-text opacity-40 group-hover:opacity-70 font-light group-hover:font-normal transition-all">
                    {service.year}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 pb-16">
        <div className="max-w-7xl mx-auto text-center">
          <div className="space-y-8">
            <h3 className="display-heading text-3xl">READY TO GET STARTED?</h3>
            <div className="flex justify-center gap-4">
              <Link
                href="/contact"
                className="px-8 py-3 bg-white text-black rounded-full nav-text hover:bg-gray-200 transition-all"
              >
                Contact Us
              </Link>
              <Link
                href="/inventory"
                className="px-8 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 nav-text hover:bg-white/20 transition-all"
              >
                View Fleet
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 pb-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between border-t border-white/10 pt-6">
          <div className="flex items-center gap-4 label-text opacity-60">
            <span>©2025 Femi Leasing</span>
            <span>·</span>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
          </div>

          <div className="w-3 h-3 bg-white/40 rounded-full"></div>
        </div>
      </footer>
    </div>
  )
}
