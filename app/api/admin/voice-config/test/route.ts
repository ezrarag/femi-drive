import { NextRequest, NextResponse } from 'next/server'
import { elevenLabsClient } from '@/lib/elevenlabs-client'

export async function POST(request: NextRequest) {
  try {
    if (!elevenLabsClient) {
      return NextResponse.json({ error: 'ElevenLabs not configured' }, { status: 400 })
    }

    const body = await request.json()
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