// Accordion-style layout
"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { AboutSection } from "@/data/aboutSections"

interface LayoutVariant2Props {
  sections: AboutSection[]
}

export function LayoutVariant2({ sections }: LayoutVariant2Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({})

  const toggleSection = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const toggleReadMore = (index: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  return (
    <div className="relative z-40 flex items-center justify-center min-h-[calc(100vh-120px)] py-12 sm:py-16 md:py-24">
      <div className="w-full max-w-4xl mx-auto px-6">
        <div className="space-y-4">
          {sections.map((section, index) => {
            const isOpen = openIndex === index
            const isExpanded = expandedSections[index] || false

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full p-6 sm:p-8 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <div>
                    <div className="label-text opacity-80 text-sm sm:text-base mb-2">
                      {section.label}
                    </div>
                    <h2 className="display-heading text-2xl sm:text-3xl md:text-4xl">
                      {section.title}
                    </h2>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 sm:w-6 sm:h-6 text-white/60 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 sm:p-8 pt-0">
                        <div className="body-text leading-relaxed text-base sm:text-lg text-white/90 space-y-4">
                          {section.hasReadMore ? (
                            <>
                              <p>{isExpanded ? section.fullContent : section.shortContent}</p>
                              <button
                                onClick={() => toggleReadMore(index)}
                                className="text-xs sm:text-sm underline hover:no-underline opacity-80 hover:opacity-100 transition-all inline-block"
                              >
                                {isExpanded ? "Read less" : "Read more"}
                              </button>
                            </>
                          ) : (
                            <p>{section.fullContent}</p>
                          )}
                        </div>
                        {index === 0 && (
                          <Link 
                            href="/contact" 
                            className="mt-4 label-text underline hover:no-underline transition-all inline-block text-sm sm:text-base"
                          >
                            Contact Us
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

