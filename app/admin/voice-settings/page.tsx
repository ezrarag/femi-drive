"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

interface Voice {
  voice_id: string
  name: string
  category: string
  description: string
}

interface CallAnalytics {
  totalCalls: number
  averageDuration: number
  averageConfidence: number
  escalationRate: number
  bookingRate: number
}

export default function VoiceSettingsPage() {
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [testText, setTestText] = useState<string>('Hello! Welcome to Femi Leasing. How can I help you today?')
  const [isPlaying, setIsPlaying] = useState(false)
  const [analytics, setAnalytics] = useState<CallAnalytics | null>(null)
  const [settings, setSettings] = useState({
    useDeepgram: true,
    useElevenLabs: true,
    fallbackToTwilio: true,
    voiceId: '21m00Tcm4TlvDq8ikWAM'
  })
  const { toast } = useToast()

  useEffect(() => {
    loadVoices()
    loadAnalytics()
  }, [])

  const loadVoices = async () => {
    try {
      const response = await fetch('/api/admin/voice-config/voices')
      if (response.ok) {
        const data = await response.json()
        setVoices(data.voices || [])
      }
    } catch (error) {
      console.error('Failed to load voices:', error)
    }
  }

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/voice-config/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    }
  }

  const testVoice = async () => {
    if (!testText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to test",
        variant: "destructive"
      })
      return
    }

    setIsPlaying(true)
    try {
      const response = await fetch('/api/admin/voice-config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: testText,
          voiceId: selectedVoice || settings.voiceId
        })
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audio.play()
        
        toast({
          title: "Success",
          description: "Voice test completed successfully"
        })
      } else {
        throw new Error('Voice test failed')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test voice",
        variant: "destructive"
      })
    } finally {
      setIsPlaying(false)
    }
  }

  const updateSettings = async () => {
    try {
      const response = await fetch('/api/admin/voice-config/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Voice settings updated successfully"
        })
      } else {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update voice settings",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Voice Settings</h1>
        <Badge variant="outline">Enhanced AI Voice System</Badge>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="voices">Voice Library</TabsTrigger>
          <TabsTrigger value="test">Voice Test</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voice Configuration</CardTitle>
              <CardDescription>
                Configure your AI voice assistant settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Speech Recognition</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.useDeepgram}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, useDeepgram: checked }))
                      }
                    />
                    <Label>Use Deepgram (Enhanced)</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Voice Synthesis</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.useElevenLabs}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, useElevenLabs: checked }))
                      }
                    />
                    <Label>Use ElevenLabs (High Quality)</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Default Voice</Label>
                <Select
                  value={settings.voiceId}
                  onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, voiceId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice.voice_id} value={voice.voice_id}>
                        {voice.name} ({voice.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={updateSettings} className="w-full">
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Voices</CardTitle>
              <CardDescription>
                Manage your voice library and create custom voices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {voices.map((voice) => (
                  <Card key={voice.voice_id} className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{voice.name}</h3>
                      <p className="text-sm text-muted-foreground">{voice.description}</p>
                      <Badge variant="secondary">{voice.category}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voice Test</CardTitle>
              <CardDescription>
                Test different voices and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Test Text</Label>
                <Input
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Enter text to test..."
                />
              </div>

              <div className="space-y-2">
                <Label>Voice</Label>
                <Select
                  value={selectedVoice}
                  onValueChange={setSelectedVoice}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice.voice_id} value={voice.voice_id}>
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={testVoice} 
                disabled={isPlaying}
                className="w-full"
              >
                {isPlaying ? "Generating..." : "Test Voice"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Analytics</CardTitle>
              <CardDescription>
                Monitor your voice system performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analytics.totalCalls}</div>
                    <div className="text-sm text-muted-foreground">Total Calls</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{Math.round(analytics.averageDuration / 1000)}s</div>
                    <div className="text-sm text-muted-foreground">Avg Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{Math.round(analytics.averageConfidence * 100)}%</div>
                    <div className="text-sm text-muted-foreground">Avg Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{Math.round(analytics.bookingRate * 100)}%</div>
                    <div className="text-sm text-muted-foreground">Booking Rate</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  No analytics data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 