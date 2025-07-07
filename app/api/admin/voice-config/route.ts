import { type NextRequest, NextResponse } from "next/server"
import { aiAgent } from "@/lib/ai-voice-agent"

// Admin endpoint to update AI prompts
export async function POST(request: NextRequest) {
  try {
    const { systemPrompt, adminKey } = await request.json()

    // Simple admin authentication (replace with proper auth)
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (systemPrompt) {
      aiAgent.updateSystemPrompt(systemPrompt)
      return NextResponse.json({ success: true, message: "System prompt updated" })
    }

    return NextResponse.json({ error: "No system prompt provided" }, { status: 400 })
  } catch (error) {
    console.error("Voice config update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const adminKey = searchParams.get("adminKey")

  if (adminKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Return current configuration
  return NextResponse.json({
    twilioNumber: process.env.TWILIO_PHONE_NUMBER,
    webhookUrl: process.env.TWILIO_WEBHOOK_URL,
    businessOwnerPhone: process.env.BUSINESS_OWNER_PHONE,
  })
}
