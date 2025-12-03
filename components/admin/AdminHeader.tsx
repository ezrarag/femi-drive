"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { User, LogOut } from "lucide-react"

export default function AdminHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/admin/login")
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Admin Dashboard</h2>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {user && (
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span className="truncate max-w-[150px]">{user.email}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  )
}

