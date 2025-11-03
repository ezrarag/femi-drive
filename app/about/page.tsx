"use client"

import Image from "next/image"
import Link from "next/link"
import NavBar from "@/components/NavBar"
import { motion } from "framer-motion"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <NavBar variant="dark" transparent noBorder />
      
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
          <source
            src="https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/femileasing%2FHome%2F5419498-uhd_3840_2160_25fps.mp4?alt=media&token=a667e232-1daf-4aa9-b1a0-7ea2604f5051"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Main Content */}
      <main className="relative z-40 flex items-center justify-center min-h-[calc(100vh-120px)] py-12 sm:py-16 md:py-24">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 sm:space-y-8"
            >
              <div className="label-text opacity-80 text-sm sm:text-base">About Us</div>
              <h1 className="display-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-none">
                FEMI LEASING
              </h1>
              <div className="body-text leading-relaxed text-base sm:text-lg md:text-xl text-white/90 space-y-4">
                <p>
                  Our vision is to transform the car rental experience by continually evolving with the shifting landscape of modern mobility. We are committed to becoming the premier rental solution in the NJ/NY area, offering exceptional convenience, competitive pricing, and an unwavering focus on customer satisfaction.
                </p>
                <p>
                  To provide accessible, flexible, and dependable car rental solutions that fit seamlessly into the lives of our clients. We're committed to serving a diverse community of drivers—whether you're working in the gig economy, traveling for business, or simply need a reliable ride for personal use.
                </p>
              </div>
              <Link 
                href="/contact" 
                className="label-text underline hover:no-underline transition-all inline-block text-sm sm:text-base md:text-lg"
              >
                Contact Us
              </Link>
            </motion.div>

            {/* Right Column - Photo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="rounded-lg shadow-md bg-white/10 backdrop-blur-sm p-2 sm:p-4 max-w-md w-full">
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-md">
                  <Image
                    src="/placeholder-logo.png"
                    alt="Femi Leasing Fleet"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-40 px-6 pb-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 label-text text-xs sm:text-sm">
            <span>© 2025 Femi Leasing</span>
            <span>·</span>
            <Link href="/privacy" className="hover:underline min-h-[44px] flex items-center">
              Privacy
            </Link>
          </div>
          <div className="w-3 h-3 bg-white/40 rounded-full"></div>
        </div>
      </footer>
    </div>
  )
}
