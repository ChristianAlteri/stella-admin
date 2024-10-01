import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    try {
      const { readerId } = await req.json();

      if (!readerId) {
        return NextResponse.json(
          { error: "reader id is required" },
          { status: 400 }
        );
      }

      const reader =
        await stripe.testHelpers.terminal.readers.presentPaymentMethod(
          readerId,
          // { card_present: { number: "4242424242424242" } }
          // {
          //   card_present: { number: "4000000000000002" },
          //   type: 'card_present',
          // // card declined
          // }
          // {
          //   card_present: { number: "4000000000009995" },
          //   type: 'card_present',
          // // insufficient funds
          // }
          // {
          //   card_present: { number: "4000000000009979" },
          //   type: 'card_present',
          // // stolen card
          // }
        );

      console.log("[SIMULATED PAYMENT]", { reader: reader });
      return NextResponse.json({ reader: reader });
    } catch (error: any) {
      console.error(
        "An error occurred when calling the Stripe API to [SIMULATED PAYMENT]",
        error.message
      );
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
}
