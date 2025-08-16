// Only import and use Twilio if environment variables are available
let twilioClient: any = null

// Guard against missing environment variables
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    import("twilio").then((twilio) => {
      twilioClient = twilio.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    }).catch((error) => {
      console.warn("Twilio not available:", error.message)
    })
  } catch (error) {
    console.warn("Twilio not available:", error.message)
  }
}

export { twilioClient }

export const TWILIO_CONFIG = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
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

// SMS sending utility with environment guards
export async function sendSMS(to: string, message: string) {
  // Guard against missing configuration
  if (!twilioClient || !TWILIO_CONFIG.phoneNumber) {
    console.warn("SMS not configured - missing Twilio credentials")
    return { success: false, error: "SMS service not configured" }
  }

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
