"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminLoginPage() {
  const [error, setError] = useState("")

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" })
  }

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        if (user.email && user.email.endsWith("@femileasing.com")) {
          window.location.href = "/admin/dashboard"
        } else {
          setError("Access denied: You must use a femileasing.com email.")
          await supabase.auth.signOut()
        }
      }
    }
    checkAdmin()
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => checkAdmin())
    return () => { listener?.subscription.unsubscribe() }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        <button
          onClick={handleLogin}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Sign in with Google
        </button>
        {error && <div className="text-red-600 text-center mt-4">{error}</div>}
      </div>
    </div>
  )
} 