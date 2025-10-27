"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

interface Balance {
  available: number
  pending: number
  currency: string
}

interface Transaction {
  id: string
  amount: number
  currency: string
  type: string
  status: string
  description: string
  created: number
  fee: number
  net: number
}

interface Transfer {
  id: string
  amount: number
  currency: string
  destination: string
  description: string
  created: number
  status: string
}

export default function FinancePage() {
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState<Balance | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBalance()
  }, [])

  const fetchBalance = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/finance/balance')
      if (!response.ok) {
        throw new Error('Failed to fetch balance data')
      }
      const data = await response.json()
      setBalance(data.balance)
      setTransactions(data.recentTransactions || [])
      setTransfers(data.recentTransfers || [])
      setError(null)
    } catch (err: any) {
      console.error('Failed to fetch balance:', err)
      setError(err.message || 'Failed to fetch finance data')
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-semibold text-gray-700">Loading finance data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Finance & Payouts</h1>
          <p className="text-gray-600 mt-2">View balances, transactions, and transfer history</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded mb-6">
            Error: {error}
          </div>
        )}

        {/* Balance Cards */}
        {balance && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-700">Available Balance</h3>
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(balance.available)}
              </div>
              <p className="text-sm text-gray-500 mt-2">Ready to transfer to Femi Leasing</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-700">Pending Balance</h3>
                <span className="text-2xl">⏳</span>
              </div>
              <div className="text-3xl font-bold text-yellow-600">
                {formatCurrency(balance.pending)}
              </div>
              <p className="text-sm text-gray-500 mt-2">Awaiting processing</p>
            </div>
          </div>
        )}

        {/* Recent Transfers */}
        {transfers.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Transfers</h2>
              <p className="text-sm text-gray-600 mt-1">Transfers to Femi Leasing account</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transfers.map((transfer) => (
                    <tr key={transfer.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transfer.created)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(transfer.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {transfer.description || 'Transfer to Femi Leasing'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transfer.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transfer.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
              <p className="text-sm text-gray-600 mt-1">All platform activity</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.created)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        -{formatCurrency(transaction.fee)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {formatCurrency(transaction.net)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.status === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Manual Transfer Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Transfer</h2>
          <p className="text-sm text-gray-600 mb-4">
            Transfer funds to Femi Leasing account (acct_1SK6dd1lscTKUkb9)
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Manual transfers should only be used for immediate needs. Future payments will automatically route to the connected account.
            </p>
          </div>
          <p className="text-sm text-gray-700">
            Use the API endpoint: <code className="bg-gray-100 px-2 py-1 rounded">POST /api/finance/transfer</code>
          </p>
        </div>
      </div>
    </div>
  )
}
