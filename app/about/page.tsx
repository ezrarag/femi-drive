"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"

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
    <main className="relative min-h-screen w-full flex flex-col items-center text-white">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://gfqhzuqckfxtzqawdcso.supabase.co/storage/v1/object/public/usethisfornow//pexels-artempodrez-7232668.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6 w-full">
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
            className="nav-text px-4 py-2 bg-white text-black rounded-full border border-white transition-all"
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

      {/* Content wrapper */}
      <section className="relative z-10 flex-1 w-full max-w-3xl px-6 flex flex-col items-center justify-center text-center gap-8 py-24">
        {/* Title */}
        <h1 className="display-heading text-4xl md:text-6xl tracking-tighter text-white">FEMI LEASING</h1>

        {/* Body paragraph */}
        <p className="body-text whitespace-pre-line leading-relaxed max-w-prose text-white/90">
          {`"At Femi Leasing, our vision is to transform the car rental experience by continually evolving with the shifting landscape of modern mobility. We are committed to becoming the premier rental solution in the NJ/NY area, offering exceptional convenience, competitive pricing, and an unwavering focus on customer satisfaction.
​
Through innovation, strategic partnerships, and a deep understanding of our clients' needs, we aim to set a new industry benchmark delivering flexibility, reliability, and excellence at every turn."\n\nAt Femi Leasing, our mission is to provide accessible, flexible, and dependable car rental solutions that fit seamlessly into the lives of our clients. We're committed to serving a diverse community of drivers whether you're working in the gig economy, traveling for business, or simply need a reliable ride for personal use.​ By combining quality vehicles with exceptional customer service and user friendly policies, we aim to remove the stress from car rentals and empower our clients with the freedom to move on their own terms.`}
        </p>

        {/* Cycling Photos */}
        <div className="rounded-lg shadow-md bg-white/10 backdrop-blur-sm p-2 inline-block">
          <div className="relative w-[300px] h-[360px] overflow-hidden rounded-md">
            {placeholderPhotos.map((photo, index) => (
              <Image
                key={index}
                src={photo || "/placeholder.svg"}
                alt={`Portrait ${index + 1}`}
                width={300}
                height={360}
                unoptimized
                className={`absolute inset-0 object-cover transition-all duration-1000 ${
                  index === currentPhotoIndex ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-sm"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom paragraph */}
        <p className="body-text leading-relaxed max-w-prose text-white/90">
          At Femi Leasing, our journey began with a simple mission: to redefine car rentals by making the process more
          convenient, flexible, and accessible especially for the hardworking individuals powering today's gig economy. ​
          With over 20 years of industry experience, we saw a growing need in the NJ/NY area for reliable, short term
          rental options tailored to modern drivers. Whether you're behind the wheel for Uber, running errands, or
          taking a well deserved weekend getaway, we wanted to make sure you had the right vehicle without the stress.
          What started as a small venture has grown into a trusted name, proudly serving drivers between the ages of 25
          and 55 with high quality vehicles, transparent pricing, and unmatched customer service. Our close
          collaboration with Uber and other ride sharing platforms allows us to offer tailored solutions that help
          drivers hit the road faster and earn more, with less hassle. ​ Femi Leasing isn't just a rental service it's a
          community built on trust, convenience, and the freedom to move.
        </p>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-4 label-text flex items-center justify-between text-white/70">
        <div>© 2025 Femi Leasing · Cookies</div>
        <div className="text-center flex-1">All Rights Reserved</div>
        <div className="flex items-center gap-1">
          <span>Website by</span>
          <span role="img" aria-label="bow and arrow">
            🏹
          </span>
        </div>
      </footer>
    </main>
  )
}
