// Homepage hero component with toggleable variants
"use client"

import { useState } from "react"
import { HeroVariant1 } from "./HeroVariant1"
import { HeroVariant2 } from "./HeroVariant2"
import { HeroVariant3 } from "./HeroVariant3"
import { homeTextVariants, HomeTextVariant } from "@/data/homeText"
import NavBar from "@/components/NavBar"
import { ReviewPopup } from "@/components/ReviewPopup"
import Link from "next/link"

type LayoutVariant = 'centered' | 'split' | 'video'

interface HomeHeroProps {
  layoutVariant?: LayoutVariant
  textVariant?: HomeTextVariant
  imageUrl?: string
  videoUrl?: string
}

export function HomeHero({ 
  layoutVariant = 'video', 
  textVariant = 'professional',
  imageUrl,
  videoUrl 
}: HomeHeroProps) {
  const [reviewPopupOpen, setReviewPopupOpen] = useState(false)
  const text = homeTextVariants[textVariant]

  const renderHero = () => {
    switch (layoutVariant) {
      case 'centered':
        return <HeroVariant1 text={text} imageUrl={imageUrl} />
      case 'split':
        return <HeroVariant2 text={text} imageUrl={imageUrl} />
      case 'video':
      default:
        return <HeroVariant3 text={text} videoUrl={videoUrl} />
    }
  }

  return (
    <>
      <NavBar variant="dark" transparent noBorder />
      {renderHero()}
      
      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-40 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-0">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 label-text text-xs sm:text-sm">
            <span>©2025 Femi Leasing</span>
            <span className="hidden sm:inline">·</span>
            <a href="/privacy" className="hover:underline min-h-[44px] flex items-center">
              Privacy
            </a>
            <span className="hidden sm:inline">·</span>
            <button
              onClick={() => setReviewPopupOpen(true)}
              className="hover:underline min-h-[44px] flex items-center"
            >
              Reviews
            </button>
            <span className="hidden sm:inline">·</span>
            <Link
              href="/inventory"
              className="hover:underline min-h-[44px] flex items-center"
            >
              Bookings
            </Link>
          </div>
          {/* Pulsating button - commented out */}
          {/* <div className="relative">
            <button
              onClick={() => setReviewPopupOpen(true)}
              className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-white/40 rounded-full hover:bg-white/60 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 relative"
              aria-label="View reviews"
            >
              <span className="absolute inset-0 rounded-full bg-white/40 animate-ping" />
            </button>
          </div> */}
        </div>
      </footer>

      {/* Review Popup */}
      <ReviewPopup open={reviewPopupOpen} onOpenChange={setReviewPopupOpen} />
    </>
  )
}

