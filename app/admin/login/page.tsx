"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithPopup, signOut } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { motion } from "framer-motion"
import { Shield, Lock } from "lucide-react"
import NavBar from "@/components/NavBar"
import { isAuthorizedAdmin } from "@/lib/admin-authorized-emails"

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
      if (!isAuthorizedAdmin(userEmail)) {
        // Sign out unauthorized user
        await signOut(auth)
        setError("Access denied. Please contact support to request admin access.")
        setLoading(false)
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
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      // Check if user is authorized
      if (isAuthorizedAdmin(user.email)) {
        router.push("/admin/dashboard")
      } else {
        // Sign out unauthorized user
        signOut(auth)
      }
    }
  }, [user, authLoading, router])

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <NavBar variant="dark" transparent noBorder />
      
      {/* Background with video */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Video Background */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source
            src="https://firebasestorage.googleapis.com/v0/b/readyaimgo-clients-temp.firebasestorage.app/o/femileasing%2Fadmin-login%2F6873496-uhd_2160_3840_25fps.mp4?alt=media&token=f920e52f-3b33-4099-95b3-d13f3b3b5a97"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        {/* Color overlay */}
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Main Content */}
      <main className="relative z-40 flex items-center justify-center min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-100px)] md:min-h-[calc(100vh-120px)] px-3 sm:px-4 md:px-6 pt-20">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-8"
          >
            <div className="mb-6 flex flex-col items-center">
              <div className="mb-4 p-3 bg-white/10 rounded-full border border-white/20">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-center text-white mb-2">Admin Access</h1>
              <p className="text-white/80 text-center text-sm">
                Sign in with your Google account to access the admin dashboard and manage the system.
              </p>
              <div className="mt-4 p-2 bg-white/5 border border-white/20 rounded-lg text-xs text-white/70 flex items-center gap-2">
                <Lock className="w-3 h-3" />
                <span>Secure authentication</span>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200"
              >
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

            <motion.button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-4 px-6 bg-white text-black rounded-lg font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-white/90"
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </main>
    </div>
  )
} 