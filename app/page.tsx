"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "DRIVE",
      subtitle: "TO EARN",
      description:
        "ROOTED IN THE GIG ECONOMY, WE'VE DEVELOPED A COMPREHENSIVE APPROACH TO VEHICLE ACCESS. FLEXIBLE TERMS MEET INNOVATIVE FINANCING TO CREATE THE PERFECT PLATFORM FOR SUCCESS.",
      cta: "GET STARTED",
      info: "01 - 03 NEWARK - JERSEY CITY FLEET",
    },
    {
      title: "FLEXIBLE",
      subtitle: "FINANCING",
      description:
        "NO CREDIT? NO PROBLEM. OUR INNOVATIVE FINANCING SOLUTIONS BREAK DOWN BARRIERS TO VEHICLE OWNERSHIP. WEEKLY PAYMENTS, LEASE-TO-OWN, AND CUSTOM TERMS DESIGNED FOR YOUR SUCCESS.",
      cta: "APPLY NOW",
      info: "02 - 05 FINANCING - LEASE TO OWN",
    },
    {
      title: "PREMIUM",
      subtitle: "FLEET",
      description:
        "EVERY VEHICLE IN OUR FLEET IS CAREFULLY SELECTED AND MAINTAINED TO RIDESHARE STANDARDS. GIG-READY VEHICLES THAT HELP YOU MAXIMIZE YOUR EARNING POTENTIAL ON THE ROAD.",
      cta: "VIEW FLEET",
      info: "03 - 08 INVENTORY - GIG READY VEHICLES",
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
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
      <nav className="relative z-50 flex items-center justify-between px-8 py-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            Home
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full text-white/70 hover:bg-white/10 hover:text-white">
            <Link href="/inventory">Fleet</Link>
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full text-white/70 hover:bg-white/10 hover:text-white">
            <Link href="/services">Services</Link>
          </Button>
        </div>

        {/* Center Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="text-center">
            <div className="text-2xl font-bold tracking-wider text-white">
              FE
              <br />
              MI
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="rounded-full text-white/70 hover:bg-white/10 hover:text-white">
            <Link href="/about">About</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <Link href="/contact">Contact</Link>
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-40 flex h-full items-center justify-between px-8 pb-20">
        {/* Left Content */}
        <div className="flex-1 max-w-md">
          <div className="mb-8">
            <h1 className="text-8xl font-black tracking-tighter text-white leading-none">
              {slides[currentSlide].title}
            </h1>
          </div>

          <div className="mb-6">
            <p className="text-xs font-medium tracking-widest text-white/60 uppercase mb-4">LEASING COMPANY</p>
            <p className="text-sm leading-relaxed text-white/80 font-light tracking-wide max-w-xs">
              {slides[currentSlide].description}
            </p>
          </div>

          <Button
            variant="link"
            className="text-white/80 hover:text-white p-0 h-auto font-normal tracking-widest text-xs"
          >
            READ MORE
          </Button>
        </div>

        {/* Center CTA */}
        <div className="flex-1 flex justify-center">
          <Button
            size="lg"
            className="rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-sm px-12 py-6 text-lg font-medium tracking-wider"
          >
            <Play className="mr-3 h-5 w-5" />
            {slides[currentSlide].cta}
          </Button>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col items-end">
          <div className="text-right mb-8">
            <h2 className="text-8xl font-black tracking-tighter text-white leading-none">
              {slides[currentSlide].subtitle}
            </h2>
          </div>

          <div className="text-right mb-8">
            <p className="text-xs font-medium tracking-widest text-white/60 uppercase">{slides[currentSlide].info}</p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevSlide}
              className="rounded-full w-10 h-10 p-0 text-white/60 hover:text-white hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextSlide}
              className="rounded-full w-10 h-10 p-0 text-white/60 hover:text-white hover:bg-white/10"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Elements */}
      <div className="absolute bottom-0 left-0 right-0 z-50">
        {/* Copyright */}
        <div className="absolute bottom-6 left-8">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-white/60" />
              <div className="w-2 h-2 rounded-full bg-white/60" />
            </div>
            <p className="text-xs text-white/60 tracking-wider">
              ©2025 FEMI LEASING - <span className="underline cursor-pointer">TERMS</span>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64">
          <div className="h-0.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500 ease-out"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Slide Indicator */}
        <div className="absolute bottom-6 right-8">
          <div className="w-3 h-3 rounded-full bg-white/40" />
        </div>
      </div>
    </div>
  )
}
