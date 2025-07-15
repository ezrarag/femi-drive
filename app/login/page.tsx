"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

export default function LoginPage() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + "/dashboard" } })
  }

  useEffect(() => {
    // Optionally, check if already logged in and redirect
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) window.location.href = "/dashboard"
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col items-center">
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