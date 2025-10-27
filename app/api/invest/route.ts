import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    })
  : null

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'usd', email, name } = await request.json()

    if (!amount || amount < 1000) {
      return NextResponse.json(
        { error: 'Minimum investment amount is $1,000' },
        { status: 400 }
      )
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.' },
        { status: 500 }
      )
    }

    // Convert amount to cents
    const amountInCents = amount * 100;
    
    // Calculate 0.5% platform fee
    const applicationFeeAmount = Math.round(amountInCents * 0.005);

    // Create a payment intent with automatic transfer to Femi Leasing
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata: {
        type: 'investment',
        investor_email: email,
        investor_name: name,
        project: 'femi-leasing',
      },
      automatic_payment_methods: {
        enabled: true,
      },
      // Always transfer to Femi Leasing connected account
      transfer_data: { 
        destination: "acct_1SK6dd1lscTKUkb9" 
      },
      // Apply 0.5% platform fee
      application_fee_amount: applicationFeeAmount,
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
