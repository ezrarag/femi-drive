import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
// @ts-ignore - nodemailer types not available
import nodemailer from 'nodemailer'
import { sendSmsToAdmins } from '@/lib/admin-sms'

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    })
  : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

// Email-to-SMS Gateway Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// SMS Recipients (carrier gateways)
const smsGateways = [
  process.env.ADMIN_SMS_EMAIL,     // 4049739860@txt.att.net
  process.env.COUSIN_SMS_EMAIL,    // your cousin's carrier gateway
].filter(Boolean) // Remove any undefined values

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature || !webhookSecret) {
      console.error('Missing Stripe signature or webhook secret')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe!.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSuccess(paymentIntent)
        break
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailure(failedPayment)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const metadata = paymentIntent.metadata
  const paymentType = metadata.type

  console.log(`Payment succeeded: ${paymentIntent.id}`)
  console.log(`Amount: $${(paymentIntent.amount / 100).toFixed(2)}`)
  console.log(`Type: ${paymentType}`)

  if (paymentType === 'booking') {
    const vehicleName = metadata.vehicleName || 'Unknown Vehicle'
    const vehicleId = metadata.vehicleId
    const startDate = metadata.startDate
    const endDate = metadata.endDate

    console.log(`Booking confirmed for ${vehicleName}`)
    console.log(`Vehicle ID: ${vehicleId}`)
    console.log(`Dates: ${startDate} to ${endDate}`)

    // Send notifications
    await sendBookingNotifications({
      vehicleName,
      vehicleId,
      startDate,
      endDate,
      amount: paymentIntent.amount / 100,
      customerEmail: paymentIntent.receipt_email || undefined,
      paymentIntentId: paymentIntent.id
    })
  } else if (paymentType === 'direct_payment') {
    const vehicleName = metadata.vehicleName || 'Unknown Vehicle'
    const vehicleId = metadata.vehicleId

    console.log(`Direct payment confirmed for ${vehicleName}`)
    console.log(`Vehicle ID: ${vehicleId}`)
    console.log(`Amount: $${(paymentIntent.amount / 100).toFixed(2)}`)

    // Send notifications
    await sendDirectPaymentNotifications({
      vehicleName,
      vehicleId,
      amount: paymentIntent.amount / 100,
      customerEmail: paymentIntent.receipt_email || undefined,
      paymentIntentId: paymentIntent.id
    })
  } else if (paymentType === 'investment') {
    console.log(`Investment confirmed: $${(paymentIntent.amount / 100).toFixed(2)}`)
    
    // Send investment notifications
    await sendInvestmentNotifications({
      amount: paymentIntent.amount / 100,
      customerEmail: paymentIntent.receipt_email || undefined,
      paymentIntentId: paymentIntent.id
    })
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const metadata = paymentIntent.metadata
  const paymentType = metadata.type

  console.log(`Payment failed: ${paymentIntent.id}`)
  console.log(`Type: ${paymentType}`)

  if (paymentType === 'booking') {
    const vehicleName = metadata.vehicleName || 'Unknown Vehicle'
    console.log(`Booking payment failed for ${vehicleName}`)
    
    // Send failure notifications
    await sendPaymentFailureNotifications({
      vehicleName,
      amount: paymentIntent.amount / 100,
      customerEmail: paymentIntent.receipt_email || undefined,
      paymentIntentId: paymentIntent.id
    })
  }
}

async function sendBookingNotifications(bookingData: {
  vehicleName: string
  vehicleId: string
  startDate: string
  endDate: string
  amount: number
  customerEmail?: string
  paymentIntentId: string
}) {
  try {
    // Send SMS to admins with notifications enabled
    const smsMessage = `🚗 NEW BOOKING CONFIRMED!

Vehicle: ${bookingData.vehicleName}
Dates: ${bookingData.startDate} to ${bookingData.endDate}
Amount: $${bookingData.amount.toFixed(2)}
Customer: ${bookingData.customerEmail || 'N/A'}

Payment ID: ${bookingData.paymentIntentId}
Status: Confirmed ✅

Femi Leasing`

    await sendSmsToAdmins(smsMessage)

    // Legacy: Send SMS to admin and cousin via Email-to-SMS gateway (fallback)
    if (smsGateways.length > 0) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: smsGateways,
        subject: "Femi Leasing Booking Confirmation",
        text: smsMessage,
      })
      console.log('Legacy SMS notifications sent to:', smsGateways)
    }

    // Send email to admin
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'admin@readyaimgo.biz',
      subject: `New Booking Confirmed - ${bookingData.vehicleName}`,
      text: smsMessage,
    })
    console.log('Email sent to admin@readyaimgo.biz')

    // Send confirmation email to customer
    if (bookingData.customerEmail) {
      const customerMessage = `🎉 Your booking has been confirmed!

Vehicle: ${bookingData.vehicleName}
Pickup Date: ${bookingData.startDate}
Return Date: ${bookingData.endDate}
Total Amount: $${bookingData.amount.toFixed(2)}

Payment ID: ${bookingData.paymentIntentId}

Thank you for choosing Femi Leasing!
We'll contact you soon with pickup instructions.

ReadyAimGo - Femi Leasing`

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: bookingData.customerEmail,
        subject: `Booking Confirmed - ${bookingData.vehicleName}`,
        text: customerMessage,
      })
      console.log('Confirmation email sent to customer:', bookingData.customerEmail)
    }

  } catch (error) {
    console.error('Failed to send booking notifications:', error)
  }
}

