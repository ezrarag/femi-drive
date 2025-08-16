"use client"

import { useEffect, useState } from "react"
import { supabase, checkAdminRole, getAllUsers, updateUserRole } from "@/lib/supabase"
import Link from "next/link"
import { User, Shield, ShieldCheck, ShieldX, Mail, Calendar, Edit } from "lucide-react"

interface UserProfile {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
  user_roles?: { role: string }[]
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [authLoading, setAuthLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState<string>("")

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = "/admin/login"
        return
      }

      const isAdmin = await checkAdminRole(user.id)
      if (!isAdmin) {
        window.location.href = "/admin/login"
        return
      }

      setAuthLoading(false)
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (!authLoading) {
      loadUsers()
    }
  }, [authLoading])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const userData = await getAllUsers()
      setUsers(userData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole as 'user' | 'admin' | 'super_admin')
      await loadUsers() // Refresh the list
      setEditingUser(null)
      setEditingRole("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role")
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <ShieldCheck className="w-4 h-4 text-purple-600" />
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-600" />
      default:
        return <ShieldX className="w-4 h-4 text-gray-400" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Super Admin</span>
      case 'admin':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Admin</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">User</span>
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-semibold text-gray-700">Checking admin access...</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-semibold text-gray-700">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage user accounts and permissions</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/dashboard" className="px-3 sm:px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">Dashboard</Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <User className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.user_roles?.[0]?.role === 'admin' || u.user_roles?.[0]?.role === 'super_admin').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => {
                    const created = new Date(u.created_at)
                    const now = new Date()
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar_url ? (
                            <img className="h-10 w-10 rounded-full" src={user.avatar_url} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name || 'No Name'}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRoleIcon(user.user_roles?.[0]?.role || 'user')}
                        <span className="ml-2">{getRoleBadge(user.user_roles?.[0]?.role || 'user')}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingUser === user.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editingRole}
                            onChange={(e) => setEditingRole(e.target.value)}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                          <button
                            onClick={() => handleRoleUpdate(user.id, editingRole)}
                            className="text-green-600 hover:text-green-900 text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(null)
                              setEditingRole("")
                            }}
                            className="text-gray-600 hover:text-gray-900 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingUser(user.id)
                            setEditingRole(user.user_roles?.[0]?.role || 'user')
                          }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Edit Role
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
