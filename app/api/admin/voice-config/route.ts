import { NextRequest, NextResponse } from 'next/server'
import { elevenLabsClient } from '@/lib/elevenlabs-client'
import { enhancedVoiceAgent } from '@/lib/enhanced-voice-agent'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'voices':
        return await getVoices()
      case 'analytics':
        return await getAnalytics()
      case 'settings':
        return await getSettings()
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Voice config API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const body = await request.json()

    switch (action) {
      case 'test':
        return await testVoice(body)
      case 'settings':
        return await updateSettings(body)
      case 'create-voice':
        return await createVoice(body)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Voice config API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getVoices() {
  try {
    if (!elevenLabsClient) {
      return NextResponse.json({ voices: [] })
    }

    const voices = await elevenLabsClient.getVoices()
    return NextResponse.json({ voices: voices.voices || [] })
  } catch (error) {
    console.error('Failed to get voices:', error)
    return NextResponse.json({ voices: [] })
  }
}

async function getAnalytics() {
  try {
    // Mock analytics data - in production, this would come from your database
    const analytics = {
      totalCalls: 150,
      averageDuration: 45000, // milliseconds
      averageConfidence: 0.85,
      escalationRate: 0.12,
      bookingRate: 0.23
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Failed to get analytics:', error)
    return NextResponse.json({ error: 'Failed to get analytics' }, { status: 500 })
  }
}

async function getSettings() {
  try {
    const settings = {
      useDeepgram: !!process.env.DEEPGRAM_API_KEY,
      useElevenLabs: !!process.env.ELEVENLABS_API_KEY,
      fallbackToTwilio: true,
      voiceId: process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to get settings:', error)
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 })
  }
}

async function testVoice(body: { text: string; voiceId?: string }) {
  try {
    if (!elevenLabsClient) {
      return NextResponse.json({ error: 'ElevenLabs not configured' }, { status: 400 })
    }

    const { text, voiceId } = body
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const audioBuffer = await elevenLabsClient.textToSpeech(text, voiceId)
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Voice test failed:', error)
    return NextResponse.json({ error: 'Voice test failed' }, { status: 500 })
  }
}

async function updateSettings(body: any) {
  try {
    // In a real application, you'd save these settings to a database
    // For now, we'll just validate and return success
    const { useDeepgram, useElevenLabs, fallbackToTwilio, voiceId } = body

    if (typeof useDeepgram !== 'boolean' || typeof useElevenLabs !== 'boolean') {
      return NextResponse.json({ error: 'Invalid settings' }, { status: 400 })
    }

    // Here you would save to database
    console.log('Settings updated:', { useDeepgram, useElevenLabs, fallbackToTwilio, voiceId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

async function createVoice(body: { name: string; description: string; audioFiles: File[] }) {
  try {
    if (!elevenLabsClient) {
      return NextResponse.json({ error: 'ElevenLabs not configured' }, { status: 400 })
    }

    const { name, description, audioFiles } = body
    if (!name || !description || !audioFiles?.length) {
      return NextResponse.json({ error: 'Name, description, and audio files are required' }, { status: 400 })
    }

    const voice = await elevenLabsClient.createVoice(name, description, audioFiles)
    return NextResponse.json({ success: true, voice })
  } catch (error) {
    console.error('Failed to create voice:', error)
    return NextResponse.json({ error: 'Failed to create voice' }, { status: 500 })
  }
}
