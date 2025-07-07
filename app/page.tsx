"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { PhoneDisplay } from "@/components/phone-display"

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "DRIVE",
      subtitle: "TO EARN",
      label: "Gig Economy",
      description:
        "Rooted in the gig economy world, we've developed a comprehensive vehicle access platform. Moving beyond traditional leasing to embrace its power as a financial tool.",
      cta: "Start Earning",
      info: "01 - 03 Uber - Lyft Ready",
    },
    {
      title: "FLEXIBLE",
      subtitle: "FINANCING",
      label: "No Credit",
      description:
        "No credit? No problem. We've created innovative financing solutions that work with your situation. From rent-to-own to traditional leasing options.",
      cta: "Apply Now",
      info: "02 - 03 Financing Options",
    },
    {
      title: "PREMIUM",
      subtitle: "FLEET",
      label: "Quality Vehicles",
      description:
        "Every vehicle in our fleet is carefully selected and maintained. From fuel-efficient sedans to spacious SUVs, we provide the tools for your success.",
      cta: "View Fleet",
      info: "03 - 03 Newark - NYC Area",
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
          <source
            src="https://gfqhzuqckfxtzqawdcso.supabase.co/storage/v1/object/public/project-media/temporary/coverr-electric-car-driving-in-the-dark-woods-668-1080p.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/40" />
      </div>
      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6">
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
          {process.env.NEXT_PUBLIC_BUSINESS_PHONE && (
            <PhoneDisplay
              phoneNumber={process.env.NEXT_PUBLIC_BUSINESS_PHONE}
              variant="header"
              className="text-white"
            />
          )}
          <Link
            href="/about"
            className="nav-text px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="nav-text px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all"
          >
            Contact
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-40 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left Content */}
          <div className="text-left">
            <div className="label-text mb-4 opacity-80">{slides[currentSlide].label}</div>
            <h1 className="display-heading text-6xl md:text-8xl lg:text-9xl leading-none mb-8">
              {slides[currentSlide].title}
            </h1>
            <div className="body-text leading-relaxed max-w-md mb-8">{slides[currentSlide].description}</div>
            <Link href="/contact" className="label-text underline hover:no-underline transition-all">
              Read More
            </Link>
          </div>

          {/* Center CTA */}
          <div className="flex justify-center">
            <button className="nav-text px-8 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all">
              {slides[currentSlide].cta}
            </button>
          </div>

          {/* Right Content */}
          <div className="text-right">
            <h2 className="display-heading text-6xl md:text-8xl lg:text-9xl leading-none mb-8">
              {slides[currentSlide].subtitle}
            </h2>
            <div className="label-text mb-4 opacity-80">{slides[currentSlide].info}</div>

            {/* Navigation Arrows */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={prevSlide}
                className="p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                className="p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-40 px-6 pb-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 label-text">
            <span>©2025 Femi Leasing</span>
            <span>·</span>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <div className="h-px bg-white/20 relative">
              <div
                className="h-px bg-white transition-all duration-500"
                style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="w-3 h-3 bg-white/40 rounded-full"></div>
        </div>
      </footer>
    </div>
  )
}
