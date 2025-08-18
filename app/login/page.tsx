"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: "google", 
        options: { 
          redirectTo: window.location.origin + "/auth/callback" 
        } 
      })
      
      if (error) {
        console.error('Login error:', error)
      }
    } catch (err) {
      console.error('Unexpected login error:', err)
    }
  }

  useEffect(() => {
    // Handle OAuth hash fragments if they exist
    const handleHashFragment = async () => {
      if (window.location.hash && window.location.hash.includes('access_token')) {
        console.log('Detected OAuth hash fragment on login page, attempting to handle...')
        
        // Extract the hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        
        if (accessToken) {
          try {
            // Set the session manually
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get('refresh_token') || '',
            })
            
            if (!error) {
              console.log('Session set successfully from hash fragment')
              // Clear the hash fragment
              window.history.replaceState(null, '', window.location.pathname)
              // Redirect to dashboard
              router.push("/dashboard")
            } else {
              console.error('Error setting session from hash:', error)
            }
          } catch (err) {
            console.error('Unexpected error handling hash fragment:', err)
          }
        }
      }
    }
    
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

    // Check initial session and handle hash fragments
    handleHashFragment()
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