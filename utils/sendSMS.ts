// SMS utility - supports both Twilio and Email-to-SMS gateway
import { sendSMS as twilioSendSMS } from '@/lib/twilio'
import { sendEmail } from './sendEmail'

// SMS Recipients (carrier gateways for email-to-SMS)
const smsGateways = [
  process.env.ADMIN_SMS_EMAIL,
  process.env.COUSIN_SMS_EMAIL,
].filter(Boolean) as string[]

export interface SMSOptions {
  to: string
  message: string
}

export async function sendSMS(options: SMSOptions): Promise<{ success: boolean; error?: string }> {
  // Try Twilio first if configured
  const twilioResult = await twilioSendSMS(options.to, options.message)
  if (twilioResult.success) {
    return { success: true }
  }

  // Fallback to email-to-SMS gateway
  if (smsGateways.length > 0) {
    try {
      // Send to all configured SMS gateways
      const emailResult = await sendEmail({
        to: smsGateways,
        subject: "Femi Leasing SMS",
        text: options.message,
      })
      return emailResult
    } catch (error: any) {
      console.error("SMS sending failed:", error)
      return { success: false, error: error.message }
    }
  }

  console.warn("SMS not configured - no Twilio or email-to-SMS gateway available")
  return { success: false, error: "SMS service not configured" }
}

// Convenience function for booking confirmation SMS
export async function sendBookingConfirmationSMS(data: {
  customerPhone?: string
  vehicleName: string
  vehicleId: string
  startDate: string
  endDate: string
  totalAmount: number
}) {
  const message = `🚗 BOOKING CONFIRMED!

Vehicle: ${data.vehicleName}
Dates: ${new Date(data.startDate).toLocaleDateString()} - ${new Date(data.endDate).toLocaleDateString()}
Amount: $${data.totalAmount.toFixed(2)}

Thank you for choosing Femi Leasing!
We'll contact you soon with pickup instructions.

Questions? Call (201) 898-7281`

  // Send to customer if phone provided
  if (data.customerPhone) {
    await sendSMS({ to: data.customerPhone, message })
  }

  // Also send admin notification
  const adminMessage = `🚗 NEW BOOKING CONFIRMED!

Vehicle: ${data.vehicleName}
ID: ${data.vehicleId}
Dates: ${data.startDate} to ${data.endDate}
Amount: $${data.totalAmount.toFixed(2)}

Femi Leasing`

  // Send to admin gateways
  if (smsGateways.length > 0) {
    await sendEmail({
      to: smsGateways,
      subject: "Femi Leasing Booking Confirmation",
      text: adminMessage,
    })
  }
}

