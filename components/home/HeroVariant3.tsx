// Full-screen video background hero
"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { HomeText } from "@/data/homeText"

interface HeroVariant3Props {
  text: HomeText
  videoUrl?: string
}

export function HeroVariant3({ text, videoUrl }: HeroVariant3Props) {
  return (
    <div className="h-screen bg-black text-white relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden">
        {videoUrl ? (
          <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
        )}
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Hero Section */}
      <main className="relative z-40 flex items-center justify-center h-full px-3 sm:px-4 md:px-6">
        <div className="w-full max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="display-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl leading-none mb-4 sm:mb-6 md:mb-8">
              {text.heading}
            </h1>
            {text.subheading && (
              <h2 className="label-text text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6 opacity-90">
                {text.subheading}
              </h2>
            )}
            <div className="body-text text-sm sm:text-base max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 opacity-90">
              <p>{text.description}</p>
            </div>
            <Link
              href="/inventory"
              className="nav-text px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all inline-flex items-center justify-center text-center text-sm sm:text-base md:text-lg min-h-[44px] mx-auto"
            >
              {text.ctaText}
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

