import { adminFirestore } from './firebase-admin'
// @ts-ignore - nodemailer types not available
import nodemailer from 'nodemailer'

const ADMIN_SMS_SETTINGS_COLLECTION = 'admin_sms_settings'

// Email-to-SMS Gateway Configuration (fallback)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

/**
 * Get all admin phone numbers that have SMS notifications enabled
 */
export async function getAdminPhoneNumbers(): Promise<Array<{ email: string; phoneNumber: string }>> {
  if (!adminFirestore) {
    console.warn('Firestore not initialized, cannot fetch admin phone numbers')
    return []
  }

  try {
    const snapshot = await adminFirestore
      .collection(ADMIN_SMS_SETTINGS_COLLECTION)
      .where('enabled', '==', true)
      .get()

    const admins: Array<{ email: string; phoneNumber: string }> = []
    
    snapshot.forEach((doc) => {
      const data = doc.data()
      if (data?.phoneNumber && data?.enabled) {
        admins.push({
          email: data.email || doc.id,
          phoneNumber: data.phoneNumber
        })
      }
    })

    return admins
  } catch (error) {
    console.error('Error fetching admin phone numbers:', error)
    return []
  }
}

/**
 * Send SMS to all admins with notifications enabled
 */
export async function sendSmsToAdmins(message: string): Promise<void> {
  try {
    const admins = await getAdminPhoneNumbers()
    
    if (admins.length === 0) {
      console.log('No admins with SMS notifications enabled')
      return
    }

    // Try Twilio first for each admin, then fallback to email
    for (const admin of admins) {
      let sentViaTwilio = false
      
      // Try Twilio if configured
      try {
        // Dynamic import to avoid build-time errors
        const twilioModule = await import('./twilio')
        
        // Check if Twilio is configured
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
          const result = await twilioModule.sendSMS(admin.phoneNumber, message)
          if (result.success) {
            console.log(`SMS sent to ${admin.email} via Twilio`)
            sentViaTwilio = true
          } else {
            console.log(`Twilio returned failure for ${admin.email}:`, result.error)
          }
        } else {
          console.log(`Twilio not configured, using email fallback for ${admin.email}`)
        }
      } catch (error: any) {
        console.log(`Twilio error for ${admin.email}:`, error.message)
      }
      
      // Fallback to email-to-SMS gateway if Twilio didn't work
      if (!sentViaTwilio) {
        try {
          await sendSmsViaEmail(admin.phoneNumber, message, admin.email)
        } catch (emailError) {
          console.error(`Failed to send SMS via email to ${admin.email}:`, emailError)
        }
      }
    }
  } catch (error) {
    console.error('Error sending SMS to admins:', error)
  }
}

/**
 * Fallback: Send SMS via email-to-SMS gateway
 * This converts the phone number to a carrier gateway email address
 */
async function sendSmsViaEmail(phoneNumber: string, message: string, adminEmail: string): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP not configured, cannot send SMS via email gateway')
    return
  }

  // Common carrier gateways (US)
  // Format: phone_number@carrier_gateway.com
  // We'll try to detect carrier or use a generic approach
  // For now, we'll send to the admin's email as a fallback notification
  
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: adminEmail, // Send to admin email as fallback
      subject: `Femi Leasing SMS Alert - ${phoneNumber}`,
      text: `SMS intended for ${phoneNumber}:\n\n${message}`,
    })
    console.log(`SMS notification sent to ${adminEmail} via email (fallback)`)
  } catch (error) {
    console.error('Failed to send SMS via email gateway:', error)
    throw error
  }
}

