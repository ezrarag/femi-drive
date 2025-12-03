"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/lib/auth-guard"
import { AUTHORIZED_ADMIN_EMAILS } from "@/lib/admin-authorized-emails"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminHeader from "@/components/admin/AdminHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, XCircle, Save } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

function SettingsContent() {
  const { user } = useAuth()
  const [businessProfile, setBusinessProfile] = useState({
    name: 'Femi Leasing',
    email: 'info@femileasing.com',
    phone: '+1 (201) 555-1234',
    address: '123 Main St, Newark, NJ 07102'
  })
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'inactive'>('inactive')
  const [voiceSettings, setVoiceSettings] = useState({
    enabled: true,
    provider: 'openai',
    voice: 'alloy'
  })
  const [connectedAccounts, setConnectedAccounts] = useState({
    google: false,
    facebook: false,
    instagram: false,
    whatsapp: false,
    slack: false
  })
  const [security, setSecurity] = useState({
    twoFactorEnabled: false
  })
  const [smsSettings, setSmsSettings] = useState({
    phoneNumber: '',
    enabled: false
  })
  const [smsLoading, setSmsLoading] = useState(false)

  useEffect(() => {
    // Fetch subscription status
    const fetchSubscriptionStatus = async () => {
      if (!user) return
      try {
        const idToken = await user.getIdToken()
        const response = await fetch('/api/admin/subscription-payments', {
          headers: { 'Authorization': `Bearer ${idToken}` },
        })
        if (response.ok) {
          const data = await response.json()
          setSubscriptionStatus(data.payments && data.payments.length > 0 ? 'active' : 'inactive')
        }
      } catch (error) {
        console.error('Error fetching subscription:', error)
      }
    }
    
    // Fetch SMS settings
    const fetchSmsSettings = async () => {
      if (!user) return
      try {
        const idToken = await user.getIdToken()
        const response = await fetch('/api/admin/settings/sms', {
          headers: { 'Authorization': `Bearer ${idToken}` },
        })
        if (response.ok) {
          const data = await response.json()
          setSmsSettings({
            phoneNumber: data.phoneNumber || '',
            enabled: data.enabled || false
          })
        }
      } catch (error) {
        console.error('Error fetching SMS settings:', error)
      }
    }
    
    fetchSubscriptionStatus()
    fetchSmsSettings()
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <AdminSidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 pt-16 lg:pt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
            <p className="text-gray-600">Manage your business settings and preferences</p>
          </div>

          <div className="bg-white rounded-lg shadow">
            <Tabs defaultValue="business" className="w-full">
              <div className="border-b border-gray-200 px-6 pt-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="business">Business Profile</TabsTrigger>
                  <TabsTrigger value="subscription">Subscription</TabsTrigger>
                  <TabsTrigger value="voice">Voice AI</TabsTrigger>
                  <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                {/* Business Profile */}
                <TabsContent value="business" className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Profile</h2>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Business Name</Label>
                        <Input
                          id="name"
                          value={businessProfile.name}
                          onChange={(e) => setBusinessProfile({ ...businessProfile, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={businessProfile.email}
                          onChange={(e) => setBusinessProfile({ ...businessProfile, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={businessProfile.phone}
                          onChange={(e) => setBusinessProfile({ ...businessProfile, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={businessProfile.address}
                          onChange={(e) => setBusinessProfile({ ...businessProfile, address: e.target.value })}
                        />
                      </div>
                      <Button className="bg-yellow-500 hover:bg-yellow-600">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Subscription */}
                <TabsContent value="subscription" className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">ReadyAimGo Subscription</h2>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">C-Suite Plan</h3>
                          <p className="text-sm text-gray-600">Full admin features and support</p>
                        </div>
                        {subscriptionStatus === 'active' ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-medium">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                            <XCircle className="w-5 h-5" />
                            <span className="font-medium">Inactive</span>
                          </div>
                        )}
                      </div>
                      {subscriptionStatus === 'inactive' && (
                        <Button className="bg-yellow-500 hover:bg-yellow-600">
                          Activate Subscription
                        </Button>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Voice AI Settings */}
                <TabsContent value="voice" className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Voice AI Settings</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label htmlFor="voice-enabled">Enable Voice AI</Label>
                          <p className="text-sm text-gray-600">Allow AI to handle customer calls</p>
                        </div>
                        <input
                          type="checkbox"
                          id="voice-enabled"
                          checked={voiceSettings.enabled}
                          onChange={(e) => setVoiceSettings({ ...voiceSettings, enabled: e.target.checked })}
                          className="w-4 h-4"
                        />
                      </div>
                      <div>
                        <Label htmlFor="provider">AI Provider</Label>
                        <select
                          id="provider"
                          value={voiceSettings.provider}
                          onChange={(e) => setVoiceSettings({ ...voiceSettings, provider: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="openai">OpenAI</option>
                          <option value="elevenlabs">ElevenLabs</option>
                          <option value="deepgram">Deepgram</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="voice">Voice Model</Label>
                        <select
                          id="voice"
                          value={voiceSettings.voice}
                          onChange={(e) => setVoiceSettings({ ...voiceSettings, voice: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="alloy">Alloy</option>
                          <option value="echo">Echo</option>
                          <option value="fable">Fable</option>
                          <option value="onyx">Onyx</option>
                          <option value="nova">Nova</option>
                          <option value="shimmer">Shimmer</option>
                        </select>
                      </div>
                      <Button className="bg-yellow-500 hover:bg-yellow-600">
                        <Save className="w-4 h-4 mr-2" />
                        Save Voice Settings
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Connected Accounts */}
                <TabsContent value="accounts" className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Connected Accounts</h2>
                    <div className="space-y-3">
                      {Object.entries(connectedAccounts).map(([account, connected]) => (
                        <div key={account} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {account.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 capitalize">{account}</h3>
                              <p className="text-sm text-gray-600">
                                {connected ? 'Connected' : 'Not connected'}
                              </p>
                            </div>
                          </div>
                          {connected ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => setConnectedAccounts({ ...connectedAccounts, [account]: true })}
                            >
                              Connect
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Security */}
                <TabsContent value="security" className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="password">Change Password</Label>
                        <Input id="password" type="password" placeholder="Enter new password" />
                        <Button className="mt-2 bg-yellow-500 hover:bg-yellow-600">
                          Update Password
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label htmlFor="2fa">Two-Factor Authentication</Label>
                          <p className="text-sm text-gray-600">Add an extra layer of security</p>
                        </div>
                        <input
                          type="checkbox"
                          id="2fa"
                          checked={security.twoFactorEnabled}
                          onChange={(e) => setSecurity({ ...security, twoFactorEnabled: e.target.checked })}
                          className="w-4 h-4"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* SMS Notifications */}
                  <div className="mt-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">SMS Notifications</h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900 mb-3">
                          Receive text message alerts when vehicles are booked and payments are successfully received.
                        </p>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="phone-number">Phone Number</Label>
                            <Input
                              id="phone-number"
                              type="tel"
                              placeholder="+1 (555) 123-4567"
                              value={smsSettings.phoneNumber}
                              onChange={(e) => {
                                setSmsSettings({ ...smsSettings, phoneNumber: e.target.value })
                              }}
                              disabled={smsLoading}
                            />
                            <p className="text-xs text-gray-600 mt-1">
                              Enter your phone number with country code (e.g., +1 for US)
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="sms-enabled"
                              checked={smsSettings.enabled}
                              onChange={(e) => {
                                setSmsSettings({ ...smsSettings, enabled: e.target.checked })
                              }}
                              disabled={smsLoading}
                              className="w-4 h-4"
                            />
                            <Label htmlFor="sms-enabled" className="text-sm font-medium">
                              Enable SMS notifications for bookings and payments
                            </Label>
                          </div>
                          <Button
                            onClick={async () => {
                              if (!user) return
                              setSmsLoading(true)
                              try {
                                const idToken = await user.getIdToken()
                                const response = await fetch('/api/admin/settings/sms', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${idToken}`,
                                  },
                                  body: JSON.stringify({
                                    phoneNumber: smsSettings.phoneNumber,
                                    enabled: smsSettings.enabled
                                  }),
                                })
                                if (response.ok) {
                                  alert('SMS settings saved successfully!')
                                } else {
                                  const error = await response.json()
                                  throw new Error(error.message || 'Failed to save SMS settings')
                                }
                              } catch (error: any) {
                                console.error('Error saving SMS settings:', error)
                                alert(error.message || 'Failed to save SMS settings. Please try again.')
                              } finally {
                                setSmsLoading(false)
                              }
                            }}
                            disabled={smsLoading}
                            className="bg-yellow-500 hover:bg-yellow-600"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save SMS Settings
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <AuthGuard allowedEmails={[...AUTHORIZED_ADMIN_EMAILS]}>
      <SettingsContent />
    </AuthGuard>
  )
}

