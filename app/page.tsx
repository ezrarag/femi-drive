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
            src="https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/femileasing%2F2229697-uhd_3840_2160_30fps.mp4?alt=media&token=baa0aecd-215f-4e67-a290-f5853e1d4dd0"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/40" />
      </div>
      {/* Main Content */}
      <main className="relative z-40 flex items-center justify-center min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-100px)] md:min-h-[calc(100vh-120px)] px-3 sm:px-4 md:px-6">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="text-left order-2 xl:order-1">
            <div className="label-text mb-2 sm:mb-3 md:mb-4 opacity-80 text-xs sm:text-sm">{slides[currentSlide].label}</div>
            <h1 className="display-heading text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl 2xl:text-8xl leading-none mb-3 sm:mb-4 md:mb-6 lg:mb-8">
              {slides[currentSlide].title}
            </h1>
            <div className="body-text leading-relaxed max-w-sm sm:max-w-md mb-3 sm:mb-4 md:mb-6 lg:mb-8 text-xs sm:text-sm md:text-base">{slides[currentSlide].description}</div>
            <Link href="/contact" className="label-text underline hover:no-underline transition-all text-xs sm:text-sm md:text-base min-h-[44px] inline-flex items-center">
              Read More
            </Link>
          </div>

          {/* Center CTA */}
          <div className="flex justify-center order-1 xl:order-2 mb-4 sm:mb-6 lg:mb-0">
            <Link
              href="/inventory"
              className="nav-text px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all text-center text-xs sm:text-sm md:text-base min-h-[44px] flex items-center justify-center"
            >
              {slides[currentSlide].cta}
            </Link>
          </div>

          {/* Right Content */}
          <div className="text-right order-3">
            <h2 className="display-heading text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl 2xl:text-8xl leading-none mb-3 sm:mb-4 md:mb-6 lg:mb-8">
              {slides[currentSlide].subtitle}
            </h2>
            <div className="label-text mb-2 sm:mb-3 md:mb-4 opacity-80 text-xs sm:text-sm md:text-base">{slides[currentSlide].info}</div>

            {/* Navigation Arrows */}
            <div className="flex justify-end gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4 md:mt-6 lg:mt-8">
              <button
                onClick={prevSlide}
                className="p-2 sm:p-2.5 md:p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 sm:p-2.5 md:p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-40 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-0">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 label-text text-xs sm:text-sm">
            <span>©2025 Femi Leasing</span>
            <span className="hidden sm:inline">·</span>
            <Link href="/privacy" className="hover:underline min-h-[44px] flex items-center">
              Privacy
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="hidden lg:block flex-1 max-w-md mx-4 lg:mx-8">
            <div className="h-px bg-white/20 relative">
              <div
                className="h-px bg-white transition-all duration-500"
                style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white/40 rounded-full"></div>
        </div>
      </footer>
    </div>
  )
}
