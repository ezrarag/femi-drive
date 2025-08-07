import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { useDeepgram, useElevenLabs, fallbackToTwilio, voiceId } = body

    if (typeof useDeepgram !== 'boolean' || typeof useElevenLabs !== 'boolean') {
      return NextResponse.json({ error: 'Invalid settings' }, { status: 400 })
    }

    // In a real application, you'd save these settings to a database
    // For now, we'll just validate and return success
    console.log('Settings updated:', { useDeepgram, useElevenLabs, fallbackToTwilio, voiceId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
} 