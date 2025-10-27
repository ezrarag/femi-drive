import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.error("❌ Missing STRIPE_SECRET_KEY in environment variables.");
      return NextResponse.json({ error: "Missing Stripe secret key." }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const body = await req.json();

    console.log("📦 Transfer request body:", body);

    const { amount, destination, description } = body;

    if (!amount || isNaN(amount) || amount <= 0) {
      console.error("❌ Invalid or missing amount:", amount);
      return NextResponse.json({ error: "Invalid or missing amount." }, { status: 400 });
    }

    if (!destination) {
      console.error("❌ Missing destination account ID");
      return NextResponse.json({ error: "Missing destination account ID." }, { status: 400 });
    }

    // Convert USD to cents
    const amountInCents = Math.round(amount * 100);

    // Create transfer
    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: "usd",
      destination: destination,
      description: description || `Manual transfer - ${new Date().toISOString()}`,
    });

    console.log("✅ Transfer created:", transfer.id);

    return NextResponse.json({ 
      success: true, 
      transfer: {
        id: transfer.id,
        amount: transfer.amount,
        currency: transfer.currency,
        destination: transfer.destination,
        description: transfer.description,
        created: transfer.created,
      }
    });
  } catch (err: any) {
    console.error("🚨 Transfer failed:", {
      message: err.message,
      type: err.type,
      code: err.code,
      stack: err.stack,
    });

    return NextResponse.json(
      {
        error: "Transfer failed",
        message: err.message,
        type: err.type,
        code: err.code,
      },
      { status: 500 }
    );
  }
}
