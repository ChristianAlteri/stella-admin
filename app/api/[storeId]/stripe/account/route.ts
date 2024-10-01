import prismadb from "@/lib/prismadb";
import { stripe_connect } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const account = await stripe_connect.accounts.create({
      controller: {
        stripe_dashboard: {
          type: "none",
        },
        fees: {
          payer: "application",
        },
        losses: {
          payments: "application",
        },
        requirement_collection: "application",
      },
      capabilities: {
        transfers: { requested: true },
      },
      country: "GB", //TODO: change to the stores country code
    });

    // console.log("STRIPE ACCOUNT CREATION", account);
    return NextResponse.json({ success: true, account: account });
  } catch (error: any) {
    console.error(
      "An error occurred when calling the Stripe API to create an account:",
      error.message
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}