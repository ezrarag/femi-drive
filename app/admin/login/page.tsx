"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

export default function AdminLoginPage() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError("")
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: "google", 
        options: { 
          redirectTo: window.location.origin + "/admin/dashboard" 
        } 
      })
      
      if (error) {
        setError(`Login error: ${error.message}`)
      }
    } catch (err) {
      setError("An unexpected error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // TEMPORARY: Allow any email for development - REMOVE BEFORE PRODUCTION
        // if (user.email && user.email.endsWith("@femileasing.com")) {
        if (user.email) {
          console.log("Admin user authenticated, redirecting to dashboard...")
          window.location.href = "/admin/dashboard"
        } else {
          setError("Access denied: You must use a femileasing.com email.")
          await supabase.auth.signOut()
        }
      }
    }

    // Check initial session
    checkAdmin()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session?.user) {
        // TEMPORARY: Allow any email for development - REMOVE BEFORE PRODUCTION
        // if (session.user.email && session.user.email.endsWith("@femileasing.com")) {
        if (session.user.email) {
          console.log("Admin user signed in, redirecting to dashboard...")
          window.location.href = "/admin/dashboard"
        } else {
          setError("Access denied: You must use a femileasing.com email.")
          await supabase.auth.signOut()
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center">
          <Image 
            src="https://wayxucjcejqxydflxwgo.supabase.co/storage/v1/object/public/site-assets/login/f9lugl5xwm8hkwltjdhm-removebg-preview.png" 
            alt="Femi Leasing Logo" 
            width={48} 
            height={48} 
            className="mb-2" 
          />
          <h1 className="text-2xl font-bold text-center text-neutral-900">Admin Access</h1>
          <p className="text-neutral-500 text-center text-sm mt-2">
            Sign in with your Google account to access the admin dashboard and manage the system.
          </p>
          <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
            ⚠️ Development Mode: Email restrictions temporarily disabled
          </div>
        </div>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-400"
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
        {error && <div className="text-red-600 text-center mt-4">{error}</div>}
        
        {/* Debug info */}
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
          <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
          <p>Redirect target: {typeof window !== 'undefined' ? window.location.origin + '/admin/dashboard' : 'N/A'}</p>
        </div>
      </div>
    </div>
  )
} 