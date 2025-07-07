import twilio from "twilio"

// Twilio configuration
export const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export const TWILIO_CONFIG = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER, // Your business number
  webhookUrl: process.env.TWILIO_WEBHOOK_URL || "https://your-domain.com/api/voice",
}

// Phone number formatting utility
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, "")
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phoneNumber
}

// SMS sending utility
export async function sendSMS(to: string, message: string) {
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: TWILIO_CONFIG.phoneNumber,
      to: to,
    })
    return { success: true, sid: result.sid }
  } catch (error) {
    console.error("SMS sending failed:", error)
    return { success: false, error: error.message }
  }
}
