"use client"

import Link from "next/link"
import { useState } from "react"
import { User, Menu, X, Phone } from "lucide-react"
import { useRouter } from "next/navigation"

interface NavBarProps {
  variant?: "light" | "dark"
  transparent?: boolean
  noBorder?: boolean
}

function getInitials(name: string) {
  if (!name) return "?"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function NavBar({ variant = "light", transparent = false, noBorder = false }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const base = transparent
    ? "bg-transparent text-white"
    : variant === "dark"
      ? "bg-black text-white border-white/20"
      : "bg-white/80 text-neutral-900 border-neutral-300"
  const hover = variant === "dark"
    ? "hover:bg-white/10"
    : "hover:bg-white"
  const border = noBorder ? "" : (variant === "dark" ? "border-white/20" : "border-neutral-300")
  const dropdownBg = variant === "dark" ? "bg-black text-white border-white/20" : "bg-white text-gray-800 border-neutral-200"
  const dropdownHover = variant === "dark" ? "hover:bg-white/10" : "hover:bg-gray-100"

  return (
    <nav className={`relative z-50 flex items-center justify-between p-3 sm:p-4 md:p-6 ${base} ${border ? `border-b ${border}` : ""}`}> 
      {/* Left Section - Mobile Menu Button or Desktop Navigation */}
      <div className="flex items-center">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`xl:hidden p-2 rounded-lg ${hover} transition-all min-w-[44px] min-h-[44px] flex items-center justify-center`}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Desktop Navigation - Show on xl and up */}
        <div className="hidden xl:flex gap-2 2xl:gap-4">
          <Link
            href="/"
            className={`nav-text px-3 2xl:px-4 py-2 rounded-full border ${border} ${hover} transition-all text-xs 2xl:text-sm`}
          >
            Home
          </Link>
          <Link
            href="/inventory"
            className={`nav-text px-3 2xl:px-4 py-2 rounded-full border ${border} ${variant === "dark" ? "bg-white/10 text-white" : "bg-neutral-900 text-white"} transition-all text-xs 2xl:text-sm`}
          >
            Fleet
          </Link>
          {/* COMMENTED OUT: Services link
          <Link
            href="/services"
            className={`nav-text px-3 2xl:px-4 py-2 rounded-full border ${border} ${hover} transition-all text-xs 2xl:text-sm`}
          >
            Services
          </Link>
          */}
        </div>
      </div>

      {/* Center Logo - Always centered */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="text-center">
          <div className="text-xs sm:text-sm font-bold tracking-widest">FE</div>
          <div className="text-xs sm:text-sm font-bold tracking-widest -mt-1">MI</div>
        </div>
      </div>

      {/* Right Section - Desktop User Menu or Mobile User Buttons */}
      <div className="flex items-center">
        {/* Desktop User Menu - Show on xl and up */}
        <div className="hidden xl:flex gap-2 2xl:gap-4 items-center relative">
          {/* Phone Button */}
          <button
            onClick={() => window.open('facetime://201-898-7281', '_self')}
            className={`nav-text px-3 2xl:px-4 py-2 rounded-full border ${border} ${hover} flex items-center gap-2 transition-all text-xs 2xl:text-sm`}
            aria-label="Call 201-898-7281"
          >
            <Phone className="w-4 h-4 2xl:w-5 2xl:h-5" />
            <span className="hidden 2xl:inline">Call</span>
          </button>
          
          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className={`nav-text px-3 2xl:px-4 py-2 rounded-full border ${border} ${hover} font-medium transition-all text-xs 2xl:text-sm`}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              aria-controls="main-menu-dropdown"
              type="button"
            >
              Menu
            </button>
            {menuOpen && (
              <div
                id="main-menu-dropdown"
                className={`absolute right-0 top-full mt-2 w-32 rounded-lg shadow-lg border z-50 ${variant === "dark" ? "bg-transparent border-white/20" : "bg-transparent border-neutral-300"}`}
                onMouseLeave={() => setMenuOpen(false)}
              >
                <Link
                  href="/about"
                  className={`block px-3 py-2 rounded-t-lg text-sm ${variant === "dark" ? "hover:bg-white/20 text-white" : "hover:bg-white text-neutral-900"} transition-all`}
                  onClick={() => setMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/invest"
                  className={`block px-3 py-2 text-sm ${variant === "dark" ? "hover:bg-white/20 text-white" : "hover:bg-white text-neutral-900"} transition-all`}
                  onClick={() => setMenuOpen(false)}
                >
                  Invest
                </Link>
                <Link
                  href="/contact"
                  className={`block px-3 py-2 rounded-b-lg text-sm ${variant === "dark" ? "hover:bg-white/20 text-white" : "hover:bg-white text-neutral-900"} transition-all`}
                  onClick={() => setMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>
            )}
          </div>
        {/* User/Login Button */}
        <button
          onClick={() => router.push("/login")}
          className={`nav-text px-3 2xl:px-4 py-2 rounded-full border ${border} ${hover} flex items-center gap-2 transition-all text-xs 2xl:text-sm`}
          aria-label="Login"
        >
          <User className="w-4 h-4 2xl:w-5 2xl:h-5" />
          <span className="hidden 2xl:inline">Login</span>
        </button>
        </div>

        {/* Mobile User Buttons */}
        <div className="xl:hidden flex items-center gap-2">
          {/* Phone Button */}
          <button
            onClick={() => window.open('facetime://201-898-7281', '_self')}
            className={`p-2 rounded-lg ${hover} flex items-center gap-2 transition-all min-w-[44px] min-h-[44px]`}
            aria-label="Call 201-898-7281"
          >
            <Phone className="w-5 h-5" />
          </button>
          
          {/* User Button */}
          <button
            onClick={() => router.push("/login")}
            className={`p-2 rounded-lg ${hover} flex items-center gap-2 transition-all min-w-[44px] min-h-[44px]`}
            aria-label="Login"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200" onClick={() => setMobileMenuOpen(false)}>
          <div className={`absolute top-0 right-0 w-72 sm:w-80 h-full ${variant === "dark" ? "bg-black/90 backdrop-blur-md" : "bg-white/90 backdrop-blur-md"} shadow-xl p-6 animate-in slide-in-from-right duration-300`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className={`text-xl font-bold ${variant === "dark" ? "text-white" : "text-black"}`}>Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2 ${variant === "dark" ? "hover:bg-white/10" : "hover:bg-gray-100"} rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center`}
              >
                <X className={`w-6 h-6 ${variant === "dark" ? "text-white" : "text-black"}`} />
              </button>
            </div>
            
            <div className="space-y-2">
              <Link
                href="/"
                className={`block py-3 px-4 rounded-full ${variant === "dark" ? "hover:bg-white/20 text-white" : "hover:bg-white text-black"} transition-all text-lg min-h-[44px] flex items-center animate-in slide-in-from-right duration-300 delay-75`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/inventory"
                className={`block py-3 px-4 rounded-full ${variant === "dark" ? "hover:bg-white/20 text-white" : "hover:bg-white text-black"} transition-all text-lg min-h-[44px] flex items-center animate-in slide-in-from-right duration-300 delay-100`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Fleet
              </Link>
              {/* COMMENTED OUT: Services link in mobile menu
              <Link
                href="/services"
                className={`block py-3 px-4 rounded-full ${variant === "dark" ? "hover:bg-white/20 text-white" : "hover:bg-white text-black"} transition-all text-lg min-h-[44px] flex items-center animate-in slide-in-from-right duration-300 delay-125`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              */}
              <Link
                href="/about"
                className={`block py-3 px-4 rounded-full ${variant === "dark" ? "hover:bg-white/20 text-white" : "hover:bg-white text-black"} transition-all text-lg min-h-[44px] flex items-center animate-in slide-in-from-right duration-300 delay-150`}
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/invest"
                className={`block py-3 px-4 rounded-full ${variant === "dark" ? "hover:bg-white/20 text-white" : "hover:bg-white text-black"} transition-all text-lg min-h-[44px] flex items-center animate-in slide-in-from-right duration-300 delay-175`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Invest
              </Link>
              <Link
                href="/contact"
                className={`block py-3 px-4 rounded-full ${variant === "dark" ? "hover:bg-white/20 text-white" : "hover:bg-white text-black"} transition-all text-lg min-h-[44px] flex items-center animate-in slide-in-from-right duration-300 delay-200`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
} 