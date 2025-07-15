"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { User } from "lucide-react"
import { supabase } from "@/lib/supabase"
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
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user)
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("name, avatar_url")
          .eq("id", user.id)
          .single()
        setProfile(profileData)
      }
    })
  }, [])

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
    <nav className={`relative z-50 flex items-center justify-between p-6 ${base} ${border ? `border-b ${border}` : ""}`}> 
      <div className="flex gap-4">
        <Link
          href="/"
          className={`nav-text px-4 py-2 rounded-full border ${border} ${hover} transition-all`}
        >
          Home
        </Link>
        <Link
          href="/inventory"
          className={`nav-text px-4 py-2 rounded-full border ${border} ${variant === "dark" ? "bg-white/10 text-white" : "bg-neutral-900 text-white"} transition-all`}
        >
          Fleet
        </Link>
        <Link
          href="/services"
          className={`nav-text px-4 py-2 rounded-full border ${border} ${hover} transition-all`}
        >
          Services
        </Link>
      </div>

      {/* Center Logo */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="text-center">
          <div className="text-sm font-bold tracking-widest">FE</div>
          <div className="text-sm font-bold tracking-widest -mt-1">MI</div>
        </div>
      </div>

      <div className="flex gap-4 items-center relative">
        {/* Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className={`nav-text px-4 py-2 rounded-full border ${border} ${hover} font-medium transition-all`}
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
              className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg border z-50 ${dropdownBg}`}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <Link
                href="/about"
                className={`block px-4 py-2 rounded-t-lg ${dropdownHover}`}
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`block px-4 py-2 rounded-b-lg ${dropdownHover}`}
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          )}
        </div>
        {/* User/Login Button */}
        <button
          onClick={() => router.push(user ? "/dashboard" : "/login")}
          className={`nav-text px-4 py-2 rounded-full border ${border} ${hover} flex items-center gap-2 transition-all`}
          aria-label={user ? "Dashboard" : "Login"}
        >
          {user && profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
          ) : user && profile?.name ? (
            <span className="w-6 h-6 rounded-full bg-neutral-300 flex items-center justify-center font-bold text-neutral-700">
              {getInitials(profile.name)}
            </span>
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="hidden sm:inline">{user ? "Dashboard" : "Login"}</span>
        </button>
      </div>
    </nav>
  )
} 