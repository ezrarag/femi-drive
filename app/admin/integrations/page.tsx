"use client"

import { useState } from "react"
import { AuthGuard } from "@/lib/auth-guard"
import { AUTHORIZED_ADMIN_EMAILS } from "@/lib/admin-authorized-emails"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminHeader from "@/components/admin/AdminHeader"
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Integration {
  id: string
  name: string
  description: string
  status: 'connected' | 'not_connected'
  icon: string
  settingsUrl?: string
}

const integrations: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe Connect',
    description: 'Payment processing and payouts',
    status: 'connected',
    icon: '💳',
    settingsUrl: '/admin/finance'
  },
  {
    id: 'slack',
    name: 'Slack Connect',
    description: 'Internal team communication',
    status: 'not_connected',
    icon: '💬'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Customer messaging via Twilio or WhatsApp Cloud API',
    status: 'not_connected',
    icon: '📱'
  },
  {
    id: 'instagram',
    name: 'Instagram Messaging API',
    description: 'Direct messages from Instagram',
    status: 'not_connected',
    icon: '📸'
  },
  {
    id: 'facebook',
    name: 'Facebook Messaging API',
    description: 'Messenger conversations',
    status: 'not_connected',
    icon: '👥'
  },
  {
    id: 'twilio',
    name: 'Twilio Voice/SMS',
    description: 'Voice calls and SMS notifications',
    status: 'not_connected',
    icon: '☎️'
  },
  {
    id: 'openai',
    name: 'OpenAI Pulse',
    description: 'AI-powered customer support',
    status: 'not_connected',
    icon: '🤖'
  },
]

function IntegrationsContent() {
  const [integrationStatuses, setIntegrationStatuses] = useState<Record<string, 'connected' | 'not_connected'>>(
    integrations.reduce((acc, int) => {
      acc[int.id] = int.status
      return acc
    }, {} as Record<string, 'connected' | 'not_connected'>)
  )

  const handleConnect = (id: string) => {
    setIntegrationStatuses(prev => ({
      ...prev,
      [id]: 'connected'
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <AdminSidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 pt-16 lg:pt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Integrations</h1>
            <p className="text-gray-600">Connect third-party services to streamline your operations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => {
              const isConnected = integrationStatuses[integration.id] === 'connected'
              
              return (
                <div key={integration.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{integration.icon}</div>
                    {isConnected ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{integration.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleConnect(integration.id)}
                      variant={isConnected ? "outline" : "default"}
                      className={isConnected ? "flex-1" : "flex-1 bg-yellow-500 hover:bg-yellow-600"}
                      disabled={isConnected}
                    >
                      {isConnected ? 'Connected' : 'Connect'}
                    </Button>
                    {integration.settingsUrl && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.location.href = integration.settingsUrl!}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {isConnected && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-sm"
                        onClick={() => window.location.href = '/admin/settings'}
                      >
                        Manage Settings
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function IntegrationsPage() {
  return (
    <AuthGuard allowedEmails={[...AUTHORIZED_ADMIN_EMAILS]}>
      <IntegrationsContent />
    </AuthGuard>
  )
}

