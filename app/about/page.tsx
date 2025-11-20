"use client"

import Link from "next/link"
import NavBar from "@/components/NavBar"
import { AboutContent } from "@/components/about"

// Configure About page layout variant here
// Options: 'dots' | 'accordion'
const ABOUT_LAYOUT: 'dots' | 'accordion' = 'dots'

export default function AboutPage() {
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
      <main>
        <AboutContent layoutVariant={ABOUT_LAYOUT} />
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
