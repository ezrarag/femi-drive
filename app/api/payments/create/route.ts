import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    })
  : null

export async function POST(request: NextRequest) {
  try {
    const { amount, connectedAccountId, description, metadata } = await request.json()

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.' },
        { status: 500 }
      )
    }

    // Convert USD to cents
    const amountInCents = Math.round(amount * 100)
    
    // Calculate 0.5% platform fee (rounded)
    const applicationFeeAmount = Math.round(amountInCents * 0.005)

    // Determine payment type and metadata
    const paymentType = metadata?.type || 'investment'
    const paymentMetadata = {
      type: paymentType,
      description: description || `${paymentType === 'booking' ? 'Booking' : 'Investment'} of $${amount}`,
      ...metadata, // Include all metadata fields
    }

    // Create PaymentIntent with Stripe Connect
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      transfer_data: {
        destination: connectedAccountId || 'acct_1SK6dd1lscTKUkb9', // Femi Leasing connected account
      },
      application_fee_amount: applicationFeeAmount,
      payment_method_types: ['card'],
      metadata: paymentMetadata,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Stripe error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
