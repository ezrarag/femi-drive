"use client"

import Link from "next/link"
import NavBar from "@/components/NavBar"
import { motion } from "framer-motion"
import { useState } from "react"
import { ReviewPopup } from "@/components/ReviewPopup"

export default function HomePage() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [reviewPopupOpen, setReviewPopupOpen] = useState(false)
  return (
    <div className="h-screen bg-black text-white relative overflow-hidden">
      <NavBar variant="dark" transparent noBorder />
      
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
          <source
            src="https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/femileasing%2FHome%2F5419064-uhd_3840_2160_25fps.mp4?alt=media&token=d3d15a44-e5fe-4023-8273-8e531e5109e1"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
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
              FEMI LEASING
            </h1>
            <div className="body-text text-sm sm:text-base max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 opacity-90">
              <p className={isExpanded ? "" : "line-clamp-1"}>
                At Femi Leasing, we believe finding the right vehicle should be simple, affordable, and stress-free. Whether you're hitting the road for work, running errands, or planning your next adventure, we offer a range of well maintained vehicles to fit your lifestyle and budget.
                {" "}
                {isExpanded && (
                  <>
                    Browse our selection of reliable cars and discover flexible rental options designed to meet your needs. With transparent pricing, easy booking, and outstanding customer support, Femi Leasing makes it easier than ever to get behind the wheel with confidence.
                    {" "}
                    Find your perfect ride today, your journey starts here!
                  </>
                )}
              </p>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-xs sm:text-sm underline hover:no-underline opacity-80 hover:opacity-100 transition-all"
              >
                {isExpanded ? "Read less" : "Read more"}
              </button>
            </div>
            <Link
              href="/inventory"
              className="nav-text px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all inline-flex items-center justify-center text-center text-sm sm:text-base md:text-lg min-h-[44px] mx-auto"
            >
              View Fleet
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-40 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-0">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 label-text text-xs sm:text-sm">
            <span>©2025 Femi Leasing</span>
            <span className="hidden sm:inline">·</span>
            <Link href="/privacy" className="hover:underline min-h-[44px] flex items-center">
              Privacy
            </Link>
          </div>
          <button
            onClick={() => setReviewPopupOpen(true)}
            className="w-2 h-2 sm:w-3 sm:h-3 bg-white/40 rounded-full hover:bg-white/60 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="View reviews"
          />
        </div>
      </footer>

      {/* Review Popup */}
      <ReviewPopup open={reviewPopupOpen} onOpenChange={setReviewPopupOpen} />
    </div>
  )
}
