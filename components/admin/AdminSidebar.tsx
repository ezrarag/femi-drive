"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { 
  LayoutDashboard, 
  Car, 
  Calendar, 
  Users, 
  CreditCard,
  Wallet,
  MessageSquare,
  Plug,
  UserCog,
  Settings,
  Receipt,
  Menu,
  X
} from "lucide-react"

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Vehicles', href: '/admin/vehicles', icon: Car },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Customers', href: '/admin/users', icon: Users },
  { name: 'Finance', href: '/admin/finance', icon: CreditCard },
  { name: 'Payments', href: '/admin/payments', icon: Receipt },
  { name: 'Wallet', href: '/admin/wallet', icon: Wallet },
  { name: 'Messaging', href: '/admin/messaging', icon: MessageSquare },
  { name: 'Integrations', href: '/admin/integrations', icon: Plug },
  { name: 'Team', href: '/admin/team', icon: UserCog },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-gray-50 border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">FemiLeasing Admin</h1>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-200 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-80px)]">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-yellow-100 text-yellow-900 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}

