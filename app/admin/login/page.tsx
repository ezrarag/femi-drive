"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import Image from "next/image"

export default function AdminLoginPage() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)
    setError("")
    
    if (!auth || !googleProvider) {
      setError("Firebase authentication is not configured. Please check environment variables.")
      setLoading(false)
      return
    }
    
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const userEmail = result.user.email
      
      // Check if user is authorized
      const authorizedEmails = [
        'finance@readyaimgo.biz',
        'ezra@readyaimgo.biz',
        'femileasing@gmail.com',
        // Add more authorized emails as needed
      ]
      
      const isAuthorized = authorizedEmails.some(email => 
        userEmail?.toLowerCase().includes(email.toLowerCase())
      )
      
      if (!isAuthorized) {
        setError("Access denied. Please contact support to request admin access.")
        await signInWithPopup(auth, googleProvider) // This will sign out if unauthorized
        return
      }
      
      // Redirect to dashboard on success
      router.push("/admin/dashboard")
    } catch (err: any) {
      console.error("Login error:", err)
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in cancelled")
      } else {
        setError(err.message || "An unexpected error occurred during login")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      // Check if user is authorized
      const userEmail = user.email
      const authorizedEmails = [
        'finance@readyaimgo.biz',
        'ezra@readyaimgo.biz',
        'femileasing@gmail.com',
      ]
      
      const isAuthorized = authorizedEmails.some(email => 
        userEmail?.toLowerCase().includes(email.toLowerCase())
      )
      
      if (isAuthorized) {
        router.push("/admin/dashboard")
      }
    }
  }, [user, authLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center">
          <Image 
            src="/placeholder-logo.png" 
            alt="Femi Leasing Logo" 
            width={48} 
            height={48} 
            className="mb-2" 
          />
          <h1 className="text-2xl font-bold text-center text-neutral-900">Admin Access</h1>
          <p className="text-neutral-500 text-center text-sm mt-2">
            Sign in with your Google account to access the admin dashboard and manage the system.
          </p>
          <div className="mt-2 p-2 bg-blue-100 border border-blue-300 rounded text-xs text-blue-800">
            🔐 Secure authentication via Firebase
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