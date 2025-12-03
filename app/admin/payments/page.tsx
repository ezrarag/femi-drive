"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/lib/auth-guard"
import { useAuth } from "@/hooks/useAuth"
import { AUTHORIZED_ADMIN_EMAILS } from "@/lib/admin-authorized-emails"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminHeader from "@/components/admin/AdminHeader"
import { Receipt, ExternalLink, DollarSign, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"

interface StripePayment {
  id: string
  amount: number
  currency: string
  status: string
  paymentMethod: string
  description: string
  customerEmail: string
  customerName: string
  createdAt: string
  stripeUrl: string
}

function AdminPaymentsContent() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<StripePayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      loadPayments()
    }
  }, [user])

  const loadPayments = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setError("")
      const idToken = await user.getIdToken()
      const response = await fetch('/api/admin/stripe/payments', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || `Failed to fetch payments (${response.status})`)
      }
      
      const data = await response.json()
      setPayments(data.payments || [])
    } catch (err) {
      console.error('Error fetching payments:', err)
      setError(err instanceof Error ? err.message : "Failed to load payments")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'succeeded') {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    } else if (statusLower === 'canceled' || statusLower === 'failed') {
      return <XCircle className="w-4 h-4 text-red-600" />
    } else {
      return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'succeeded') {
      return 'bg-green-100 text-green-800'
    } else if (statusLower === 'canceled' || statusLower === 'failed') {
      return 'bg-red-100 text-red-800'
    } else {
      return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
              <div className="text-lg font-semibold text-gray-700">Loading payments...</div>
            </div>
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
        <main className="flex-1 p-4 sm:p-6 pt-16 lg:pt-6 max-w-[1800px] mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Stripe Payments</h1>
            <p className="text-gray-600">Itemized payment log from Stripe for FemiLeasing connected account</p>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 mb-6">
              <div className="font-semibold mb-1">Error loading payments</div>
              <div className="text-sm">{error}</div>
              <button
                onClick={loadPayments}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Retry
              </button>
            </div>
          ) : payments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">No payments found</p>
              <p className="text-sm text-gray-400">Payments will appear here once they are processed</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                            <DollarSign className="w-4 h-4 flex-shrink-0" />
                            <span>{formatCurrency(payment.amount, payment.currency)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {getStatusIcon(payment.status)}
                            <span className="hidden sm:inline">{payment.status}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900 max-w-[120px] truncate" title={payment.paymentMethod}>
                            {payment.paymentMethod}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900 max-w-[200px] truncate" title={payment.description}>
                            {payment.description}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm min-w-[150px]">
                            <div className="font-medium text-gray-900 truncate max-w-[150px]" title={payment.customerName}>
                              {payment.customerName}
                            </div>
                            <div className="text-gray-500 text-xs truncate max-w-[150px]" title={payment.customerEmail}>
                              {payment.customerEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex flex-col">
                            <span>{formatDate(payment.createdAt).split(',')[0]}</span>
                            <span className="text-xs text-gray-400">{formatDate(payment.createdAt).split(',')[1]?.trim()}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <a
                            href={payment.stripeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                          >
                            <span className="hidden sm:inline">View</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{payments.length}</span> payment{payments.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function AdminPaymentsPage() {
  return (
    <AuthGuard allowedEmails={[...AUTHORIZED_ADMIN_EMAILS]}>
      <AdminPaymentsContent />
    </AuthGuard>
  )
}

