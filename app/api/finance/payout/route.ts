import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST() {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.error("❌ Missing STRIPE_SECRET_KEY in environment variables.");
      return NextResponse.json({ error: "Missing Stripe secret key." }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const CONNECTED_ACCOUNT_ID = "acct_1SK6dd1lscTKUkb9"; // Femi Leasing account

    // Get the connected account's balance
    const balance = await stripe.balance.retrieve({ 
      stripeAccount: CONNECTED_ACCOUNT_ID 
    });
    
    // Find USD available balance
    const available = balance.available?.find(b => b.currency === 'usd')?.amount ?? 0;

    if (available <= 0) {
      return NextResponse.json({ 
        message: "No available balance to transfer.",
        available: 0 
      }, { status: 400 });
    }

    console.log(`💰 Creating payout for ${available / 100} USD to account ${CONNECTED_ACCOUNT_ID}`);

    // Create payout to transfer funds from connected account to their bank
    const payout = await stripe.payouts.create(
      {
        amount: available,
        currency: "usd",
        statement_descriptor: "Femi Leasing",
        description: "Payout to Femi Leasing bank account",
      },
      { stripeAccount: CONNECTED_ACCOUNT_ID }
    );

    console.log(`✅ Payout created: ${payout.id}`);

    return NextResponse.json({ 
      success: true, 
      payout: {
        id: payout.id,
        amount: payout.amount / 100,
        currency: payout.currency,
        status: payout.status,
        created: payout.created,
        arrival_date: payout.arrival_date ? new Date(payout.arrival_date * 1000).toISOString() : null,
      }
    });
  } catch (err: any) {
    console.error("🚨 Payout error:", {
      message: err.message,
      type: err.type,
      code: err.code,
    });

    return NextResponse.json(
      { 
        error: "Payout failed",
        message: err.message,
      },
      { status: 500 }
    );
  }
}
