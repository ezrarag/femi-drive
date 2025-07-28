"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ 
      provider: "google", 
      options: { 
        redirectTo: window.location.origin + "/dashboard" 
      } 
    })
  }

  useEffect(() => {
    // Handle auth state changes and redirects
    const handleAuthChange = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Clear any hash fragments from the URL
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname)
        }
        router.push("/dashboard")
      }
    }

    // Check initial session
    handleAuthChange()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Clear any hash fragments from the URL
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname)
        }
        router.push("/dashboard")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 relative overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://wayxucjcejqxydflxwgo.supabase.co/storage/v1/object/public/site-assets/homepage/coverr-electric-car-driving-in-the-dark-woods-668-1080p.mp4"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />
      {/* Login Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col items-center relative z-20">
        <div className="mb-6 flex flex-col items-center">
          <Image src="https://wayxucjcejqxydflxwgo.supabase.co/storage/v1/object/public/site-assets/login/f9lugl5xwm8hkwltjdhm-removebg-preview.png" alt="Femi Leasing Logo" width={48} height={48} className="mb-2" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Sign in to Femi Leasing</h1>
          <p className="text-neutral-500 text-center text-sm">Welcome! Please sign in with Google to access your dashboard and manage your bookings.</p>
        </div>
        <button
          onClick={handleLogin}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-lg mt-2"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
} 