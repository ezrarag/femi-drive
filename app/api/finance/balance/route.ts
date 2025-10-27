import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.error("❌ Missing STRIPE_SECRET_KEY in environment variables.");
      return NextResponse.json({ error: "Missing Stripe secret key." }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get platform balance
    const balance = await stripe.balance.retrieve();

    // Get recent balance transactions
    const transactions = await stripe.balanceTransactions.list({ 
      limit: 20,
      expand: ['data.source']
    });

    // Get recent transfers to connected accounts
    const transfers = await stripe.transfers.list({ 
      limit: 10,
      destination: "acct_1SK6dd1lscTKUkb9" // Femi Leasing account
    });

    // Calculate summary stats
    const available = balance.available.find(b => b.currency === 'usd');
    const pending = balance.pending.find(b => b.currency === 'usd');

    return NextResponse.json({ 
      balance: {
        available: available ? available.amount / 100 : 0,
        pending: pending ? pending.amount / 100 : 0,
        currency: available?.currency || 'usd',
      },
      recentTransactions: transactions.data.map(t => ({
        id: t.id,
        amount: t.amount / 100,
        currency: t.currency,
        type: t.type,
        status: t.status,
        description: t.description,
        created: t.created,
        fee: t.fee / 100,
        net: t.net / 100,
      })),
      recentTransfers: transfers.data.map(t => ({
        id: t.id,
        amount: t.amount / 100,
        currency: t.currency,
        destination: t.destination,
        description: t.description,
        created: t.created,
        status: t.reversed ? 'reversed' : 'completed',
      })),
    });
  } catch (err: any) {
    console.error("🚨 Balance retrieval failed:", {
      message: err.message,
      type: err.type,
      code: err.code,
    });

    return NextResponse.json(
      {
        error: "Balance retrieval failed",
        message: err.message,
        type: err.type,
        code: err.code,
      },
      { status: 500 }
    );
  }
}
