// Split layout: text left, vehicle image right
"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { HomeText } from "@/data/homeText"

interface HeroVariant2Props {
  text: HomeText
  imageUrl?: string
}

export function HeroVariant2({ text, imageUrl }: HeroVariant2Props) {
  return (
    <div className="relative min-h-screen w-full bg-black">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-12 sm:py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <h1 className="display-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-none mb-4 sm:mb-6 md:mb-8">
              {text.heading}
            </h1>
            {text.subheading && (
              <h2 className="label-text text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6 opacity-90">
                {text.subheading}
              </h2>
            )}
            <div className="body-text text-sm sm:text-base mb-8 sm:mb-10 md:mb-12 opacity-90">
              <p>{text.description}</p>
            </div>
            <Link
              href="/inventory"
              className="nav-text px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all inline-flex items-center justify-center text-center text-sm sm:text-base md:text-lg min-h-[44px]"
            >
              {text.ctaText}
            </Link>
          </motion.div>
          
          {/* Right: Vehicle Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-lg overflow-hidden"
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Featured vehicle"
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                <span className="text-white/40 text-lg">Vehicle Image</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

