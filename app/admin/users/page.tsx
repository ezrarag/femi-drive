"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/lib/auth-guard"
import { useAuth } from "@/hooks/useAuth"
import { AUTHORIZED_ADMIN_EMAILS } from "@/lib/admin-authorized-emails"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminHeader from "@/components/admin/AdminHeader"
import { User, DollarSign } from "lucide-react"

interface Customer {
  email: string
  name: string
  totalSpent: number
  paymentCount: number
  lastPayment: string
  firstPayment: string
}

function AdminCustomersContent() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      loadCustomers()
    }
  }, [user])

  const loadCustomers = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const idToken = await user.getIdToken()
      const response = await fetch('/api/admin/customers', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      
      const data = await response.json()
      setCustomers(data.customers || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-lg font-semibold text-gray-700">Loading customers...</div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <AdminSidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 pt-16 lg:pt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Customers</h1>
            <p className="text-gray-600">All customers who have made payments to Femi Leasing</p>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 mb-6">
              {error}
            </div>
          ) : customers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">No customers found</p>
              <p className="text-sm text-gray-400">Customers will appear here once they make payments</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payments</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {customers.map((customer, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{customer.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {customer.paymentCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(customer.totalSpent)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(customer.firstPayment)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(customer.lastPayment)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <AuthGuard allowedEmails={[...AUTHORIZED_ADMIN_EMAILS]}>
      <AdminCustomersContent />
    </AuthGuard>
  )
}
