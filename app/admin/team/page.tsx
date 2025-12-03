"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/lib/auth-guard"
import { AUTHORIZED_ADMIN_EMAILS } from "@/lib/admin-authorized-emails"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminHeader from "@/components/admin/AdminHeader"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Mail, Shield, User, MoreVertical, History, QrCode, Copy, CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TeamMember {
  id: string
  email: string
  role: string
  status: 'active' | 'inactive'
  added_by?: string
  added_at?: string
}

interface ActivityLog {
  id: string
  admin_email: string
  admin_name: string
  action: string
  entity_type: string
  entity_id: string
  details: any
  timestamp: string
}

function TeamContent() {
  const { user } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("admin")
  const [inviteSent, setInviteSent] = useState(false)
  const [inviteError, setInviteError] = useState("")
  const [inviteUrl, setInviteUrl] = useState("")

  useEffect(() => {
    if (user) {
      loadTeamData()
    }
  }, [user])

  const loadTeamData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const idToken = await user.getIdToken()
      
      // Load activity log
      const activityResponse = await fetch('/api/admin/activity', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      })
      
      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setActivities(activityData.activities || [])
      }

      // Load team members from Firestore (authorized_admins collection)
      // For now, we'll show authorized emails from the config
      const teamMembers: TeamMember[] = AUTHORIZED_ADMIN_EMAILS.map((email, index) => ({
        id: `member-${index}`,
        email,
        role: 'admin',
        status: 'active' as const,
      }))
      setMembers(teamMembers)
    } catch (err) {
      console.error('Error loading team data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail || !inviteRole || !user) return

    setInviteSent(false)
    setInviteError("")

    try {
      const idToken = await user.getIdToken()
      const response = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create invitation')
      }

      const data = await response.json()
      
      if (data.success) {
        if (data.warning) {
          // Email failed but invitation was created
          setInviteError(`⚠️ ${data.error || 'Email failed to send'}. Invitation link: ${data.inviteUrl}`)
          setInviteUrl(data.inviteUrl || '')
        } else {
          // Success - email sent
          setInviteSent(true)
          // Reset form after 3 seconds
          setTimeout(() => {
            setInviteEmail("")
            setInviteRole("admin")
            setInviteSent(false)
            setShowInviteDialog(false)
            setInviteError("")
          }, 3000)
        }
      } else {
        setInviteError(data.error || data.details || 'Failed to create invitation')
      }
    } catch (err) {
      console.error('Error creating invitation:', err)
      setInviteError(err instanceof Error ? err.message : 'Failed to create invitation')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <Shield className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getActionLabel = (action: string, entityType: string) => {
    if (action === 'created') return `Created ${entityType}`
    if (action === 'updated') return `Updated ${entityType}`
    if (action === 'deleted') return `Deleted ${entityType}`
    return `${action} ${entityType}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-lg font-semibold text-gray-700">Loading team data...</div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Team</h1>
              <p className="text-gray-600">Manage team members and view activity history</p>
            </div>
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
              <DialogTrigger asChild>
                <Button className="bg-yellow-500 hover:bg-yellow-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Invite Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">Invite Admin User</DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Send an invitation email to grant admin access
                  </DialogDescription>
                </DialogHeader>
                {!inviteSent ? (
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block text-gray-900">Email</label>
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="text-gray-900 bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-gray-900">Role</label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger className="text-gray-900 bg-white border-gray-300">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="admin" className="text-gray-900">Admin</SelectItem>
                          <SelectItem value="manager" className="text-gray-900">Manager</SelectItem>
                          <SelectItem value="support" className="text-gray-900">Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {inviteError && (
                      <div className={`p-3 rounded-lg border ${
                        inviteError.includes('⚠️') 
                          ? 'bg-yellow-50 border-yellow-200' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <p className={`text-sm ${
                          inviteError.includes('⚠️') 
                            ? 'text-yellow-800' 
                            : 'text-red-800'
                        }`}>{inviteError}</p>
                        {inviteUrl && (
                          <div className="mt-3 p-2 bg-white rounded border border-gray-300">
                            <p className="text-xs text-gray-600 mb-1">Invitation Link (copy to share manually):</p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={inviteUrl}
                                readOnly
                                className="flex-1 text-xs p-2 bg-gray-50 border border-gray-300 rounded text-gray-900"
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                              />
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(inviteUrl)
                                  alert('Link copied to clipboard!')
                                }}
                                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-xs text-gray-900"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <Button 
                      onClick={handleInvite} 
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                      disabled={!inviteEmail || !inviteRole}
                    >
                      Send Invitation Email
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 py-4 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Invitation Sent!</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      An invitation email has been sent to <strong className="text-gray-900">{inviteEmail}</strong>
                    </p>
                    <p className="text-xs text-gray-500">
                      The user will receive an email with a link to accept the invitation and sign in to the admin dashboard.
                    </p>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="members" className="space-y-6">
            <TabsList>
              <TabsTrigger value="members">Team Members</TabsTrigger>
              <TabsTrigger value="activity">Activity History</TabsTrigger>
            </TabsList>

            <TabsContent value="members">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Authorized Admins</h2>
                  <p className="text-sm text-gray-600 mt-1">Users with access to the admin dashboard</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {members.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No team members found
                    </div>
                  ) : (
                    members.map((member) => (
                      <div key={member.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            {getRoleIcon(member.role)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{member.email.split('@')[0]}</h3>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                member.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {member.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 text-sm bg-gray-100 rounded-lg text-gray-700 capitalize">
                            {member.role}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6 bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Permissions System</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Configure role-based access control for your team members
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Admin</span>
                    <span className="text-xs text-gray-600">Full access to all features</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Manager</span>
                    <span className="text-xs text-gray-600">Manage bookings, vehicles, and customers</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Support</span>
                    <span className="text-xs text-gray-600">View bookings and respond to messages</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Admin Activity History</h2>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Track all changes made by admin users</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {activities.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No activity recorded yet
                    </div>
                  ) : (
                    activities.map((activity) => (
                      <div key={activity.id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">{activity.admin_name}</span>
                              <span className="text-sm text-gray-500">({activity.admin_email})</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-1">
                              {getActionLabel(activity.action, activity.entity_type)}
                              {activity.details?.make && activity.details?.model && (
                                <span className="text-gray-600">
                                  {' '}— {activity.details.make} {activity.details.model} {activity.details.year}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(activity.timestamp)}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            activity.action === 'created' 
                              ? 'bg-green-100 text-green-800'
                              : activity.action === 'updated'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {activity.action}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

export default function TeamPage() {
  return (
    <AuthGuard allowedEmails={[...AUTHORIZED_ADMIN_EMAILS]}>
      <TeamContent />
    </AuthGuard>
  )
}
