import { type NextRequest, NextResponse } from "next/server"
import twilio from "twilio"
import { aiAgent } from "@/lib/ai-voice-agent"
import { sendSMS } from "@/lib/twilio"

const VoiceResponse = twilio.twiml.VoiceResponse

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const callSid = formData.get("CallSid") as string
  const from = formData.get("From") as string
  const to = formData.get("To") as string
  const speechResult = formData.get("SpeechResult") as string
  const callStatus = formData.get("CallStatus") as string

  const twiml = new VoiceResponse()

  try {
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

    // Process speech with AI
    const aiResult = await aiAgent.processCall(callSid, speechResult, { from, to })

    switch (aiResult.action) {
      case "escalate":
        twiml.say(
          {
            voice: "alice",
            language: "en-US",
          },
          aiResult.response,
        )

        // Transfer to business owner (you'll need to set this number)
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

        // Send booking link via SMS
        const bookingLink = `https://checkout.wheelbasepro.com/reserve?owner_id=4321962`
        const smsMessage = `Hi! Here's your secure booking link for Femi Leasing: ${bookingLink}\n\nComplete your reservation and we'll have your vehicle ready! Questions? Call us back anytime.`

        await sendSMS(from, smsMessage)

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
  } catch (error) {
    console.error("Voice processing error:", error)
    twiml.say(
      "I apologize, but I'm experiencing technical difficulties. Please call back in a few minutes or visit our website at femi leasing dot com.",
    )
    twiml.hangup()
  }

  return new NextResponse(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  })
}
