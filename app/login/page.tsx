"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" })
  }

  useEffect(() => {
    // Optionally, check if already logged in and redirect
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) window.location.href = "/"
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Customer Login</h1>
        <button
          onClick={handleLogin}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
} 