import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    try {
      const { amount, readerId } = await req.json();

      if (!amount || !readerId) {
        return NextResponse.json(
          { error: "Amount and reader id is required" },
          { status: 400 }
        );
      }

      // Create a payment intent for card_present payments
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "gbp",
        payment_method_types: ["card_present"],
        capture_method: "manual",
      });
      const reader = await stripe.terminal.readers.processPaymentIntent(
        readerId,
        { payment_intent: paymentIntent.id }
      );

      console.log("[PAYMENT INTENT]", { reader: reader, paymentIntent: paymentIntent } );
      return NextResponse.json({ reader: reader, paymentIntent: paymentIntent });
    } catch (error: any) {
      console.error(
        "An error occurred when calling the Stripe API to create a payment intent:",
        error.message
      );
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
}
