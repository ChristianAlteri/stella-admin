import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";  // Import your Prisma instance
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";  // Import Stripe types

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    try {
      const { amount, readerId, storeId, productIds, urlFrom } = await req.json();

      if (!amount || !readerId || !storeId) {
        return NextResponse.json(
          { error: "Amount, reader id, and store id are required" },
          { status: 400 }
        );
      }

      // Fetch the store details to get the currency
      const store = await prismadb.store.findFirst({
        where: { id: storeId },
      });

      if (!store) {
        return NextResponse.json(
          { error: "Store not found" },
          { status: 404 }
        );
      }


      // Use store currency or default to GBP
      const currency = store.currency?.toLowerCase() || "gbp";
      // setup the productIds metadata
      const productIdMetadata = productIds.reduce((acc: any, id: string, index: number) => {
        acc[`productId_${index + 1}`] = id;
        return acc;
      }, {});

      // Create a payment intent for card_present payments
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,  
        payment_method_types: ["card_present"],
        capture_method: "automatic",
        // transfer_data: {
        //   destination: '{{CONNECTED_ACCOUNT_ID}}',
        // },
        // application_fee_amount: amount * 0.3,
        metadata: {
          ...productIdMetadata, 
          storeId: storeId,
          urlFrom: urlFrom,
        }
      });

      // Process payment intent with the reader
      const reader = await stripe.terminal.readers.processPaymentIntent(
        readerId,
        { payment_intent: paymentIntent.id }
      );

      console.log("[PAYMENT INTENT]", {
        reader: reader,
        paymentIntent: paymentIntent,
      });

      return NextResponse.json({
        reader: reader,
        paymentIntent: paymentIntent,
      });
    } catch (error: any) {
      if (error instanceof Stripe.errors.StripeInvalidRequestError) {
        // Check if the error is related to currency mismatch
        if (error.message.includes("currency")) {
          console.error("Currency mismatch error:", error.message);
          return NextResponse.json(
            {
              error: "The selected currency is not supported for card-present transactions in your location.",
              errorCode: "currency_mismatch",
            },
            { status: 400 }
          );
        }
      }

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


// import { stripe } from "@/lib/stripe";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   if (req.method === "POST") {
//     try {
//       const { amount, readerId } = await req.json();

//       if (!amount || !readerId) {
//         return NextResponse.json(
//           { error: "Amount and reader id is required" },
//           { status: 400 }
//         );
//       }

//       // Create a payment intent for card_present payments
//       const paymentIntent = await stripe.paymentIntents.create({
//         amount: amount,
//         //currency: "gbp",
//         currency: "gbp",
//         payment_method_types: ["card_present"],
//         capture_method: "automatic",
//       });
//       const reader = await stripe.terminal.readers.processPaymentIntent(
//         readerId,
//         { payment_intent: paymentIntent.id }
//       );

//       console.log("[PAYMENT INTENT]", { reader: reader, paymentIntent: paymentIntent } );
//       return NextResponse.json({ reader: reader, paymentIntent: paymentIntent });
//     } catch (error: any) {
//       console.error(
//         "An error occurred when calling the Stripe API to create a payment intent:",
//         error.message
//       );
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }
//   } else {
//     console.error(
//         "Method not allowed",
//       );
//     return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
//   }
// }
