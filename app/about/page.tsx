"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import NavBar from "@/components/NavBar"

// Placeholder photos for cycling
const placeholderPhotos = [
  "/placeholder-user.jpg",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=360&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=360&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=360&fit=crop&crop=face",
]

export default function AboutPage() {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  // Cycle through photos every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % placeholderPhotos.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <NavBar variant="dark" transparent noBorder />
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
          <source
            src="https://wayxucjcejqxydflxwgo.supabase.co/storage/v1/object/public/site-assets/homepage/coverr-electric-car-driving-in-the-dark-woods-668-1080p.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/40" />
      </div>
      {/* Main Content */}
      <main className="relative z-40 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left Content */}
          <div className="text-left">
            <div className="label-text mb-4 opacity-80">About Us</div>
            <h1 className="display-heading text-6xl md:text-8xl lg:text-9xl leading-none mb-8">
              FEMI LEASING
            </h1>
            <div className="body-text leading-relaxed max-w-md mb-8 text-white/90">
              {`Our vision is to transform the car rental experience by continually evolving with the shifting landscape of modern mobility. We are committed to becoming the premier rental solution in the NJ/NY area, offering exceptional convenience, competitive pricing, and an unwavering focus on customer satisfaction.`}
            </div>
            <Link href="/contact" className="label-text underline hover:no-underline transition-all">
              Contact Us
            </Link>
          </div>

          {/* Center Content (optional: could add a logo or image here) */}
          <div className="flex justify-center">
            <div className="rounded-lg shadow-md bg-white/10 backdrop-blur-sm p-2 inline-block">
              <div className="relative w-[300px] h-[360px] overflow-hidden rounded-md flex items-center justify-center">
                <Image
                  src="/placeholder-logo.png"
                  alt="Femi Leasing Logo"
                  width={180}
                  height={180}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="text-right">
            <h2 className="display-heading text-4xl md:text-6xl lg:text-7xl leading-none mb-8">
              Our Mission
            </h2>
            <div className="label-text mb-4 opacity-80">NJ/NY Area</div>
            <div className="body-text leading-relaxed max-w-md mb-8 text-white/90">
              {`To provide accessible, flexible, and dependable car rental solutions that fit seamlessly into the lives of our clients. We're committed to serving a diverse community of drivers—whether you're working in the gig economy, traveling for business, or simply need a reliable ride for personal use.`}
            </div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="relative z-40 px-6 pb-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 label-text">
            <span>© 2025 Femi Leasing</span>
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
