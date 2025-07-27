import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  // Hard gate: if no Twilio credentials, return service unavailable
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return NextResponse.json(
      { error: "Voice configuration service is not available. Missing Twilio credentials." },
      { status: 503 },
    )
  }

  // Hard gate: if no OpenAI key, return service unavailable
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Voice configuration service is not available. Missing OpenAI credentials." },
      { status: 503 },
    )
  }

  try {
    // Only import and use these modules if we have the required credentials
    const { getTwilioClient } = await import("@/lib/twilio")
    const { getVoiceConfig } = await import("@/lib/ai-voice-agent")

    const twilioClient = getTwilioClient()
    const voiceConfig = getVoiceConfig()

    // Get phone numbers
    const phoneNumbers = await twilioClient.incomingPhoneNumbers.list()

    return NextResponse.json({
      phoneNumbers: phoneNumbers.map((num) => ({
        sid: num.sid,
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        voiceUrl: num.voiceUrl,
      })),
      voiceConfig,
      status: "active",
    })
  } catch (error) {
    console.error("Voice config error:", error)
    return NextResponse.json({ error: "Failed to retrieve voice configuration" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Hard gate: if no credentials, return service unavailable
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Voice configuration service is not available. Missing required credentials." },
      { status: 503 },
    )
  }

  try {
    const { updateVoiceConfig } = await import("@/lib/ai-voice-agent")
    const body = await request.json()

    const updatedConfig = updateVoiceConfig(body)

    return NextResponse.json({
      success: true,
      config: updatedConfig,
    })
  } catch (error) {
    console.error("Voice config update error:", error)
    return NextResponse.json({ error: "Failed to update voice configuration" }, { status: 500 })
  }
}
