"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react"
import { PhoneDisplay } from "@/components/phone-display"
import NavBar from "@/components/NavBar"

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const slides = [
    {
    title: "PREMIUM",
    subtitle: "FLEET",
    label: "Quality Vehicles",
    description:
      "Every vehicle in our fleet is carefully selected and maintained. From fuel-efficient sedans to spacious SUVs, we provide the tools for your success.",
    cta: "View Fleet",
    info: "03 - 03 Newark - NYC Area",
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
      title: "DRIVE",
      subtitle: "TO EARN",
      label: "Gig Economy",
      description:
        "Rooted in the gig economy world, we've developed a comprehensive vehicle access platform. Moving beyond traditional leasing to embrace its power as a financial tool.",
      cta: "Start Earning",
      info: "01 - 03 Uber - Lyft Ready",
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
      <NavBar variant="dark" transparent noBorder />
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
      {/* Main Content */}
      <main className="relative z-40 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-6">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 items-center">
          {/* Left Content */}
          <div className="text-left order-2 lg:order-1">
            <div className="label-text mb-2 sm:mb-4 opacity-80">{slides[currentSlide].label}</div>
            <h1 className="display-heading text-3xl sm:text-4xl md:text-6xl lg:text-8xl xl:text-9xl leading-none mb-4 sm:mb-8">
              {slides[currentSlide].title}
            </h1>
            <div className="body-text leading-relaxed max-w-md mb-4 sm:mb-8 text-sm sm:text-base">{slides[currentSlide].description}</div>
            <Link href="/contact" className="label-text underline hover:no-underline transition-all text-sm sm:text-base">
              Read More
            </Link>
          </div>

          {/* Center CTA */}
          <div className="flex justify-center order-1 lg:order-2 mb-6 lg:mb-0">
            <Link
              href="/inventory"
              className="nav-text px-6 sm:px-8 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all text-center text-sm sm:text-base"
            >
              {slides[currentSlide].cta}
            </Link>
          </div>

          {/* Right Content */}
          <div className="text-right order-3">
            <h2 className="display-heading text-3xl sm:text-4xl md:text-6xl lg:text-8xl xl:text-9xl leading-none mb-4 sm:mb-8">
              {slides[currentSlide].subtitle}
            </h2>
            <div className="label-text mb-2 sm:mb-4 opacity-80 text-sm sm:text-base">{slides[currentSlide].info}</div>

            {/* Navigation Arrows */}
            <div className="flex justify-end gap-2 sm:gap-4 mt-4 sm:mt-8">
              <button
                onClick={prevSlide}
                className="p-2 sm:p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 sm:p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-40 px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-4 label-text text-xs sm:text-sm">
            <span>©2025 Femi Leasing</span>
            <span className="hidden sm:inline">·</span>
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
