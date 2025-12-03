"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/lib/auth-guard"
import { useAuth } from "@/hooks/useAuth"
import { AUTHORIZED_ADMIN_EMAILS } from "@/lib/admin-authorized-emails"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminHeader from "@/components/admin/AdminHeader"
import { DollarSign, ArrowDownCircle, ArrowUpCircle } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface AllocationSettings {
  vehicleManagement: number
  marketing: number
  operations: number
  maintenance: number
  insurance: number
  savings: number
  taxes: number
}

interface Transaction {
  id: string
  type: string
  amount: number
  date: string
  metadata?: any
}

function WalletContent() {
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fundAmount, setFundAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [funding, setFunding] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [allocations, setAllocations] = useState<AllocationSettings>({
    vehicleManagement: 30,
    marketing: 20,
    operations: 10,
    maintenance: 10,
    insurance: 10,
    savings: 10,
    taxes: 10,
  })
  const [savingAllocations, setSavingAllocations] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    fetchBalance()
    fetchAllocations()
    fetchTransactions()
  }, [user])

  const fetchBalance = async () => {
    if (!user) return
    
    try {
      const idToken = await user.getIdToken()
      const response = await fetch('/api/finance/balance', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        // Use available balance from Stripe
        setBalance(data.balance?.available || 0)
      }
    } catch (error) {
      console.error('Error fetching balance:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllocations = async () => {
    if (!user) return
    
    try {
      const idToken = await user.getIdToken()
      // Fetch from Firestore via API
      const response = await fetch('/api/admin/wallet/allocations', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.allocations) {
          setAllocations(data.allocations)
        }
      }
    } catch (error) {
      console.error('Error fetching allocations:', error)
    }
  }

  const fetchTransactions = async () => {
    if (!user) return
    
    try {
      const idToken = await user.getIdToken()
      const response = await fetch('/api/admin/wallet/transactions', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const handleFund = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) return
    
    setFunding(true)
    try {
      const idToken = await user?.getIdToken()
      const response = await fetch('/api/admin/wallet/fund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ amount: parseFloat(fundAmount) }),
      })
      
      if (response.ok) {
        setFundAmount("")
        await fetchBalance()
        await fetchTransactions()
      }
    } catch (error) {
      console.error('Error funding:', error)
    } finally {
      setFunding(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return
    
    setWithdrawing(true)
    try {
      const idToken = await user?.getIdToken()
      const response = await fetch('/api/admin/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ amount: parseFloat(withdrawAmount) }),
      })
      
      if (response.ok) {
        setWithdrawAmount("")
        await fetchBalance()
        await fetchTransactions()
      }
    } catch (error) {
      console.error('Error withdrawing:', error)
    } finally {
      setWithdrawing(false)
    }
  }

  const handleAllocationChange = (category: keyof AllocationSettings, value: number[]) => {
    const newValue = value[0]
    const currentTotal = Object.values(allocations).reduce((sum, val) => sum + val, 0)
    const otherTotal = currentTotal - allocations[category]
    const maxAllowed = 100 - otherTotal
    
    if (newValue <= maxAllowed && newValue >= 0) {
      setAllocations({
        ...allocations,
        [category]: newValue,
      })
    }
  }

  const handleSaveAllocations = async () => {
    setSavingAllocations(true)
    try {
      const idToken = await user?.getIdToken()
      const response = await fetch('/api/admin/wallet/allocations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ allocations }),
      })
      
      if (response.ok) {
        // Show success message
        setTimeout(() => setSavingAllocations(false), 1000)
      }
    } catch (error) {
      console.error('Error saving allocations:', error)
      setSavingAllocations(false)
    }
  }

  const totalAllocation = Object.values(allocations).reduce((sum, val) => sum + val, 0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-[B612_Mono]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 pt-16 lg:pt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Wallet</h1>
            <p className="text-gray-600">Manage your funds and allocations</p>
          </div>

          {/* Balance Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Balance</h2>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              ${loading ? '0.00' : balance.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">Available balance</p>
          </div>

          {/* Fund Controls */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Fund Management</h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <button
                onClick={handleFund}
                disabled={funding || !fundAmount}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowDownCircle className="w-4 h-4" />
                {funding ? 'Funding...' : 'Fund'}
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawing || !withdrawAmount}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowUpCircle className="w-4 h-4" />
                {withdrawing ? 'Withdrawing...' : 'Withdraw'}
              </button>
              <div className="flex-1">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
          </div>

          {/* Allocation Settings */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Allocation Settings</h2>
            <p className="text-sm text-gray-600 mb-6">Set how funds are allocated across categories</p>
            
            <div className="space-y-6">
              {Object.entries(allocations).map(([category, value]) => (
                <div key={category}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <span className="text-sm font-semibold text-gray-900">{value}%</span>
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={(val) => handleAllocationChange(category as keyof AllocationSettings, val)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-700">Total Allocation</span>
                <span className={`text-sm font-semibold ${totalAllocation === 100 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalAllocation}%
                </span>
              </div>
              <button
                onClick={handleSaveAllocations}
                disabled={savingAllocations || totalAllocation !== 100}
                className="w-full px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingAllocations ? 'Saving...' : 'Save Allocations'}
              </button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Transaction history will appear here
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{transaction.type}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          ${transaction.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function WalletPage() {
  return (
    <AuthGuard allowedEmails={AUTHORIZED_ADMIN_EMAILS}>
      <WalletContent />
    </AuthGuard>
  )
}

