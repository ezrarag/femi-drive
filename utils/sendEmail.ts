// Email utility using nodemailer (Gmail SMTP)
import nodemailer from 'nodemailer'

// Create transporter if credentials are available
const transporter = process.env.SMTP_USER && process.env.SMTP_PASS
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null

export interface EmailOptions {
  to: string | string[]
  subject: string
  text: string
  html?: string
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  if (!transporter) {
    console.warn("Email not configured - missing SMTP credentials")
    return { success: false, error: "Email service not configured" }
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })
    return { success: true }
  } catch (error: any) {
    console.error("Email sending failed:", error)
    return { success: false, error: error.message }
  }
}

// Convenience function for booking confirmation emails
export async function sendBookingConfirmationEmail(data: {
  customerEmail: string
  customerName: string
  vehicleName: string
  vehicleId: string
  startDate: string
  endDate: string
  totalAmount: number
  paymentIntentId: string
}) {
  const subject = `Booking Confirmed - ${data.vehicleName}`
  const text = `🎉 Your booking has been confirmed!

Dear ${data.customerName},

Thank you for choosing Femi Leasing!

Booking Details:
- Vehicle: ${data.vehicleName}
- Vehicle ID: ${data.vehicleId}
- Pickup Date: ${new Date(data.startDate).toLocaleDateString()}
- Return Date: ${new Date(data.endDate).toLocaleDateString()}
- Total Amount: $${data.totalAmount.toFixed(2)}
- Payment ID: ${data.paymentIntentId}

We'll contact you soon with pickup instructions and location details.

If you have any questions, please contact us at:
- Phone: (201) 898-7281
- Email: femileasingauto@gmail.com
- Hours: Daily 6:00 AM - 11:00 PM

Thank you for your business!

Femi Leasing Team`

  return sendEmail({
    to: data.customerEmail,
    subject,
    text,
  })
}

