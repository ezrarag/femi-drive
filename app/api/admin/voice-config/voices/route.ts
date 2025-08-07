import { NextResponse } from 'next/server'
import { elevenLabsClient } from '@/lib/elevenlabs-client'

export async function GET() {
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