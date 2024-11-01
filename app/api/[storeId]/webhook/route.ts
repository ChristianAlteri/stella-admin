import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

function convertUrl(urlFrom: string) {
    // Use the URL API to extract the path part of the URL
    const url = new URL(urlFrom);
    
    // Extract the path (e.g., '/0de0bb80-a113-4ace-aa76-6094fbbbb0bb/point-of-sale')
    const path = url.pathname;

    const baseUrl = url.origin; 
  
    // Split the path by '/' to extract the UUID
    const parts = path.split('/');
    
    // Assuming the UUID is the first part of the path after the root '/'
    const uuid = parts[1];
    console.log("Webhook URL Built",`${baseUrl}/api/${uuid}/verify-webhook-payment`);
  
    // Return the new API route
    return `${baseUrl}/api/${uuid}/verify-webhook-payment`;
  }

export async function OPTIONS(request: Request) {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  headers.set("Access-Control-Allow-Credentials", "true");

  return new NextResponse(null, { status: 204, headers });
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  console.log("sig", sig);

  let event;

  try {
    const body = await req.text(); // Extract the raw body for Stripe signature verification
    console.log("body", body);
    if (!sig) {
      console.error("Stripe signature is missing");
      return NextResponse.json(
        { error: "Stripe signature is missing" },
        { status: 400 }
      );
    }
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret!);
    console.log("event", event);
  } catch (err) {
    console.error(`Webhook Error: ${(err as Error).message}`);
    const errorMessage = (err as Error).message;
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  // Handle different Stripe event types
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntentSucceeded = event.data.object;
      // Handle logic for successful payment intent
      break;
    }
    case "payment_intent.created": {
      const paymentIntentCreated = event.data.object;
      console.log("PaymentIntent was created!", paymentIntentCreated);
      // Handle logic for payment intent creation
      break;
    }
    case "charge.succeeded": {
      const chargeSucceeded = event.data.object;
      console.log("Charge was successful!", chargeSucceeded);

      const paymentIntentId = chargeSucceeded.payment_intent;

      if (paymentIntentId) {
        try {
          // Fetch the PaymentIntent object from Stripe
          if (typeof paymentIntentId === "string") {
            const paymentIntent = await stripe.paymentIntents.retrieve(
              paymentIntentId
            );

            if (paymentIntent.metadata) {
                console.log(
                    "Metadata from PaymentIntent:",
                    paymentIntent.metadata
                );
                const url = convertUrl(paymentIntent.metadata.urlFrom);
                console.log("Converted URL:", url);

              // Make a POST request to your /api/verify-terminal-payment route
              const response = await fetch(`${url}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ metadata: paymentIntent.metadata }),
              });

              const data = await response.json();
              console.log("response data", data);

              if (response.ok) {
                console.log("Metadata successfully passed to API", data);
                return NextResponse.json({ success: true, data });
              } else {
                console.error("Failed to pass metadata to API", data);
                return NextResponse.json(
                  { success: false, error: data },
                  { status: 400 }
                );
              }
            } else {
              console.log("No metadata found in PaymentIntent");
              return NextResponse.json(
                { error: "No metadata found" },
                { status: 400 }
              );
            }
          }
        } catch (error) {
          console.error("Error fetching PaymentIntent:", error);
          return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
          );
        }
      } else {
        console.log("No payment intent associated with the charge");
        return NextResponse.json(
          { error: "No payment intent associated with the charge" },
          { status: 400 }
        );
      }

      break; // Add break for this case
    }
    case "terminal.reader.action_succeeded": {
      const terminalReaderActionSucceeded = event.data.object;
      // Handle logic for terminal reader action succeeded
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return 200 to acknowledge receipt of the event
  return NextResponse.json({ received: true });
}
