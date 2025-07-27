import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  // Guard against missing environment variables
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn("Voicemail API disabled - missing Twilio credentials")
    return new NextResponse("Voicemail service not configured", { status: 503 })
  }

  try {
    // Dynamic import to avoid build-time errors
    const { sendSMS } = await import("@/lib/twilio")

    const formData = await request.formData()
    const recordingUrl = formData.get("RecordingUrl") as string
    const transcriptionText = formData.get("TranscriptionText") as string
    const from = formData.get("From") as string
    const callSid = formData.get("CallSid") as string

    // Send notification to business owner (if configured)
    if (process.env.BUSINESS_OWNER_PHONE) {
      const ownerNotification = `New voicemail from ${from}:\n\n"${transcriptionText}"\n\nListen: ${recordingUrl}\n\nCall ID: ${callSid}`
      await sendSMS(process.env.BUSINESS_OWNER_PHONE, ownerNotification)
    }

    // Send confirmation to caller
    await sendSMS(
      from,
      "Thank you for your message! We received your voicemail and will call you back within one hour. For immediate assistance, visit femileasing.com",
    )

    console.log("Voicemail processed:", {
      from,
      callSid,
      transcription: transcriptionText,
      recording: recordingUrl,
    })

    return new NextResponse("OK")
  } catch (error) {
    console.error("Voicemail processing error:", error)
    return new NextResponse("Error processing voicemail", { status: 500 })
  }
}
