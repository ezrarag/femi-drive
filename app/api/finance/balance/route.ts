import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error("❌ Missing STRIPE_SECRET_KEY in environment variables.");
    return NextResponse.json({ 
      error: "Missing Stripe secret key in environment variables.",
      balance: { available: 0, pending: 0, currency: 'usd' },
      recentTransactions: [],
      recentTransfers: [],
      femiPayments: [],
      femiTransactions: [],
    }, { status: 200 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

  // Initialize all data as empty arrays
  let balance = null;
  let transactions = { data: [] };
  let transfers = { data: [] };
  let allPayments = { data: [] };
  let errorMessage = null;

  try {
    // Get platform balance
    balance = await stripe.balance.retrieve();
    console.log("✅ Balance retrieved successfully");
  } catch (err: any) {
    console.error("🚨 Failed to retrieve balance:", err.message);
    errorMessage = `Balance error: ${err.message}`;
  }

  try {
    // Get recent balance transactions
    transactions = await stripe.balanceTransactions.list({ 
      limit: 20,
      expand: ['data.source']
    });
    console.log(`✅ Retrieved ${transactions.data.length} transactions`);
  } catch (err: any) {
    console.error("🚨 Failed to retrieve transactions:", err.message);
  }

  try {
    // Get recent transfers to connected accounts
    transfers = await stripe.transfers.list({ 
      limit: 10,
      destination: "acct_1SK6dd1lscTKUkb9" // Femi Leasing account
    });
    console.log(`✅ Retrieved ${transfers.data.length} transfers`);
  } catch (err: any) {
    console.error("🚨 Failed to retrieve transfers:", err.message);
  }

  try {
    // Get all PaymentIntents destined for Femi Leasing
    allPayments = await stripe.paymentIntents.list({ 
      limit: 50,
      expand: ['data.transfer_data']
    });
    console.log(`✅ Retrieved ${allPayments.data.length} payment intents`);
  } catch (err: any) {
    console.error("🚨 Failed to retrieve payment intents:", err.message);
  }

  // Filter payments for Femi Leasing (either by destination or metadata)
  const femiPayments = allPayments.data.filter(payment => 
    payment.transfer_data?.destination === "acct_1SK6dd1lscTKUkb9" ||
    payment.metadata?.project === "femi-leasing" ||
    payment.metadata?.client === "femileasing"
  );

  // Get balance transactions for these specific payment intents
  const femiPaymentIds = femiPayments.map(p => p.id);
  const femiTransactions = transactions.data.filter(t => 
    t.source && femiPaymentIds.includes(t.source as string)
  );

  // Calculate summary stats
  const available = balance?.available.find(b => b.currency === 'usd');
  const pending = balance?.pending.find(b => b.currency === 'usd');

  return NextResponse.json({ 
    error: errorMessage,
    balance: {
      available: available ? available.amount / 100 : 0,
      pending: pending ? pending.amount / 100 : 0,
      currency: available?.currency || 'usd',
    },
    // Recent transactions (all platform activity)
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
    // Transfers to Femi Leasing account
    recentTransfers: transfers.data.map(t => ({
      id: t.id,
      amount: t.amount / 100,
      currency: t.currency,
      destination: t.destination,
      description: t.description,
      created: t.created,
      status: t.reversed ? 'reversed' : 'completed',
    })),
    // Femi Leasing payments (platform payments destined for their account)
    femiPayments: femiPayments.map(payment => ({
      id: payment.id,
      amount: payment.amount / 100,
      currency: payment.currency,
      status: payment.status,
      description: payment.description,
      metadata: payment.metadata,
      created: payment.created,
      transferDestination: payment.transfer_data?.destination,
      applicationFeeAmount: payment.application_fee_amount ? payment.application_fee_amount / 100 : 0,
    })),
    // Femi Leasing transactions (balance transactions related to their payments)
    femiTransactions: femiTransactions.map(t => ({
      id: t.id,
      amount: t.amount / 100,
      currency: t.currency,
      type: t.type,
      status: t.status,
      description: t.description,
      created: t.created,
      fee: t.fee / 100,
      net: t.net / 100,
      availableOn: t.available_on ? new Date(t.available_on * 1000).toISOString() : null,
    })),
  });
}