async function sendDirectPaymentNotifications(paymentData: {
  vehicleName: string
  vehicleId: string
  amount: number
  customerEmail?: string
  paymentIntentId: string
}) {
  try {
    // Send SMS to admins with notifications enabled
    const smsMessage = `💳 PAYMENT RECEIVED!

Vehicle: ${paymentData.vehicleName}
Amount: $${paymentData.amount.toFixed(2)}
Customer: ${paymentData.customerEmail || 'N/A'}

Payment ID: ${paymentData.paymentIntentId}
Status: Confirmed ✅

Femi Leasing`

    await sendSmsToAdmins(smsMessage)

    // Legacy: Send SMS to admin and cousin via Email-to-SMS gateway (fallback)
    if (smsGateways.length > 0) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: smsGateways,
        subject: "Femi Leasing Direct Payment Confirmation",
        text: smsMessage,
      })
      console.log('Legacy SMS notifications sent to:', smsGateways)
    }

    // Send email to admin
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'admin@readyaimgo.biz',
      subject: `Direct Payment - ${paymentData.vehicleName}`,
      text: smsMessage,
    })
    console.log('Email sent to admin@readyaimgo.biz')

    // Send confirmation email to customer
    if (paymentData.customerEmail) {
      const customerMessage = `💳 Your direct payment has been confirmed!

Vehicle: ${paymentData.vehicleName}
Amount: $${paymentData.amount.toFixed(2)}

Payment ID: ${paymentData.paymentIntentId}

Thank you for your payment to Femi Leasing!
We appreciate your business.

ReadyAimGo - Femi Leasing`

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: paymentData.customerEmail,
        subject: `Payment Confirmed - ${paymentData.vehicleName}`,
        text: customerMessage,
      })
      console.log('Confirmation email sent to customer:', paymentData.customerEmail)
    }

  } catch (error) {
    console.error('Failed to send direct payment notifications:', error)
  }
}

async function sendInvestmentNotifications(investmentData: {
  amount: number
  customerEmail?: string
  paymentIntentId: string
}) {
  try {
    // Send SMS to admin and cousin via Email-to-SMS gateway
    const smsMessage = `💰 NEW INVESTMENT CONFIRMED!
    
Amount: $${investmentData.amount.toFixed(2)}
Customer: ${investmentData.customerEmail || 'N/A'}

Payment ID: ${investmentData.paymentIntentId}
Status: Confirmed ✅

ReadyAimGo - Femi Leasing`

    if (smsGateways.length > 0) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: smsGateways,
        subject: "Femi Leasing Investment Confirmation",
        text: smsMessage,
      })
      console.log('SMS notifications sent to:', smsGateways)
    }

    // Send email to admin
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'admin@readyaimgo.biz',
      subject: `New Investment - $${investmentData.amount.toFixed(2)}`,
      text: smsMessage,
    })
    console.log('Email sent to admin@readyaimgo.biz')

  } catch (error) {
    console.error('Failed to send investment notifications:', error)
  }
}

async function sendPaymentFailureNotifications(failureData: {
  vehicleName: string
  amount: number
  customerEmail?: string
  paymentIntentId: string
}) {
  try {
    // Send SMS to admin and cousin via Email-to-SMS gateway
    const smsMessage = `❌ BOOKING PAYMENT FAILED!
    
Vehicle: ${failureData.vehicleName}
Amount: $${failureData.amount.toFixed(2)}
Customer: ${failureData.customerEmail || 'N/A'}

Payment ID: ${failureData.paymentIntentId}
Status: Failed ❌

ReadyAimGo - Femi Leasing`

    if (smsGateways.length > 0) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: smsGateways,
        subject: "Femi Leasing Payment Failed",
        text: smsMessage,
      })
      console.log('SMS notifications sent to:', smsGateways)
    }

  } catch (error) {
    console.error('Failed to send failure notifications:', error)
  }
}
