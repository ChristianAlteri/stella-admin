import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Parse the payment_intent_id from the request body
    const { payment_intent_id } = await req.json();

    if (!payment_intent_id) {
      return NextResponse.json({ error: "Payment Intent ID is required" }, { status: 400 });
    }

    // Capture the payment intent using Stripe API
    const intent = await stripe.paymentIntents.capture(payment_intent_id);

    console.log("[PAYMENT INTENT CAPTURED]", { intent: intent });
    return NextResponse.json({intent: intent});
  } catch (error: any) {
    console.error(
      "An error occurred when capturing the payment intent:",
      error.message
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
