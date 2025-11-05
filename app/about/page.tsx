"use client"

import { useState } from "react"
import Link from "next/link"
import NavBar from "@/components/NavBar"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function AboutPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({})
  
  const slides = [
    {
      label: "About Us",
      title: "FEMI LEASING",
      content: (
        <div className="body-text leading-relaxed text-base sm:text-lg md:text-xl text-white/90 space-y-4">
          <p>
            To provide accessible, flexible, and dependable car rental solutions that fit seamlessly into the lives of our clients. We're committed to serving a diverse community of drivers—whether you're working in the gig economy, traveling for business, or simply need a reliable ride for personal use.
          </p>
        </div>
      ),
    },
    {
      label: "Our Vision",
      title: "OUR VISION",
      hasReadMore: true,
      shortContent: (
        <div className="body-text leading-relaxed text-base sm:text-lg md:text-xl text-white/90 space-y-4">
          <p>
            At Femi Leasing, our vision is to transform the car rental experience by continually evolving with the shifting landscape of modern mobility. We are committed to becoming the premier rental solution in the NJ/NY area, offering exceptional convenience, competitive pricing, and an unwavering focus on customer satisfaction.
          </p>
        </div>
      ),
      fullContent: (
        <div className="body-text leading-relaxed text-base sm:text-lg md:text-xl text-white/90 space-y-4">
          <p>
            At Femi Leasing, our vision is to transform the car rental experience by continually evolving with the shifting landscape of modern mobility. We are committed to becoming the premier rental solution in the NJ/NY area, offering exceptional convenience, competitive pricing, and an unwavering focus on customer satisfaction.
          </p>
          <p>
            Through innovation, strategic partnerships, and a deep understanding of our clients' needs, we aim to set a new industry benchmark delivering flexibility, reliability, and excellence at every turn.
          </p>
        </div>
      ),
    },
    {
      label: "Who We Are",
      title: "WHO WE ARE",
      hasReadMore: true,
      shortContent: (
        <div className="body-text leading-relaxed text-base sm:text-lg md:text-xl text-white/90 space-y-4">
          <p>
            At Femi Leasing, our journey began with a simple mission: to redefine car rentals by making the process more convenient, flexible, and accessible especially for the hardworking individuals powering today's gig economy.
          </p>
        </div>
      ),
      fullContent: (
        <div className="body-text leading-relaxed text-base sm:text-lg md:text-xl text-white/90 space-y-4">
          <p>
            At Femi Leasing, our journey began with a simple mission: to redefine car rentals by making the process more convenient, flexible, and accessible especially for the hardworking individuals powering today's gig economy.
          </p>
          <p>
            With over 20 years of industry experience, we saw a growing need in the NJ/NY area for reliable, short term rental options tailored to modern drivers. Whether you're behind the wheel for Uber, running errands, or taking a well deserved weekend getaway, we wanted to make sure you had the right vehicle without the stress.
          </p>
          <p>
            What started as a small venture has grown into a trusted name, proudly serving drivers between the ages of 25 and 55 with high quality vehicles, transparent pricing, and unmatched customer service. Our close collaboration with Uber and other ride sharing platforms allows us to offer tailored solutions that help drivers hit the road faster and earn more, with less hassle.
          </p>
          <p>
            Femi Leasing isn't just a rental service it's a community built on trust, convenience, and the freedom to move.
          </p>
        </div>
      ),
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    // Reset expanded state when changing slides
    setExpandedSections({})
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    // Reset expanded state when changing slides
    setExpandedSections({})
  }

  const toggleReadMore = (slideIndex: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [slideIndex]: !prev[slideIndex],
    }))
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <NavBar variant="dark" transparent noBorder />
      
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
          <source
            src="https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/femileasing%2Fabout%2F5992516-uhd_3840_2160_30fps.mp4?alt=media&token=2c876181-1d48-48c8-aefe-f604e34e8df5"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/80" />
      </div>

      {/* Main Content */}
      <main className="relative z-40 flex items-center justify-center min-h-[calc(100vh-120px)] py-12 sm:py-16 md:py-24">
        <div className="w-full max-w-4xl mx-auto px-6 relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute -left-4 sm:-left-16 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/20 hover:border-white/30 z-10"
            aria-label="Previous slide"
          >
            <ArrowLeft className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute -right-4 sm:-right-16 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/20 hover:border-white/30 z-10"
            aria-label="Next slide"
          >
            <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </button>

          {/* Slide Content */}
          <div className="relative min-h-[400px] sm:min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="space-y-6 sm:space-y-8"
              >
                <div className="label-text opacity-80 text-sm sm:text-base">
                  {slides[currentSlide].label}
                </div>
                <h1 className="display-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-none">
                  {slides[currentSlide].title}
                </h1>
                {slides[currentSlide].hasReadMore ? (
                  <>
                    {expandedSections[currentSlide] 
                      ? slides[currentSlide].fullContent 
                      : slides[currentSlide].shortContent}
                    <button
                      onClick={() => toggleReadMore(currentSlide)}
                      className="mt-2 text-xs sm:text-sm underline hover:no-underline opacity-80 hover:opacity-100 transition-all inline-block"
                    >
                      {expandedSections[currentSlide] ? "Read less" : "Read more"}
                    </button>
                  </>
                ) : (
                  slides[currentSlide].content
                )}
                {currentSlide === 0 && (
                  <Link 
                    href="/contact" 
                    className="label-text underline hover:no-underline transition-all inline-block text-sm sm:text-base md:text-lg"
                  >
                    Contact Us
                  </Link>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentSlide(index)
                  // Reset expanded state when changing slides
                  setExpandedSections({})
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-8 bg-white"
                    : "w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
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
