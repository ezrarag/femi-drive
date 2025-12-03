// Email utility using nodemailer (supports Zoho Mail, Gmail, and other SMTP providers)
import nodemailer from 'nodemailer'

// Create transporter with configurable SMTP settings
const getTransporter = () => {
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10)
  const smtpSecure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === undefined

  console.log('📧 SMTP Configuration:', {
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    user: smtpUser ? `${smtpUser.substring(0, 3)}***` : 'NOT SET',
    pass: smtpPass ? 'SET' : 'NOT SET',
  })

  if (!smtpUser || !smtpPass) {
    console.error('❌ SMTP credentials missing:', {
      SMTP_USER: smtpUser ? 'SET' : 'MISSING',
      SMTP_PASS: smtpPass ? 'SET' : 'MISSING',
    })
    return null
  }

  // If using Gmail without explicit host, use service shortcut
  if (smtpHost === 'smtp.gmail.com' && !process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  }

  // For Zoho Mail or other SMTP providers
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      // Zoho requires TLS
      rejectUnauthorized: false, // Some providers need this
    },
  })
}

// Create transporter dynamically (not at module load time)
const getTransporterInstance = () => getTransporter()

export interface EmailOptions {
  to: string | string[]
  subject: string
  text: string
  html?: string
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  // Get transporter dynamically to ensure env vars are loaded
  const transporter = getTransporterInstance()
  
  if (!transporter) {
    const errorMsg = "Email not configured - missing SMTP credentials. Check SMTP_USER and SMTP_PASS environment variables."
    console.error("❌", errorMsg)
    return { success: false, error: errorMsg }
  }

  try {
    const emailFrom = process.env.EMAIL_FROM || process.env.SMTP_USER || 'Femi Leasing Admin'
    
    console.log('📤 Sending email:', {
      from: emailFrom,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
    })
    
    const result = await transporter.sendMail({
      from: emailFrom,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })
    
    console.log('✅ Email sent successfully:', {
      messageId: result.messageId,
      response: result.response,
    })
    
    return { success: true }
  } catch (error: any) {
    console.error("❌ Email sending failed:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack,
    })
    
    // Provide more helpful error messages
    let errorMessage = error.message || 'Unknown error'
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed. Check your SMTP_USER and SMTP_PASS (App Password).'
    } else if (error.code === 'ECONNECTION') {
      errorMessage = `Connection failed. Check SMTP_HOST (${process.env.SMTP_HOST}) and SMTP_PORT (${process.env.SMTP_PORT}).`
    } else if (error.responseCode === 535) {
      errorMessage = 'Authentication failed. Invalid email or app password.'
    }
    
    return { success: false, error: errorMessage }
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

