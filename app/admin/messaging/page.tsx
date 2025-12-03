"use client"

import { useState } from "react"
import { AuthGuard } from "@/lib/auth-guard"
import { AUTHORIZED_ADMIN_EMAILS } from "@/lib/admin-authorized-emails"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminHeader from "@/components/admin/AdminHeader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Conversation {
  id: string
  name: string
  lastMessage: string
  timestamp: string
  unread: number
  channel: string
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'John Doe',
    lastMessage: 'Hi, I need to extend my rental',
    timestamp: '2 min ago',
    unread: 2,
    channel: 'whatsapp'
  },
  {
    id: '2',
    name: 'Sarah Smith',
    lastMessage: 'When will my vehicle be ready?',
    timestamp: '15 min ago',
    unread: 0,
    channel: 'email'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    lastMessage: 'Can I get a discount for weekly rental?',
    timestamp: '1 hour ago',
    unread: 1,
    channel: 'website'
  },
]

function MessagingContent() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [activeTab, setActiveTab] = useState('whatsapp')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <AdminSidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 pt-16 lg:pt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Messaging</h1>
            <p className="text-gray-600">Centralized inbox for all customer communications</p>
          </div>

          <div className="bg-white rounded-lg shadow h-[calc(100vh-200px)] flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="border-b border-gray-200 px-6 pt-4">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="website">Website Chat</TabsTrigger>
                  <TabsTrigger value="instagram">Instagram DM</TabsTrigger>
                  <TabsTrigger value="facebook">Facebook</TabsTrigger>
                  <TabsTrigger value="slack">Slack</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Conversation List */}
                <div className="w-1/3 border-r border-gray-200 flex flex-col">
                  <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search conversations..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {mockConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                          selectedConversation?.id === conversation.id ? 'bg-yellow-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-gray-900">{conversation.name}</h3>
                          {conversation.unread > 0 && (
                            <span className="bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5">
                              {conversation.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                        <p className="text-xs text-gray-400 mt-1">{conversation.timestamp}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conversation Detail */}
                <div className="flex-1 flex flex-col">
                  {selectedConversation ? (
                    <>
                      <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">{selectedConversation.name}</h2>
                        <p className="text-sm text-gray-600 capitalize">{selectedConversation.channel}</p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                            <p className="text-sm text-gray-900">Hello, I need help with my rental</p>
                            <p className="text-xs text-gray-500 mt-1">10:30 AM</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-yellow-500 text-white rounded-lg p-3 max-w-xs">
                            <p className="text-sm">Hi! How can I help you today?</p>
                            <p className="text-xs text-yellow-100 mt-1">10:32 AM</p>
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                            <p className="text-sm text-gray-900">{selectedConversation.lastMessage}</p>
                            <p className="text-xs text-gray-500 mt-1">{selectedConversation.timestamp}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border-t border-gray-200">
                        <div className="flex gap-2">
                          <Input placeholder="Type a message..." className="flex-1" />
                          <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                            Send
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>Select a conversation to view messages</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <TabsContent value="whatsapp" className="hidden" />
              <TabsContent value="email" className="hidden" />
              <TabsContent value="website" className="hidden" />
              <TabsContent value="instagram" className="hidden" />
              <TabsContent value="facebook" className="hidden" />
              <TabsContent value="slack" className="hidden" />
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function MessagingPage() {
  return (
    <AuthGuard allowedEmails={[...AUTHORIZED_ADMIN_EMAILS]}>
      <MessagingContent />
    </AuthGuard>
  )
}

