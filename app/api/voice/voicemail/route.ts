import { type NextRequest, NextResponse } from "next/server"
import { sendSMS } from "@/lib/twilio"

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const recordingUrl = formData.get("RecordingUrl") as string
  const transcriptionText = formData.get("TranscriptionText") as string
  const from = formData.get("From") as string
  const callSid = formData.get("CallSid") as string

  try {
    // Send notification to business owner
    const ownerNotification = `New voicemail from ${from}:\n\n"${transcriptionText}"\n\nListen: ${recordingUrl}\n\nCall ID: ${callSid}`

    await sendSMS(process.env.BUSINESS_OWNER_PHONE || "+1234567890", ownerNotification)

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
  } catch (error) {
    console.error("Voicemail processing error:", error)
  }

  return new NextResponse("OK")
}
