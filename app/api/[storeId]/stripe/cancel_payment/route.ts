import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Parse the readerId from the request body
    const { readerId } = await req.json();

    if (!readerId) {
      return NextResponse.json({ error: "Reader Id is required" }, { status: 400 });
    }

    // Capture the payment intent using Stripe API
    const canceledPayment = await stripe.terminal.readers.cancelAction(readerId);

    console.log("[CANCEL PAYMENT]", { payment: canceledPayment });
    return NextResponse.json({payment: canceledPayment});
  } catch (error: any) {
    console.error(
      "An error occurred when capturing the CANCEL payment :",
      error.message
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
