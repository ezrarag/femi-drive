// Original dots navigation layout (current)
"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { AboutSection } from "@/data/aboutSections"

interface LayoutVariant1Props {
  sections: AboutSection[]
}

export function LayoutVariant1({ sections }: LayoutVariant1Props) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({})

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sections.length)
    setExpandedSections({})
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sections.length) % sections.length)
    setExpandedSections({})
  }

  const toggleReadMore = (slideIndex: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [slideIndex]: !prev[slideIndex],
    }))
  }

  const currentSection = sections[currentSlide]
  const isExpanded = expandedSections[currentSlide] || false

  return (
    <div className="relative z-40 flex items-center justify-center min-h-[calc(100vh-120px)] py-12 sm:py-16 md:py-24">
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
                {currentSection.label}
              </div>
              <h1 className="display-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-none">
                {currentSection.title}
              </h1>
              <div className="body-text leading-relaxed text-base sm:text-lg md:text-xl text-white/90 space-y-4">
                {currentSection.hasReadMore ? (
                  <>
                    <p>{isExpanded ? currentSection.fullContent : currentSection.shortContent}</p>
                    <button
                      onClick={() => toggleReadMore(currentSlide)}
                      className="mt-2 text-xs sm:text-sm underline hover:no-underline opacity-80 hover:opacity-100 transition-all inline-block"
                    >
                      {isExpanded ? "Read less" : "Read more"}
                    </button>
                  </>
                ) : (
                  <p>{currentSection.fullContent}</p>
                )}
              </div>
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
          {sections.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index)
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
    </div>
  )
}

