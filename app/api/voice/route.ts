import { type NextRequest, NextResponse } from "next/server"

// Guard against missing environment variables
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  console.warn("Voice API disabled - missing Twilio credentials")
}

export async function POST(request: NextRequest) {
  // Return early if Twilio is not configured
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return new NextResponse("Voice service not configured", { status: 503 })
  }

  try {
    // Dynamic import to avoid build-time errors
    const twilio = await import("twilio")
    const { aiAgent } = await import("@/lib/ai-voice-agent")
    const { sendSMS } = await import("@/lib/twilio")
    const { enhancedVoiceAgent } = await import("@/lib/enhanced-voice-agent")

    const VoiceResponse = twilio.default.twiml.VoiceResponse

    const formData = await request.formData()
    const callSid = formData.get("CallSid") as string
    const from = formData.get("From") as string
    const to = formData.get("To") as string
    const speechResult = formData.get("SpeechResult") as string
    const callStatus = formData.get("CallStatus") as string

    const twiml = new VoiceResponse()

    // Handle initial call
    if (callStatus === "ringing" || !speechResult) {
      twiml.say(
        {
          voice: "alice",
          language: "en-US",
        },
        "Hello! Thank you for calling Femi Leasing. I'm Femi, your AI assistant. How can I help you with your vehicle rental needs today?",
      )

      twiml.gather({
        input: ["speech"],
        timeout: 10,
        speechTimeout: "auto",
        action: "/api/voice",
        method: "POST",
      })

      twiml.say("I didn't catch that. Please let me know how I can assist you today.")
      twiml.redirect("/api/voice")

      return new NextResponse(twiml.toString(), {
        headers: { "Content-Type": "text/xml" },
      })
    }

    // Process speech with enhanced AI agent
    const enhancedResult = await enhancedVoiceAgent.processCall(callSid, speechResult, { from, to })

    // If enhanced agent fails, fall back to basic AI agent
    if (!enhancedResult || !aiAgent) {
      twiml.say("I apologize, but our AI assistant is currently unavailable. Let me transfer you to our team.")
      twiml.dial(
        {
          timeout: 30,
          callerId: from,
        },
        process.env.BUSINESS_OWNER_PHONE || "+1234567890",
      )
      return new NextResponse(twiml.toString(), {
        headers: { "Content-Type": "text/xml" },
      })
    }

    const aiResult = enhancedResult

    switch (aiResult.action) {
      case "escalate":
        twiml.say(
          {
            voice: "alice",
            language: "en-US",
          },
          aiResult.response,
        )

        twiml.dial(
          {
            timeout: 30,
            callerId: from,
          },
          process.env.BUSINESS_OWNER_PHONE || "+1234567890",
        )

        twiml.say(
          "I apologize, but our team is currently unavailable. Please leave a message after the tone, and we'll call you back within one hour.",
        )
        twiml.record({
          timeout: 30,
          transcribe: true,
          action: "/api/voice/voicemail",
        })
        break

      case "send_booking_link":
        twiml.say(
          {
            voice: "alice",
            language: "en-US",
          },
          aiResult.response,
        )

        const bookingLink = `https://checkout.wheelbasepro.com/reserve?owner_id=4321962`
        const smsMessage = `Hi! Here's your secure booking link for Femi Leasing: ${bookingLink}\n\nComplete your reservation and we'll have your vehicle ready! Questions? Call us back anytime.`

        await enhancedVoiceAgent.sendEnhancedSMS(from, smsMessage, bookingLink)

        twiml.say(
          "Perfect! I've sent the booking link to your phone. You should receive it in just a moment. Is there anything else I can help you with today?",
        )

        twiml.gather({
          input: ["speech"],
          timeout: 10,
          speechTimeout: "auto",
          action: "/api/voice",
          method: "POST",
        })
        break

      case "end_call":
        twiml.say(
          {
            voice: "alice",
            language: "en-US",
          },
          aiResult.response,
        )
        twiml.say("Thank you for calling Femi Leasing. Have a great day!")
        twiml.hangup()
        break

      default:
        twiml.say(
          {
            voice: "alice",
            language: "en-US",
          },
          aiResult.response,
        )

        twiml.gather({
          input: ["speech"],
          timeout: 10,
          speechTimeout: "auto",
          action: "/api/voice",
          method: "POST",
        })

        twiml.say("I didn't hear a response. How else can I help you today?")
        twiml.redirect("/api/voice")
    }

    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    })
  } catch (error) {
    console.error("Voice processing error:", error)

    // Fallback response
    try {
      const twilio = await import("twilio")
      const VoiceResponse = twilio.default.twiml.VoiceResponse
      const twiml = new VoiceResponse()

      twiml.say(
        "I apologize, but I'm experiencing technical difficulties. Please call back in a few minutes or visit our website at femi leasing dot com.",
      )
      twiml.hangup()

      return new NextResponse(twiml.toString(), {
        headers: { "Content-Type": "text/xml" },
      })
    } catch (fallbackError) {
      console.error("Fallback error:", fallbackError)
      return new NextResponse("Service temporarily unavailable", { status: 503 })
    }
  }
}
