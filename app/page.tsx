"use client"

import Link from "next/link"
import { Truck, Car, Calendar } from "lucide-react"
import NavBar from "@/components/NavBar"
import { motion } from "framer-motion"

export default function HomePage() {
  const services = [
    {
      icon: Truck,
      title: "Fleet Management",
      description: "Comprehensive fleet management solutions designed to help businesses optimize their vehicle operations and maximize efficiency.",
    },
    {
      icon: Car,
      title: "Gig Rentals",
      description: "Perfect vehicles for Uber, Lyft, DoorDash, Instacart, and other gig economy platforms. Get on the road and start earning today.",
    },
    {
      icon: Calendar,
      title: "Short-Term & Long-Term Rentals",
      description: "Flexible rental options to meet your needs, whether you need a vehicle for a few days or several months.",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <NavBar variant="dark" transparent noBorder />
      
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden">
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

      {/* Hero Section */}
      <main className="relative z-40 flex items-center justify-center min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-100px)] md:min-h-[calc(100vh-120px)] px-3 sm:px-4 md:px-6">
        <div className="w-full max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="display-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl leading-none mb-4 sm:mb-6 md:mb-8">
              FEMI LEASING
            </h1>
            <p className="body-text text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 opacity-90">
              Your trusted partner for premium vehicle rentals, fleet management, and gig economy solutions in the NJ/NY area.
            </p>
            <Link
              href="/inventory"
              className="nav-text px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all inline-block text-center text-sm sm:text-base md:text-lg min-h-[44px] flex items-center justify-center mx-auto"
            >
              View Fleet
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Service Highlights Section */}
      <section className="relative z-40 px-3 sm:px-4 md:px-6 py-12 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <h2 className="display-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6">
              Our Services
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 sm:p-8 hover:bg-white/10 transition-all"
                >
                  <div className="flex justify-center mb-4 sm:mb-6">
                    <div className="p-3 sm:p-4 bg-white/10 rounded-full">
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                    </div>
                  </div>
                  <h3 className="label-text text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 text-center">
                    {service.title}
                  </h3>
                  <p className="body-text text-sm sm:text-base md:text-lg opacity-80 text-center leading-relaxed">
                    {service.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

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
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white/40 rounded-full"></div>
        </div>
      </footer>
    </div>
  )
}
